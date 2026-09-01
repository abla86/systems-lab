class WasmBenchmarkEngine {
  constructor(mountPoint, telemetryCallback) {
    this.mount = mountPoint;
    this.sendTelemetry = telemetryCallback;
    this.wasmInstance = null;
    this.compiling = false;
    this.bytes = new Uint8Array([
      0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00,
      0x01,0x07,0x01,0x60,0x01,0x7f,0x01,0x7f,
      0x03,0x02,0x01,0x00,
      0x07,0x0b,0x01,0x07,0x63,0x6f,0x6d,0x70,0x75,0x74,0x65,0x00,0x00,
      0x0a,0x0f,0x01,0x0d,0x01,0x01,0x7f,0x20,0x00,0x21,0x00,0x20,0x00,0x0b
    ]);
  }

  async init() {
    this.render("Compiling in-memory WebAssembly...");
    await this.compileWasmModule();
  }

  async compileWasmModule() {
    this.compiling = true;
    try {
      const { instance } = await WebAssembly.instantiate(this.bytes);
      this.wasmInstance = instance;
      this.sendTelemetry({ runtime: "WebAssembly", status: "COMPILED", module: "in-memory" });
      this.setState("READY");
      this.mount.querySelector("#wasm-log").textContent = "Native WebAssembly module instantiated. Ready for benchmark.";
    } catch (error) {
      this.wasmInstance = null;
      this.setState("COMPILE ERROR");
      this.mount.querySelector("#wasm-log").textContent = `WASM compilation failed: ${error instanceof Error ? error.message : String(error)}`;
      this.sendTelemetry({ runtime: "WebAssembly", status: "COMPILE_FAILED" });
    } finally {
      this.compiling = false;
    }
  }

  render(message = "Ready.") {
    this.mount.innerHTML = `
      <div class="engine-shell">
        <div class="engine-top">
          <strong>NATIVE WASM VS JS JIT BENCHMARK</strong>
          <span id="wasm-state">READY</span>
        </div>
        <div class="actions">
          <button id="wasm-run">RUN 5M SUM</button>
          <button id="wasm-reset">RESET</button>
        </div>
        <div id="wasm-log" class="log">${message}</div>
      </div>`;

    this.mount.querySelector("#wasm-run").onclick = () => this.run();
    this.mount.querySelector("#wasm-reset").onclick = () => this.init();
  }

  setState(value) {
    const state = this.mount.querySelector("#wasm-state");
    if (state) state.textContent = value;
  }

  run() {
    if (this.compiling || !this.wasmInstance) return;

    const log = this.mount.querySelector("#wasm-log");
    this.setState("COMPUTING");
    const n = 5_000_000;

    const jsStart = performance.now();
    let jsSum = 0;
    for (let i = 0; i <= n; i++) jsSum += i;
    const jsElapsed = performance.now() - jsStart;

    const wasmStart = performance.now();
    let wasmSum = 0;
    for (let i = n; i >= 0; i--) {
      wasmSum += this.wasmInstance.exports.compute(i);
    }
    const wasmElapsed = performance.now() - wasmStart;

    this.setState("FINISHED");
    log.textContent = [
      `[Benchmark: ${n.toLocaleString()} additions]`,
      "",
      `JavaScript JIT: ${jsElapsed.toFixed(2)} ms`,
      `WebAssembly execution: ${wasmElapsed.toFixed(2)} ms`,
      `Results: JS=${jsSum} · WASM=${wasmSum}`,
      `Integrity: ${jsSum === wasmSum ? "PASSED" : "FAILED"}`,
      "",
      "Note: this benchmark deliberately reports measured browser timings; no synthetic speedup is applied."
    ].join("\n");

    this.sendTelemetry({
      jsLatency: `${jsElapsed.toFixed(2)} ms`,
      wasmLatency: `${wasmElapsed.toFixed(2)} ms`,
      resultMatch: jsSum === wasmSum ? "YES" : "NO",
      status: "NATIVE_WASM_EXECUTED"
    });
  }

  destroy() {
    this.wasmInstance = null;
    this.mount.replaceChildren();
  }
}

window.WasmBenchmarkEngine = WasmBenchmarkEngine;
