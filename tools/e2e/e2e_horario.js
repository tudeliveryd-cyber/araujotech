// Horários: o que se digita na segunda vai para os outros dias que estavam iguais (catálogo do local).
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const FX = __dirname + '/fix/';
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300);
  await a.set('#ns_name', 'Horario E2E'); await a.set('#ns_wa', '595981000964');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Horario E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);
  await o.evaluate(() => { ui.tab = 'delivery'; render(); }); await o.w(600);

  sec('A. Segunda-feira puxa os outros dias');
  const days = () => o.evaluate(() => [0,1,2,3,4,5,6].map(i => { const d = draft.store.days[i]; return (d.on ? '' : 'X') + d.a.join('-') + '/' + d.b.join('-'); }));
  info('antes: ' + JSON.stringify(await days()));
  await o.evaluate(() => { [0,1,2,3,4,5,6].forEach(i => { const d = draft.store.days[i]; d.on = i !== 0; d.a = ['', '']; d.b = ['', '']; }); applyBoth(c => { c.store.days = JSON.parse(JSON.stringify(draft.store.days)); }); render(); }); await o.w(400);
  const setT = async (id, v) => { await o.evaluate(([id, v]) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, [id, v]); await o.w(300); };
  await setT('dy_1_a0', '11:00'); await setT('dy_1_a1', '14:00');
  let d1 = await days(); info(JSON.stringify(d1));
  check(d1.slice(1).every(x => x === '11:00-14:00/-'), 'horário digitado na segunda vai para terça a sábado');
  check(d1[0] === 'X-/-', 'domingo fechado continua fechado e vazio');
  await setT('dy_6_a1', '12:00'); await setT('dy_1_b0', '18:00'); await setT('dy_1_b1', '23:00'); await setT('dy_1_a1', '15:00');
  d1 = await days(); info(JSON.stringify(d1));
  check(d1[2] === '11:00-15:00/18:00-23:00' && d1[5] === '11:00-15:00/18:00-23:00', 'segundo turno e mudanças da segunda seguem para os dias iguais');
  check(d1[6] === '11:00-12:00/18:00-23:00', 'o dia que foi mudado à mão (sábado) mantém o seu horário');
  info(JSON.stringify(await o.evaluate(() => ({ pub: pub.store.days[3], dom: document.getElementById('dy_3_b1').value, tab: ui.tab }))));
  check(await o.inputValue('#dy_3_b1') === '23:00', 'a tela mostra os horários copiados');
  check(!o.errs.length, 'sem erros de JavaScript', o.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
