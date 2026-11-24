// somente leitura: abre a Guía em português (at_lang=pt) e fotografa telas, para ver o que ficou em espanhol.
//   node tools/diag/pt.js "Lúcio"
const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(devices['iPhone 13']);
  await ctx.addInitScript(() => { try { localStorage.setItem('at_lang', 'pt'); } catch (e) {} });
  const p = await ctx.newPage(); let n = 0;
  const shot = async (full) => { const buf = await p.screenshot({ type: 'jpeg', quality: 60, fullPage: !!full }); console.log('IMG' + (++n) + '<<' + buf.toString('base64') + '>>'); };
  await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(2500); await shot(true);
  await p.fill('#q', process.argv[2] || 'Lúcio'); await p.waitForTimeout(2500); await shot();
  for (const u of ['/negocio/lucio-viagens', '/negocio/dr-jonathan-salinas']) { await p.goto('https://guiadesantarita.com' + u, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500); await shot(true); }
  console.log('TXT', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 1500));
  await b.close();
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
