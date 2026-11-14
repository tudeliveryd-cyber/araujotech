// "Empezar de cero": só a Araújo Tech (admin) apaga os pedidos de teste de um local; o dono não vê a opção.
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
  await a.set('#ns_name', 'Zerar E2E'); await a.set('#ns_wa', '595981000966');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Zerar E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  // dois pedidos de teste (como os da instalação) e o contador em 2
  const now = new Date().toISOString();
  for (const [id, no] of [['t1', 1001], ['t2', 1002]]) {
    await L.fsReq(P, 'PATCH', `shops/${shop.id}/orders/${id}`, 'owner', L.fields({ no, date: now, status: 'entregue', total: 50000, name: 'Prueba', phone: '0981000000', mode: 'pickup', lines: [] }));
    await L.fsReq(P, 'PATCH', `shops/${shop.id}/track/${id}`, 'owner', L.fields({ no, status: 'entregue' }));
  }
  await L.fsReq(P, 'PATCH', `shops/${shop.id}/meta/counter`, 'owner', L.fields({ n: 2 }));
  // um pedido de OUTRA loja, que não pode ser tocado
  await L.fsReq(P, 'PATCH', `shops/outra/orders/x1`, 'owner', L.fields({ no: 1001, date: now, status: 'entregue', total: 1 }));
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const nOrd = async s => ((await L.fsReq(P, 'GET', `shops/${s}/orders`, 'owner')).json.documents || []).length;
  const nTrk = async s => ((await L.fsReq(P, 'GET', `shops/${s}/track`, 'owner')).json.documents || []).length;

  sec('A. O dono não vê a opção');
  const O = await L.open({ w: 1280 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  await o.evaluate(() => { ui.tab = 'orders'; render(); }); await o.w(800);
  check(await o.locator('[data-act=wipeord]').count() === 0, 'no painel do dono não aparece "Borrar pedidos de prueba"');
  check(await nOrd(shop.id) === 2, 'os 2 pedidos de teste estão lá');

  sec('B. Araújo Tech (admin) no painel do local');
  const B = await L.open({ w: 1280 }); const b = B.p;
  await b.goto(HOST + '/painel/'); await b.waitForFunction(() => { const x = document.querySelector('#loginForm button[type=submit]'); return x && !x.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && (await b.locator('#lg_user').count()); k++) { await b.fill('#lg_user', 'admin'); await b.fill('#lg_pass', ADM[1]); await b.press('#lg_pass', 'Enter'); await b.waitForSelector('#lg_user', { state: 'detached', timeout: 20000 }).catch(() => {}); } await b.w(3000); // no CI o login demora mais
  await b.evaluate(() => { ui.tab = 'orders'; render(); }); await b.w(800);
  check(await b.locator('[data-act=wipeord]').count() === 1, 'o admin vê "Empezar de cero (solo Araújo Tech)"');
  await b.locator('[data-act=wipeord]').click(); await b.w(1500);
  const cnt = await b.txt('.sheet .sh-body'); info(cnt.slice(0, 120));
  check(/Pedidos guardados: 2/.test(cnt), 'mostra quantos pedidos serão apagados (2)');
  await b.fill('#wp_in', 'borra'); await b.locator('[data-act=wipego]').click(); await b.w(1500);
  check(await nOrd(shop.id) === 2 && await b.locator('.sheet[data-k=wipe]').count() === 1, 'sem escrever BORRAR, nada é apagado');
  await b.evaluate(() => { window.__t = []; new MutationObserver(() => { const x = document.getElementById('toastRoot').innerText; if (x) window.__t.push(x); }).observe(document.getElementById('toastRoot'), { childList: true, subtree: true }); });
  await b.fill('#wp_in', 'borrar'); await b.locator('[data-act=wipego]').click(); await b.w(4000);
  const tt = (await b.evaluate(() => window.__t)).join(' | '); info(tt);
  check(await nOrd(shop.id) === 0 && await nTrk(shop.id) === 0, 'os pedidos e o acompanhamento deles foram apagados');
  check((await L.fsReq(P, 'GET', `shops/${shop.id}/meta/counter`, 'owner')).status === 404, 'a numeração volta ao início (próximo Nº 1001)');
  check(/2 pedidos borrados/.test(tt), 'avisa "Listo: 2 pedidos borrados"');
  check(await nOrd('outra') === 1, 'pedidos de outra loja não são tocados');
  const sd = L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json);
  check(sd && JSON.parse(sd.cfg).products.length > 0, 'os produtos e a configuração continuam iguais');
  await o.w(1500);
  check(await o.evaluate(() => orders.length) === 0, 'o painel do dono, aberto, fica sem os pedidos de teste');
  check(!o.errs.length && !b.errs.length, 'sem erros de JavaScript', o.errs.concat(b.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
