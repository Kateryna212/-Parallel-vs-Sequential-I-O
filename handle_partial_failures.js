const http = require('http');
const fs = require('fs').promises;

const port = process.argv[2];

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/error-handling') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const fileNames = JSON.parse(body);

        // Перевірка, чи це масив
        if (!Array.isArray(fileNames)) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: "Expected an array of strings" }));
        }

        // Запускаємо читання всіх файлів через allSettled
        const results = await Promise.allSettled(
          fileNames.map(name => fs.readFile(name, 'utf8'))
        );

        const successes = [];
        const failures = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            // Якщо прочитано успішно, додаємо вміст
            successes.push(result.value.trim());
          } else {
            // Якщо помилка (наприклад, файл не знайдено), додаємо назву файлу
            failures.push(fileNames[index]);
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          successes,
          failures,
          total: fileNames.length
        }));

      } catch (err) {
        // Якщо JSON у запиті "битий"
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
