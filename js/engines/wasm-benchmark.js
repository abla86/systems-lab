class WasmBenchmarkEngine {
  constructor(mount, telemetry) {
    this.mount = mount;
    this.sendTelemetry = telemetry;
  }

  init() {
    this.render();
    this.sendTelemetry({ mode: "JS Benchmark", status: "READY", iterations: "1,000,000" });
  }

  render() {
    this.mount.innerHTML = `
      <div class="engine-shell">
        <div class="engine-top">
          <strong>RUNTIME BENCHMARK // JS BASELINE</strong>
          <span id="state">READY</span>
        </div>
        <div class="actions">
          <button id="run">RUN 1M MATH OPS</button>
          <button id="reset">RESET</button>
        </div>
        <div id="log" class="log">Ready for benchmark.</div>
      </div>`;

    this.mount.querySelector("#run").onclick = () => this.run();
    this.mount.querySelector("#reset").onclick = () => this.init();
  }

  run() {
    const state = this.mount.querySelector("#state");
    const log = this.mount.querySelector("#log");
    const n = 1_000_000;

    state.textContent = "RUNNING";

    const start = performance.now();
    let checksum = 0;

    for (let i = 0; i < n; i++) {
      checksum += Math.sqrt(i) * 1.0001;
    }

    const elapsed = performance.now() - start;

    state.textContent = "COMPLETE";
    log.textContent = [
      `[${n.toLocaleString()} operations]`,
      `JavaScript JIT baseline: ${elapsed.toFixed(2)} ms`,
      `Checksum: ${checksum.toFixed(2)}`,
      "",
      "NOTE: this version does not execute a .wasm module.",
      "It is a reproducible JS baseline ready for a future native WASM comparison."
    ].join("\n");

    this.sendTelemetry({
      runtime: "JavaScript",
      latency: `${elapsed.toFixed(2)} ms`,
      wasmExecution: "NOT IMPLEMENTED",
      status: "COMPLETE"
    });
  }

  destroy() {
    this.mount.replaceChildren();
  }
}

window.WasmBenchmarkEngine = WasmBenchmarkEngine;
