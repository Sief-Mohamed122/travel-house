// Minimal static file server (no clean-URL rewrites) for local preview.
// Keeps .html extensions so relative links resolve correctly (e.g. /ar/index.html -> tours.html => /ar/tours.html).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 4173;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  // prevent path traversal
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  const trySend = (candidates) => {
    if (candidates.length === 0) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const [c, ...rest] = candidates;
    fs.stat(c, (e, st) => {
      if (e || !st.isFile()) return trySend(rest);
      send(c, res);
    });
  };

  // resolve: exact -> +'.html' -> +'/index.html' (handles clean/dir URLs like /ar or /ar/tours)
  trySend([filePath, filePath + '.html', filePath + '/index.html']);
});

function send(p, res) {
  const ext = path.extname(p).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}

server.listen(PORT, () => console.log(`Travel House preview: http://localhost:${PORT}`));
