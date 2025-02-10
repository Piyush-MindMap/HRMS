import 'dotenv/config';
import { WebSocketServer } from 'ws'; 
import { userNotification } from './utils/socketFuncitons.js';
import wsAuthenticate from './middleware/wsAuthenticate.js';

const WS_PORT = process.env.WS_PORT || 3000;

export const empIdToSocketMap = new Map();

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  wsAuthenticate(req, (err, decoded) => {
    if (err) {
      console.log(err);
      ws.send('Authentication failed!')
      ws.close();
      return;
    }

    const empId = decoded.eid; 
    console.log(`User connected: Employee ID - ${empId}`);

    empIdToSocketMap.set(empId, ws);

    ws.on('message', (message) => {
      console.log(`Message from Employee ${empId}: ${message}`);
      
      // Example: Echo the received message back to the client
      ws.send(`Echo: ${message}`);
    });

    // Event: When the connection is closed
    ws.on('close', () => {
      console.log(`Connection closed for Employee ID: ${empId}`);
      empIdToSocketMap.delete(empId); // Remove from map
    });

    ws.send(`Welcome, Employee ${empId}`);
    userNotification(empId, ws)
  });
});
