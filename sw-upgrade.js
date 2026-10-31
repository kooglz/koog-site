/* One-time bridge for earlier installed PWAs that did not listen for worker updates. */
const upgradeCache = 'koog-worker-upgrade';
const upgradeKey = new URL('__worker_update__', self.registration.scope).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(upgradeCache).then(cache => cache.put(upgradeKey, new Response(self.registration.active ? 'update' : 'first-install'))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(upgradeCache);
    if ((await (await cache.match(upgradeKey))?.text()) !== 'update') return;
    await self.clients.claim();
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    await Promise.all(windows.map(async client => {
      const url = new URL(client.url);
      if (!client.url.startsWith(self.registration.scope) || url.pathname.includes('/admin/')) return;
      const understandsUpdates = await new Promise(resolve => {
        const channel = new MessageChannel();
        const timeout = setTimeout(() => { channel.port1.close(); resolve(false); }, 900);
        channel.port1.onmessage = () => { clearTimeout(timeout); channel.port1.close(); resolve(true); };
        client.postMessage({type:'KOOG_UPDATE_CAPABLE'}, [channel.port2]);
      });
      // New clients use virtual:pwa-register's update handling; legacy clients need one navigation.
      if (!understandsUpdates) void client.navigate(client.url).catch(() => {});
    }));
    await cache.put(upgradeKey, new Response('activated'));
  })());
});
