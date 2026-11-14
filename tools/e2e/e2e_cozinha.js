// Tela da cozinha só para comida: em loja (roupa, suplementos…) não aparece "Cocina"; se o dono quiser, liga "Preparación".
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
  await a.set('#ns_name', 'Cozinha E2E'); await a.set('#ns_wa', '595981000965');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Cozinha E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const O = await L.open({ w: 1280 }); const o = O.p;
  await o.goto('https://' + shop.id + '.araujotechsistemas.com/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);
  const tabs = () => o.evaluate(() => admTabs().map(x => x[0] + ':' + x[1] + ':' + t('a_' + x[0])).filter(x => /^cocina/.test(x)).join(''));
  const deliv = async () => { await o.evaluate(() => { ui.tab = 'delivery'; render(); }); await o.w(300); return o.evaluate(() => { const i = document.getElementById('m_kds'); return i && { on: i.checked, txt: i.closest('label').innerText.replace(/\s+/g, ' ') }; }); };

  sec('A. Restaurante: cozinha como sempre');
  const t1 = await tabs(); info(t1);
  check(t1 === 'cocina:flame:Cocina', 'restaurante tem a aba "Cocina"');
  const d1 = await deliv(); info(JSON.stringify(d1));
  check(d1 && d1.on && /Pantalla de cocina/.test(d1.txt), 'a opção "Pantalla de cocina" vem ligada');

  sec('B. Loja de roupa: sem cozinha');
  await o.evaluate(() => { applyBoth(c => { c.store.ramo = 'ropa'; delete c.store.kds; }); render(); }); await o.w(400);
  const t2 = await tabs(); info('abas: ' + (t2 || '(sem cozinha)'));
  check(t2 === '', 'a aba "Cocina" some numa loja que não é de comida');
  const d2 = await deliv(); info(JSON.stringify(d2));
  check(d2 && !d2.on && /Pantalla de preparación/.test(d2.txt) && !/cocina/i.test(d2.txt), 'a opção aparece como "Pantalla de preparación", desligada');
  await o.evaluate(() => { ui.tab = 'cocina'; render(); }); await o.w(300);
  check(await o.evaluate(() => !document.querySelector('.kds,.kcard') && !/Cocina/.test(document.querySelector('main, body').innerText.slice(0, 4000))), 'se alguém estava na aba antiga, vê os Pedidos (sem "Cocina")');

  sec('C. O dono liga a tela de preparação');
  await deliv(); await o.locator('#m_kds').check(); await o.w(500);
  const t3 = await tabs(); info(t3);
  check(t3 === 'cocina:box:Preparación' && await o.evaluate(() => draft.store.kds === true && pub.store.kds === true), 'aparece a aba "Preparación" (ícone de caixa), sem falar em cozinha');
  await o.evaluate(() => { ui.tab = 'cocina'; render(); }); await o.w(300);
  const k = await o.evaluate(() => document.body.innerText);
  check(/separar y empacar/.test(k) && !/Pantalla de cocina|Cocina/.test(k), 'a tela explica "separar y empacar"');
  await deliv(); await o.locator('#m_kds').uncheck(); await o.w(400);
  check(await tabs() === '' && await o.evaluate(() => pub.store.kds === false), 'desligando, a aba some de novo');
  await o.evaluate(() => { lang = 'pt'; applyBoth(c => { c.store.kds = true; }); render(); }); await o.w(300);
  check(await tabs() === 'cocina:box:Preparação', 'em português: "Preparação"');
  check(!o.errs.length, 'sem erros de JavaScript', o.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
