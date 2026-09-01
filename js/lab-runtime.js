class SystemsLabRuntime {
  constructor() {
    this.engines = new Map();
    this.active = null;
    this.container = document.getElementById("engine-viewport");
    this.title = document.getElementById("ins-title");
    this.tag = document.getElementById("ins-tag");
    this.desc = document.getElementById("ins-desc");
    this.complexity = document.getElementById("ins-complexity");
    this.metrics = document.getElementById("ins-metrics");
  }

  registerEngine(id, metadata, EngineClass) {
    if (this.engines.has(id)) throw new Error(`Engine '${id}' already registered`);
    this.engines.set(id, { metadata, EngineClass, instance: null });
    this.renderButton(id, metadata);
  }

  renderButton(id, metadata) {
    const list = document.getElementById("engine-matrix");
    if (!list) return;
    const button = document.createElement("button");
    button.className = "engine-button";
    button.id = `engine-${id}`;
    const title = document.createElement("strong");
    title.textContent = metadata.title;
    const tag = document.createElement("small");
    tag.textContent = metadata.tag || "";
    button.append(title, tag);
    button.addEventListener("click", () => this.mountEngine(id));
    list.appendChild(button);
  }

  mountEngine(id) {
    const target = this.engines.get(id);
    if (!target) return;
    this.active?.instance?.destroy?.();
    this.container.replaceChildren();
    document.querySelectorAll(".engine-button").forEach(b => b.classList.remove("active"));
    document.getElementById(`engine-${id}`)?.classList.add("active");
    target.instance = new target.EngineClass(this.container, metrics => this.updateTelemetry(metrics));
    this.active = target;
    this.title.textContent = target.metadata.title;
    this.tag.textContent = target.metadata.tag || "";
    this.desc.textContent = target.metadata.concept || target.metadata.shortDesc || "";
    this.complexity.textContent = target.metadata.complexity || "";
    target.instance.init();
  }

  updateTelemetry(metrics = {}) {
    this.metrics.replaceChildren();
    for (const [key, value] of Object.entries(metrics)) {
      const row = document.createElement("div");
      row.className = "metric";
      const keyNode = document.createElement("b");
      keyNode.textContent = `${key}: `;
      const valueNode = document.createElement("span");
      valueNode.textContent = String(value);
      row.append(keyNode, document.createElement("br"), valueNode);
      this.metrics.appendChild(row);
    }
  }
}

window.labRuntime = new SystemsLabRuntime();
