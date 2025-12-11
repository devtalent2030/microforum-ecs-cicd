// users/server.js

const app = require('koa')();
const router = require('koa-router')();
const usersDb = require('./db.json');
const threadsDb = require('../threads/db.json');
const postsDb = require('../posts/db.json');

// Helpers to safely get arrays from the JSON files
function getUsersArray() {
  // If usersDb is { "users": [...] } use that, otherwise assume it's already an array
  return Array.isArray(usersDb) ? usersDb : usersDb.users || [];
}

function getThreadsArray() {
  return Array.isArray(threadsDb) ? threadsDb : threadsDb.threads || [];
}

function getPostsArray() {
  return Array.isArray(postsDb) ? postsDb : postsDb.posts || [];
}

// Log requests
app.use(function* (next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log('%s %s - %s ms', this.method, this.url, ms);
});

// Health check
router.get('/health', function* () {
  this.status = 200;
  this.body = { ok: true, service: 'users', uptime: process.uptime() };
});

//
// -------- API-style routes (existing) --------
//
router.get('/api/users', function* () {
  this.body = getUsersArray();
});

router.get('/api/users/:userId', function* () {
  const id = parseInt(this.params.userId, 10);
  const users = getUsersArray();
  this.body = users.find((user) => user.id == id);
});

router.get('/api/', function* () {
  this.body = 'API ready to receive requests';
});

//
// -------- Friendly routes for ALB (/users...) (existing) --------
//
router.get('/users', function* () {
  this.body = getUsersArray();
});

router.get('/users/:userId', function* () {
  const id = parseInt(this.params.userId, 10);
  const users = getUsersArray();
  this.body = users.find((user) => user.id == id);
});

//
// -------- New: threads routes --------
//
router.get('/threads', function* () {
  const threads = getThreadsArray();
  this.body = threads;
});

//
// -------- New: posts routes --------
//

// /posts -> all posts
router.get('/posts', function* () {
  const posts = getPostsArray();
  this.body = posts;
});

// /posts/in-thread/:id -> filter posts by threadId
router.get('/posts/in-thread/:id', function* () {
  const threadId = parseInt(this.params.id, 10);

  if (Number.isNaN(threadId)) {
    this.status = 400;
    this.body = 'Invalid thread id';
    return;
  }

  const posts = getPostsArray();
  this.body = posts.filter((p) => Number(p.threadId) === threadId);
});

// /posts/by-user/:id -> filter posts by userId
router.get('/posts/by-user/:id', function* () {
  const userId = parseInt(this.params.id, 10);

  if (Number.isNaN(userId)) {
    this.status = 400;
    this.body = 'Invalid user id';
    return;
  }

  const posts = getPostsArray();
  this.body = posts.filter((p) => Number(p.userId) === userId);
});

//
// -------- Root (existing) --------
//
router.get('/', function* () {
  this.body = 'Ready to receive requests';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);

console.log('Users worker started with /users, /threads, and /posts routes');