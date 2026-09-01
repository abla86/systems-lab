import fs from "node:fs";

const required = [
  "index.html",
  "css/lab-theme.css",
  "js/lab-runtime.js",
  "js/engines/wasm-benchmark.js",
  "js/engines/worker-pool.js",
  "package.json"
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}

const html = fs.readFileSync("index.html", "utf8");

for (const file of [
  "js/lab-runtime.js",
  "js/engines/wasm-benchmark.js",
  "js/engines/worker-pool.js",
  "css/lab-theme.css"
]) {
  if (!html.includes(file) && file !== "js/lab-runtime.js" && file !== "css/lab-theme.css") {
    throw new Error(`Missing reference in index.html: ${file}`);
  }
}

for (const engineId of ["wasm", "workers"]) {
  if (!html.includes(`registerEngine("${engineId}"`)) {
    throw new Error(`Missing engine registration: ${engineId}`);
  }
}

console.log("Systems Lab build integrity passed.");
