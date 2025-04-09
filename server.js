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
    const data = JSON.parse(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    if (data.type === 'scene') {
      obs.call('SetCurrentProgramScene', { sceneName: data.scene })
        .then(() => console.log(`🎬 シーン切替: ${data.scene}`))
        .catch(console.error);
    }
  });
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
  });
});

server.listen(8090, () => {
  console.log('Server running at http://localhost:8090');
});