// جرد الخبز: بيجيب آخر نسخة من الإنترنت دايماً، وإذا ما في نت بيفتح المحفوظة
const CACHE = 'khobez-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    // حدّث الصفحات المفتوحة عشان تشوف النسخة الجديدة على طول
    const list = await self.clients.matchAll({ type: 'window' });
    list.forEach(c => { try { c.navigate(c.url); } catch (err) {} });
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const res = await fetch(req, { cache: 'no-store' });
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    } catch (err) {
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
      return Response.error();
    }
  })());
});
