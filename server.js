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

function createRequestHandler(root) {
  const rootPath = fs.realpathSync(root);
  const insideRoot = (candidate) => {
    const relative = path.relative(rootPath, candidate);
    return relative !== '..' && !relative.startsWith('..' + path.sep) &&
      !path.isAbsolute(relative) &&
      !relative.split(path.sep).some(segment => segment.startsWith('.'));
  };

  return (req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid request path');
      return;
    }
    if (!urlPath.startsWith('/') || urlPath.includes('\0')) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid request path');
      return;
    }
    if (urlPath.split('/').some(segment => segment.startsWith('.'))) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Path is not available');
      return;
    }
    if (urlPath === '/') urlPath = '/index.html';
    const requestedPath = path.resolve(rootPath, '.' + urlPath);
    if (!insideRoot(requestedPath)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Path is not available');
      return;
    }

    const readFile = (candidate, fallback) => {
      fs.realpath(candidate, (pathError, canonicalPath) => {
        if (pathError) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        if (!insideRoot(canonicalPath)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('Path is not available');
          return;
        }
        fs.readFile(canonicalPath, (readError, data) => {
          if (readError) {
            if (fallback) {
              readFile(path.join(candidate, 'index.html'), false);
              return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
            return;
          }
          const ext = path.extname(canonicalPath).toLowerCase();
          const headers = { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' };
          headers['Cache-Control'] = ['.jpg', '.jpeg', '.png', '.webp', '.woff2', '.mp3'].includes(ext)
            ? 'public, max-age=3600'
            : 'no-cache';
          res.writeHead(200, headers);
          res.end(data);
        });
      });
    };
    readFile(requestedPath, true);
  };
}

if (require.main === module) {
  const PORT = 8080;
  const HOST = '127.0.0.1';
  const server = http.createServer(createRequestHandler(dir));
  server.listen(PORT, HOST, () => {
    console.log(`PRAYED dev server running at http://${HOST}:${PORT}`);
    console.log(`Serving files from: ${dir}`);
  });
}

module.exports = { createRequestHandler };
