// 마음톡 service worker — 오프라인 캐시
// 앱을 배포할 때마다 VERSION 을 올려야 새 버전이 사용자에게 반영됩니다.
const VERSION = "maeumtalk-v11";
const VOICE_IDS = [
  "no","help","toilet","more","water","milk","gummy","rice","bear",
  "book","outside","rest","yes","wait","happy","sad","stop","pain"
];
const ASSETS = [
  ".",
  "index.html",
  "manifest.webmanifest",
  "favicon.svg",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "aac-pictograms-v2.png",
  "aac-essential-actions-v4.png",
  "aac-gummy-bears-v3.png",
  "aac-rice-bowl-v3.png",
  "aac-playground.png",
  "og.png",
  ...VOICE_IDS.map((id) => `voice/${id}.mp3`)
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // 캐시 우선, 없으면 네트워크 → 캐시에 저장
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
