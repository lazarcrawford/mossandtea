(function () {
  const body = document.body;
  const telegram = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const form = document.getElementById("prompt-form");
  const promptInput = document.getElementById("prompt");
  const terminalInput = document.querySelector(".terminal-mirror");
  const winInput = document.querySelector(".win-mirror");
  const workspaceInput = document.getElementById("workspace");
  const modeInput = document.getElementById("mode");
  const status = document.getElementById("status");
  const terminalWorkspace = document.getElementById("terminal-workspace");
  const terminalMode = document.getElementById("terminal-mode");
  const terminalFeed = document.getElementById("terminal-feed");
  const hudWorkspace = document.getElementById("hud-workspace");
  const hudMode = document.getElementById("hud-mode");
  const hudLaunch = document.getElementById("hud-launch");
  const winLine = document.getElementById("win-line");
  const winFeed = document.getElementById("win-feed");
  const canvas = document.getElementById("field");
  const ctx = canvas.getContext("2d");
  const startButton = document.getElementById("start-button");
  const startPanel = document.getElementById("start-panel");
  const taskPill = document.getElementById("task-pill");
  const codexWindow = document.getElementById("codex-window");
  const clock = document.getElementById("clock");
  const particles = [];
  const workspaceLabels = {
    "Web Engineering": "Web Engineering - Moss & Tea",
    "Node 1": "CSG - Node 1",
    "LucidBridge": "CSG - LucidBridge",
    "Mission Control": "Crawford Mission Control",
  };
  let theme = localStorage.getItem("codex-console-theme") || "harness";
  let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
  let windowMinimized = false;
  let windowMaximized = false;
  let launchMode = "browser";
  let drag = null;

  function activeInput() {
    if (theme === "terminal") return terminalInput;
    if (theme === "win95") return winInput;
    return promptInput;
  }

  function syncMirrors(source) {
    const value = source.value;
    [promptInput, terminalInput, winInput].forEach((input) => {
      if (input !== source) input.value = value;
    });
    if (telegram && telegram.MainButton) {
      if (value.trim()) telegram.MainButton.show();
      else telegram.MainButton.hide();
    }
  }

  function syncControlReadouts() {
    const workspaceLabel = workspaceInput.options[workspaceInput.selectedIndex]?.text || "Web Engineering";
    const modeLabel = modeInput.value || "fresh";
    terminalWorkspace.textContent = workspaceLabel;
    terminalMode.textContent = modeLabel;
    hudWorkspace.textContent = workspaceLabel;
    hudMode.textContent = modeLabel;
    winLine.textContent = `C:\\CODEX> workspace: ${workspaceLabel} | mode: ${modeLabel}`;
    writeFeed(`workspace set: ${workspaceLabel}`);
  }

  function setTheme(nextTheme) {
    theme = nextTheme;
    body.dataset.theme = theme;
    localStorage.setItem("codex-console-theme", theme);
    document.querySelectorAll("[data-set-theme]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.setTheme === theme));
    });
    const color = theme === "win95" ? "#008080" : theme === "terminal" ? "#020403" : "#100712";
    if (telegram) {
      telegram.setHeaderColor(color);
      telegram.setBackgroundColor(color);
    }
    window.setTimeout(() => activeInput().focus(), 60);
  }

  function setStatus(message) {
    status.textContent = message;
    terminalFeed.textContent = `status: ${message}`;
    winFeed.textContent = message;
  }

  function writeFeed(message) {
    terminalFeed.textContent = `status: ${message}`;
    winFeed.textContent = message;
    status.textContent = message;
  }

  function isKeyboardLaunch() {
    return new URLSearchParams(window.location.search).get("launch") === "keyboard";
  }

  function updateLaunchMode() {
    if (!telegram) {
      launchMode = "browser preview";
    } else if (isKeyboardLaunch()) {
      launchMode = "keyboard handoff";
    } else {
      launchMode = "menu preview";
    }
    hudLaunch.textContent = launchMode;
    if (launchMode === "menu preview") {
      writeFeed("menu preview: open via /console keyboard to transmit");
    }
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function palette() {
    if (theme === "terminal") return ["#36ff72", "#00e5ff"];
    if (theme === "win95") return ["#000080", "#ff00ff", "#ffff00"];
    return ["#ff7a2f", "#35f2bd", "#ff3b73", "#ffd166"];
  }

  function spawnParticle(x, y, force = 1) {
    const colors = palette();
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5 * force,
      vy: (Math.random() - 0.5) * 1.5 * force,
      life: 1,
      size: Math.random() * 2.8 + 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    if (particles.length > 180) particles.shift();
  }

  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (pointer.active && theme === "harness") {
      spawnParticle(pointer.x, pointer.y, 1.4);
    }
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= theme === "harness" ? 0.01 : 0.016;
      ctx.globalAlpha = Math.max(particle.life, 0);
      ctx.fillStyle = particle.color;
      if (theme === "terminal") {
        ctx.fillRect(particle.x, particle.y, particle.size * 2, 1);
      } else if (theme === "win95") {
        ctx.fillRect(particle.x, particle.y, particle.size * 2.2, particle.size * 2.2);
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      if (particles[index].life <= 0) particles.splice(index, 1);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  function submitPrompt() {
    const input = activeInput();
    syncMirrors(input);
    const text = input.value.trim();
    if (!text) {
      setStatus("No signal entered.");
      input.focus();
      return;
    }
    if (text === "/help") {
      writeFeed("commands: /help, /workspace, /mode, /theme, cmd+enter sends");
      return;
    }
    if (text === "/workspace") {
      writeFeed(`workspace: ${workspaceLabels[workspaceInput.value] || workspaceInput.value}`);
      return;
    }
    if (text === "/mode") {
      writeFeed(`mode: ${modeInput.value}`);
      return;
    }
    if (text.startsWith("/theme")) {
      const next = text.split(/\s+/)[1];
      if (["harness", "terminal", "win95"].includes(next)) {
        setTheme(next);
        writeFeed(`theme switched: ${next}`);
      } else {
        writeFeed("theme options: harness, terminal, win95");
      }
      return;
    }
    writeFeed("transmitting signal to Telegram...");
    const payload = {
      type: "codex_prompt",
      text,
      workspace: workspaceInput.value,
      mode: modeInput.value,
      theme,
      sent_at: new Date().toISOString(),
    };
    if (telegram && telegram.sendData && isKeyboardLaunch()) {
      telegram.sendData(JSON.stringify(payload));
      setStatus("sent to Telegram; watch the chat for Codex telemetry");
      [promptInput, terminalInput, winInput].forEach((mirror) => {
        mirror.value = "";
      });
      if (telegram.HapticFeedback) telegram.HapticFeedback.notificationOccurred("success");
    } else if (telegram && telegram.sendData) {
      writeFeed("menu launch cannot hand off; send /console, then open the keyboard button");
      if (telegram.showAlert) {
        telegram.showAlert("This menu launch is preview-only for sending. In the chat, send /console and open the keyboard button so Telegram can hand the prompt to the bot.");
      }
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
      setStatus("Preview mode: copied prompt. Open inside Telegram to transmit.");
    }
  }

  document.querySelectorAll("[data-set-theme]").forEach((button) => {
    button.addEventListener("click", () => setTheme(button.dataset.setTheme));
  });

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeChoice);
      startPanel.hidden = true;
    });
  });

  document.querySelectorAll("[data-workspace-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      workspaceInput.value = button.dataset.workspaceChoice;
      syncControlReadouts();
      writeFeed(`workspace selected: ${workspaceLabels[workspaceInput.value] || workspaceInput.value}`);
      startPanel.hidden = true;
    });
  });

  document.querySelectorAll("[data-mode-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      modeInput.value = button.dataset.modeChoice;
      syncControlReadouts();
      writeFeed(`mode selected: ${modeInput.value}`);
      startPanel.hidden = true;
    });
  });

  [promptInput, terminalInput, winInput].forEach((input) => {
    input.addEventListener("input", () => syncMirrors(input));
  });

  terminalInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt();
    }
    if (event.key === "/" && !terminalInput.value.trim()) {
      window.setTimeout(() => {
        writeFeed("commands: /help, /workspace, /mode, /theme harness|terminal|win95");
      }, 0);
    }
  });

  workspaceInput.addEventListener("change", syncControlReadouts);
  modeInput.addEventListener("change", syncControlReadouts);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitPrompt();
  });

  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      submitPrompt();
      return;
    }
    if (theme === "terminal" && event.key === "Tab") {
      event.preventDefault();
      const options = Array.from(workspaceInput.options);
      const next = (workspaceInput.selectedIndex + 1) % options.length;
      workspaceInput.selectedIndex = next;
      syncControlReadouts();
      writeFeed(`workspace cycled: ${options[next].text}`);
    }
  });

  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY, active: true };
    if (theme !== "harness" && Math.random() > 0.72) spawnParticle(event.clientX, event.clientY);
  });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });

  startButton.addEventListener("click", () => {
    startPanel.hidden = !startPanel.hidden;
  });
  document.querySelector("[data-open-window]").addEventListener("click", () => {
    restoreWindow();
  });
  taskPill.addEventListener("click", restoreWindow);
  document.querySelector("[data-window-minimize]").addEventListener("click", () => {
    windowMinimized = true;
    codexWindow.hidden = true;
    taskPill.classList.add("task-pill--minimized");
    writeFeed("window minimized to taskbar");
  });
  document.querySelector("[data-window-maximize]").addEventListener("click", () => {
    windowMaximized = !windowMaximized;
    codexWindow.classList.toggle("win-window--maximized", windowMaximized);
    writeFeed(windowMaximized ? "window maximized" : "window restored");
  });
  document.querySelector("[data-window-close]").addEventListener("click", () => {
    windowMinimized = true;
    codexWindow.hidden = true;
    writeFeed("window closed; click desktop icon or taskbar");
  });

  document.querySelector(".win-titlebar").addEventListener("pointerdown", (event) => {
    if (windowMaximized || event.target.closest("button")) return;
    const rect = codexWindow.getBoundingClientRect();
    codexWindow.style.left = `${rect.left}px`;
    codexWindow.style.top = `${rect.top}px`;
    codexWindow.style.transform = "none";
    drag = {
      id: event.pointerId,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  });

  document.querySelector(".win-titlebar").addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const left = Math.max(4, Math.min(window.innerWidth - 80, event.clientX - drag.dx));
    const top = Math.max(46, Math.min(window.innerHeight - 90, event.clientY - drag.dy));
    codexWindow.style.left = `${left}px`;
    codexWindow.style.top = `${top}px`;
  });

  document.querySelector(".win-titlebar").addEventListener("pointerup", (event) => {
    if (drag && drag.id === event.pointerId) drag = null;
  });

  function restoreWindow() {
    windowMinimized = false;
    codexWindow.hidden = false;
    taskPill.classList.remove("task-pill--minimized");
    writeFeed("window restored");
  }

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (telegram) {
    telegram.ready();
    telegram.expand();
    if (telegram.MainButton) {
      telegram.MainButton.setText("Transmit to Codex");
      telegram.MainButton.onClick(submitPrompt);
    }
  } else {
    setStatus("Browser preview mode. Telegram opens the live harness.");
  }

  resizeCanvas();
  syncControlReadouts();
  setTheme(theme);
  updateLaunchMode();
  updateClock();
  animate();
  window.addEventListener("resize", resizeCanvas);
  window.setInterval(updateClock, 30000);
})();
