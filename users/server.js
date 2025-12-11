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
// Root
// ------------------------------
router.get('/', function* () {
  this.body = 'Users service ready';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () =>
  console.log('Users service running on port 3000')
);
