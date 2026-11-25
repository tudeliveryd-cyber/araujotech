// somente leitura: fotos da Guía para apresentação (topo e seções). Uso: node tools/diag/shots.js es|pt
const { chromium, devices } = require('playwright');
(async () => { const L = process.argv[2] === 'pt' ? 'pt' : 'es';
  const b = await chromium.launch(); const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'America/Asuncion' }));
  await ctx.addInitScript(l => { try { localStorage.setItem('at_lang', l); } catch (e) {} }, L);
  const p = await ctx.newPage(); await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
  const out = (n, buf) => console.log('IMG-' + n + '<<' + buf.toString('base64') + '>>');
  out('top', await p.screenshot({ type: 'jpeg', quality: 80 }));
  for (const id of ['aldia', 'comer', 'destacados', 'cats', 'agenda', 'noticias', 'empleos', 'util']) { const s = p.locator('#' + id).first(); if (!(await s.count()) || !(await s.isVisible())) { console.log('SEM', id); continue; } await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(900); const bb = await s.boundingBox(); if (!bb || bb.height < 40) { console.log('SEM', id); continue; } out(id, await s.screenshot({ type: 'jpeg', quality: 80 })); }
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
