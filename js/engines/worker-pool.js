class WorkerPoolEngine {
  constructor(mount, telemetry) {
    this.mount = mount;
    this.sendTelemetry = telemetry;
    this.timers = [];
    this.activeTasks = 0;
  }

  init() {
    this.render();
    this.sendTelemetry({ model: "Task Pool Simulation", status: "READY", tasks: 0 });
  }

  render() {
    this.mount.innerHTML = `
      <div class="engine-shell">
        <div class="engine-top">
          <strong>CONCURRENCY LAB // TASK POOL</strong>
          <span id="state">IDLE</span>
        </div>
        <div class="actions">
          <button id="run">DISPATCH 4 TASKS</button>
          <button id="reset">RESET</button>
        </div>
        <div id="log" class="log">Task pool ready.</div>
      </div>`;

    this.mount.querySelector("#run").onclick = () => this.dispatch();
    this.mount.querySelector("#reset").onclick = () => this.reset();
  }

  dispatch() {
    this.clearTimers();
    const state = this.mount.querySelector("#state");
    const log = this.mount.querySelector("#log");

    this.activeTasks = 4;
    let completed = 0;
    state.textContent = "RUNNING";
    log.textContent = "[Dispatching 4 simulated background tasks]\n";

    for (let i = 1; i <= 4; i++) {
      const timer = setTimeout(() => {
        completed++;
        log.textContent += `→ Task ${i}: COMPLETE\n`;
        if (completed === 4) {
          state.textContent = "COMPLETE";
          log.textContent += "\n[ALL TASKS RESOLVED]";
          this.sendTelemetry({ tasks: 4, completed: 4, status: "COMPLETE", implementation: "simulation" });
        }
      }, i * 180);
      this.timers.push(timer);
    }
  }

  reset() {
    this.clearTimers();
    this.activeTasks = 0;
    this.render();
    this.sendTelemetry({ tasks: 0, status: "IDLE" });
  }

  clearTimers() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
  }

  destroy() {
    this.clearTimers();
    this.mount.replaceChildren();
  }
}

window.WorkerPoolEngine = WorkerPoolEngine;
