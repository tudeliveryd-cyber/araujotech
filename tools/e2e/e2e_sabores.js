// Sabores ou versões: o mesmo produto em várias opções, cada uma com foto e valor a mais opcionais (cadastra uma vez só).
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
  await a.set('#ns_name', 'Bebidas Sabores E2E'); await a.set('#ns_wa', '595981000964');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Bebidas Sabores E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);
  await o.evaluate(() => { ui.tab = 'products'; render(); }); await o.w(600);


  sec('A. Painel: gaseosa em 3 sabores, dois com foto');
  await o.evaluate(() => acts.newprod()); await o.w(500);
  await o.set('#ed_nes', 'Gaseosa 2L'); await o.set('#ed_pr', '15000');
  await o.setInputFiles('#prodFile', FX + 'prod-alto.jpg'); await o.w(3500);
  check(await o.locator('[data-act=addvar]').count() === 1, 'o editor tem "Agregar sabor o versión"');
  for (const nm of ['Naranja', 'Uva', 'Limón']) { await o.locator('[data-act=addvar]').click(); await o.w(300); await o.evaluate(n => { const i = document.activeElement; i.value = n; i.dispatchEvent(new Event('input', { bubbles: true })); }, nm); }
  check(await o.locator('.vrow').count() === 3, 'as 3 opções entram na lista');
  await o.setInputFiles('[data-evarph="0"]', FX + 'prod-extra1.jpg'); await o.w(3000);
  await o.setInputFiles('[data-evarph="1"]', FX + 'prod-extra2.jpg'); await o.w(3000);
  await o.evaluate(() => { const i = document.querySelector('input[data-evar="2"][data-f=p]'); i.value = '1000'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  const g0 = await o.evaluate(() => { const g = varG(ui.edit); return g && { n: g.n.es, o: g.o.map(x => ({ es: x.n.es, pt: x.n.pt, ph: !!x.ph, p: x.p })), gen: [...document.querySelectorAll('.sheet .gbox')].some(b => /Sabor/.test(b.innerHTML)) }; });
  info(JSON.stringify(g0));
  check(g0 && g0.n === 'Sabor' && g0.o.length === 3 && g0.o[0].es === 'Naranja' && g0.o[0].pt === 'Naranja' && g0.o[0].ph && g0.o[1].ph && !g0.o[2].ph && g0.o[2].p === 1000, 'nome, foto e valor a mais de cada sabor');
  check(!g0.gen, 'o grupo de sabores não aparece repetido nas opções comuns');
  await o.evaluate(() => acts.saveprod()); await o.w(6000);
  const pid = await o.evaluate(() => (pub.products.find(p => tr(p.n) === 'Gaseosa 2L') || {}).id);
  const sv = await o.evaluate(id => { const p = pub.products.find(x => x.id === id); const g = varG(p); return { kind: g.kind, req: g.req, ph: g.o.map(x => x.ph || '') }; }, pid);
  info(JSON.stringify(sv));
  check(sv.kind === 'var' && sv.req && /^x:x/.test(sv.ph[0]) && /^x:x/.test(sv.ph[1]) && !sv.ph[2], 'as fotos dos sabores vão para a nuvem (como as fotos de cor)');

  sec('B. Catálogo: escolher o sabor');
  const C = await L.open({ w: 390 }); const c = C.p;
  await c.goto(HOST + '/'); await c.w(5000);
  const tg = await c.evaluate(id => { const b = document.querySelector('.pcard[data-pid="' + id + '"]'); return b && (b.querySelector('.cdots small') || {}).textContent; }, pid);
  check(tg === '3 opciones', 'o cartão do produto avisa "3 opciones"', String(tg));
  await c.locator('.pcard[data-pid="' + pid + '"]').first().click(); await c.w(3500);
  const s1 = await c.evaluate(() => ({ n: document.querySelectorAll('.sheet .vopt').length, im: [...document.querySelectorAll('.sheet .vopt img.vph')].filter(i => i.complete && i.naturalWidth > 0).length, h: document.querySelector('.sheet .grp-h b').textContent, src: (document.querySelector('.sheet .pgal .gs img') || {}).src || '' }));
  info(JSON.stringify({ n: s1.n, im: s1.im, h: s1.h }));
  check(s1.n === 3 && s1.im === 2 && /^Sabor/.test(s1.h), 'abre com os 3 sabores em lista, com a fotinha ao lado de quem tem foto');
  await c.locator('.sheet .vopt').nth(1).click(); await c.w(1500);
  const s2 = await c.evaluate(() => ({ h: document.querySelector('.sheet .grp-h b').textContent, src: (document.querySelector('.sheet .pgal .gs img') || {}).src || '', tot: (document.querySelector('.sheet .sh-foot') || {}).innerText }));
  check(s2.h === 'Sabor: Uva' && s2.src && s2.src !== s1.src, 'tocar em Uva mostra "Sabor: Uva" e troca a foto grande para a da uva');
  await c.locator('.sheet .vopt').nth(2).click(); await c.w(1000);
  const s3 = await c.evaluate(() => ({ tot: (document.querySelector('.sheet .sh-foot') || {}).innerText, n: document.querySelectorAll('.sheet .pgal .gs').length }));
  check(/16\.000/.test(s3.tot) && s3.n === 1, 'Limón (sem foto) usa a foto principal e soma o valor a mais (16.000)', s3.tot);
  await c.act('addcart'); await c.w(800);
  const lbl = await c.evaluate(() => lineLabel(pub, cart[0], 'es').join(' · '));
  info(lbl);
  check(/Sabor: Limón/.test(lbl), 'o pedido diz "Sabor: Limón"');
  if (process.env.SHOT) { await c.evaluate(id => { closeSheet(); productSheet(id); }, pid); await c.w(1800); await c.screenshot({ path: process.env.SHOT }); }
  if (process.env.SHOT2) { await o.evaluate(id => acts.editprod({ dataset: { pid: id } }), pid); await o.w(2000); await o.evaluate(() => document.querySelector('.vrow').scrollIntoView({ block: 'center' })); await o.w(300); await o.screenshot({ path: process.env.SHOT2 }); }
  check(!o.errs.length && !c.errs.length, 'sem erros de JavaScript', o.errs.concat(c.errs).join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
