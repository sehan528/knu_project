// const CACHE_NAME = 'static-cahce-v1';

// const FILES_TO_CACHE = [
//     '/public/offline.html',
//     'http://localhost:3000/public/image/project_icon.png'
// ];

// self.addEventListener('install', evt => {
//     // console.log('[ServiceWorker] Pre-cacing offline page');
//     // evt.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
//     evt.waitUntil(
//         caches.open(CACHE_NAME).then((cache) => {
//             console.log('[ServiceWorker] Pre-cacing offline page');
//             return cache.addAll(FILES_TO_CACHE);
//         }) 
//     );
// });

// self.addEventListener('activate', evt => {
//     // console.log('Service worker activate event!');
//     evt.waitUntil(
//         caches.keys().then((keyList) => {
//             return Promise.all(keyList.map((key) => {
//                 if(key !== CACHE_NAME) {
//                     console.log('[ServiceWorker] Removing old cache', key);
//                     return caches.delete(key);
//                 }
//             }));
//         })
//     );
// });

// self.addEventListener('fetch', event => {
//     event.respondWith(
//         fetch(event.request).catch(() => {
//             return caches.open('offline').then(cache => {
//                 return cache.match('/public/offline.html');
//             });
//         })
//     );
// });

// self.addEventListener('fetch', evt => {
//     evt.respondWith(
//         caches.open(CACHE_NAME).then((cache) => {
//             return cache.match(evt.request)
//                 .then((response) => {
//                     return response || fetch(evt.request);
//                 });
//         })
//     );
// });

// self.addEventListener('fetch', (evt) => {
//     console.log('Fetch intercepted for:', evt.request.url);
//     evt.respondWith(
//         caches.match(evt.request).then((cachedResponse) => {
//             if (cachedResponse) {
//                 return cachedResponse;
//             }
//             return fetch(evt.request);
//         }),
//     );
// });


// ------------------------------------------------------------------------------

const CACHE_NAME = 'static-cache-v1';

const FILES_TO_CACHE = [
    '/offline.html',
    '/public/image/project_icon.png',
];

self.addEventListener('install', (evt) => {
    console.log('[ServiceWorker] Install');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline page');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
    console.log('[ServiceWorker] Activate');
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
    console.log('[ServiceWorker] Fetch', evt.request.url);
    if (evt.request.mode !== 'navigate') {
        // Not a page navigation, bail.
        return;
    }
    evt.respondWith(
        fetch(evt.request)
            .catch(() => {
                return caches.open(CACHE_NAME)
                    .then((cache) => {
                        return cache.match('offline.html');
                    });
            })
    );
});