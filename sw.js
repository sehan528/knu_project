// ------------------------------------------------------------------------------

const CACHE_NAME = 'static-cache-v1';

// 아마존 배포버전에선 배포 외부용 IPV4로 붙여야 됩니다.
const localhost = 'http://localhost:3000/';

const FILES_TO_CACHE = [
    '/offline.html',
    '/splash.html',
    '/public/image/project_icon.png',
    '/public/image/splash.png',
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

// 대안 1
    // if (evt.request.url === 'http://localhost:3000/') {
    //     console.log("스플래쉬 테스팅");
    //     evt.respondWith(
    //         Promise.all([
    //             caches.match('/public/image/splash.png'),
    //             fetch(evt.request)
    //         ])
    //             .then(([cachedResponse, fetchResponse]) => {
    //                 if (cachedResponse) {
    //                     console.log(cachedResponse);
    //                     console.log(fetchResponse);

    //                     return new Promise((resolve) => {
    //                         setTimeout(() => {
    //                             fetch('/')
    //                                 .then((response) => {
    //                                     console.log(response);
    //                                     resolve(response);
    //                                 })
    //                                 .catch((error) => {
    //                                     console.error(error);
    //                                     // resolve(cachedResponse);
    //                                 });
    //                         }, 10000);
    //                     });

    //                 } else {
    //                     return fetchResponse;
    //                 }
    //             })
    //             .catch(() => {
    //                 return caches.match('offline.html');
    //             })
    //     );
    //     return;
    // }

// 대안 2
// if (evt.request.url === 'http://localhost:3000/') {
//     evt.respondWith(
//         caches.match('http://localhost:3000/public/image/splash.png')
//             .then((response) => {
//                 console.log(evt.request);
//                 console.log(response);

//                 return new Promise((resolve) => {
//                     setTimeout(() => {
//                         resolve(response);
//                     }, 4000);
//                 });
//             })
//             .then((response) => {
//                 console.log(response);

//                 return response || fetch(evt.request);
//             })
//             .catch(() => {
//                 return caches.match('offline.html');
//             })
//     );
//     return;
// }

// 대안 3
// if (evt.request.url === 'http://localhost:3000/') {
//     evt.respondWith(
//         caches.match('http://localhost:3000/public/image/splash.png')
//             .then((response) => {
//                 console.log(evt.request);
//                 console.log(response);

//                 if (response) {
//                     return new Promise((resolve) => {
//                         setTimeout(() => {
//                             resolve(response);
//                         }, 3000);
//                     });
//                 } else {
//                     throw Error('No response from cache');
//                 }
//             })
//             .then((response) => {
//                 console.log(response);

//                 return fetch(evt.request)
//                     .then((networkResponse) => {
//                         if (networkResponse.ok) {
//                             return networkResponse;
//                         } else {
//                             throw Error('Network response was not ok');
//                         }
//                     })
//                     .catch(() => {
//                         return response;
//                     });
//             })
//             .catch(() => {
//                 return caches.match('offline.html');
//             })
//     );
//     return;
// }



    // 네트워크 끊겼을 때 offline.
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

// ---


