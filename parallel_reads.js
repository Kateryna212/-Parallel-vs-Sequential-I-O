const http = require('http');
const fs = require('fs').promises;
const { performance } = require('perf_hooks');

const port = process.argv[2];

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/parallel') {
    const start = performance.now();

    try {
      // ЗАПУСКАЄМО ЧИТАННЯ ПАРАЛЕЛЬНО
      // fs.readFile повертає проміс. Ми передаємо масив цих промісів у Promise.all
      const [a, b, c] = await Promise.all([
        fs.readFile('a.txt', 'utf8'),
        fs.readFile('b.txt', 'utf8'),
        fs.readFile('c.txt', 'utf8')
      ]);

      const end = performance.now();
      const elapsedMs = end - start;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        combined: a.trim() + b.trim() + c.trim(),
        elapsedMs: elapsedMs
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: "File read error" }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
