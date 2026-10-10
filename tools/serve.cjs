const http = require("http"),
  fs = require("fs"),
  path = require("path");
const root = path.resolve(__dirname, "..");
http
  .createServer((req, res) => {
    let name;
    try {
      name = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch (e) {
      res.writeHead(400);
      return res.end();
    }
    const file = path.resolve(
      root,
      "." + (name === "/" ? "/index.html" : name),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Không tìm thấy trang.");
      }
      const types = {
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".webp": "image/webp",
        ".txt": "text/plain; charset=utf-8",
        ".xml": "application/xml",
      };
      res.setHeader(
        "Content-Type",
        types[path.extname(file)] || "application/octet-stream",
      );
      res.end(data);
    });
  })
  .listen(8000, "127.0.0.1", () => console.log("http://127.0.0.1:8000"));
