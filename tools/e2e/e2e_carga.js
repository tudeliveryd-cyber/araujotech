// Teste de carga: quantos produtos cabem num catálogo e quanto demora para abrir no celular.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300); await a.set('#ns_name', 'Carga E2E'); await a.set('#ns_wa', '595981000555'); await a.act('createshop'); await a.w(4000);
  const id = await a.evaluate(() => PL.shops.find(x => x.name === 'Carga E2E').id);
  const URL = 'https://araujotechsistemas.com/loja/' + id + '/';
  const T0 = await L.open({ w: 390 }); await T0.p.goto(URL); await T0.p.w(3000); const base = await T0.p.evaluate(() => JSON.parse(JSON.stringify(pub))); await T0.ctx.close();
  base.store.days = Array(7).fill(0).map(() => ({ on: true, a: ['00:00', '23:59'], b: ['', ''] }));
  const cats = Array.from({ length: 40 }, (_, i) => ({ id: 'c' + i, n: { pt: 'Categoria ' + i, es: 'Categoría ' + i }, i: 'tag' }));
  const mk = n => Array.from({ length: n }, (_, i) => ({ id: 'p' + i.toString(36) + 'x' + n, cat: 'c' + (i % 40), n: { pt: 'Producto de prueba número ' + i + ' 500 g', es: 'Producto de prueba número ' + i + ' 500 g' }, d: { pt: '', es: '' }, price: 1000 + i, promo: 0, photo: null, on: true, feat: false, best: false, g: [] }));
  for (const n of [1000, 3000, 5000, 6000, 8000]) {
    sec('N = ' + n);
    const cfg = Object.assign({}, base, { cats, products: mk(n) }); const str = JSON.stringify(cfg);
    const r = await L.fsReq(P, 'PATCH', 'shops/' + id + '?updateMask.fieldPaths=cfg&updateMask.fieldPaths=status', 'owner', L.fields({ cfg: str, status: 'ativo' }));
    info(n + ' produtos · ' + Math.round(str.length / 1024) + ' KB · gravar: HTTP ' + r.status);
    if (r.status !== 200) { info('não coube (limite de 1 MB por catálogo)'); continue; }
    const C = await L.open({ w: 390, dpr: 2 }); const c = C.p; const t0 = Date.now(); await c.goto(URL);
    await c.waitForFunction(n => (pub.products || []).length === n && document.querySelectorAll('.pcard').length > 0, n, { timeout: 60000 }).catch(() => {});
    const ms = Date.now() - t0; const st = await c.evaluate(() => ({ n: (pub.products || []).length, cards: document.querySelectorAll('.pcard').length }));
    info('abrir no celular: ' + ms + ' ms · produtos ' + st.n + ' · cartões na tela ' + st.cards);
    const t1 = Date.now(); await c.evaluate(() => { ui.q = 'número 4999'; render(); }); const ms2 = Date.now() - t1; info('buscar: ' + ms2 + ' ms');
    await C.ctx.close();
  }
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
