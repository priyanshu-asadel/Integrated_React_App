import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const socketService = {
  socket: null,

  init: () => {
    socketService.socket = io(API_URL, { transports: ['websocket'] });
  },

  onConnected: (callback) => {
    socketService.socket.on('connected', (data) => {
      callback(data);
    });
  },

  onCameraMsg: (cameraId, callback) => {
    socketService.socket.on(cameraId, (data) => {
      callback(data);
    });
  },

  onCamerasMsg: (callback) => {
    socketService.socket.on('camera', (data) => {
      callback(data);
    });
  },

  sendData: (data) => {
    socketService.socket.emit('control', data);
  },
};