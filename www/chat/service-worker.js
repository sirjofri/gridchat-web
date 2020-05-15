var cacheName = "gridcache";
var filesToCache = [
	"/chat/index.html",
	"/chat/main.js",
	"/chat/main.css",
];

self.addEventListener("install", (e) => {
	e.waitUntil(
		caches.open(cacheName)
		.then((cache) => {
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener("fetch", (e) => {
	e.respondWith(
		caches.match(e.request)
		.then((response) => {
			return response || fetch(e.request);
		})
	);
});