const CACHE_NAME="presence-shell-v13";
const APP_SHELL=["./","./index.html","./logo.svg","./quantumdev-logo.svg","./manifest.webmanifest"];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(APP_SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

async function brandAuthPage(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  const html=await response.text();
  const branded=html.replace(
    '<span class="qdev-mark" aria-hidden="true">Q</span>',
    '<img class="qdev-mark" src="./quantumdev-logo.svg" alt="quantumDEV" aria-hidden="true" style="background:transparent;box-shadow:none;object-fit:contain">'
  );
  return new Response(branded,{
    status:response.status,
    statusText:response.statusText,
    headers:response.headers
  });
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;

  const url=new URL(request.url);
  if(url.origin!==location.origin)return;

  if(url.pathname.endsWith("/auth.js")){
    event.respondWith(fetch(request,{cache:"no-store"}));
    return;
  }

  event.respondWith(
    fetch(request).then(async response=>{
      const isIndex=url.pathname.endsWith("/")||url.pathname.endsWith("/index.html");
      const finalResponse=isIndex?await brandAuthPage(response.clone()):response;
      caches.open(CACHE_NAME).then(cache=>cache.put(request,finalResponse.clone()));
      return finalResponse;
    }).catch(()=>caches.match(request).then(cached=>cached||caches.match("./index.html")))
  );
});