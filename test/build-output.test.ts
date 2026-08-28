import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deployRoot = resolve(repository, 'dist/site');

test('the exact production build creates a complete deployable site root', () => {
  // Remove both the intended and formerly mis-resolved outputs so stale files
  // cannot make this regression pass.
  rmSync(resolve(repository, 'dist'), { recursive: true, force: true });
  rmSync(resolve(repository, 'site/dist'), { recursive: true, force: true });

  const result = spawnSync('npm', ['run', 'build'], {
    cwd: repository,
    encoding: 'utf8',
    env: process.env
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);

  const indexPath = resolve(deployRoot, 'index.html');
  assert.ok(existsSync(indexPath), 'dist/site/index.html must exist after npm run build');
  assert.ok(!existsSync(resolve(repository, 'site/dist')), 'site output must not be nested beneath site/');

  const html = readFileSync(indexPath, 'utf8');
  const resourceUrls = [...html.matchAll(/<(?:script|link|img)\b[^>]+(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => !/^(?:https?:|data:|#)/.test(url));

  assert.ok(resourceUrls.length >= 3, 'built index should reference its script, stylesheet, and hero image');
  for (const url of resourceUrls) {
    const assetPath = resolve(deployRoot, url.replace(/^\//, '').split(/[?#]/, 1)[0]);
    assert.ok(existsSync(assetPath), `referenced asset must exist: ${url}`);
  }
  assert.ok(existsSync(resolve(deployRoot, 'privacy.html')), 'privacy page must be deployable');
  assert.ok(existsSync(resolve(deployRoot, 'terms.html')), 'terms page must be deployable');
  assert.ok(existsSync(resolve(deployRoot, 'favicon.ico')), 'browser icon must be deployable');
  assert.ok(existsSync(resolve(deployRoot, 'staticwebapp.config.json')), 'deployment headers and routes must be deployable');
  assert.ok(existsSync(resolve(repository, 'dist/app/index.html')), 'desktop webview assets must remain deployable');
});
