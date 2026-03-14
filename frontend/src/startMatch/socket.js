// src/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const socket = io(SOCKET_URL, {
  transports: ['polling', 'websocket'],
  autoConnect: false, // we'll connect manually
});

export default socket;
