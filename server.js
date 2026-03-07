const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Default to index.html for root
  let urlPath = req.url.split('?')[0]; // strip query params
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(dir, decodeURIComponent(urlPath));
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try as directory with index.html
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (err2, data2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found: ' + urlPath);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data2);
      });
      return;
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Cache static assets aggressively in dev
    const headers = { 'Content-Type': contentType };
    if (['.jpg', '.jpeg', '.png', '.webp', '.woff2', '.mp3'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=3600';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`PRAYED dev server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${dir}`);
});
