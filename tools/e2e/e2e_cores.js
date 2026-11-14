// Opções de cor: o mesmo modelo em várias cores, com bolinhas no catálogo e a foto de cada cor.
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
  await a.set('#ns_name', 'Tapiceria E2E'); await a.set('#ns_wa', '595981000963');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Tapiceria E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  await o.evaluate(() => { ui.tab = 'products'; render(); }); await o.w(600);

  sec('A. Painel: sofá em preto e branco, cada cor com foto');
  await o.evaluate(() => acts.newprod()); await o.w(500);
  await o.set('#ed_nes', 'Sofá Milano'); await o.set('#ed_pr', '2500000');
  await o.setInputFiles('#prodFile', FX + 'prod-alto.jpg'); await o.w(3500);
  check(await o.locator('[data-act=addcol][data-es=Negro]').count() === 1, 'o editor oferece cores prontas (Negro, Blanco, Gris…)');
  await o.locator('[data-act=addcol][data-es=Negro]').click(); await o.w(300);
  await o.locator('[data-act=addcol][data-es=Blanco]').click(); await o.w(300);
  check(await o.locator('.crow').count() === 2 && await o.locator('[data-act=addcol][data-es=Negro]').count() === 0, 'as 2 cores entram na lista e somem dos atalhos');
  await o.setInputFiles('[data-ecolph="0"]', FX + 'prod-extra1.jpg'); await o.w(3000);
  await o.setInputFiles('[data-ecolph="1"]', FX + 'prod-extra2.jpg'); await o.w(3000);
  await o.set('.crow:nth-of-type(1) input[data-f=p]', '0').catch(() => {});
  await o.evaluate(() => { const i = document.querySelectorAll('input[data-ecol="1"][data-f=p]')[0]; i.value = '150000'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await o.locator('[data-act=addcol]:not([data-es])').click(); await o.w(300);
  check(await o.evaluate(() => document.activeElement && document.activeElement.id === 'ecol_2'), '"Otro color" abre o campo do nome');
  await o.evaluate(() => { const i = document.getElementById('ecol_2'); i.value = 'Verde agua'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await o.w(200);
  const g0 = await o.evaluate(() => { const g = colG(ui.edit); return g && g.o.map(x => ({ es: x.n.es, pt: x.n.pt, hex: x.hex || colHex(x), ph: !!x.ph, p: x.p })); });
  info(JSON.stringify(g0));
  check(g0 && g0.length === 3 && g0[0].hex === '#1F1F1F' && g0[1].hex === '#FFFFFF' && g0[2].hex === '#5FC9B3', 'cada cor ganha o tom certo pelo nome');
  check(g0[0].ph && g0[1].ph && !g0[2].ph && g0[1].p === 150000, 'foto por cor e valor a mais opcionais');
  await o.evaluate(() => acts.saveprod()); await o.w(6000);
  const pid = await o.evaluate(() => (pub.products.find(p => tr(p.n) === 'Sofá Milano') || {}).id);
  const sv = await o.evaluate(id => { const p = pub.products.find(x => x.id === id); const g = colG(p); return { kind: g.kind, req: g.req, ph: g.o.map(x => x.ph || '') }; }, pid);
  info(JSON.stringify(sv));
  check(sv.kind === 'color' && sv.req && /^x:x/.test(sv.ph[0]) && /^x:x/.test(sv.ph[1]), 'as fotos das cores vão para documentos próprios na nuvem');

  sec('B. Catálogo: escolher a cor');
  const C = await L.open({ w: 390 }); const c = C.p;
  await c.goto(HOST + '/'); await c.w(5000);
  const dots = await c.evaluate(id => { const b = document.querySelector('.pcard[data-pid="' + id + '"]'); return b && { n: b.querySelectorAll('.cdots i').length, t: (b.querySelector('.cdots small') || {}).textContent }; }, pid);
  check(dots && dots.n === 3 && dots.t === '3 colores', 'o cartão mostra as bolinhas: "3 colores"');
  await c.locator('.pcard[data-pid="' + pid + '"]').first().click(); await c.w(3500);
  const s1 = await c.evaluate(() => ({ sw: document.querySelectorAll('.sheet .csw').length, on: (document.querySelector('.sheet .csw.on .cn') || {}).textContent, h: document.querySelector('.sheet .grp-h b').textContent, first: (document.querySelector('.sheet .pgal .gs img') || {}).naturalWidth, n: document.querySelectorAll('.sheet .pgal .gs').length, bg: getComputedStyle(document.querySelectorAll('.sheet .csw .cdot')[1]).backgroundColor }));
  info(JSON.stringify(s1));
  check(s1.sw === 3 && s1.on === 'Negro' && s1.h === 'Color: Negro', 'abre com 3 bolinhas e a primeira cor escolhida');
  check(s1.n === 2 && s1.first === 1600, 'a galeria começa pela foto da cor escolhida (+ a foto principal)');
  check(s1.bg === 'rgb(255, 255, 255)', 'a bolinha do branco é branca');
  const ph0 = await c.evaluate(() => document.querySelector('.sheet .pgal .gs img').src.length);
  await c.locator('.sheet .csw').nth(1).click(); await c.w(1500);
  const s2 = await c.evaluate(() => ({ h: document.querySelector('.sheet .grp-h b').textContent, src: document.querySelector('.sheet .pgal .gs img').src.length, at: document.querySelector('.sheet [data-gal]').scrollLeft, tot: (document.querySelector('.sheet .sh-foot') || {}).innerText }));
  info(JSON.stringify({ h: s2.h, tot: s2.tot }));
  check(s2.h === 'Color: Blanco' && s2.src !== ph0 && s2.at === 0, 'tocar no branco troca a foto para a do sofá branco');
  check(/2\.650\.000/.test(s2.tot), 'o valor a mais do branco entra no total');
  await c.locator('.sheet .csw').nth(2).click(); await c.w(800);
  check(await c.evaluate(() => document.querySelectorAll('.sheet .pgal .gs').length) === 1, 'cor sem foto própria mostra a foto principal');
  await c.locator('.sheet .csw').nth(1).click(); await c.w(800);
  await c.act('addcart'); await c.w(800);
  const lbl = await c.evaluate(() => lineLabel(pub, cart[0], 'es').join(' · '));
  info(lbl);
  check(/Color: Blanco/.test(lbl), 'o pedido diz "Color: Blanco"');

  sec('C. Demo de ropa: os grupos "Color" antigos viram bolinhas');
  const D = await L.open({ w: 390 }); const d = D.p;
  await d.goto('https://araujotechsistemas.com/demo-ropa/'); await d.w(4000);
  await d.evaluate(() => productSheet('r2')); await d.w(800);
  const dr = await d.evaluate(() => [...document.querySelectorAll('.sheet .csw')].map(l => l.querySelector('.cn').textContent + '=' + getComputedStyle(l.querySelector('.cdot')).backgroundColor));
  info(dr.join(' | '));
  check(dr.length === 4 && dr[1] === 'Negro=rgb(31, 31, 31)', 'remera básica mostra Blanco/Negro/Gris/Beige em bolinhas');
  if (process.env.SHOT) { await c.evaluate(id => { closeSheet(); productSheet(id); }, pid); await c.w(1800); await c.screenshot({ path: process.env.SHOT }); }
  if (process.env.SHOT2) { await o.evaluate(id => acts.editprod({ dataset: { pid: id } }), pid); await o.w(2000); await o.evaluate(() => document.querySelector('.crow').scrollIntoView({ block: 'center' })); await o.w(300); await o.screenshot({ path: process.env.SHOT2 }); }
  check(!o.errs.length && !c.errs.length && !d.errs.length, 'sem erros de JavaScript', o.errs.concat(c.errs, d.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
