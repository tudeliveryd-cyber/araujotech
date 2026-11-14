// Garçom lança o pedido pela Caja: "Enviar a la mesa · cobrar al final" — vai para a cozinha e a conta da mesa fica aberta no Salón.
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
  await a.act('newshop'); await a.w(300);
  await a.set('#ns_name', 'Mozo E2E'); await a.set('#ns_wa', '595981000951');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Mozo E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 1100 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);
  await o.evaluate(() => { applyBoth(c => { c.store.tables = 8 }); ui.tab = 'caja'; render(); }); await o.w(1500);

  sec('A. Caja com mesa: botão para mandar à mesa e cobrar no final');
  const pid = await o.evaluate(() => pub.products.find(p => p.on && !(p.g || []).length).id);
  await o.locator(`[data-act=posadd][data-pid="${pid}"]`).first().click().catch(async () => { await o.evaluate(id => { posState().items.push({ pid: id, q: 2, o: {} }); posSave(); render(); }, pid); });
  await o.evaluate(id => { const P = posState(); if (!P.items.length) P.items.push({ pid: id, q: 2, o: {} }); else P.items[0].q = 2; posSave(); render(); }, pid); await o.w(200);
  await o.locator('[data-act=postype][data-k=table]').click(); await o.w(300);
  check(await o.locator('[data-act=posopen]').count() === 1, 'aparece "Enviar a la mesa · cobrar al final"');
  await o.set('#pos_tb', '3'); await o.w(200);
  await o.act('posopen'); await o.w(2500);
  const ord = await o.evaluate(() => orders.find(x => x.mesa === '3'));
  info(JSON.stringify(ord && { canal: ord.canal, status: ord.status, paid: ord.paid, pay: ord.pay, total: ord.total, id: !!ord.id }));
  check(ord && ord.canal === 'mesa' && ord.status === 'aceito' && ord.paid === false && ord.id, 'pedido salvo na nuvem, na cozinha e sem cobrar');
  check(/Pedido enviado a la cocina/.test(await o.txt()), 'confirmação "Pedido enviado a la cocina"');

  sec('B. Conta aberta no Salón e cobrança no final');
  await o.evaluate(() => { closeSheet(); ui.tab = 'salon'; render(); }); await o.w(600);
  const g = await o.evaluate(() => salOpen().map(x => ({ m: x.mesa, tot: x.tot, n: x.l.length })));
  info(JSON.stringify(g));
  check(g.some(x => x.m === '3' && x.tot === ord.total), 'Mesa 3 aparece em Cuentas abiertas com o total');
  await o.locator('[data-act=salpaid][data-m="3"]').click(); await o.w(1500);
  check(await o.evaluate(() => !salOpen().some(x => x.mesa === '3')), 'depois de "Cobrado" a conta fecha');
  const cloud = (await L.fsReq(P, 'GET', 'shops/' + shop.id + '/orders/' + ord.id, 'owner')).json; const cf = (cloud && cloud.fields) || {};
  check(cf.paid && cf.paid.booleanValue === true && cf.canal && cf.canal.stringValue === 'mesa', 'nuvem: pedido de mesa marcado como cobrado');
  check(!o.errs.length, 'sem erros de JavaScript', o.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
