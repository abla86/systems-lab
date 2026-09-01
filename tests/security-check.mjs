import fs from "node:fs";

const files = [
  "index.html",
  "js/lab-runtime.js",
  "js/engines/wasm-benchmark.js",
  "js/engines/worker-pool.js"
];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (/\beval\s*\(/.test(text)) throw new Error(`eval() detected in ${file}`);
  if (/\bnew\s+Function\s*\(/.test(text)) throw new Error(`new Function() detected in ${file}`);
}

console.log("Systems Lab security check passed.");
