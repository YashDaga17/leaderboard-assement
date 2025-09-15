# 🏆 Hogwarts House Cup Leaderboard

A real-time leaderboard system for tracking Hogwarts house points, built with React (TypeScript) frontend and Flask backend with SQLite database.

## ✨ Features

- **Real-time Updates**: Live leaderboard updates using WebSockets
- **Time Window Filtering**: View points for last 5 minutes, last 1 hour, or all time
- **Interactive Controls**: Start/stop live data ingestion
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **House Themes**: Each house has its own colors and emojis (🦁 Gryffindor, 🐍 Slytherin, 🦅 Ravenclaw, 🦡 Hufflepuff)

## 🛠️ Tech Stack

### Backend
- **Flask** - Web framework
- **Flask-SocketIO** - Real-time WebSocket communication
- **SQLite** - Lightweight database for data persistence
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Socket.IO Client** - Real-time communication
- **CSS3** - Modern styling with gradients and animations

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd leaderboard-assement
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   python backend.py
   ```
   The backend will start on `http://localhost:5001`

2. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 🎮 How to Use

1. **Connect**: The frontend automatically connects to the backend via WebSocket
2. **Start Updates**: Click the "Start Updates" button to begin live data ingestion
3. **View Leaderboard**: Watch as house points update in real-time
4. **Filter by Time**: Use the time window buttons to see:
   - Last 5 Minutes
   - Last 1 Hour  
   - All Time
5. **Stop Updates**: Click "Stop Updates" to pause data ingestion

## 📊 Data Flow

1. **Data Generation**: `data_gen.py` generates random house point events
2. **Backend Ingestion**: Flask server receives and stores events in SQLite
3. **Real-time Broadcast**: New data is broadcast to all connected clients via WebSocket
4. **Frontend Updates**: React app receives updates and re-renders the leaderboard

## 🗄️ Database Schema

```sql
CREATE TABLE house_points (
    id TEXT PRIMARY KEY,           -- Unique event ID
    category TEXT NOT NULL,        -- House name (Gryff, Slyth, Raven, Huff)
    points INTEGER NOT NULL,       -- Points awarded
    timestamp TEXT NOT NULL        -- ISO timestamp
);
```

## 🔧 API Endpoints

### REST Endpoints
- `GET /api/leaderboard?window={5min|1hour|all}` - Get house totals for time window
- `POST /api/start` - Start live data ingestion
- `POST /api/stop` - Stop live data ingestion
- `GET /api/status` - Get current ingestion status

### WebSocket Events
- `connect` - Client connects to server
- `leaderboard_update` - Server broadcasts new totals to all clients
- `disconnect` - Client disconnects from server

## 📱 UI Components

### Header
- Live Leaderboard title
- Connection status indicator

### Controls
- Start/Stop updates button
- Time window selection (5min, 1hour, all time)

### Leaderboard
- House rankings with animated bars
- House colors and emojis
- Point totals with tooltips
- Responsive design for mobile devices

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradients and shadows
- **House Colors**: 
  - 🦁 Gryffindor: Crimson red (`#dc143c`)
  - 🐍 Slytherin: Dark green (`#2d5a3d`)
  - 🦅 Ravenclaw: Royal blue (`#1e3a8a`)
  - 🦡 Hufflepuff: Golden yellow (`#eab308`)
- **Animations**: Smooth bar transitions and hover effects
- **Responsive**: Mobile-first design that adapts to all screen sizes

## 🔍 Development

### Project Structure
```
leaderboard-assement/
├── backend.py              # Flask server with WebSocket support
├── data_gen.py            # Data generator utility
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
├── src/
│   ├── App.tsx           # Main React component
│   ├── App.css           # Component styles
│   ├── types.ts          # TypeScript type definitions
│   ├── socket.ts         # Socket.IO configuration
│   └── main.tsx          # React entry point
└── README.md             # This file
```

### Building for Production

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure Python dependencies are installed: `pip install -r requirements.txt`
   - Check that port 5000 is not in use

2. **Frontend can't connect to backend**
   - Verify backend is running on `http://localhost:5001`
   - Check browser console for WebSocket connection errors

3. **No data updates**
   - Click "Start Updates" button in the UI
   - Check backend logs for data ingestion activity

4. **Database issues**
   - Delete `hogwarts.db` file to reset the database
   - Backend will recreate the database on next startup

## 📝 License

This project is created for educational purposes as part of a coding assessment.

## 🎯 Future Enhancements

- Add data export functionality
- Implement user authentication
- Add historical charts and analytics
- Support for custom time ranges
- Real-time notifications for major point changes
- Database backup and recovery features
