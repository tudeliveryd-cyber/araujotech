// Painel: foto grande do celular como portada (6000×4000) e logo escuro mais largo que alto.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const CAPA = process.env.CAPA, LOGO = process.env.LOGO;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300);
  await a.set('#ns_name', 'Fotos E2E'); await a.set('#ns_wa', '595981000961');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Fotos E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  await o.evaluate(() => { ui.tab = 'custom'; render(); }); await o.w(600);

  sec('A. Portada: foto grande do celular');
  await o.setInputFiles('#coverFile', CAPA); await o.w(4000);
  const cv = await o.evaluate(() => new Promise(r => { const u = draft.store.cover || ''; if (!u) return r(null); const i = new Image(); i.onload = () => r({ w: i.width, h: i.height, kb: Math.round(u.length / 1024) }); i.src = u; }));
  info(JSON.stringify(cv));
  check(cv && cv.w === 1400 && cv.h === 933 && cv.kb < 400, 'foto de 6000×4000 vira portada de 1400 px (leve)');
  check(await o.locator('.cvprev > img').count() === 1, 'a portada aparece na prévia');

  sec('B. Logo escuro mais largo que alto');
  await o.setInputFiles('#logoFile', LOGO); await o.w(2500);
  const lp = await o.evaluate(() => { const i = document.querySelector('.lgprev img'); const b = document.querySelector('.lgprev').getBoundingClientRect(); return i && { cls: i.className, bg: i.style.backgroundColor, w: Math.round(b.width), h: Math.round(b.height) }; });
  info(JSON.stringify(lp));
  check(lp && lp.w === lp.h, 'prévia do logo quadrada, igual ao catálogo');
  check(lp && /full/.test(lp.cls) && /fit/.test(lp.cls) && lp.bg === 'rgb(0, 0, 0)', 'logo largo aparece inteiro sobre o preto dele, sem cortar as letras');
  if (process.env.SHOT) await o.locator('.cvprev').screenshot({ path: process.env.SHOT });
  check(!o.errs.length, 'sem erros de JavaScript', o.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
