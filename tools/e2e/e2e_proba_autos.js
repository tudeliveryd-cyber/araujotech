// Página do Vitrix "Probá con tu negocio": rubro escrito ("carros y furgonetas") manda sobre o nome ("Agro…") e abre a demo de autos.
const L = require('./lib');
const { info, sec, check } = L;
(async () => {
  const S = await L.open({ w: 390 }); const s = S.p;
  await s.goto('https://araujotechsistemas.com/vitrix/'); await s.w(2500);
  sec('A. Rubro escrito manda');
  await s.locator('#pbn').fill('Agro Nacunday'); await s.dispatchEvent('#pbn', 'input'); await s.w(200);
  await s.selectOption('#pbr', '__otro'); await s.w(500);
  await s.locator('#pbo').fill('carros y furgonetas'); await s.dispatchEvent('#pbo', 'input'); await s.w(300);
  const r = await s.evaluate(() => ({ r: PB.r, hint: document.getElementById('pbrh').textContent }));
  info(JSON.stringify(r));
  check(r.r === 'demo-autos' && /Autos y camionetas/.test(r.hint), '"carros y furgonetas" usa a demo de autos, mesmo com "Agro" no nome');
  for (const [txt, want] of [['venta de camionetas', 'demo-autos'], ['concesionaria', 'demo-autos'], ['repuestos de motos', 'demo-repuestos'], ['autoservicio', 'demo-supermercado'], ['semillas', 'demo-agro']]) {
    await s.locator('#pbo').fill(txt); await s.dispatchEvent('#pbo', 'input'); await s.w(100);
    const got = await s.evaluate(() => PB.r); check(got === want, `"${txt}" → ${want}`, got);
  }
  await s.locator('#pbo').fill('carros y furgonetas'); await s.dispatchEvent('#pbo', 'input'); await s.w(100);
  await s.locator('#pbgo').click(); await s.w(500);
  const op = (await s.evaluate(() => window.__opened || [])).concat([s.url()]); info(JSON.stringify(op));
  check(op.some(u => /demo-autos\/\?probar=1/.test(u)), 'o botão abre a demo de autos com o nome do cliente');

  sec('B. A demo de autos');
  await s.goto('https://araujotechsistemas.com/demo-autos/?probar=1'); await s.w(4000);
  const d = await s.evaluate(() => ({ name: pub.store.name, mode: pub.store.mode, n: pub.products.length, cats: pub.cats.map(c => c.n.es) }));
  info(JSON.stringify(d));
  check(d.name === 'Agro Nacunday' && d.mode === 'consulta' && d.n === 7, 'demo com o nome do cliente, em modo consulta, 7 veículos');
  await s.evaluate(() => productSheet('c2')); await s.w(1500);
  const sh = await s.evaluate(() => ({ sw: [...document.querySelectorAll('.sheet .csw .cn')].map(x => x.textContent), btn: !!document.querySelector('.sheet [data-act=cqsend]'), n: document.querySelectorAll('.sheet .pgal .gs').length }));
  info(JSON.stringify(sh));
  check(JSON.stringify(sh.sw) === '["Negro","Blanco"]' && sh.btn && sh.n === 2, 'SUV com cores (Negro/Blanco, cada uma com foto) e botão "Consultar por WhatsApp"');
  if (process.env.SHOT) await s.screenshot({ path: process.env.SHOT });
  check(!s.errs.length, 'sem erros de JavaScript', s.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
