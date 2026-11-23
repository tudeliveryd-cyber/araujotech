// somente leitura: procura no script do site da Santa Rita Visión de onde vêm as notícias.
(async () => { const base = process.argv[2]; const h = await (await fetch(base)).text();
  const srcs = [...h.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => new URL(m[1], base).href).filter(u => u.startsWith(base));
  for (const u of srcs) { const t = await (await fetch(u)).text(); console.log('SCRIPT ' + u + ' ' + t.length);
    for (const m of t.matchAll(/fetch\(([^)]{0,200})\)/g)) console.log('  FETCH ' + m[1]);
    for (const m of t.matchAll(/["'`](\/[a-z0-9_\-\/.]*(?:api|noticias|news|posts|feed)[a-z0-9_\-\/.?=&]*)["'`]/gi)) console.log('  PATH ' + m[1]); }
  for (const p of ['/api/noticias', '/api/news', '/noticias.json', '/news.json', '/api/posts', '/feed', '/rss', '/noticias']) { try { const r = await fetch(new URL(p, base)); const t = await r.text(); console.log('TRY ' + p + ' ' + r.status + ' ' + (r.headers.get('content-type') || '') + ' ' + t.slice(0, 300).replace(/\s+/g, ' ')); } catch (e) { console.log('TRY ' + p + ' erro'); } }
})();
