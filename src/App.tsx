import { useState, useEffect } from 'react';
import './App.css';
import { socket, connectSocket, disconnectSocket } from './socket';
import type { LeaderboardData, TimeWindow, HouseEntry } from './types';

const HOUSE_CONFIGS = {
  Gryff: { name: 'Gryffindor', color: '#dc143c', emoji: '🦁' },
  Slyth: { name: 'Slytherin', color: '#2d5a3d', emoji: '🐍' },
  Raven: { name: 'Ravenclaw', color: '#1e3a8a', emoji: '🦅' },
  Huff: { name: 'Hufflepuff', color: '#eab308', emoji: '🦡' },
};

function App() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    '5min': { Gryff: 0, Slyth: 0, Raven: 0, Huff: 0 },
    '1hour': { Gryff: 0, Slyth: 0, Raven: 0, Huff: 0 },
    'all': { Gryff: 0, Slyth: 0, Raven: 0, Huff: 0 },
  });
  const [selectedWindow, setSelectedWindow] = useState<TimeWindow>('1hour');
  const [isLiveUpdatesActive, setIsLiveUpdatesActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    // Socket event listeners
    socket.on('connect', () => {
      setConnectionStatus('Connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    socket.on('leaderboard_update', (data: LeaderboardData) => {
      setLeaderboardData(data);
    });

    // Connect socket on component mount
    connectSocket();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('leaderboard_update');
      disconnectSocket();
    };
  }, []);

  const startLiveUpdates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/start', {
        method: 'POST',
      });
      if (response.ok) {
        setIsLiveUpdatesActive(true);
      }
    } catch (error) {
      console.error('Failed to start live updates:', error);
    }
  };

  const stopLiveUpdates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stop', {
        method: 'POST',
      });
      if (response.ok) {
        setIsLiveUpdatesActive(false);
      }
    } catch (error) {
      console.error('Failed to stop live updates:', error);
    }
  };

  const getLeaderboardEntries = (): HouseEntry[] => {
    const currentData = leaderboardData[selectedWindow];
    return Object.entries(currentData)
      .map(([house, points]) => ({
        name: HOUSE_CONFIGS[house as keyof typeof HOUSE_CONFIGS].name,
        points,
        color: HOUSE_CONFIGS[house as keyof typeof HOUSE_CONFIGS].color,
        emoji: HOUSE_CONFIGS[house as keyof typeof HOUSE_CONFIGS].emoji,
      }))
      .sort((a, b) => b.points - a.points);
  };

  const maxPoints = Math.max(...Object.values(leaderboardData[selectedWindow]));

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">
          📊 Live Leaderboard
        </h1>
        <div className="connection-status">
          Status: <span className={connectionStatus === 'Connected' ? 'connected' : 'disconnected'}>
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="controls">
        <div className="control-group">
          <button
            className={`control-btn ${isLiveUpdatesActive ? 'stop' : 'start'}`}
            onClick={isLiveUpdatesActive ? stopLiveUpdates : startLiveUpdates}
          >
            ⏸️ {isLiveUpdatesActive ? 'Stop Updates' : 'Start Updates'}
          </button>
        </div>

        <div className="time-window-controls">
          <select 
            className="time-dropdown"
            value={selectedWindow}
            onChange={(e) => setSelectedWindow(e.target.value as TimeWindow)}
          >
            <option value="5min">Last 5 Minutes</option>
            <option value="1hour">Last 1 Hour</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="leaderboard">
        {getLeaderboardEntries().map((house) => (
          <div key={house.name} className="house-row">
            <div className="house-info">
              <span className="house-emoji">{house.emoji}</span>
              <span className="house-name">{house.name}</span>
            </div>
            <div className="points-container">
              <div 
                className="points-bar"
                style={{
                  backgroundColor: house.color,
                  width: maxPoints > 0 ? `${(house.points / maxPoints) * 100}%` : '0%',
                }}
              />
              <div className="points-tooltip">
                <span className="house-emoji">{house.emoji}</span>
                <span className="house-name">{house.name}</span>
                <span className="count-text">count: {house.points}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
