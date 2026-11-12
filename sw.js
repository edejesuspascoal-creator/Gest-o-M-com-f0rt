// Gestão Mundo Comfort: rede primeiro, cache só da app verdadeira.
// Nunca guarda nem mostra páginas de erro ou a página vazia do GitHub.
const C='gestao-v3',MARK='gestao-mundo-comfort-v2';
const F=['index.html','manifest.json','icon-192.png','icon-512.png'];
const bom=async r=>{try{return r.ok&&(await r.clone().text()).includes(MARK)}catch(x){return false}};
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(C);
  await Promise.all(F.map(async u=>{try{const r=await fetch(u,{cache:'reload'});if(r.ok&&(u!=='index.html'||await bom(r)))await c.put(u,r)}catch(x){}}));
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const q=e.request;if(q.method!=='GET')return;
  const nav=q.mode==='navigate';
  e.respondWith((async()=>{
    try{
      const r=await(nav?fetch(q.url,{cache:'no-cache'}):fetch(q));
      if(nav){if(await bom(r)){const c=await caches.open(C);c.put('index.html',r.clone());return r}}
      else{if(r.ok){const c=await caches.open(C);c.put(q,r.clone())}return r}
    }catch(x){}
    const c=await caches.open(C);
    return (nav?await c.match('index.html'):await c.match(q))||new Response('Sem ligação. Abra a app com internet uma vez.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  })());
});
