class WorkerPoolEngine {
  constructor(mountPoint, telemetryCallback) {
    this.mount = mountPoint;
    this.sendTelemetry = telemetryCallback;
    this.poolSize = Math.min(4, navigator.hardwareConcurrency || 2);
    this.workers = [];
    this.runStartedAt = 0;
    this.completed = 0;
  }

  init() {
    this.render();
    this.sendTelemetry({ runtime: "Web Worker API", poolSize: this.poolSize, status: "READY" });
  }

  render() {
    this.mount.innerHTML = `
      <div class="engine-shell">
        <div class="engine-top">
          <strong>NATIVE MULTI-THREADED WEB WORKER POOL</strong>
          <span id="worker-state">IDLE</span>
        </div>
        <div class="actions">
          <button id="worker-dispatch">DISPATCH ${this.poolSize} WORKERS</button>
          <button id="worker-reset">TERMINATE POOL</button>
        </div>
        <div id="worker-log" class="log">Worker pool ready.</div>
      </div>`;

    this.mount.querySelector("#worker-dispatch").onclick = () => this.dispatch();
    this.mount.querySelector("#worker-reset").onclick = () => this.terminate();
  }

  dispatch() {
    this.terminate(false);

    const state = this.mount.querySelector("#worker-state");
    const log = this.mount.querySelector("#worker-log");
    state.textContent = "SPAWNING";
    log.textContent = `[Spawning ${this.poolSize} native Web Workers]\n`;

    const workerCode = `
      self.onmessage = ({ data }) => {
        const { id, iterations } = data;
        let checksum = 0;
        for (let i = 1; i <= iterations; i++) {
          checksum += Math.sqrt(i);
        }
        self.postMessage({ id, checksum, status: "DONE" });
      };
    `;

    const url = URL.createObjectURL(new Blob([workerCode], { type: "text/javascript" }));
    this.workers = [];
    this.completed = 0;
    this.runStartedAt = performance.now();
    state.textContent = "RUNNING";

    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(url);
      this.workers.push(worker);

      worker.onmessage = ({ data }) => {
        this.completed++;
        log.textContent += `→ Worker ${String(data.id + 1).padStart(2,"0")}: COMPLETE\n`;

        if (this.completed === this.poolSize) {
          const elapsed = performance.now() - this.runStartedAt;
          state.textContent = "COMPLETE";
          log.textContent += `\n[ALL WORKERS COMPLETE] ${elapsed.toFixed(2)} ms`;
          this.sendTelemetry({
            workers: this.poolSize,
            completed: this.completed,
            latency: `${elapsed.toFixed(2)} ms`,
            execution: "NATIVE WEB WORKERS",
            status: "COMPLETE"
          });
          this.workers.forEach(w => w.terminate());
          this.workers = [];
          URL.revokeObjectURL(url);
        }
      };

      worker.onerror = event => {
        log.textContent += `→ Worker ${String(i + 1).padStart(2,"0")}: ERROR ${event.message || "unknown"}\n`;
        worker.terminate();
      };

      worker.postMessage({ id: i, iterations: 2_000_000 });
    }
  }

  terminate(report = true) {
    for (const worker of this.workers) worker.terminate();
    this.workers = [];
    this.completed = 0;

    if (report) {
      const state = this.mount.querySelector("#worker-state");
      const log = this.mount.querySelector("#worker-log");
      if (state) state.textContent = "IDLE";
      if (log) log.textContent = "All workers terminated.";
      this.sendTelemetry({ workers: 0, status: "TERMINATED" });
    }
  }

  destroy() {
    this.terminate(false);
    this.mount.replaceChildren();
  }
}

window.WorkerPoolEngine = WorkerPoolEngine;
