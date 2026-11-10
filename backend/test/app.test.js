process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  const { pool } = require('../src/db');
  await pool.end();
});

test('health endpoint is public and returns success', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('student endpoints reject requests without a token', async () => {
  const response = await fetch(`${baseUrl}/api/students/profile`);
  assert.equal(response.status, 401);
});

test('student endpoints reject authenticated users with another role', async () => {
  const token = jwt.sign({ id: 1, vaiTro: 'QUAN_TRI' }, process.env.JWT_SECRET);
  const response = await fetch(`${baseUrl}/api/students/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 403);
});