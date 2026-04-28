const http = require('http');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

const port = process.argv[2];

/**
 * Функція для імітації важкої обчислювальної задачі.
 * pbkdf2 - це алгоритм хешування паролів, який сильно навантажує процесор.
 */
const runHash = () => {
  return new Promise((resolve, reject) => {
    // Параметри: пароль, сіль, ітерації, довжина ключа, алгоритм
    crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve();
    });
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/threadpool-limit') {
    const start = performance.now();

    try {
      // Запускаємо РІВНО 8 задач паралельно
      const tasks = Array(8).fill(null).map(() => runHash());
      
      await Promise.all(tasks);

      const end = performance.now();
      const durationMs = end - start;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        tasks: 8,
        durationMs: durationMs
      }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Crypto error" }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
