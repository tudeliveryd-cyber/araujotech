// Admin: cidade do cliente (Santa Rita, Santa Rosa del Monday, outra) — no cadastro, no editar e no filtro da lista.
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
  const loja = nome => a.evaluate(n => { const s = PL.shops.find(x => x.name === n); if (!s) return null; const c = S.get(mkK(s.id).pub, null); return { id: s.id, city: s.city, addr: c && c.store.address, lat: c && c.store.lat, br: c && c.store.bairros.length }; }, nome);

  sec('A. Cadastro: Santa Rita vem marcada e traz os bairros de Santa Rita');
  await a.act('newshop'); await a.w(400);
  check(await a.locator('[data-act=citypick][data-c="Santa Rita"][aria-pressed=true]').count() === 1, 'Santa Rita já vem escolhida');
  await a.set('#ns_name', 'Cidade SR E2E'); await a.set('#ns_wa', '595981000401');
  await a.act('createshop'); await a.w(3500);
  const sr = await loja('Cidade SR E2E'); info(JSON.stringify(sr));
  check(sr && sr.city === 'Santa Rita' && /Santa Rita/.test(sr.addr) && sr.br > 0, 'cliente de Santa Rita com endereço e bairros de Santa Rita');

  sec('B. Cadastro em Santa Rosa del Monday');
  await a.act('newshop'); await a.w(400);
  await a.locator('[data-act=citypick][data-c="Santa Rosa del Monday"]').click(); await a.w(300);
  check(await a.locator('[data-act=citypick][data-c="Santa Rosa del Monday"][aria-pressed=true]').count() === 1, 'Santa Rosa del Monday marcada');
  await a.set('#ns_name', 'Cidade Rosa E2E'); await a.set('#ns_wa', '595981000402');
  await a.act('createshop'); await a.w(3500);
  const ro = await loja('Cidade Rosa E2E'); info(JSON.stringify(ro));
  check(ro && ro.city === 'Santa Rosa del Monday', 'cidade gravada no cliente');
  check(ro && /Santa Rosa del Monday/.test(ro.addr) && Math.abs(ro.lat + 25.8144) < 0.01, 'catálogo com endereço e localização de Santa Rosa');
  check(ro && ro.br === 0, 'sem os bairros de Santa Rita (o cliente escreve o bairro)');

  sec('C. Cadastro em outra cidade escrita à mão');
  await a.act('newshop'); await a.w(400);
  await a.locator('[data-act=citypick][data-c=""]').click(); await a.w(300);
  await a.set('#ns_city', 'Naranjito'); await a.w(200);
  await a.set('#ns_name', 'Cidade Nara E2E'); await a.set('#ns_wa', '595981000403');
  await a.act('createshop'); await a.w(3500);
  const na = await loja('Cidade Nara E2E'); info(JSON.stringify(na));
  check(na && na.city === 'Naranjito' && na.addr === 'Naranjito' && na.br === 0, 'outra cidade gravada');

  sec('D. Lista separada por cidade');
  await a.locator('[data-act=cityf][data-k="Santa Rosa del Monday"]').click(); await a.w(500);
  const nomes = await a.evaluate(() => [...document.querySelectorAll('.shop b')].map(b => b.textContent));
  check(nomes.includes('Cidade Rosa E2E') && !nomes.includes('Cidade SR E2E') && !nomes.includes('Loja Teste'), 'filtro de Santa Rosa mostra só os de Santa Rosa', JSON.stringify(nomes));
  check(await a.locator('[data-act=cityf][data-k=_none]').count() === 1, 'clientes antigos sem cidade aparecem em "Sin ciudad"');

  sec('E. Editar: trocar a cidade');
  await a.locator('[data-act=editcl][data-sid="' + ro.id + '"]').click(); await a.w(400);
  check(await a.locator('[data-act=citypick][data-c="Santa Rosa del Monday"][aria-pressed=true]').count() === 1, 'editar mostra a cidade atual');
  await a.locator('[data-act=citypick][data-c="Santa Rita"]').click(); await a.w(300);
  await a.act('saveec'); await a.w(800);
  check((await loja('Cidade Rosa E2E')).city === 'Santa Rita', 'cidade trocada pelo editar');
  await a.w(2500);
  const bd = await L.fsReq(P, 'GET', 'billing/' + ro.id, 'owner'); const bf = bd.json && bd.json.fields; const bc = bf && bf.city && bf.city.stringValue; if (!bc) info('billing: ' + bd.status + ' ' + JSON.stringify(bd.json).slice(0, 200));
  check(bc === 'Santa Rita', 'cidade salva na nuvem (billing)', String(bc));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
