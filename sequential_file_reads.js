const http = require('http');
const fs = require('fs').promises;
const { performance } = require('perf_hooks');

const port = process.argv[2];

const server = http.createServer(async (req, res) => {
  // Перевіряємо метод GET та шлях /sequential
  if (req.method === 'GET' && req.url === '/sequential') {
    const start = performance.now();

    try {
      // ПОСЛІДОВНЕ читання: чекаємо на кожен файл по черзі
      const a = await fs.readFile('a.txt', 'utf8');
      const b = await fs.readFile('b.txt', 'utf8');
      const c = await fs.readFile('c.txt', 'utf8');

      const end = performance.now();
      const elapsedMs = end - start;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        // Очищаємо текст від зайвих пробілів/переносів рядка .trim()
        combined: a.trim() + b.trim() + c.trim(),
        elapsedMs: elapsedMs
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "File read error" }));
    }
  } else {
    // Для невідомих шляхів або неправильних методів
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
