const cacheFiles = ["index.html"];
const cacheName = "v1";

self.addEventListener("install", (_event) => {
  caches.open(cacheName).then((cache) => cache.addAll(cacheFiles));
});

self.addEventListener("activate", (_event) => {
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(function (resp) {
      return resp || fetch(event.request).then(function (response) {
        let responseClone = response.clone();
        caches.open(cacheName).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      });
    }).catch(function () {
      return caches.match("logo.svg");
    }),
  );
});

self.addEventListener("push", e => {
    const title = e.data.text();
    self.registration.showNotification(title, {
        body: "web push test",
        icon: "/public/icon-192x192.png",
    });
});