// users/server.js

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

const usersDb = require('./db.json');

// ------------------------------
// Helpers
// ------------------------------
function getUsersArray() {
  return Array.isArray(usersDb) ? usersDb : usersDb.users || [];
}

// ------------------------------
// Middleware: simple logger
// ------------------------------
app.use(function* (next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log('%s %s - %s ms', this.method, this.url, ms);
});

// ------------------------------
// Health Check (for ALB)
// ------------------------------
router.get('/health', function* () {
  this.status = 200;
  this.body = { ok: true, service: 'users', uptime: process.uptime() };
});

// ------------------------------
// USERS API ROUTES
// ------------------------------
router.get('/api/users', function* () {
  this.body = getUsersArray();
});

router.get('/api/users/:userId', function* () {
  const id = parseInt(this.params.userId, 10);
  const users = getUsersArray();
  this.body = users.find((u) => u.id == id);
});

router.get('/users', function* () {
  this.body = getUsersArray();
});

router.get('/users/:userId', function* () {
  const id = parseInt(this.params.userId, 10);
  const users = getUsersArray();
  this.body = users.find((u) => u.id == id);
});

// ------------------------------
// Root: HTML landing page
// ------------------------------
router.get('/', function* () {
  this.type = 'html';
  this.body = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Microforum – Scalable Microservices on AWS</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #050816;
        --bg-card: #0b1020;
        --accent: #6366f1;
        --accent-soft: rgba(99,102,241,0.12);
        --text: #e5e7eb;
        --text-muted: #9ca3af;
        --border: #1f2937;
        --ok: #22c55e;
        --warn: #f97316;
        --err: #ef4444;
        --shadow: 0 18px 45px rgba(0,0,0,0.65);
        --radius-xl: 18px;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
                     "Inter", sans-serif;
      }

      body {
        min-height: 100vh;
        background: radial-gradient(circle at top, #111827 0, #020617 45%, #000 100%);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .shell {
        width: 100%;
        max-width: 1080px;
        background: linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.98));
        border-radius: 28px;
        border: 1px solid rgba(148,163,184,0.12);
        box-shadow: var(--shadow);
        overflow: hidden;
        position: relative;
      }

      /* subtle glow */
      .shell::before {
        content: "";
        position: absolute;
        inset: -120px;
        background:
          radial-gradient(circle at 10% 0%, rgba(94,234,212,0.08), transparent 55%),
          radial-gradient(circle at 90% 10%, rgba(129,140,248,0.18), transparent 55%),
          radial-gradient(circle at 50% 100%, rgba(244,114,182,0.09), transparent 55%);
        opacity: 0.95;
        pointer-events: none;
        z-index: -1;
      }

      .header {
        padding: 20px 26px 16px;
        border-bottom: 1px solid rgba(15,23,42,0.9);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .title-block h1 {
        font-size: 1.35rem;
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .badge {
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        padding: 3px 8px;
        border-radius: 999px;
        background: rgba(37,99,235,0.16);
        border: 1px solid rgba(96,165,250,0.4);
        color: #bfdbfe;
      }

      .subtitle {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 4px;
      }

      .meta {
        text-align: right;
        font-size: 0.75rem;
      }

      .meta strong {
        color: #e5e7eb;
      }

      .meta span {
        color: var(--text-muted);
        display: block;
      }

      .body {
        display: grid;
        grid-template-columns: minmax(0, 2.1fr) minmax(0, 1.4fr);
        gap: 18px;
        padding: 18px 22px 20px;
      }

      @media (max-width: 840px) {
        .body {
          grid-template-columns: minmax(0,1fr);
        }
        .meta {
          text-align: left;
        }
      }

      .panel {
        background: radial-gradient(circle at top left, rgba(148,163,184,0.08), rgba(15,23,42,0.98));
        border-radius: var(--radius-xl);
        border: 1px solid var(--border);
        padding: 16px 18px 18px;
        position: relative;
        overflow: hidden;
      }

      .panel + .panel {
        margin-top: 10px;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .panel-title {
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #9ca3ff;
      }

      .panel-kicker {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--text-muted);
      }

      .hero-copy {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.5;
      }

      .hero-copy strong {
        color: var(--text);
      }

      .pill-row {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .pill {
        font-size: 0.7rem;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(148,163,184,0.3);
        background: rgba(15,23,42,0.8);
        color: #e5e7eb;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .pill span {
        font-size: 0.75rem;
        color: #a5b4fc;
      }

      .cta-row {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid rgba(129,140,248,0.7);
        background: radial-gradient(circle at top, var(--accent), #4f46e5);
        color: white;
        font-size: 0.82rem;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        box-shadow: 0 10px 25px rgba(79,70,229,0.45);
        transition: transform 0.13s ease, box-shadow 0.13s ease, background 0.13s ease;
      }

      .btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 16px 40px rgba(79,70,229,0.6);
      }

      .btn-secondary {
        background: rgba(15,23,42,0.9);
        border-color: rgba(148,163,184,0.6);
        color: #e5e7eb;
        box-shadow: none;
      }

      .btn-secondary:hover {
        background: rgba(31,41,55,0.95);
        box-shadow: 0 8px 20px rgba(15,23,42,0.85);
      }

      .btn span.icon {
        font-size: 1.05rem;
      }

      .right-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .endpoint-grid {
        display: grid;
        grid-template-columns: minmax(0,1fr);
        gap: 10px;
      }

      .endpoint-card {
        border-radius: 14px;
        background: rgba(15,23,42,0.95);
        border: 1px solid rgba(55,65,81,0.9);
        padding: 10px 11px 11px;
      }

      .endpoint-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 4px;
      }

      .endpoint-path {
        font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.78rem;
        color: #e5e7eb;
      }

      .tag {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid rgba(55,65,81,0.9);
        background: rgba(15,23,42,0.9);
        color: var(--text-muted);
      }

      .status {
        font-size: 0.76rem;
        color: var(--text-muted);
      }

      .status.ok {
        color: var(--ok);
      }
      .status.warn {
        color: var(--warn);
      }
      .status.err {
        color: var(--err);
      }

      .endpoint-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 5px;
      }

      .endpoint-meta {
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .endpoint-btn {
        font-size: 0.72rem;
        padding: 4px 9px;
        border-radius: 999px;
        border: 1px solid rgba(129,140,248,0.8);
        background: rgba(79,70,229,0.16);
        color: #c7d2fe;
        cursor: pointer;
        text-decoration: none;
      }

      .endpoint-btn:hover {
        background: rgba(79,70,229,0.32);
      }

      .footnote {
        margin-top: 4px;
        font-size: 0.7rem;
        color: var(--text-muted);
      }

      .footnote strong {
        color: #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="header">
        <div class="title-block">
          <h1>
            Microforum
            <span class="badge">ECS Fargate • CI/CD • IaC</span>
          </h1>
          <p class="subtitle">
            Scalable forum microservices on AWS – users, posts, and threads behind an Application Load Balancer.
          </p>
        </div>
        <div class="meta">
          <span><strong>Group 6 – DevOps Solutions</strong></span>
          <span>Users • Posts • Threads microservices</span>
        </div>
      </div>

      <div class="body">
        <!-- LEFT: high-level description -->
        <div>
          <div class="panel">
            <div class="panel-header">
              <div>
                <div class="panel-kicker">Production entry point</div>
                <div class="panel-title">Application Load Balancer DNS</div>
              </div>
            </div>
            <p class="hero-copy">
              This page is served from the <strong>users service</strong> running on
              <strong>Amazon ECS Fargate</strong> behind an
              <strong>Application Load Balancer</strong>. From here we can:
            </p>
            <ul class="hero-copy" style="margin: 8px 0 0 18px;">
              <li>Hit <code>/users</code>, <code>/posts</code>, and <code>/threads</code> via the ALB.</li>
              <li>Verify that each microservice is reachable through the same DNS entry.</li>
              <li>Demonstrate the microservices architecture live in the browser.</li>
            </ul>

            <div class="pill-row">
              <div class="pill"><span>Runtime</span> ECS Fargate • 2 AZ</div>
              <div class="pill"><span>Traffic</span> ALB path-based routing</div>
              <div class="pill"><span>Pipeline</span> CodePipeline → CodeBuild → CodeDeploy</div>
            </div>

            <div class="cta-row">
              <a class="btn" href="/users" target="_blank" rel="noopener noreferrer">
                <span class="icon">👤</span>
                <span>Open /users (JSON)</span>
              </a>
              <a class="btn btn-secondary" href="/posts" target="_blank" rel="noopener noreferrer">
                <span class="icon">📝</span>
                <span>Open /posts</span>
              </a>
              <a class="btn btn-secondary" href="/threads" target="_blank" rel="noopener noreferrer">
                <span class="icon">🧵</span>
                <span>Open /threads</span>
              </a>
            </div>
          </div>

          <div class="panel">
            <div class="panel-header">
              <div>
                <div class="panel-kicker">Live health probe</div>
                <div class="panel-title">Endpoint status (via ALB)</div>
              </div>
            </div>
            <p class="hero-copy">
              Below we ping the three core endpoints
              <code>/users</code>, <code>/posts</code>, and <code>/threads</code>
              through the same DNS that the professor is using. This shows whether each
              microservice is <strong>reachable in production</strong>.
            </p>
          </div>
        </div>

        <!-- RIGHT: endpoint cards -->
        <div class="right-panel">
          <div class="endpoint-grid">
            <div class="endpoint-card">
              <div class="endpoint-top">
                <div>
                  <div class="endpoint-path">GET /users</div>
                  <div id="users-status" class="status">Checking…</div>
                </div>
                <span class="tag">Users service</span>
              </div>
              <div class="endpoint-footer">
                <div class="endpoint-meta">
                  <span id="users-meta">Awaiting response</span>
                </div>
                <button class="endpoint-btn" onclick="openAndLog('/users')">
                  View payload
                </button>
              </div>
            </div>

            <div class="endpoint-card">
              <div class="endpoint-top">
                <div>
                  <div class="endpoint-path">GET /posts</div>
                  <div id="posts-status" class="status">Checking…</div>
                </div>
                <span class="tag">Posts service</span>
              </div>
              <div class="endpoint-footer">
                <div class="endpoint-meta">
                  <span id="posts-meta">Awaiting response</span>
                </div>
                <button class="endpoint-btn" onclick="openAndLog('/posts')">
                  View payload
                </button>
              </div>
            </div>

            <div class="endpoint-card">
              <div class="endpoint-top">
                <div>
                  <div class="endpoint-path">GET /threads</div>
                  <div id="threads-status" class="status">Checking…</div>
                </div>
                <span class="tag">Threads service</span>
              </div>
              <div class="endpoint-footer">
                <div class="endpoint-meta">
                  <span id="threads-meta">Awaiting response</span>
                </div>
                <button class="endpoint-btn" onclick="openAndLog('/threads')">
                  View payload
                </button>
              </div>
            </div>
          </div>

          <p class="footnote">
            <strong>Demo tip:</strong> you can open the browser Network tab to show these
            calls going from the ALB DNS to each microservice without exposing any
            private IPs.
          </p>
        </div>
      </div>
    </div>

    <script>
      function classifyStatus(ok, status) {
        if (!ok) return 'err';
        if (status >= 200 && status < 300) return 'ok';
        if (status >= 300 && status < 500) return 'warn';
        return 'err';
      }

      async function checkEndpoint(path, statusId, metaId) {
        const statusEl = document.getElementById(statusId);
        const metaEl = document.getElementById(metaId);

        try {
          const res = await fetch(path);
          const contentType = res.headers.get('content-type') || '';
          let info = '';

          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data)) {
              info = data.length + ' record(s) returned';
            } else {
              info = 'JSON payload returned';
            }
          } else {
            const txt = await res.text();
            info = (txt || '').slice(0, 80) || 'Text response';
          }

          const cls = classifyStatus(res.ok, res.status);
          statusEl.className = 'status ' + cls;
          statusEl.textContent = res.ok
            ? '✅ ' + res.status + ' ' + res.statusText
            : '⚠️ ' + res.status + ' ' + res.statusText;
          metaEl.textContent = info;
        } catch (err) {
          statusEl.className = 'status err';
          statusEl.textContent = '❌ Error reaching endpoint';
          metaEl.textContent = err.message || 'Network error';
        }
      }

      function openAndLog(path) {
        window.open(path, '_blank');
      }

      window.addEventListener('load', function () {
        checkEndpoint('/users', 'users-status', 'users-meta');
        checkEndpoint('/posts', 'posts-status', 'posts-meta');
        checkEndpoint('/threads', 'threads-status', 'threads-meta');
      });
    </script>
  </body>
  </html>
  `;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () =>
  console.log('Users service running on port 3000 with HTML landing page')
);
