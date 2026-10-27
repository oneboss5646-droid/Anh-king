import { BuilderProject } from '../types';

export const STARTER_WEBSITE: BuilderProject = {
  id: 'starter_website_project',
  title: 'Apex Modern Landing Page',
  type: 'website',
  activeFile: 'html',
  promptDescription: 'Modern responsive marketing website with hero section, feature cards, and interactive newsletter signup.',
  isAiGenerated: false,
  updatedAt: Date.now(),
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Studio — Next Gen Design</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Header -->
  <header class="navbar">
    <div class="logo">⚡ ApexStudio</div>
    <nav class="nav-links">
      <a href="#features">Features</a>
      <a href="#showcase">Showcase</a>
      <a href="#about">About</a>
    </nav>
    <button class="cta-btn" id="headerCta">Get Started</button>
  </header>

  <!-- Hero Section -->
  <main>
    <section class="hero">
      <div class="badge">Version 2.0 Released</div>
      <h1 class="hero-title">Craft Exceptional Digital Experiences</h1>
      <p class="hero-sub">
        Build high-performance web applications with modular architecture and modern design standards.
      </p>
      <div class="hero-actions">
        <button class="primary-btn" id="exploreBtn">Explore Platform</button>
        <button class="secondary-btn" id="demoBtn">View Demo</button>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="features" id="features">
      <h2 class="section-title">Built for Speed and Precision</h2>
      <div class="card-grid">
        <div class="card">
          <div class="card-icon">🚀</div>
          <h3>Ultra Fast Performance</h3>
          <p>Zero bloat, lightweight bundle delivery optimized for mobile Safari and modern browsers.</p>
        </div>
        <div class="card">
          <div class="card-icon">🛡️</div>
          <h3>Secure by Default</h3>
          <p>Sandboxed client execution with zero third-party telemetry or invasive tracking.</p>
        </div>
        <div class="card">
          <div class="card-icon">📱</div>
          <h3>Mobile First</h3>
          <p>Seamless thumb zone ergonomics, safe area margins, and touch-optimized controls.</p>
        </div>
      </div>
    </section>

    <!-- Interactive Section -->
    <section class="interactive-box">
      <h3>Interactive Counter Test</h3>
      <p>Demonstrating real working vanilla JavaScript execution:</p>
      <div class="counter-wrap">
        <button id="decBtn" class="count-btn">-</button>
        <span id="counterVal">0</span>
        <button id="incBtn" class="count-btn">+</button>
      </div>
      <p class="counter-msg" id="counterMsg">Click to interact</p>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 ApexStudio. Built with ChatGPT 6 Plus Website Builder.</p>
  </footer>

  <script src="app.js"></script>
</body>
</html>`,
  css: `/* Reset & Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #0b0f19;
  color: #f1f5f9;
  line-height: 1.6;
  padding: 0 16px;
}

/* Navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  max-width: 1000px;
  margin: 0 auto;
}

.logo {
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.5px;
  color: #38bdf8;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #ffffff;
}

@media (max-width: 600px) {
  .nav-links { display: none; }
}

.cta-btn {
  background: #0284c7;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.cta-btn:hover {
  background: #0369a1;
}

/* Hero */
.hero {
  text-align: center;
  padding: 60px 10px 40px;
  max-width: 750px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.hero-title {
  font-size: 2.25rem;
  line-height: 1.2;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.hero-sub {
  color: #94a3b8;
  font-size: 1rem;
  margin-bottom: 28px;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.primary-btn {
  background: #38bdf8;
  color: #0b0f19;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s;
}

.primary-btn:active {
  transform: scale(0.97);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #f1f5f9;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

/* Features */
.features {
  max-width: 1000px;
  margin: 40px auto;
}

.section-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 30px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px;
  border-radius: 14px;
  transition: border-color 0.2s;
}

.card:hover {
  border-color: rgba(56, 189, 248, 0.4);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.card h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #f8fafc;
}

.card p {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Interactive Box */
.interactive-box {
  background: rgba(56, 189, 248, 0.05);
  border: 1px dashed rgba(56, 189, 248, 0.3);
  border-radius: 14px;
  padding: 24px;
  max-width: 450px;
  margin: 40px auto;
  text-align: center;
}

.interactive-box h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.interactive-box p {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.counter-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}

.count-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #0284c7;
  color: white;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

#counterVal {
  font-size: 2rem;
  font-weight: 700;
  min-width: 60px;
}

.counter-msg {
  font-size: 0.8rem;
  color: #38bdf8;
}

/* Footer */
.footer {
  text-align: center;
  padding: 40px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 40px;
  font-size: 0.8rem;
  color: #64748b;
}`,
  js: `// Interactive Vanilla JS Logic
console.log("ApexStudio Website Loaded Successfully in Sandboxed Preview!");

let count = 0;
const counterVal = document.getElementById("counterVal");
const counterMsg = document.getElementById("counterMsg");
const incBtn = document.getElementById("incBtn");
const decBtn = document.getElementById("decBtn");
const exploreBtn = document.getElementById("exploreBtn");

incBtn.addEventListener("click", () => {
  count++;
  updateCounter();
  console.log("Counter incremented:", count);
});

decBtn.addEventListener("click", () => {
  count--;
  updateCounter();
  console.log("Counter decremented:", count);
});

function updateCounter() {
  counterVal.textContent = count;
  if (count > 0) {
    counterMsg.textContent = "Positive momentum! Keep going.";
    counterMsg.style.color = "#34d399";
  } else if (count < 0) {
    counterMsg.textContent = "Negative value reached.";
    counterMsg.style.color = "#f87171";
  } else {
    counterMsg.textContent = "Zero balance.";
    counterMsg.style.color = "#38bdf8";
  }
}

exploreBtn.addEventListener("click", () => {
  alert("Exploring Apex Platform! Real sandboxed JavaScript is functional.");
  console.log("User clicked Explore Platform button.");
});
`,
};

export const STARTER_WEBAPP: BuilderProject = {
  id: 'starter_webapp_project',
  title: 'FocusTrack Mini Task Manager',
  type: 'webapp',
  activeFile: 'html',
  promptDescription: 'Interactive single-page task manager with status filters, local storage persistence, and completion animations.',
  isAiGenerated: false,
  updatedAt: Date.now(),
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FocusTrack — Web App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app-shell">
    <header class="app-header">
      <h1>🎯 FocusTrack</h1>
      <span class="badge" id="statsBadge">0 Completed</span>
    </header>

    <div class="input-card">
      <form id="taskForm">
        <input type="text" id="taskInput" placeholder="Add a new task..." required autocomplete="off">
        <button type="submit" id="addBtn">Add</button>
      </form>
    </div>

    <div class="filter-bar">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="active">Active</button>
      <button class="filter-btn" data-filter="done">Completed</button>
    </div>

    <ul class="task-list" id="taskList"></ul>

    <div class="empty-state" id="emptyState">
      <p>No tasks found. Add a task above to begin!</p>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
  css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #0f172a;
  color: #f8fafc;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.app-shell {
  width: 100%;
  max-width: 440px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.app-header h1 {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.badge {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.input-card form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

#taskInput {
  flex: 1;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 16px; /* Prevents iOS Safari auto-zoom */
  outline: none;
}

#taskInput:focus {
  border-color: #10b981;
}

#addBtn {
  background: #10b981;
  color: #ffffff;
  border: none;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
}

.filter-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  background: #1e293b;
  padding: 4px;
  border-radius: 8px;
}

.filter-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 0;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
}

.filter-btn.active {
  background: #0f172a;
  color: #ffffff;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  cursor: pointer;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #10b981;
  cursor: pointer;
}

.task-title {
  font-size: 0.95rem;
  transition: opacity 0.2s, text-decoration 0.2s;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  opacity: 0.4;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  padding: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 30px 10px;
  color: #64748b;
  font-size: 0.85rem;
}`,
  js: `// FocusTrack Single-Page Task Manager
console.log("FocusTrack Mini Web App Started");

let tasks = [
  { id: 1, text: "Explore ChatGPT 6 Plus Web App Builder", done: true },
  { id: 2, text: "Edit HTML, CSS, and JS in the Code tab", done: false },
  { id: 3, text: "Check Console tab for live preview logs", done: false }
];
let activeFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const statsBadge = document.getElementById("statsBadge");
const filterBtns = document.querySelectorAll(".filter-btn");

function render() {
  const filtered = tasks.filter(t => {
    if (activeFilter === "active") return !t.done;
    if (activeFilter === "done") return t.done;
    return true;
  });

  taskList.innerHTML = "";
  if (filtered.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    filtered.forEach(t => {
      const li = document.createElement("li");
      li.className = "task-item " + (t.done ? "completed" : "");

      const left = document.createElement("div");
      left.className = "task-left";
      left.onclick = () => toggleTask(t.id);

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = t.done;

      const span = document.createElement("span");
      span.className = "task-title";
      span.textContent = t.text;

      left.appendChild(checkbox);
      left.appendChild(span);

      const del = document.createElement("button");
      del.className = "delete-btn";
      del.innerHTML = "×";
      del.onclick = (e) => {
        e.stopPropagation();
        deleteTask(t.id);
      };

      li.appendChild(left);
      li.appendChild(del);
      taskList.appendChild(li);
    });
  }

  const completedCount = tasks.filter(t => t.done).length;
  statsBadge.textContent = completedCount + " / " + tasks.length + " Done";
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  console.log("Toggled task:", id);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  console.log("Deleted task:", id);
  render();
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, done: false });
  taskInput.value = "";
  console.log("Added new task:", text);
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    console.log("Active filter switched to:", activeFilter);
    render();
  });
});

render();
`,
};

/**
 * Combines HTML, CSS, and JS into a complete sandboxed document
 * with console log redirection to parent window.
 */
export function combineProjectToHtml(project: BuilderProject): string {
  const consoleScript = `
    <script>
      (function() {
        var originalLog = console.log;
        var originalWarn = console.warn;
        var originalError = console.error;

        function sendToParent(type, args) {
          try {
            var msg = Array.from(args).map(function(item) {
              if (typeof item === 'object') {
                try { return JSON.stringify(item); } catch(e) { return String(item); }
              }
              return String(item);
            }).join(' ');

            window.parent.postMessage({
              type: 'PREVIEW_CONSOLE',
              level: type,
              message: msg,
              timestamp: Date.now()
            }, '*');
          } catch(e) {}
        }

        console.log = function() {
          sendToParent('log', arguments);
          originalLog.apply(console, arguments);
        };
        console.warn = function() {
          sendToParent('warn', arguments);
          originalWarn.apply(console, arguments);
        };
        console.error = function() {
          sendToParent('error', arguments);
          originalError.apply(console, arguments);
        };

        window.onerror = function(msg, url, line) {
          sendToParent('error', ['Error at line ' + line + ': ' + msg]);
        };
      })();
    </script>
  `;

  // Inject CSS inside head or before closing tag
  let html = project.html;

  const styleTag = `<style>\n${project.css}\n</style>`;
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleTag}\n</head>`);
  } else {
    html = styleTag + html;
  }

  // Inject console listener & script inside body or at end
  const scriptTag = `${consoleScript}\n<script>\n${project.js}\n</script>`;
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${scriptTag}\n</body>`);
  } else {
    html = html + scriptTag;
  }

  return html;
}
