const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const port = process.argv[2];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/error-handling') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const files = JSON.parse(body);
        if (!Array.isArray(files)) throw new Error('Not an array');

        // Створюємо масив промісів для кожного файлу
        const promises = files.map(file => fs.readFile(path.join(__dirname, file), 'utf8'));
        
        // Чекаємо завершення всіх промісів (успішних і неуспішних)
        const results = await Promise.allSettled(promises);

        const successes = [];
        const failures = [];

        // Сортуємо результати по масивах
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successes.push({ file: files[index], content: result.value });
          } else {
            failures.push({ file: files[index], error: result.reason.message });
          }
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          successes,
          failures,
          total: files.length
        }));
      } catch (err) {
        res.statusCode = 400;
        res.end('Invalid JSON or not an array');
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(port);