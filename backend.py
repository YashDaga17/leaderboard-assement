from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import sqlite3
import json
import threading
import time
from datetime import datetime, timezone, timedelta
from data_gen import record_stream
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hogwarts_secret'
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

# Database setup
def init_db():
    conn = sqlite3.connect('hogwarts.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS house_points (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            points INTEGER NOT NULL,
            timestamp TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def insert_record(record):
    conn = sqlite3.connect('hogwarts.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO house_points (id, category, points, timestamp)
        VALUES (?, ?, ?, ?)
    ''', (record['id'], record['category'], record['points'], record['timestamp']))
    conn.commit()
    conn.close()

def get_totals(time_window=None):
    conn = sqlite3.connect('hogwarts.db')
    cursor = conn.cursor()
    
    if time_window == '5min':
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
        cursor.execute('''
            SELECT category, SUM(points) as total_points
            FROM house_points 
            WHERE timestamp > ?
            GROUP BY category
        ''', (cutoff.isoformat(),))
    elif time_window == '1hour':
        cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
        cursor.execute('''
            SELECT category, SUM(points) as total_points
            FROM house_points 
            WHERE timestamp > ?
            GROUP BY category
        ''', (cutoff.isoformat(),))
    else:  # All time
        cursor.execute('''
            SELECT category, SUM(points) as total_points
            FROM house_points 
            GROUP BY category
        ''')
    
    results = cursor.fetchall()
    conn.close()
    
    # Initialize all houses with 0 points
    totals = {"Gryff": 0, "Slyth": 0, "Raven": 0, "Huff": 0}
    for category, points in results:
        totals[category] = points
    
    return totals

# Data ingestion flag
data_ingestion_active = False
data_thread = None

def data_ingestion_worker():
    """Worker function to continuously ingest data and broadcast updates"""
    global data_ingestion_active
    for record in record_stream():
        if not data_ingestion_active:
            break
        
        try:
            # Insert record to database
            insert_record(record)
            logger.info(f"Inserted record: {record}")
            
            # Broadcast update to all connected clients
            totals = {
                '5min': get_totals('5min'),
                '1hour': get_totals('1hour'),
                'all': get_totals()
            }
            socketio.emit('leaderboard_update', totals)
            
        except Exception as e:
            logger.error(f"Error processing record: {e}")

@app.route('/api/leaderboard')
def get_leaderboard():
    time_window = request.args.get('window', 'all')
    totals = get_totals(time_window)
    return jsonify(totals)

@app.route('/api/start', methods=['POST'])
def start_updates():
    global data_ingestion_active, data_thread
    
    if not data_ingestion_active:
        data_ingestion_active = True
        data_thread = threading.Thread(target=data_ingestion_worker)
        data_thread.daemon = True
        data_thread.start()
        logger.info("Data ingestion started")
    
    return jsonify({"status": "started"})

@app.route('/api/stop', methods=['POST'])
def stop_updates():
    global data_ingestion_active
    data_ingestion_active = False
    logger.info("Data ingestion stopped")
    return jsonify({"status": "stopped"})

@app.route('/api/status')
def get_status():
    return jsonify({"active": data_ingestion_active})

@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    # Send current totals on connection
    totals = {
        '5min': get_totals('5min'),
        '1hour': get_totals('1hour'),
        'all': get_totals()
    }
    emit('leaderboard_update', totals)

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

if __name__ == '__main__':
    init_db()
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
