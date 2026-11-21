// Catálogo grande: importar milhares de produtos (até 100 mil) pelo painel, abrir no celular por categoria e buscar.
// N=20000 por padrão; N=100000 para o teste completo.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const N = +process.env.N || 20000;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  await L.fsReq(P, 'PATCH', 'billing/semilla', 'owner', L.fields({ name: 'Semilla', status: 'ativo', user: 'semilla', plan: 'basico', due: '2026-12-01', pays: [], created: '2026-11-01' }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300); await a.set('#ns_name', 'Super Grande E2E'); await a.set('#ns_wa', '595981000777'); await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Super Grande E2E'); return { id: s.id, user: s.user, pass: s.pass }; });
  for (let i = 0; i < 20 && !(await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass)).idToken; i++) await a.w(1000);
  info('local: ' + shop.id);
  await A.ctx.close();
  const SID = shop.id, HOST = 'https://' + SID + '.araujotechsistemas.com';
  const shopDoc = async () => L.unfields((await L.fsReq(P, 'GET', 'shops/' + SID, 'owner')).json) || {};
  const media = async k => L.unfields((await L.fsReq(P, 'GET', 'shops/' + SID + '/media/' + k, 'owner')).json) || null;

  sec('A. Painel: importar ' + N.toLocaleString('pt-BR') + ' produtos');
  const O = await L.open({ w: 1280 }); const o = O.p;
  await o.goto(HOST + '/painel/'); await o.w(3000);
  await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); await o.w(3500);
  const NEWP = 'DonoNovo#77'; await o.fill('#np_a', NEWP); await o.fill('#np_b', NEWP); await o.press('#np_b', 'Enter');
  await o.waitForSelector('#np_a', { state: 'detached', timeout: 45000 }).catch(() => {}); await o.w(2500);
  // limite de produtos ativos do plano (o teste libera para medir o modo grande)
  await o.evaluate(() => { if (typeof LIM !== 'undefined' && LIM) LIM.max = 0; });
  const rows = n => { const L2 = ['Nombre\tPrecio\tCategoría\tCódigo\tFoto']; for (let i = 0; i < n; i++) L2.push(`Producto prueba ${i} marca ${i % 97}\t${1000 + i}\tSección ${i % 60}\t78900${String(i).padStart(7, '0')}\t${i % 5 === 0 ? 'https://example.com/f/' + i + '.jpg' : ''}`); return L2.join('\n'); };
  await o.evaluate(tx => { ui.tab = 'products'; render(); IMP = { txt: tx, replace: true }; impSheet(); }, rows(N)); await o.w(1500);
  check(await o.locator('#imp_txt').count() === 0 && /filas|linhas/.test(await o.txt('.sheet')), 'planilha grande: não coloca as linhas na caixa de texto, mostra o total', (await o.txt('.sheet')).slice(0, 200));
  const t0 = Date.now(); await o.act('impgo');
  await o.waitForFunction(() => !!(pub.big && pub.big.n) && !document.querySelector('.sheet #bigprog'), null, { timeout: 600000 }).catch(() => {});
  await o.w(4000);
  info('importar e salvar: ' + Math.round((Date.now() - t0) / 1000) + ' s');
  const d = await shopDoc(); const cfg = JSON.parse(d.cfg || '{}');
  check(cfg.big && cfg.big.n === N, 'Firebase: catálogo grande gravado com ' + N + ' produtos', JSON.stringify(cfg.big || {}).slice(0, 200) + ' | ' + o.errs.join('|'));
  info('documento da loja: ' + Math.round((d.cfg || '').length / 1024) + ' KB · blocos: ' + ((cfg.big || {}).ch || []).length + ' · índice: ' + ((cfg.big || {}).ix || []).length);
  check((d.cfg || '').length < 300000, 'documento da loja continua pequeno (longe do limite de 1 MB)');
  const ch0 = (cfg.big.ch || [])[0]; const b0 = ch0 && await media(ch0.k); const pl0 = b0 ? JSON.parse(b0.pl) : [];
  check(pl0.length === ch0.n && pl0.every(p => p.cat === ch0.cat), 'bloco de produtos guarda uma categoria só', ch0 && ch0.k);
  const pF = pl0.find(p => p.photo); check(!!pF && /^https:\/\/example\.com\/f\//.test(pF.photo) && /^78900/.test(pF.bc || ''), 'importar: coluna Foto vira a foto e Código vira o código de barras', JSON.stringify(pF || pl0[0]).slice(0, 200));
  const sumN = cfg.big.ch.reduce((s, x) => s + x.n, 0); check(sumN === N, 'soma dos blocos = total de produtos', sumN);
  check(new Set(cfg.big.ch.map(x => x.cat)).size === 60 && (cfg.cats || []).length >= 60, 'categorias da planilha criadas (60)');

  sec('B. Importar de novo com preços novos (atualiza pelo código, não duplica)');
  const rows2 = 'Nombre\tPrecio\tCategoría\tCódigo\nOtro nombre cualquiera\t55555\tSección 3\t789000000003\nProducto nuevo E2E\t7777\tNovedades\t789999999999';
  await o.evaluate(tx => { IMP = { txt: tx, replace: false }; impSheet(); }, rows2); await o.w(800);
  await o.act('impgo'); await o.waitForFunction(n => pub.big && pub.big.n === n, N + 1, { timeout: 300000 }).catch(() => {}); await o.w(3000);
  const cfg2 = JSON.parse((await shopDoc()).cfg || '{}');
  check(cfg2.big && cfg2.big.n === N + 1, 'segunda importação: 1 atualizado + 1 novo (total ' + (N + 1) + ')', JSON.stringify(cfg2.big || {}).slice(0, 120));
  let upd = null; for (const c of cfg2.big.ch) { if (upd) break; const b = await media(c.k); upd = JSON.parse(b.pl).find(p => p.bc === '789000000003'); }
  check(upd && upd.price === 55555, 'produto achado pelo código teve o preço atualizado', JSON.stringify(upd || {}).slice(0, 160));
  const oldKeys = cfg.big.ch.map(x => x.k).filter(k => !cfg2.big.ch.some(x => x.k === k));
  for (const k of oldKeys.slice(0, 3)) check(!(await media(k)), 'bloco que deixou de ser usado foi apagado: ' + k);
  await O.ctx.close();

  sec('C. Cliente no celular');
  const C = await L.open({ w: 390, dpr: 2 }); const c = C.p; const t1 = Date.now();
  await c.goto(HOST + '/'); await c.waitForFunction(() => typeof pub !== 'undefined' && pub.big && document.querySelectorAll('[data-act=bigcat]').length > 0, null, { timeout: 60000 }).catch(() => {});
  info('abrir catálogo: ' + (Date.now() - t1) + ' ms');
  const st = await c.evaluate(() => ({ secs: document.querySelectorAll('section .sech').length, btn: document.querySelectorAll('[data-act=bigcat]').length, prods: pub.products.length }));
  check(st.secs >= 60 && st.btn >= 60, 'catálogo mostra as categorias com o total de cada uma', JSON.stringify(st) + ' | ' + c.errs.join('|'));
  check(st.prods < 200, 'ao abrir não baixa todos os produtos (só ' + st.prods + ')');
  const t2 = Date.now(); await c.locator('[data-act=bigcat]').first().click();
  await c.waitForFunction(() => document.querySelector('section .grid .pcard'), null, { timeout: 30000 }).catch(() => {});
  info('abrir uma categoria: ' + (Date.now() - t2) + ' ms');
  const s2 = await c.evaluate(() => ({ cards: document.querySelectorAll('section:first-of-type .pcard').length, more: !!document.querySelector('[data-act=bigmore]') }));
  check(s2.cards > 0 && s2.cards <= 24 && s2.more, 'categoria mostra os primeiros produtos e "Ver más"', JSON.stringify(s2));
  await c.locator('[data-act=bigmore]').first().click(); await c.w(500);
  check(await c.evaluate(() => document.querySelectorAll('section .pcard').length) > s2.cards, '"Ver más" mostra mais produtos');
  const t3 = Date.now(); await c.evaluate(n => { ui.q = 'prueba ' + n + ' marca'; render(); }, N - 2);
  await c.waitForFunction(() => BIG.ix && document.querySelectorAll('.pcard').length > 0, null, { timeout: 60000 }).catch(() => {});
  info('primeira busca (baixa o índice): ' + (Date.now() - t3) + ' ms');
  const target = 'Producto prueba ' + (N - 2) + ' marca ' + ((N - 2) % 97);
  check((await c.txt()).includes(target), 'busca acha produto que ainda não foi carregado', (await c.txt()).slice(0, 200));
  const t4 = Date.now(); await c.evaluate(() => { ui.q = '789999999999'; render(); }); const ms4 = Date.now() - t4;
  check((await c.txt()).includes('Producto nuevo E2E'), 'busca pelo código de barras (' + ms4 + ' ms)');
  await c.locator('.pcard[data-act=bigopen], .pcard[data-act=open]').first().click(); await c.w(2500);
  check(/Producto nuevo E2E/.test(await c.txt('.sheet')), 'tocar no resultado abre a ficha do produto', (await c.txt('.sheet')).slice(0, 160) + ' | ' + c.errs.join('|'));
  check(c.errs.length === 0, 'sem erros de JavaScript no catálogo', c.errs.join('|'));
  await C.ctx.close();
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
