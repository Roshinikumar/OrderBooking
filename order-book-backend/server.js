const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const BITFINEX_WS_URL = 'wss://api-pub.bitfinex.com/ws/2';

let bitfinexSocket;

const openBitfinexSocket = () => {
  bitfinexSocket = new WebSocket(BITFINEX_WS_URL);

  bitfinexSocket.on('open', () => {
    console.log('Connected to Bitfinex WebSocket');

    // Subscribe to order book data
    const msg = JSON.stringify({
      event: 'subscribe',
      channel: 'book',
      symbol: 'tBTCUSD',
      prec: 'P0',
      freq: 'F0',
      len: 25
    });
    bitfinexSocket.send(msg);
  });

  bitfinexSocket.on('message', (data) => {
    const parsedData = JSON.parse(data);

    // Forward the order book updates to the client
    if (parsedData[1] !== 'hb') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedData));
        }
      });
    }
  });

  bitfinexSocket.on('close', () => {
    console.log('Bitfinex WebSocket disconnected, reconnecting...');
    setTimeout(openBitfinexSocket, 5000); // Attempt to reconnect after 5 seconds
  });
};

// Open the Bitfinex WebSocket
openBitfinexSocket();

// Serve WebSocket connections to the frontend
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});
