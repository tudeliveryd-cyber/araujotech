// Admin: rubro "Otro" escrito à mão — sugere um rubro parecido; se não houver, cria o catálogo com as categorias escritas.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(6000);

  sec('A. Rubro novo na lista: Caza, pesca y náutica');
  await a.act('newshop'); await a.w(400);
  check(await a.locator('[data-act=nsramo][data-r=pesca]').count() === 1, 'a lista de rubros tem "Caza, pesca y náutica"');

  sec('B. "Otro" com nome parecido a um rubro: sugere usar o rubro');
  await a.locator('[data-act=nsramo][data-r=otro]').click(); await a.w(300);
  await a.locator('#ns_segc').fill('Náutica del Lago'); await a.w(300);
  const sug = (await a.txt('#nsSug')).replace(/\s+/g, ' ');
  check(/Caza, pesca y náutica/.test(sug), 'sugere "Caza, pesca y náutica" para "Náutica del Lago"', sug);
  await a.locator('[data-act=nsuse]').click(); await a.w(400);
  check(await a.evaluate(() => ui.ns.ramo) === 'pesca', 'botão "Usar este rubro" escolhe o rubro');

  sec('C. "Otro" sem rubro parecido: cria com as categorias escritas');
  await a.locator('[data-act=nsramo][data-r=otro]').click(); await a.w(300);
  await a.locator('#ns_segc').fill('Escuela de idiomas'); await a.w(300);
  const sug2 = (await a.txt('#nsSug')).replace(/\s+/g, ' ');
  check(/No hay un rubro parecido/.test(sug2), 'avisa que não há rubro parecido', sug2);
  await a.set('#ns_name', 'Tattoo Ink E2E'); await a.w(200);
  await a.locator('#ns_cats').fill('Tatuajes, Piercing, Cuidados'); await a.w(200);
  await a.set('#ns_wa', '595981000222');
  await a.act('createshop'); await a.w(4000);
  const r = await a.evaluate(() => { const s = PL.shops.find(x => /Tattoo Ink/.test(x.name)); if (!s) return null; const c = S.get(mkK(s.id).pub, null); return { seg: s.seg, cats: c && c.cats.map(x => x.n.es), prods: c && c.products.length, slogan: c && c.store.slogan.es }; });
  info('criado: ' + JSON.stringify(r));
  check(r && JSON.stringify(r.cats) === '["Tatuajes","Piercing","Cuidados"]', 'catálogo criado com as 3 categorias escritas');
  check(r && r.prods === 0, 'sem produtos de outro rubro (para cadastrar os próprios)');
  check(r && r.seg && r.seg.es === 'Escuela de idiomas', 'o rubro escrito aparece no cliente');

  sec('D. "Otro" sem categorias: continua como antes');
  await a.act('newshop'); await a.w(400);
  await a.locator('[data-act=nsramo][data-r=otro]').click(); await a.w(300);
  await a.set('#ns_name', 'Generico E2E'); await a.set('#ns_wa', '595981000333');
  await a.act('createshop'); await a.w(4000);
  const g = await a.evaluate(() => { const s = PL.shops.find(x => /Generico E2E/.test(x.name)); const c = s && S.get(mkK(s.id).pub, null); return c ? { cats: c.cats.length, prods: c.products.length } : null; });
  check(g && g.cats > 0 && g.prods > 0, 'sem categorias escritas, usa o modelo genérico de antes', JSON.stringify(g));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
