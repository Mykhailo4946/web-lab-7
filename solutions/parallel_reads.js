const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const port = process.argv[2];

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/parallel') {
    const t0 = Date.now();
    try {
      // Запускаємо читання паралельно
      const [a, b, c] = await Promise.all([
        fs.readFile(path.join(__dirname, 'a.txt'), 'utf8'),
        fs.readFile(path.join(__dirname, 'b.txt'), 'utf8'),
        fs.readFile(path.join(__dirname, 'c.txt'), 'utf8')
      ]);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        combined: a.trim() + b.trim() + c.trim(),
        elapsedMs: Date.now() - t0
      }));
    } catch (err) {
      res.statusCode = 500;
      res.end('File read error');
    }
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(port);