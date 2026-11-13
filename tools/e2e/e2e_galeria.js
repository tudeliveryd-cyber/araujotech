// Galeria do produto: foto principal + fotos extras; ao abrir, o cliente vê a foto inteira (sem cortar), em boa qualidade, e pode ampliar.
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
  await a.set('#ns_name', 'Galeria E2E'); await a.set('#ns_wa', '595981000962');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Galeria E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter');
  await o.waitForSelector('#np_a', { timeout: 20000 }).catch(() => {});
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  await o.evaluate(() => { ui.tab = 'products'; render(); }); await o.w(600);

  sec('A. Painel: produto com foto principal e 2 fotos a mais');
  await o.evaluate(() => acts.newprod()); await o.w(500);
  await o.set('#ed_nes', 'Campera Galería'); await o.set('#ed_pr', '150000');
  await o.setInputFiles('#prodFile', FX + 'prod-alto.jpg'); await o.w(4000);
  check(await o.locator('.phx').count() === 1, 'o editor mostra o campo "Más fotos"');
  await o.setInputFiles('#prodMore', [FX + 'prod-extra1.jpg', FX + 'prod-extra2.jpg']); await o.w(5000);
  const ed = await o.evaluate(() => ({ ph: !!ui.edit.photo, hq: (ui.edit.hq || '').length, hqk: ui.edit.hqk === hashStr(ui.edit.photo), n: (ui.edit.photos || []).length, th: document.querySelectorAll('.phx .thumb img').length }));
  info(JSON.stringify(ed));
  check(ed.ph && ed.hq > 50000 && ed.hqk, 'a foto principal ganha uma versão grande (para ver ao abrir)');
  check(ed.n === 2 && ed.th === 2, 'as 2 fotos a mais aparecem no editor');
  await o.evaluate(() => acts.saveprod()); await o.w(6000);
  const pid = await o.evaluate(() => (pub.products.find(p => tr(p.n) === 'Campera Galería') || {}).id);
  const sv = await o.evaluate(id => { const p = pub.products.find(x => x.id === id); return { hq: p.hq, ph: p.photos, ls: (localStorage.getItem(K.pub) || '').length }; }, pid);
  info(JSON.stringify({ hq: sv.hq, ph: sv.ph, ls: sv.ls }));
  check(/^x:x/.test(sv.hq) && sv.ph.length === 2 && sv.ph.every(v => /^x:x/.test(v)), 'na nuvem, as fotos grandes viram documentos separados (o catálogo não fica pesado)');
  check(sv.ls < 400000, 'a memória do celular não guarda as fotos grandes');
  const shopDoc = L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json);
  const cfg = JSON.parse(shopDoc.cfg); const cp = cfg.products.find(x => x.id === pid);
  check(cp && cp.hq === sv.hq && cp.photos.length === 2, 'o catálogo publicado guarda só as referências das fotos');
  const xs = []; for (const r of [sv.hq, ...sv.ph]) { const d = await L.fsReq(P, 'GET', 'shops/' + shop.id + '/media/' + r.slice(2), null); xs.push(d.status === 200 && (L.unfields(d.json).x || '').length); }
  info('tamanhos: ' + xs.join(', '));
  check(xs.every(n => n > 50000 && n < 1000000), 'cada foto grande fica no seu documento (legível pelo público, abaixo do limite)');

  sec('B. Catálogo do cliente: abrir o produto');
  const C = await L.open({ w: 390 }); const c = C.p;
  await c.goto(HOST + '/'); await c.w(5000);
  const card = c.locator('.pcard[data-pid="' + pid + '"]');
  check(await card.count() === 1, 'o produto aparece no catálogo');
  await card.first().click(); await c.w(3500);
  const g = await c.evaluate(() => { const s = [...document.querySelectorAll('.sheet .pgal .gs')]; return { n: s.length, imgs: s.map(b => { const i = b.querySelector('img'); const r = i && i.getBoundingClientRect(), rb = b.getBoundingClientRect(); return i ? { w: i.naturalWidth, h: i.naturalHeight, fit: getComputedStyle(i).objectFit, pend: !!i.dataset.xr, inside: r.height <= rb.height + 1 && r.width <= rb.width + 1 } : null; }), dots: document.querySelectorAll('.sheet .pgal .dots i').length, gn: (document.querySelector('.sheet [data-gn]') || {}).textContent }; });
  info(JSON.stringify(g));
  check(g.n === 3 && g.dots === 3 && g.gn === '1 / 3', 'a ficha do produto mostra as 3 fotos, com indicador 1 / 3');
  check(g.imgs[0] && g.imgs[0].inside && g.imgs[0].fit === 'contain' && g.imgs[0].h >= 1500 && !g.imgs[0].pend, 'a foto principal aparece inteira (sem cortar) e em alta resolução');
  check(g.imgs.slice(1).every(x => x && x.w >= 1500 && x.fit === 'contain'), 'as fotos extras carregam em boa qualidade');
  await c.evaluate(() => { const t = document.querySelector('.sheet [data-gal]'); t.scrollLeft = t.clientWidth * 2; }); await c.w(500);
  check(await c.evaluate(() => document.querySelector('.sheet [data-gn]').textContent) === '3 / 3', 'deslizar troca a foto e o indicador');
  await c.evaluate(() => acts.pq({ dataset: { d: '1' } })); await c.w(400);
  check(await c.evaluate(() => { const t = document.querySelector('.sheet [data-gal]'); return Math.round(t.scrollLeft / t.clientWidth); }) === 2, 'mudar a quantidade não volta para a primeira foto');

  sec('C. Ampliar em tela cheia');
  await c.locator('.sheet .pgal .gs').nth(2).click(); await c.w(1200);
  if (process.env.SHOT2) await c.screenshot({ path: process.env.SHOT2 });
  const pv = await c.evaluate(() => { const v = document.getElementById('pv'); if (!v) return null; const t = v.querySelector('.pvtrack'); return { n: v.querySelectorAll('.pvs').length, at: Math.round(t.scrollLeft / t.clientWidth), lbl: document.getElementById('pvn').textContent, full: v.getBoundingClientRect().height, fitv: [...v.querySelectorAll('.pvs')].every(s => { const i = s.querySelector('img'), a = i.getBoundingClientRect(), b = s.getBoundingClientRect(); return a.height <= b.height + 1 && a.width <= b.width + 1; }), imgs: [...v.querySelectorAll('.pvs img')].filter(i => Math.max(i.naturalWidth, i.naturalHeight) >= 1500).length }; });
  info(JSON.stringify(pv));
  check(pv && pv.n === 3 && pv.at === 2 && pv.lbl === '3 / 3' && pv.full === 844, 'abre em tela cheia na mesma foto, com as 3 para deslizar');
  check(pv && pv.fitv, 'em tela cheia a foto cabe inteira na tela');
  check(pv && pv.imgs === 3, 'em tela cheia as fotos estão em alta resolução');
  await c.locator('#pv .pvs').nth(2).click(); await c.w(300);
  const z = await c.evaluate(() => { const s = document.querySelectorAll('#pv .pvs')[2]; return { z: s.classList.contains('z'), w: s.querySelector('img').getBoundingClientRect().width }; });
  check(z.z && z.w > 390 * 2, 'tocar na foto amplia (zoom)');
  await c.locator('#pv [data-act=pvclose]').click(); await c.w(300);
  check(await c.locator('#pv').count() === 0 && await c.locator('.sheet .pgal').count() === 1, 'fechar volta para o produto');

  sec('D. Opção de foto inteira nos cartões');
  await o.evaluate(() => { ui.tab = 'custom'; render(); }); await o.w(500);
  check(await o.locator('#lay_fit').count() === 1, 'o painel tem "Mostrar la foto entera en las tarjetas"');
  await o.locator('#lay_fit').check(); await o.w(300);
  check(await o.evaluate(() => draft.layout.phfit === true), 'a opção fica no rascunho do layout');

  sec('E. Tirar uma foto extra apaga o documento dela');
  await o.evaluate(() => { ui.tab = 'products'; render(); }); await o.w(400);
  await o.evaluate(id => acts.editprod({ dataset: { pid: id } }), pid); await o.w(1500);
  check(await o.evaluate(() => document.querySelectorAll('.phx .thumb img').length) === 2, 'ao editar, as fotos extras aparecem (carregadas da nuvem)');
  await o.locator('[data-act=rmxph][data-i="0"]').click(); await o.w(300);
  await o.evaluate(() => acts.saveprod()); await o.w(6000);
  const gone = await L.fsReq(P, 'GET', 'shops/' + shop.id + '/media/' + sv.ph[0].slice(2), null);
  const kept = await L.fsReq(P, 'GET', 'shops/' + shop.id + '/media/' + sv.ph[1].slice(2), null);
  check(gone.status === 404 && kept.status === 200, 'a foto removida sai da nuvem e a outra continua');

  sec('F. Produtos antigos (sem fotos extras) continuam iguais');
  await c.reload(); await c.w(4500);
  const old = await c.evaluate(id => { const p = pub.products.find(x => x.id === id); delete p.hq; delete p.hqk; delete p.photos; /* só nesta página: simula um produto antigo */ productSheet(p.id); const s = document.querySelectorAll('.sheet .pgal .gs').length; const i = document.querySelector('.sheet .pgal img'); return { s, fit: i && getComputedStyle(i).objectFit, dots: document.querySelectorAll('.sheet .pgal .dots i').length }; }, pid);
  info(JSON.stringify(old));
  check(old.s === 1 && old.fit === 'contain' && old.dots === 0, 'produto com 1 foto: aparece inteira, sem indicador de várias');
  check(!o.errs.length && !c.errs.length, 'sem erros de JavaScript', o.errs.concat(c.errs).join(' | '));
  if (process.env.SHOT) { await c.evaluate(id => productSheet(id), pid); await c.w(2000); await c.screenshot({ path: process.env.SHOT }); }
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
