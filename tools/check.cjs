const fs = require("fs"),
  vm = require("vm"),
  path = require("path");
const root = path.resolve(__dirname, "..");
let files = fs.readdirSync(root).filter((f) => f.endsWith(".html") && !/^google[a-f0-9]+\.html$/i.test(f));
if (files.length !== 6) throw Error("Cần đủ sáu trang HTML.");
for (const f of files) {
  const s = fs.readFileSync(path.join(root, f), "utf8");
  for (const script of s.matchAll(/<script>([\s\S]*?)<\/script>/g))
    new vm.Script(script[1], { filename: f });
  for (const ref of s.matchAll(/(?:src|href)="([^"{}]+)"/g)) {
    if (/^(https?:|#|data:)/.test(ref[1])) continue;
    const file = ref[1].split("#")[0];
    if (!fs.existsSync(path.join(root, file)))
      throw Error(f + ": thiếu " + file);
  }
  for (const ref of s.matchAll(/assets\/[\w.-]+/g))
    if (!fs.existsSync(path.join(root, ref[0])))
      throw Error(f + ": thiếu " + ref[0]);
  console.log(f + ": cú pháp và đường dẫn hợp lệ");
}
function checkJavaScript(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) checkJavaScript(file);
    else if (entry.name.endsWith('.js')) new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
  }
}
checkJavaScript(path.join(root, 'js'));

if (
  fs.readdirSync(path.join(root, "assets")).filter((f) => f.endsWith(".webp"))
    .length !== 37
)
  throw Error("Cần giữ 37 ảnh WebP.");
JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
console.log("Sáu trang, toàn bộ JavaScript, 37 ảnh và cấu hình JSON hợp lệ.");
