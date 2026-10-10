const fs = require("fs"),
  path = require("path");
const root = path.resolve(__dirname, "..");
let domain;
try {
  domain = new URL(process.argv[2]);
  if (
    domain.protocol !== "https:" ||
    domain.pathname !== "/" ||
    domain.search ||
    domain.hash ||
    domain.username ||
    domain.password
  )
    throw Error();
} catch (e) {
  throw Error("Cung cấp origin HTTPS thật, không có path/query/hash.");
}
const pages = [
  "index.html",
  "ve-du-an.html",
  "thong-tin.html",
  "giai-phau-dia-com.html",
  "rap-dia.html",
  "that-hay-giai-thoai.html",
];
const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
fs.writeFileSync(
  path.join(root, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages
      .map(
        (p) =>
          "  <url><loc>" + escape(new URL(p, domain).href) + "</loc></url>",
      )
      .join("\n") +
    "\n</urlset>\n",
);
fs.writeFileSync(
  path.join(root, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: " +
    new URL("sitemap.xml", domain).href +
    "\n",
);
console.log("Đã ghi sitemap.xml và robots.txt.");
