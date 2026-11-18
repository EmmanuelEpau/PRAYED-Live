const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequestHandler } = require('./server');

async function run() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'prayed-server-'));
  const root = path.join(temporary, 'public');
  fs.mkdirSync(root);
  fs.mkdirSync(path.join(root, 'folder'));
  fs.mkdirSync(path.join(root, '.git'));
  fs.writeFileSync(path.join(root, 'index.html'), '<h1>Home</h1>');
  fs.writeFileSync(path.join(root, 'folder', 'index.html'), '<h1>Folder</h1>');
  fs.writeFileSync(path.join(root, 'hello world.css'), 'body { color: blue; }');
  fs.writeFileSync(path.join(root, '.git', 'config'), 'private fixture');
  fs.writeFileSync(path.join(temporary, 'outside.txt'), 'outside fixture');
  fs.symlinkSync(path.join(temporary, 'outside.txt'), path.join(root, 'outside-link'));
  fs.symlinkSync(path.join(root, 'index.html'), path.join(root, 'inside-link'));
  fs.symlinkSync(path.join(root, '.git', 'config'), path.join(root, 'hidden-link'));
  const handler = createRequestHandler(root);
  const request = (url) => new Promise((resolve) => {
    const response = {
      writeHead(status, headers) { this.status = status; this.headers = headers; },
      end(body) { resolve({ status: this.status, headers: this.headers, body: String(body) }); }
    };
    handler({ url, method: 'GET' }, response);
  });
  try {
    assert.equal((await request('/')).body, '<h1>Home</h1>');
    assert.equal((await request('/folder')).body, '<h1>Folder</h1>');
    assert.equal((await request('/folder/')).body, '<h1>Folder</h1>');
    const asset = await request('/hello%20world.css?version=1');
    assert.equal(asset.status, 200);
    assert.equal(asset.headers['Content-Type'], 'text/css');
    assert.equal((await request('/inside-link')).body, '<h1>Home</h1>');
    assert.equal((await request('/missing')).status, 404);
    for (const url of ['/../outside.txt', '/%2e%2e/outside.txt', '/%2e%2e%2foutside.txt',
      '/.git/config', '/%2egit/config', '/outside-link', '/hidden-link']) {
      const response = await request(url);
      assert.equal(response.status, 403, url);
      assert.ok(!response.body.includes('fixture'), url);
    }
    for (const url of ['/%ZZ', '/%00', 'not-an-absolute-path']) {
      assert.equal((await request(url)).status, 400, url);
    }
    assert.equal((await request('/')).status, 200, 'Malformed requests do not break later requests');
    console.log('Developer server path, symlink, hidden-file, URI and route checks passed.');
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
