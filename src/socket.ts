import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5001';

export const socket = io(BACKEND_URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
