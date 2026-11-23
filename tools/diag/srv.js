// somente leitura: abre o site da Santa Rita Visión e anota de onde vêm as "Últimas noticias" (pedidos de rede com dados).
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const reqs = [];
  p.on('response', async r => { const ct = r.headers()['content-type'] || ''; const u = r.url(); if (!/image|font|css/i.test(ct)) { let body = ''; try { body = (await r.text()).slice(0, 600); } catch (e) {} reqs.push({ u, s: r.status(), ct, body }); } });
  await p.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('GOTO ' + e.message));
  for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(700); } await p.waitForTimeout(3000);
  for (const r of reqs) console.log('REQ ' + r.s + ' ' + r.ct + ' ' + r.u + '\n  BODY ' + r.body.replace(/\s+/g, ' '));
  const n = await p.evaluate(() => [...document.querySelectorAll('a')].filter(a => /facebook|instagram|Ver en/i.test(a.href + a.innerText)).slice(0, 12).map(a => a.innerText.trim().slice(0,30) + ' => ' + a.href));
  console.log('LINKS ' + JSON.stringify(n));
  await b.close(); })();
