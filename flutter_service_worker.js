'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "917efc5cdd0471513c7c10dfd7c4e6f7",
"index.html": "fbd9a9925800ee7956db5bc1daafe78c",
"/": "fbd9a9925800ee7956db5bc1daafe78c",
"main.dart.js": "d0a6ad0d21bd3b8e0e863e3c4c55a4f0",
"icons/Icon-192.png": "280f017872d0e567517f567dd8a2ae8b",
"icons/Icon-512.png": "69ba6432ada7bc72ce32c4226788b4c4",
"manifest.json": "36ea33a7a615eae078d16b06917c58d8",
"assets/asset/svg/clipCheap.svg": "a800ca2b30b746fb173514a56e039ac2",
"assets/asset/jpg/contactBackground.jpg": "2e89b2966233b8c6b77a8f61c24731a9",
"assets/asset/jpg/homeBackground.jpg": "aade99872b530001207f50ada4f651e9",
"assets/asset/jpg/businessBackground.jpg": "e539748dab382b046e0b10c06ed17b78",
"assets/asset/json/term/homeTerm.json": "7c181ef85e5f2298109f91434e17a197",
"assets/asset/json/term/appTerm.json": "f2be1924aca9c0ece28a0c9cdb49d97c",
"assets/asset/json/term/businessTerm.json": "1f7358ac0dfe4347e5acf1eba9179f54",
"assets/asset/json/policy/appPolicy.json": "8abb33b78c89c084c43c65e63cfd8a54",
"assets/asset/json/policy/businessPolicy.json": "d739d53c5c138e9e257b78879cdca4a9",
"assets/asset/json/policy/homePolicy.json": "d1567bcf13e28ddfc546ca99520574a5",
"assets/asset/ttf/pacifico.ttf": "9b94499ccea3bd82b24cb210733c4b5e",
"assets/asset/otf/noto900.otf": "2b4777ccae990731c94ea834df3f503b",
"assets/asset/otf/noto200.otf": "b2aae66e06d9d23604f17240ae03d07a",
"assets/asset/otf/noto400.otf": "b5f8ef0cb10cf4fa6dfc584d29908421",
"assets/asset/otf/noto300.otf": "5da08a6f2f4e08e906fe93ba44232278",
"assets/asset/otf/noto700.otf": "3db31919b255ed7261e7329f0f8303a4",
"assets/asset/otf/noto500.otf": "366120c9b4029066302ca6d75afb6f8b",
"assets/AssetManifest.json": "3040cada99fb1ca4fbb42214e75ab65e",
"assets/NOTICES": "927cab034ebb3c9659e4f03ef5b5d23c",
"assets/FontManifest.json": "0108fac14e1a2dc83723d90a613ac7dc",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"favicon.svg": "68d977392c96ef1f75b8c3ec2472a56f",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
