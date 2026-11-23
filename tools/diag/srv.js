// somente leitura: abre o site da Santa Rita Visión e anota de onde vêm as "Últimas noticias" (pedidos de rede com dados).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const reqs = [];
  p.on('response', async r => { const ct = r.headers()['content-type'] || ''; const u = r.url(); if (/json|xml|rss/i.test(ct) || /api|feed|posts|news|noticias/i.test(u)) { let body = ''; try { body = (await r.text()).slice(0, 600); } catch (e) {} reqs.push({ u, s: r.status(), ct, body }); } });
  await p.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('GOTO ' + e.message));
  await p.waitForTimeout(4000);
  for (const r of reqs) console.log('REQ ' + r.s + ' ' + r.ct + ' ' + r.u + '\n  BODY ' + r.body.replace(/\s+/g, ' '));
  const n = await p.evaluate(() => [...document.querySelectorAll('a')].filter(a => /facebook|instagram/.test(a.href)).slice(0, 8).map(a => a.href));
  console.log('LINKS ' + JSON.stringify(n));
  await b.close(); })();
