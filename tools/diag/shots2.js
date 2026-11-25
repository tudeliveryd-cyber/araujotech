// somente leitura: telas inteiras do celular (iPhone 13) para a apresentação da Guía. Uso: node tools/diag/shots2.js es|pt
const { chromium, devices } = require('playwright');
(async () => { const L = process.argv[2] === 'pt' ? 'pt' : 'es';
  const b = await chromium.launch(); const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { timezoneId: 'America/Asuncion', locale: L === 'pt' ? 'pt-BR' : 'es-PY' }));
  await ctx.addInitScript(l => { try { localStorage.setItem('at_lang', l); } catch (e) {} }, L);
  const p = await ctx.newPage(); await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(3500);
  await p.evaluate(() => { document.querySelectorAll('.inst,#inst,[class*=install]').forEach(e => { if (e.offsetParent && /instal/i.test(e.textContent)) e.style.display = 'none'; }); });
  const out = (n, buf) => console.log('IMG-' + n + '<<' + buf.toString('base64') + '>>');
  const shot = async n => out(n, await p.screenshot({ type: 'jpeg', quality: 85 }));
  await shot('top');
  for (const id of ['comer', 'cats', 'util', 'agenda']) { const s = p.locator('#' + id).first(); if (!(await s.count())) { console.log('SEM', id); continue; }
if (id === 'comer' || id === 'cats') { const k = p.locator('#comer [data-qt]').first(); if (await k.count()) { await k.click(); await p.waitForTimeout(700); } }
    await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    await p.evaluate(id => { const e = document.getElementById(id); const hd = document.querySelector('header'); const h = hd && getComputedStyle(hd).position.match(/sticky|fixed/) ? hd.getBoundingClientRect().height : 0; window.scrollTo(0, window.scrollY + e.getBoundingClientRect().top - h - 12); }, id);
    await p.waitForTimeout(1200); await shot(id); }
  const q = await ctx.newPage(); await q.goto('https://guiadesantarita.com/l/dr-jonathan-salinas?v=' + Date.now(), { waitUntil: 'networkidle' }); await q.waitForTimeout(1500);
  out('bio', await q.screenshot({ type: 'jpeg', quality: 85 }));
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
