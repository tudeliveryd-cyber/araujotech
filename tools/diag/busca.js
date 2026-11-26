// somente leitura: testa na Guía publicada a busca (restaurantes, comidas por encomenda, farmácias, profissionais), "Cerca de mí" e se o clique leva à página certa.
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(Object.assign({}, devices['iPhone 13'], { geolocation: { latitude: -25.7917, longitude: -55.0858 }, permissions: ['geolocation'] }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const home = async () => { await p.goto('https://guiadesantarita.com/?v=' + Date.now(), { waitUntil: 'networkidle' }); await p.waitForTimeout(2000); };
  const names = () => p.evaluate(() => [...document.querySelectorAll('#list .cc h3, #list .card h3, #list .pro h3, #list h3')].map(x => x.textContent.trim()).filter(Boolean));
  const setQ = q => p.evaluate(q => { const e = document.getElementById('q'); e.value = q; e.dispatchEvent(new Event('input', { bubbles: true })); }, q);
  await home();
  for (const q of ['restaurante', 'restaurantes', 'comida por encomienda', 'por pedido', 'comida casera', 'farmacia', 'farmacias', 'profesional', 'abogado', 'médico', 'dentista', 'pizza', 'helado']) {
    await setQ(q); await p.waitForTimeout(700); const n = await names(); console.log('BUSCA', JSON.stringify(q), n.length, JSON.stringify(n.slice(0, 12)), (await p.evaluate(() => (document.querySelector('#list .nores') || {}).textContent || '')).slice(0, 60)); }
  await setQ('restaurante'); await p.waitForTimeout(700);
  const lk = await p.evaluate(() => { const a = document.querySelector('#list .cc a[href*="/negocio/"], #list a[href*="/negocio/"]'); return a ? a.href : ''; });
  if (lk) { const r = await (await ctx.newPage()).goto(lk); console.log('PAGINA', lk, r.status()); }
  await home(); const nb = await p.$('[data-f="near"]'); if (!nb) { await setQ('a'); await p.waitForTimeout(500); }
  const nb2 = await p.$('[data-f="near"]'); if (nb2) { await nb2.evaluate(e => e.click()); await p.waitForTimeout(2500); console.log('CERCA', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#top2 h3, #top2 b, #top2 .nr-n, #top2 li')].slice(0, 12).map(x => x.textContent.trim().slice(0, 50))))); console.log('IMG-cerca<<' + (await p.screenshot()).toString('base64') + '>>'); }
  await home(); const fa = await p.$('[data-a="far"], [data-go="farmacias"], a[href*="#farmacias"]'); console.log('FARM-BTN', !!fa);
  console.log('ERROS', JSON.stringify(errs)); await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
