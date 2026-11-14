// Moeda do local: guaranis (padrão) ou dólares. O catálogo, o painel e o pedido mostram US$; as cobranças da Araújo Tech seguem em Gs.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300); await a.set('#ns_name', 'Moneda E2E'); await a.set('#ns_wa', '595981000981'); await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Moneda E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 1280 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);

  sec('A. Padrão: guaranis');
  check(await o.evaluate(() => gs(1500)) === 'Gs. 1.500', 'sem escolher nada, tudo em Gs.');
  await o.evaluate(() => { ui.tab = 'delivery'; render(); }); await o.w(400);
  check(await o.locator('#m_cur').count() === 1, 'em Delivery há "Moneda de los precios"');

  sec('B. Trocar para dólares');
  await o.selectOption('#m_cur', 'USD'); await o.w(1500);
  const p = await o.evaluate(() => ({ g: gs(28500), cur: pub.store.cur, opt: [...document.querySelectorAll('#m_cur option')].map(x => x.textContent), minl: t('min_order_l') }));
  info(JSON.stringify(p));
  check(p.g === 'US$ 28.500' && p.cur === 'USD', 'preços aparecem como US$ 28.500');
  check(JSON.stringify(p.opt) === '["Guaraníes (Gs.)","Dólares (US$)"]', 'as opções da moeda continuam com os nomes certos');
  check(/US\$/.test(p.minl) && !/Gs\./.test(p.minl), 'os campos do painel falam em US$');
  await o.evaluate(() => { ui.tab = 'products'; render(); acts.newprod(); }); await o.w(500);
  check(/\(US\$\)/.test(await o.evaluate(() => document.querySelector('label[for=ed_pr]').textContent)), 'no produto: "Precio (US$)"');
  await o.evaluate(() => closeSheet());
  await o.w(3000);

  sec('C. Catálogo do cliente');
  const C = await L.open({ w: 390 }); const c = C.p;
  await c.goto(HOST + '/'); await c.w(5000);
  const cat = await c.evaluate(() => ({ prices: [...document.querySelectorAll('.pcard .price')].slice(0, 3).map(x => x.textContent), gs: gs(99) }));
  info(JSON.stringify(cat));
  check(cat.prices.length && cat.prices.every(x => /^US\$ /.test(x.replace(/^[^U]*/, ''))) && cat.gs === 'US$ 99', 'o cliente vê os preços em US$');
  const pid = await c.evaluate(() => pub.products.find(p => p.on && !(p.g || []).length).id);
  await c.evaluate(id => { productSheet(id); }, pid); await c.w(400); await c.act('addcart'); await c.w(400);
  const msg = await c.evaluate(() => { try { return typeof waText === 'function' ? waText() : (typeof orderMsg === 'function' ? orderMsg() : document.body.innerText.match(/US\$ [\d.]+/) ? 'US$ ok' : ''); } catch (e) { return 'erro ' + e.message; } });
  info(String(msg).slice(0, 160));
  check(/US\$/.test(msg) && !/Gs\./.test(msg), 'carrinho/pedido em US$');

  sec('D. Araújo Tech continua em guaranis');
  check(await a.evaluate(() => gs(100000)) === 'Gs. 100.000', 'no Panel Araújo Tech as cobranças seguem em Gs.');
  const D = await L.open({ w: 390 }); const d = D.p;
  await d.goto('https://araujotechsistemas.com/demo-autos/'); await d.w(3500);
  check(/^US\$ 32\.000/.test(await d.evaluate(() => gs(pub.products.find(p => p.id === 'c1').price))), 'a demo de autos mostra US$ 32.000');
  check(!o.errs.length && !c.errs.length && !d.errs.length, 'sem erros de JavaScript', o.errs.concat(c.errs, d.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
