const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = __dirname;

test("db.js exports the database initializer function", () => {
  const initializeDatabase = require(path.join(root, "db.js"));
  assert.strictEqual(typeof initializeDatabase, "function");
});

test("server.js has valid JavaScript syntax", () => {
  execFileSync(process.execPath, ["--check", path.join(root, "server.js")]);
});

test("server.js defines the /health and /ready endpoints", () => {
  const source = fs.readFileSync(path.join(root, "server.js"), "utf8");
  assert.match(source, /app\.get\("\/health"/);
  assert.match(source, /app\.get\("\/ready"/);
});

test("frontend page exists", () => {
  assert.ok(fs.existsSync(path.join(root, "frontend", "index.html")));
});
