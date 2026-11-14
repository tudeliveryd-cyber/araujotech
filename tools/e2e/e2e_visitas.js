// Visitas ao catálogo (regras v14): cada pessoa conta 1 vez por dia; dono/equipe e prévias não contam; o painel e o admin mostram.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const VT = () => { window.TDC_VTEST = true; };
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300); await a.set('#ns_name', 'Visitas Sol'); await a.set('#ns_wa', '595981000991'); await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Visitas Sol'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const day = await a.evaluate(() => dayKey(new Date()));
  const nVis = async () => { const r = await L.fsReq(P, 'GET', `shops/${shop.id}/visitas/${day}`, 'owner'); return r.status === 200 ? +L.unfields(r.json).n : 0; };

  sec('A. Cada pessoa conta uma vez por dia');
  const C1 = await L.open({ w: 390, init: VT }); const c1 = C1.p;
  await c1.goto(HOST + '/'); await c1.w(4000);
  check(await nVis() === 1, 'primeira visita: 1');
  await c1.reload(); await c1.w(3500);
  check(await nVis() === 1, 'a mesma pessoa voltando no mesmo dia não soma de novo');
  const C2 = await L.open({ w: 390, init: VT }); const c2 = C2.p;
  await c2.goto(HOST + '/'); await c2.w(4000);
  check(await nVis() === 2, 'outra pessoa: 2');
  const C3 = await L.open({ w: 390, init: VT }); const c3 = C3.p;
  await c3.goto(HOST + '/?ver=catalogo'); await c3.w(3500);
  await c3.goto('https://araujotechsistemas.com/demo-autos/'); await c3.w(3500);
  check(await nVis() === 2 && (await L.fsReq(P, 'GET', 'shops/demo-autos/visitas/' + day, 'owner')).status === 404, 'prévia do painel e páginas de demonstração não contam');

  sec('B. Dono e equipe não contam');
  const O = await L.open({ w: 1280, init: VT }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  const O2 = await o.context().newPage(); await O2.addInitScript(VT); await O2.goto(HOST + '/'); await O2.waitForTimeout(3500); await O2.close();
  check(await nVis() === 2, 'o dono abrindo o próprio catálogo no celular do painel não conta');

  sec('C. Painel do local: "Personas que vieron tu catálogo"');
  await o.evaluate(() => { ui.cvs = null; ui.tab = 'resumo'; render(); }); await o.w(2000);
  const card = await o.evaluate(() => { const h = [...document.querySelectorAll('.card h3')].find(x => /Personas que vieron/.test(x.textContent)); if (!h) return null; const c = h.closest('.card'); return { st: [...c.querySelectorAll('.stat')].map(x => x.innerText.replace(/\s+/g, ' ')), bars: c.querySelectorAll('.cvb i').length }; });
  info(JSON.stringify(card));
  check(card && card.st[0].toLowerCase() === 'hoy 2' && card.st[1].toLowerCase() === 'últimos 7 días 2' && card.bars === 14, 'mostra hoje 2, 7 dias 2 e o gráfico de 14 dias');

  sec('D. Segurança (regras v14)');
  const P0 = `projects/${P}/databases/(default)/documents`;
  const commit = async (n) => (await fetch(`http://127.0.0.1:8080/v1/${P0}:commit`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ writes: [{ update: { name: `${P0}/shops/${shop.id}/visitas/${day}`, fields: {} }, updateMask: { fieldPaths: [] }, updateTransforms: [{ fieldPath: 'n', increment: { integerValue: String(n) } }] }] }) })).status;
  check(await commit(50) !== 200 && await nVis() === 2, 'ninguém consegue somar 50 de uma vez');
  check((await fetch(`http://127.0.0.1:8080/v1/${P0}/shops/${shop.id}/visitas/${day}`)).status !== 200, 'visitante não lê os números do local');
  check((await fetch(`http://127.0.0.1:8080/v1/${P0}/shops/naoexiste/visitas/${day}?updateMask.fieldPaths=n`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fields: { n: { integerValue: '1' } } }) })).status !== 200, 'não dá para criar visitas de loja que não existe');

  sec('E. Panel Araújo Tech');
  await a.evaluate(() => { ui.cv = {}; ui.cvBusy = false; cvLoad(); }); await a.w(2500);
  await a.evaluate(() => { ui.view = 'shops'; render(); }); await a.w(800);
  const cell = await a.evaluate(id => { const el = document.querySelector(`[data-cv="${id}"]`); return el && el.textContent.trim(); }, shop.id);
  info(cell);
  check(cell === '2 en 7 días · 2 hoy', 'a lista de clientes mostra "2 en 7 días · 2 hoy"');
  check(!o.errs.length && !c1.errs.length && !a.errs.length, 'sem erros de JavaScript', o.errs.concat(c1.errs, a.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
