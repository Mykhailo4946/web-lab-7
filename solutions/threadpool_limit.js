const http = require('http');
const crypto = require('crypto');
const util = require('util');
const port = process.argv[2];

// Перетворюємо стару callback-функцію crypto.pbkdf2 на сучасну, що повертає Promise
const pbkdf2Async = util.promisify(crypto.pbkdf2);

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/threadpool-limit') {
    const t0 = Date.now();
    const tasksCount = 8;
    const tasks = [];

    // Запускаємо 8 важких задач
    for (let i = 0; i < tasksCount; i++) {
      tasks.push(pbkdf2Async('secret_password', 'salt', 100000, 64, 'sha512'));
    }

    // Чекаємо, поки всі 8 задач виконаються (вони будуть боротися за 4 потоки)
    await Promise.all(tasks);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      tasks: tasksCount,
      durationMs: Date.now() - t0
    }));
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(port);