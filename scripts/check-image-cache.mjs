// Verify the generated worker, rather than matching strings in Vite's source config.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const worker = readFileSync(process.argv[2] || 'dist/sw.js', 'utf8');
const revisions = JSON.parse(readFileSync('src/generated/media-revisions.json', 'utf8'));
const routes = [];
let precache, parameters;
const policy = kind => class {
  constructor(options = {}) { this.kind = kind; this.options = options; }
};
const workbox = {
  setCacheNameDetails() {}, clientsClaim() {}, cleanupOutdatedCaches() {},
  precacheAndRoute(entries, options) { precache = entries; parameters = options?.ignoreURLParametersMatching || []; },
  registerRoute(match, handler) { routes.push({ match, handler }); },
  createHandlerBoundToURL() { return () => {}; },
  NavigationRoute: policy('NavigationRoute'),
  CacheFirst: policy('CacheFirst'),
  NetworkOnly: policy('NetworkOnly'),
  StaleWhileRevalidate: policy('StaleWhileRevalidate'),
  ExpirationPlugin: policy('ExpirationPlugin'),
  CacheableResponsePlugin: policy('CacheableResponsePlugin'),
};
// Capture registration calls; no worker imports, fetches or install events execute.
const define = (_dependencies, factory) => factory(workbox);
runInNewContext(worker, { define, self: { define, skipWaiting() {} }, importScripts() {}, URL }, { timeout: 1000 });
assert.ok(precache?.length, 'Generated worker has no precache manifest');
assert.ok(Object.keys(revisions).length, 'No versioned media found');
assert.ok(!precache.some(entry => /(^|\/)admin\//.test(entry.url)), 'Admin editor must not be precached');

const digest = (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex');
const normalize = url => {
  url = new URL(url);
  url.hash = '';
  for (const name of [...url.searchParams.keys()]) {
    if (parameters.some(pattern => pattern.test(name))) url.searchParams.delete(name);
  }
  return url.href;
};
for (const base of ['https://cache-check.invalid/', 'https://cache-check.invalid/koog-site/']) {
  const entries = new Map(precache.map(entry => [new URL(entry.url, base).href, entry]));
  for (const [path, version] of Object.entries(revisions)) {
    const source = readFileSync(`public/${path}`);
    const built = readFileSync(`dist/${path}`);
    assert.equal(version, digest('sha256', source).slice(0, 12), `Stale image URL version: ${path}`);
    assert.ok(source.equals(built), `Published image differs from the versioned source: ${path}`);
    const requested = new URL(path, base);
    requested.searchParams.set('v', version);
    const entry = entries.get(normalize(requested));
    assert.ok(entry, `Versioned image misses precache: ${requested}`);
    if (entry.revision !== null) assert.equal(entry.revision, digest('md5', built), `Stale precache revision: ${path}`);
  }
}

const routeFor = url => routes.find(({ match }) => typeof match === 'function'
  ? match({ url, sameOrigin: true, request: { method: 'GET', destination: 'image' } })
  : typeof match?.test === 'function' && match.test(url.href));
for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'ico', 'JPG']) {
  const url = new URL(`https://cache-check.invalid/works/new-upload.${ext}?v=content-hash`);
  const route = routeFor(url);
  assert.equal(route?.handler?.kind, 'CacheFirst', `New ${ext} upload misses runtime image cache`);
  assert.equal(route.handler.options.cacheName, 'images-cache', 'Existing runtime image cache must be reused');
}
assert.equal(routeFor(new URL('https://cache-check.invalid/admin/test.png?v=x'))?.handler?.kind, 'NetworkOnly', 'Admin requests must bypass image cache');
console.log(`Image cache check passed: ${Object.keys(revisions).length} versioned media, root/subpath precache and new-upload CacheFirst routes.`);
