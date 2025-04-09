const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');


// wss
const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'public', req.url === '/' ? 'control.html' : req.url);
  const extname = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
  }[extname] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const wss = new WebSocket.Server({ server });
let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);
  ws.on('message', (message) => {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

server.listen(8090, () => {
  console.log('Server running at http://localhost:8090');
});


// obs
const { OBSWebSocket } = require('obs-websocket-js');
const obs = new OBSWebSocket();

obs.connect("ws://localhost:4455").then(() => {
  console.log('OBS WebSocket 接続成功');
}).catch(err => {
  console.error('OBS 接続失敗:', err);
});