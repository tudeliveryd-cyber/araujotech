// Diagnóstico (escáner) da Central: um cliente (completo), todos os clientes (rápido) e meus sistemas.
// Acha os problemas, mostra a solução, corrige com um toque o que é técnico, deixa desfazer e registra na auditoria.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  // um cliente já existente na nuvem: a Central carrega os clientes da nuvem (como na produção), não os de exemplo
  await L.fsReq(P, 'PATCH', 'billing/semilla', 'owner', L.fields({ name: 'Semilla', status: 'ativo', user: 'semilla', plan: 'basico', due: '2026-12-20', pays: [], created: '2026-11-01', seg: { es: 'Tienda', pt: 'Loja' }, wa: '595981000009' }));
  const A = await L.open({ w: 1366, central: true }); const a = A.p;
  // o que fica fora do repositório (outros domínios e as partes em PHP) responde aqui, como na produção; cada teste pode derrubar um deles
  const NET = { down: new Set(), guMiss: new Set(), skew: 0, newVer: false };
  await A.ctx.route(u => u.protocol === 'https:' && (/^(example\.com|guiadesantarita\.com|tile\.openstreetmap\.org|fonts\.googleapis\.com|cdnjs\.cloudflare\.com|wa\.me|tudelivery\.com\.py|sistema-de-otro\.example\.org)$/.test(u.hostname) || /\/logo\.php$/.test(u.pathname) || /\/sitio\/guia\.php$/.test(u.pathname) || (u.hostname === 'araujotechsistemas.com' && (u.pathname === '/robots.txt' || (u.pathname === '/admin/' && u.searchParams.has('dgv'))))), async r => {
    const u = new URL(r.request().url());
    if (NET.down.has(u.hostname)) return r.abort();
    if (u.pathname === '/robots.txt') return r.fulfill({ status: 200, contentType: 'text/plain', headers: NET.skew ? { date: new Date(Date.now() - NET.skew * 60000).toUTCString(), 'access-control-expose-headers': 'date' } : {}, body: 'User-agent: *\nAllow: /\n' });
    if (u.pathname === '/admin/') { let h = require('fs').readFileSync(require('path').join(L.DIRS.site, 'admin', 'index.html'), 'utf8'); if (NET.newVer) h = h.replace('const DG={', '/* versao nova */const DG={'); return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: h }); }
    if (/\/sitio\/guia\.php$/.test(u.pathname)) {
      if (u.searchParams.has('g')) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ads: [], dir: [], cat: [] }) });
      const o = {}; String(u.searchParams.get('ids') || '').split(',').filter(Boolean).forEach(id => { if (!NET.guMiss.has(id)) o[id] = { days: [], del: true, pick: true }; });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(o) });
    }
    if (u.hostname === 'example.com' && /roto/.test(u.pathname)) return r.fulfill({ status: 404, body: 'x' });
    if (/\.(png|jpe?g)$|logo\.php$/.test(u.pathname)) return r.fulfill({ status: 200, contentType: 'image/png', body: PNG });
    return r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' });
  });
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.evaluate(() => { cgG().dg = { auto: false }; }); // a revisão automática (20 s depois de abrir) é testada à parte, no fim
  const mk = async (n, wa) => { await a.act('newshop'); await a.w(300); await a.set('#ns_name', n); await a.set('#ns_wa', wa); await a.act('createshop'); await a.w(4000); return a.evaluate(n => PL.shops.find(x => x.name === n).id, n); };
  const OK = await mk('Local Sano', '595981000001'), BAD = await mk('Local Roto', '595981000002');
  await a.evaluate(({ OK, BAD }) => { [OK, BAD].forEach(id => { PL.shops.find(x => x.id === id).seg = { es: 'Restaurante', pt: 'Restaurante' }; }); savePL(); }, { OK, BAD }); await a.w(3500);
  const sq = (la, ln, d) => [[la - d, ln - d], [la - d, ln + d], [la + d, ln + d], [la + d, ln - d]];
  const days = on => [0, 1, 2, 3, 4, 5, 6].map(() => ({ on, a: ['00:00', '23:59'], b: ['', ''] }));
  const prod = (i, o) => Object.assign({ id: 'p' + i, cat: 'c1', n: { es: 'Producto ' + i, pt: 'Produto ' + i }, d: { es: '', pt: '' }, price: 10000, promo: 0, photo: 'https://example.com/f.jpg', on: true, g: [] }, o || {});
  const put = (id, cfg) => L.fsReq(P, 'PATCH', 'shops/' + id + '?updateMask.fieldPaths=cfg', 'owner', L.fields({ cfg: JSON.stringify(cfg) }));
  const doc = async id => L.unfields((await L.fsReq(P, 'GET', 'shops/' + id, 'owner')).json) || {};
  const cfgOf = async id => JSON.parse((await doc(id)).cfg || '{}');
  const SANO = { store: { name: 'Local Sano', whatsapp: '595981555444', logo: 'https://example.com/l.png', delivery: true, pickup: true, pay: { cash: true }, days: days(true), allowSched: true, feeMode: 'bairro', lat: -25.79, lng: -55.09, locSet: true, bairros: [{ name: 'Centro', fee: 8000, zone: sq(-25.79, -55.09, 0.01) }, { name: 'Anillo', fee: 15000, zone: sq(-25.79, -55.09, 0.03) }] }, zones: [], cats: [{ id: 'c1', n: { es: 'Comidas', pt: 'Comidas' } }], products: [prod(1), prod(2), prod(3)] };
  const ROTO = { store: { name: 'Local Roto', whatsapp: '0981 222 333', delivery: true, pickup: false, pay: { pix: true, cash: true }, pixKey: '', days: days(false), feeMode: 'bairro', lat: -25.79, lng: -55.09, locSet: true, bairros: [{ name: '', fee: null, zone: sq(-25.79, -55.09, 0.01) }] }, zones: [], cats: [{ id: 'c1', n: { es: 'Comidas', pt: 'Comidas' } }], products: [prod(1, { price: 0 }), prod(2, { cat: 'noexiste' }), prod(3), prod(3, { n: { es: 'Otro con el mismo código', pt: 'Outro' } }), prod(5, { photo: 'https://example.com/roto.jpg' }), prod(6, { photo: 'http://example.com/h.jpg' })] };
  await put(OK, SANO); await put(BAD, ROTO); await put('semilla', Object.assign({}, SANO, { store: Object.assign({}, SANO.store, { name: 'Semilla' }) }));
  const today = await a.evaluate(() => dayKey());
  await L.fsReq(P, 'PATCH', 'shops/' + OK + '/visitas/' + today, 'owner', L.fields({ n: 7 }));
  // analisar um cliente e esperar o resultado novo
  const scan = async id => { const t0 = await a.evaluate(() => (DG.cur && DG.cur.at) || 0); await a.evaluate(id => acts.dgpick({ dataset: { id } }), id); await a.waitForFunction(({ id, t0 }) => !DG.busy && DG.cur && DG.cur.s.id === id && DG.cur.at > t0, { id, t0 }, { timeout: 60000 }).catch(() => { }); await a.w(400); };
  const wait = async () => { await a.waitForFunction(() => !DG.busy, null, { timeout: 60000 }).catch(() => { }); await a.w(500); };
  const res = () => a.evaluate(() => ({ err: DG.cur.R.filter(x => x.sev === 'err').map(x => x.t), warn: DG.cur.R.filter(x => x.sev === 'warn').map(x => x.t), ok: DG.cur.R.filter(x => x.sev === 'ok').map(x => x.t), info: DG.cur.R.filter(x => x.sev === 'info').map(x => x.t), grupos: [...new Set(DG.cur.R.map(x => x.g))], auto: DG.cur.R.filter(x => x.act && x.act.auto).map(x => x.act.k).sort().join(','), man: DG.cur.R.filter(x => x.act && !x.act.auto).map(x => x.act.k).sort().join(','), nofix: DG.cur.R.filter(x => (x.sev === 'err' || x.sev === 'warn') && !x.fix).map(x => x.t), txt: (document.getElementById('dg_out') || {}).textContent || '' }));
  const has = (l, rx) => l.some(t => rx.test(t));

  sec('A. Onde fica: menu, botões e ficha; achar o cliente pelo link');
  await a.evaluate(() => document.querySelector('.cg-nav button[data-k="home"]').click()); await a.w(1200);
  check(await a.evaluate(() => [...document.querySelectorAll('.cg-sc [data-act="dgopen"]')].filter(b => b.offsetParent !== null).length >= 2), 'Visão geral: botão "Diagnóstico" visível no cartão da Guía e nos atalhos');
  check(await a.evaluate(() => { const b = document.querySelector('.cg-nav button[data-k="dg"]'); return !!b && b.offsetParent !== null && /Diagnóstico/.test(b.textContent); }), 'o menu da Central tem a entrada "Diagnóstico"');
  await a.evaluate(id => cgFicha(id), OK); await a.w(500);
  check(await a.evaluate(id => !!document.querySelector(`.sheet [data-act="dgpick"][data-id="${id}"]`), OK), 'a ficha do cliente tem o botão "Diagnóstico"');
  await a.evaluate(() => closeSheet()); await a.w(300);
  await a.evaluate(() => { PL.shops.push({ id: 'ag-prueba', name: 'Barbería Vecina', sys: 'agenda', plan: (PL.plans.find(p => p.sys === 'agenda') || PL.plans[0]).id, due: PL.shops[0].due, status: 'ativo', url: 'https://sistema-de-otro.example.org/app', pays: [] }); PL.shops.push({ id: 'ag-sinlink', name: 'Iglesia Sin Link', sys: 'iglesia', plan: PL.plans[0].id, due: PL.shops[0].due, status: 'ativo', pays: [] }); });
  const F = await a.evaluate(({ OK, BAD }) => ({ sub: (dgFind('https://' + OK + '.araujotechsistemas.com/') || {}).id, guia: (dgFind('guiadesantarita.com/' + BAD) || {}).id, nome: (dgFind('local roto') || {}).id, loja: (dgFind('https://araujotechsistemas.com/loja/' + OK + '/') || {}).id, outro: (dgFind('https://sistema-de-otro.example.org/app/entrar') || {}).id, nada: dgFind('https://example.com/xyz123') }), { OK, BAD });
  check(F.sub === OK && F.guia === BAD && F.nome === BAD && F.loja === OK && F.outro === 'ag-prueba' && F.nada === null, 'acha o cliente pelo subdomínio, pelo link da Guía, por /loja/, pelo nome e pelo link de outro sistema; link desconhecido não acha ninguém', JSON.stringify(F));
  await a.evaluate(() => [...document.querySelectorAll('.cg-sc [data-act="dgopen"]')].find(b => b.offsetParent !== null).click()); await a.w(600);
  check(await a.evaluate(() => ui.cgv === 'dg' && !!document.getElementById('dg_q') && document.querySelectorAll('.dg .cg-seg button').length === 3), 'o botão abre a página do Diagnóstico com os três modos (um cliente, todos, meus sistemas)');

  sec('B. Local em ordem: revisão completa');
  await a.set('#dg_q', 'https://' + OK + '.araujotechsistemas.com/'); await a.set('#dg_gps', '-25.79, -55.09'); await a.act('dgrun');
  await a.waitForFunction(id => !DG.busy && DG.cur && DG.cur.s.id === id, OK, { timeout: 60000 }).catch(() => { }); await a.w(500);
  const R1 = await res();
  info('são: erros=' + JSON.stringify(R1.err) + ' avisos=' + JSON.stringify(R1.warn));
  check(R1.err.length === 0 && R1.warn.length === 0, 'local em ordem: nenhum problema nem aviso', JSON.stringify(R1.err.concat(R1.warn)));
  check(['Internet', 'Cuenta', 'Pedidos', 'Catálogo', 'Fotos', 'Envíos', 'Sitio web', 'Guía', 'Técnico'].every(g => R1.grupos.some(x => x.includes(g))), 'o scan cobre internet, conta, pedidos, produtos, fotos, entregas, site, Guía e parte técnica', JSON.stringify(R1.grupos));
  check(has(R1.ok, /Centro/) && has(R1.ok, /8\.000/), 'a localização testada cai na zona menor (Centro) e mostra o preço', JSON.stringify(R1.ok.filter(t => /zona/i.test(t))));
  check(has(R1.ok, /Fotos por link: 2 probadas, todas cargan/), 'fotos: testa cada link (logo e produtos) e todos carregam', JSON.stringify(R1.ok.filter(t => /Foto/.test(t))));
  check(has(R1.ok, /Visitas en los últimos 7 días: 7/) && has(R1.info, /Sin pedidos por el catálogo/), 'mostra as visitas e os pedidos dos últimos 7 dias');
  check(has(R1.ok, /Aparece en la Guía/) && has(R1.ok, /La Guía lee los horarios/), 'Guía: confere a lista publicada de verdade e se a Guía lê os horários');
  check(has(R1.ok, /La página del catálogo responde/) && has(R1.ok, /WhatsApp de pedidos: \+595981555444/), 'página no ar e WhatsApp de pedidos em ordem');
  check(/Todo en orden/.test(R1.txt) && /Local Sano/.test(R1.txt) && /Salud/.test(R1.txt) && await a.evaluate(() => !document.querySelector('#dg_out [data-act="dgfixall"]') && !!document.querySelector('#dg_out details.dg-oks')), 'mostra o resumo (nome, saúde, "Todo en orden") e guarda o que está em ordem numa lista recolhida');

  sec('C. Local com problemas: cada um aparece com a solução');
  await scan(BAD);
  const R2 = await res();
  info('roto: erros=' + JSON.stringify(R2.err) + ' avisos=' + JSON.stringify(R2.warn));
  if (process.env.SHOT) { try { await a.screenshot({ path: process.env.SHOT.replace(/\.png$/, '-pc.png'), fullPage: true }); await a.setViewportSize({ width: 430, height: 900 }); await a.w(400); await a.screenshot({ path: process.env.SHOT, fullPage: true }); await a.setViewportSize({ width: 1366, height: 800 }); await a.w(300); } catch (e) { info('foto: ' + e.message); } }
  check(has(R2.warn, /WhatsApp de pedidos sin el código del país: 0981222333/), 'WhatsApp cadastrado com o 0 e sem o código do país: aviso com "Resolver"');
  check(has(R2.err, /Ningún día con horario/), 'nenhum dia com horário');
  check(has(R2.err, /categoría que no existe/), 'produto em categoria que não existe');
  check(has(R2.err, /código interno repetido/), 'dois produtos com o mesmo código interno');
  check(has(R2.warn, /producto\(s\) sin precio/) && has(R2.info, /Las zonas no tienen precio/) && has(R2.warn, /cae en una zona sin precio/), 'produto sem preço (aviso), zonas todas sem preço (dado: entrega "a confirmar") e o ponto testado numa zona sem preço');
  check(has(R2.info, /PIX sin la clave cargada/), 'PIX sem chave: sugestão (o catálogo avisa que o local manda a chave pelo WhatsApp)');
  check(has(R2.warn, /1 foto\(s\) que no cargan/) && has(R2.warn, /1 foto\(s\) con link "http"/) && has(R2.warn, /Sin logo/), 'fotos: acha a que não carrega, a que está em "http" e a falta do logo', JSON.stringify(R2.warn.filter(t => /foto|logo/i.test(t))));
  check(has(R2.warn, /Nadie abrió el catálogo/), 'avisa quando ninguém abriu o catálogo em 7 dias');
  check(R2.nofix.length === 0, 'todo problema ou aviso vem com a solução', JSON.stringify(R2.nofix));
  check(R2.auto === 'https,ids,orf,wa' && R2.man === 'cq0,pixoff', '"Resolver" técnico (WhatsApp, códigos, categoria, https) separado do que é decisão do dono (PIX, sem preço)', R2.auto + ' | ' + R2.man);
  check(/Solución:/.test(R2.txt) && /problema\(s\) para resolver/.test(R2.txt) && await a.evaluate(() => /\(4\)/.test((document.querySelector('#dg_out [data-act="dgfixall"]') || {}).textContent || '')), 'a tela mostra "Solución", o total de problemas e "Resolver todo (4)"');
  const TX = await a.evaluate(() => ({ t: dgText(DG.cur.s, DG.cur.R), m: dgMsg(DG.cur.s, DG.cur.R), wa: (document.getElementById('dg_wa') || {}).href || '' }));
  check(/Diagnóstico · Local Roto/.test(TX.t) && /\[!\] WhatsApp de pedidos sin el código del país/.test(TX.t) && /Solución:/.test(TX.t), '"Copiar informe" gera o texto com problemas e soluções');
  check(/Local Roto/.test(TX.m) && /sin precio/.test(TX.m) && /horario/.test(TX.m) && /painel\//.test(TX.m) && !/código interno/.test(TX.m) && !/PIX/.test(TX.m) && /^https:\/\/wa\.me\/595981000002\?text=/.test(TX.wa), '"Avisar al cliente": mensagem de WhatsApp só com o que o dono precisa arrumar, com o link do painel', TX.wa.slice(0, 60));

  sec('D. "Resolver todo": só o que é técnico; depois dá para desfazer');
  const before = (await doc(BAD)).cfg;
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfixall"]').click()); await a.w(1500); await wait();
  const D1 = await cfgOf(BAD); const ids1 = new Set(D1.cats.map(x => x.id));
  check(D1.store.whatsapp === '595981222333', 'WhatsApp corrigido para o formato com código do país', D1.store.whatsapp);
  check(D1.products.filter(p => !ids1.has(p.cat)).length === 0 && D1.cats.some(x => x.n.es === 'Otros'), 'produto solto foi para a categoria "Otros"');
  check(new Set(D1.products.map(p => p.id)).size === D1.products.length && D1.products.length === 6, 'códigos repetidos reparados sem apagar nenhum produto', D1.products.map(p => p.id).join(','));
  check(D1.products.some(p => p.photo === 'https://example.com/h.jpg') && !D1.products.some(p => /^http:/.test(p.photo || '')), 'link "http" da foto passou para "https" (testado antes de trocar)');
  check(D1.store.pay.pix === true && !D1.products.some(p => p.cq) && D1.products.find(p => p.n.es === 'Producto 1').price === 0, 'o que é decisão do dono (PIX, produto sem preço) não foi tocado');
  const R3 = await res();
  check(R3.auto === '' && !has(R3.err.concat(R3.warn), /WhatsApp|categoría que no existe|código interno|"http"/), 'o novo scan já não mostra os problemas corrigidos', JSON.stringify(R3.err.concat(R3.warn)));
  check(await a.evaluate(() => !!document.querySelector('#dg_out [data-act="dgundo"]')), 'aparece o botão "Deshacer"');
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgundo"]').click()); await a.w(1500); await wait();
  check((await doc(BAD)).cfg === before, '"Deshacer" devolve o catálogo exatamente como estava');
  check(await a.evaluate(() => { const l = cgG().audit.filter(x => x.a === 'dg').map(x => x.d).join(' | '); return /Local Roto · WhatsApp de pedidos corregido/.test(l) && /Corrección deshecha/.test(l); }), 'as correções e o desfazer ficam no registro de atividades (auditoria)');
  // correções que são decisão do dono: cada uma com o seu botão
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"][data-k="pixoff"]').click()); await a.w(1200); await wait();
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"][data-k="cq0"]').click()); await a.w(1200); await wait();
  const D2 = await cfgOf(BAD);
  check(D2.store.pay.pix === false && D2.store.pay.cash === true, 'botão "Desactivar PIX" desliga só o PIX');
  check(D2.products.find(p => p.n.es === 'Producto 1').cq === true && D2.products.filter(p => p.cq).length === 1, 'botão "Pasar a Consultar precio" marca só o produto sem preço (continua à vista, sem carrinho)');

  sec('E. Mapa da Tu Delivery desatualizado, pausa e "envío a confirmar"');
  await a.evaluate(async ({ OK, z }) => { const T = tdtAll(); const m = { id: tdtNewId(), name: 'Mapa X', feeMode: 'bairro', feeOrigin: 'local', minFee: 0, nightFrom: '18:00', bairros: [{ name: 'Centro', fee: 9000, zone: z }] }; T.maps.push(m); await tdtSave(); await tdfCopy('_tdt:' + m.id, [{ id: OK, night: false }]); T.as[OK] = { m: m.id, n: false }; await tdtSave(); m.bairros[0].fee = 11000; await tdtSave(); }, { OK, z: sq(-25.79, -55.09, 0.02) });
  await a.w(800); await scan(OK);
  const E1 = await a.evaluate(() => ({ stale: DG.cur.R.filter(x => x.act && x.act.k === 'map').map(x => x.t), auto: DG.cur.R.filter(x => x.act && x.act.k === 'map' && x.act.auto).length, btn: !!document.querySelector('#dg_out [data-act="dgfix"][data-k="map"]') }));
  check(E1.stale.length === 1 && E1.auto === 1 && E1.btn, 'detecta que o cliente está com a cópia antiga do mapa e oferece "Resolver"', JSON.stringify(E1));
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"][data-k="map"]').click()); await a.w(3000); await wait();
  const E2 = await a.evaluate(async OK => { const api = await CLOUD.init(); const d = await api.getShopDoc(OK); return { fee: JSON.parse(d.cfg).store.bairros[0].fee, acts: DG.cur.R.filter(x => x.act).length, ok: DG.cur.R.some(x => x.sev === 'ok' && /al día/.test(x.t)) }; }, OK);
  check(E2.fee === 11000 && E2.acts === 0 && E2.ok, 'depois do toque o cliente recebe o mapa novo e o diagnóstico fica em dia', JSON.stringify(E2));
  await put(BAD, { store: { name: 'Local Roto', whatsapp: '595981222333', logo: 'https://example.com/l.png', delivery: true, pickup: true, pay: { cash: true }, days: days(true), paused: true, feeMode: 'bairro', feeTbd: true, lat: -25.79, lng: -55.09, locSet: true, bairros: [{ name: 'Centro', fee: 8000, zone: sq(-25.79, -55.09, 0.01) }] }, zones: [], cats: [{ id: 'c1', n: { es: 'Comidas', pt: 'Comidas' } }], products: [prod(1), prod(2)] });
  await L.fsReq(P, 'PATCH', 'shops/' + BAD + '/visitas/' + today, 'owner', L.fields({ n: 3 }));
  await scan(BAD);
  const E3 = await res();
  check(has(E3.err, /El local está en pausa/) && has(E3.warn, /"Envío a confirmar" está activado aunque las zonas tienen precio/) && E3.auto === '' && E3.man === 'pause,tbd', 'pausa e "envío a confirmar" aparecem com botão próprio e ficam fora do "Resolver todo"', E3.auto + ' | ' + E3.man + ' | ' + JSON.stringify(E3.err.concat(E3.warn)));
  check(await a.evaluate(() => !document.querySelector('#dg_out [data-act="dgfixall"]') && /Sacar la pausa/.test(document.querySelector('#dg_out [data-k="pause"]').textContent)), 'sem correções técnicas não aparece "Resolver todo"; o botão diz o que faz ("Sacar la pausa")');
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"][data-k="pause"]').click()); await a.w(1200); await wait();
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"][data-k="tbd"]').click()); await a.w(1200); await wait();
  const E4 = await cfgOf(BAD); const E5 = await res();
  check(E4.store.paused === false && !E4.store.feeTbd && E4.products.length === 2, 'os dois botões tiram a pausa e desligam o "envío a confirmar", sem mexer no resto');
  check(E5.err.length === 0 && E5.man === '', 'depois de resolver, o scan sai sem problemas', JSON.stringify(E5.err));

  sec('F. Conta: o catálogo com o estado antigo; a Guía sem o cliente');
  await L.fsReq(P, 'PATCH', 'shops/' + OK + '?updateMask.fieldPaths=status', 'owner', L.fields({ status: 'suspenso' }));
  const sit0 = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json) || {};
  check((sit0.clientes || []).some(x => x.id === OK), 'a lista publicada da Guía tem o cliente (antes do teste)', JSON.stringify((sit0.clientes || []).map(x => x.id)));
  await L.fsReq(P, 'PATCH', 'platform/sitio?updateMask.fieldPaths=clientes', 'owner', L.fields({ clientes: (sit0.clientes || []).filter(x => x.id !== OK) }));
  NET.guMiss.add(BAD);
  await scan(OK);
  const F1 = await res();
  check(has(F1.err, /activa, pero el catálogo todavía muestra "suspendido"/) && has(F1.err, /Debería aparecer en la Guía, pero no está en la lista publicada/) && F1.auto === 'gsync,sync', 'detecta o catálogo "suspendido" com a conta ativa e o cliente fora da lista da Guía', JSON.stringify(F1.err) + ' ' + F1.auto);
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfixall"]').click()); await a.w(2500); await wait();
  const sit1 = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json) || {};
  check((await doc(OK)).status === 'ativo' && (sit1.clientes || []).some(x => x.id === OK), '"Resolver todo" manda o estado certo ao catálogo e publica a lista da Guía de novo', (await doc(OK)).status);
  await scan(BAD);
  check(has((await res()).warn, /La Guía no pudo leer los horarios/), 'avisa quando a Guía não consegue ler os horários do negócio');
  NET.guMiss.clear();

  sec('G. Pedidos parados e catálogo grande com defeito');
  const iso = m => new Date(Date.now() - m * 60000).toISOString();
  for (const o of [{ no: 1001, status: 'entregue', date: iso(300) }, { no: 1002, status: 'aguardando', date: iso(50) }, { no: 1003, status: 'aguardando', date: iso(200) }, { no: 1004, status: 'aguardando', date: iso(5) }]) await L.fsReq(P, 'POST', 'shops/' + OK + '/orders', 'owner', L.fields(Object.assign({ total: 50000, name: 'Cliente' }, o)));
  await scan(OK);
  const G1 = await a.evaluate(() => DG.cur.R.filter(x => /pedido\(s\) esperando/.test(x.t)).map(x => [x.sev, x.t, x.d]));
  check(G1.length === 1 && G1[0][0] === 'err' && /^2 pedido/.test(G1[0][1]) && /1002/.test(G1[0][2]) && /1003/.test(G1[0][2]) && !/1004/.test(G1[0][2]), 'pedidos esperando há mais de 30 minutos: mostra quantos e quais (o de 5 minutos não entra)', JSON.stringify(G1));
  await put(BAD, { store: { name: 'Local Roto', whatsapp: '595981222333', logo: 'https://example.com/l.png', delivery: false, pickup: true, pay: { cash: true }, days: days(true) }, zones: [], cats: [{ id: 'c1', n: { es: 'Comidas', pt: 'Comidas' } }], products: [prod(1)], big: { v: 1, n: 5, ch: [{ k: 'pc_c1_0', cat: 'c1', n: 3 }], ix: ['px_0'], at: iso(0) } });
  await scan(BAD);
  const G2 = await res();
  check(has(G2.err, /el total no coincide/) && has(G2.err, /incompleto un bloque de productos/) && has(G2.err, /índice de búsqueda/) && G2.auto === 'bign', 'catálogo grande: total errado (com "Resolver"), bloco faltando e índice de busca faltando', JSON.stringify(G2.err) + ' ' + G2.auto);
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"][data-k="bign"]').click()); await a.w(1200); await wait();
  check((await cfgOf(BAD)).big.n === 3, '"Resolver" corrige o total com a soma real dos blocos');
  await put(BAD, ROTO);

  sec('H. Outros sistemas (agenda, igreja…): conta e link');
  await scan('ag-prueba');
  const H1 = await res();
  check(has(H1.ok, /El sistema responde/) && H1.err.length === 0 && !H1.grupos.some(g => /Catálogo|Envíos/.test(g)), 'cliente de outro sistema: confere a conta e se o link responde (sem as partes de catálogo)', JSON.stringify(H1));
  NET.down.add('sistema-de-otro.example.org'); await scan('ag-prueba');
  check(has((await res()).err, /El sistema no respondió/), 'link fora do ar: erro "El sistema no respondió"');
  NET.down.clear(); await scan('ag-sinlink');
  check(has((await res()).info, /Sin dirección cargada/), 'sem link cadastrado: avisa que não dá para conferir');

  sec('I. Todos os clientes de uma vez');
  await a.evaluate(() => { delete cgG().dg.auto; });
  await a.evaluate(() => document.querySelector('.dg .cg-seg [data-k="all"]').click()); await a.w(500);
  check(await a.evaluate(() => !!document.getElementById('dg_all') && !!document.getElementById('dg_auto') && document.getElementById('dg_auto').checked), 'o modo "Todos los clientes" tem "Analizar todos" e a revisão automática diária ligada');
  await a.act('dgall'); await a.w(800); await wait();
  const I1 = await a.evaluate(({ OK, BAD }) => { const A = DG.all, g = id => A.list.find(x => x.id === id) || { n: {}, R: [] }; return { n: A.list.length, ok: g(OK).n, bad: g(BAD).n, badAuto: g(BAD).R.filter(x => x.act && x.act.auto).map(x => x.act.k).sort().join(','), fotos: g(BAD).R.some(x => /Fotos/.test(x.g)), rows: document.querySelectorAll('#dg_out table.cg-t tbody tr').length, first: (document.querySelector('#dg_out table.cg-t tbody tr') || {}).dataset.id, every: (document.querySelector('#dg_out [data-act="dgfixevery"]') || {}).textContent || '', sum: cgG().dg.all }; }, { OK, BAD });
  info('todos: ' + JSON.stringify({ n: I1.n, ok: I1.ok, bad: I1.bad, sum: I1.sum }));
  if (process.env.SHOT) { try { await a.screenshot({ path: process.env.SHOT.replace(/\.png$/, '-todos.png'), fullPage: true }); await a.setViewportSize({ width: 430, height: 900 }); await a.w(400); await a.screenshot({ path: process.env.SHOT.replace(/\.png$/, '-todos-cel.png'), fullPage: true }); await a.setViewportSize({ width: 1366, height: 800 }); await a.w(300); } catch (e) { info('foto: ' + e.message); } }
  check(I1.n === 5 && I1.rows === 5, 'revisa os 5 clientes (3 catálogos e 2 de outros sistemas) e lista todos', I1.n + ' ' + I1.rows);
  check(I1.bad.e >= 3 && I1.first === BAD, 'o cliente com problemas vem primeiro na lista', JSON.stringify(I1.bad) + ' ' + I1.first);
  check(I1.badAuto === 'ids,orf,wa' && !I1.fotos, 'a revisão rápida não baixa fotos (o conserto de "http" fica para a revisão completa)', I1.badAuto);
  check(/\(3\)/.test(I1.every) && I1.sum && I1.sum.bad >= 1 && I1.sum.n === 5, 'mostra "Resolver todo en todos (3)" e guarda o resumo da revisão', I1.every);
  await a.evaluate(() => document.querySelector('.cg-nav button[data-k="home"]').click()); await a.w(900);
  const I2 = await a.evaluate(() => { const b = [...document.querySelectorAll('.cg-ntf button')].find(x => /Diagnóstico:/.test(x.textContent)); return { tx: b ? b.textContent : '', k: b ? b.dataset.k : '' }; });
  check(/Diagnóstico: \d+ cliente\(s\) con problemas/.test(I2.tx) && I2.k === 'dg', 'a Visão geral avisa nas notificações quantos clientes têm problemas', I2.tx);
  await a.evaluate(() => [...document.querySelectorAll('.cg-ntf button')].find(x => /Diagnóstico:/.test(x.textContent)).click()); await a.w(700);
  check(await a.evaluate(() => ui.cgv === 'dg' && DG.mode === 'all' && document.querySelectorAll('#dg_out table.cg-t tbody tr').length === 5), 'tocar no aviso abre o Diagnóstico com a lista');
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfixevery"]').click()); await a.w(500);
  const I3 = await a.evaluate(() => { const s = document.querySelector('.sheet[data-k="dgprev"]'); return s ? s.textContent : ''; });
  check(/Local Roto/.test(I3) && /WhatsApp de pedidos sin el código del país/.test(I3) && /código interno/.test(I3) && /Aplicar las correcciones \(3\)/.test(I3), 'antes de corrigir em todos, mostra a prévia do que vai mudar em cada cliente');
  check((await cfgOf(BAD)).store.whatsapp === '0981 222 333', 'nada muda antes de confirmar a prévia');
  await a.evaluate(() => document.querySelector('.sheet [data-act="dgfixeveryok"]').click()); await a.w(2500); await wait(); await a.w(1500); await wait();
  const I4 = await cfgOf(BAD);
  check(I4.store.whatsapp === '595981222333' && new Set(I4.products.map(p => p.id)).size === 6 && I4.cats.some(x => x.n.es === 'Otros'), 'depois de confirmar, aplica as correções técnicas em todos');
  check(await a.evaluate(BAD => { const x = DG.all.list.find(y => y.id === BAD); return x.n.fx === 0 && !document.querySelector('#dg_out [data-act="dgfixevery"]') && !!document.querySelector('#dg_out [data-act="dgundo"]'); }, BAD), 'a lista é refeita sem correções pendentes e com o botão "Deshacer"');
  await a.evaluate(BAD => document.querySelector(`#dg_out [data-act="dgsee"][data-id="${BAD}"]`).click(), BAD); await a.w(800); await wait();
  check(await a.evaluate(BAD => DG.mode === 'one' && DG.cur && DG.cur.s.id === BAD && DG.cur.R.some(x => /Fotos/.test(x.g)), BAD), '"Ver todo" abre a revisão completa daquele cliente (com fotos)');
  // revisão automática: roda sem mexer na tela e pode ser desligada
  await a.evaluate(() => document.querySelector('.cg-nav button[data-k="cli"]').click()); await a.w(600);
  const I5 = await a.evaluate(async () => { DG.all = null; const v0 = ui.cgv, h0 = document.querySelector('.cg-body').innerHTML.length; await dgAll({ auto: true }); return { v: ui.cgv === v0, same: document.querySelector('.cg-body').innerHTML.length === h0, auto: !!(DG.all && DG.all.auto), n: DG.all ? DG.all.list.length : 0 }; });
  check(I5.v && I5.same && I5.auto && I5.n === 5, 'a revisão automática roda em segundo plano, sem trocar de tela', JSON.stringify(I5));
  await a.evaluate(() => { acts.dgopen(); document.querySelector('.dg .cg-seg [data-k="all"]').click(); }); await a.w(500);
  await a.evaluate(() => document.getElementById('dg_auto').click()); await a.w(400);
  check(await a.evaluate(() => cgG().dg.auto === false), 'a revisão automática diária pode ser desligada');
  await a.evaluate(() => document.getElementById('dg_auto').click()); await a.w(300);

  sec('J. Meus sistemas: site, Guía, catálogos, nuvem, Central e serviços externos');
  await a.evaluate(() => document.querySelector('.dg .cg-seg [data-k="sys"]').click()); await a.w(400);
  await a.act('dgsys'); await a.w(800); await wait();
  const J1 = await a.evaluate(() => ({ err: DG.sys.R.filter(x => x.sev === 'err').map(x => x.t), warn: DG.sys.R.filter(x => x.sev === 'warn').map(x => x.t), ok: DG.sys.R.filter(x => x.sev === 'ok').map(x => x.t), grupos: [...new Set(DG.sys.R.map(x => x.g))], txt: document.getElementById('dg_out').textContent }));
  info('sistemas: erros=' + JSON.stringify(J1.err) + ' avisos=' + JSON.stringify(J1.warn));
  if (process.env.SHOT) { try { await a.evaluate(() => { const d = document.querySelector('#dg_out details'); if (d) d.open = true; }); await a.screenshot({ path: process.env.SHOT.replace(/\.png$/, '-sistemas.png'), fullPage: true }); await a.setViewportSize({ width: 430, height: 900 }); await a.w(400); await a.screenshot({ path: process.env.SHOT.replace(/\.png$/, '-sistemas-cel.png'), fullPage: true }); await a.setViewportSize({ width: 1366, height: 800 }); await a.w(300); } catch (e) { info('foto: ' + e.message); } }
  check(['Este aparato', 'Sitio Araújo Tech', 'Guía', 'Catálogos', 'Nube', 'Central', 'Servicios externos', 'Otros sistemas'].every(g => J1.grupos.some(x => x.includes(g))), 'cobre este aparelho, o site, a Guía, os catálogos, a nuvem, a Central, os serviços externos e os outros sistemas', JSON.stringify(J1.grupos));
  check(J1.err.length === 0, 'com tudo respondendo, nenhum erro', JSON.stringify(J1.err));
  check(has(J1.ok, /Página principal: abre/) && has(J1.ok, /guiadesantarita\.com: responde/) && has(J1.ok, /Subdominios de los clientes: responden/) && has(J1.ok, /Panel de los locales: abre/) && has(J1.ok, /Mapa de las zonas \(OpenStreetMap\): responde/) && has(J1.ok, /WhatsApp \(wa\.me\): responde/), 'confere a página principal, a Guía, os subdomínios, o painel, o mapa e o WhatsApp', JSON.stringify(J1.ok));
  check(has(J1.ok, /La Central está en la última versión/) && has(J1.ok, /Lista de negocios publicada: \d+, al día/) && has(J1.ok, /Todos los clientes tienen su catálogo en la nube/), 'Central na última versão, lista da Guía em dia e todo cliente com catálogo na nuvem');
  check(has(J1.warn, /Todavía no hiciste una copia de seguridad/) && has(J1.ok, /Barbería Vecina: responde/), 'avisa da cópia de segurança que falta e confere o link dos outros sistemas', JSON.stringify(J1.warn));
  NET.newVer = true; NET.skew = 10; NET.down.add('wa.me'); NET.down.add('guiadesantarita.com');
  await a.act('dgsys'); await a.w(800); await wait();
  const J2 = await a.evaluate(() => ({ err: DG.sys.R.filter(x => x.sev === 'err').map(x => x.t), warn: DG.sys.R.filter(x => x.sev === 'warn').map(x => x.t), go: DG.sys.R.filter(x => x.go && x.go.k === 'reload').length }));
  check(has(J2.warn, /Hay una versión nueva de la Central/) && J2.go === 1, 'detecta versão nova da Central e oferece "Recargar ahora"', JSON.stringify(J2.warn));
  check(has(J2.warn, /La hora de este aparato está 10 min adelantada/), 'detecta o relógio do aparelho errado (10 minutos adiantado)', JSON.stringify(J2.warn));
  check(has(J2.err, /guiadesantarita\.com no respondió/) && has(J2.warn, /WhatsApp \(wa\.me\): no respondió/), 'detecta a Guía fora do ar e o WhatsApp sem responder', JSON.stringify(J2.err));
  NET.newVer = false; NET.skew = 0; NET.down.clear();

  sec('K. Revisão automática: sozinha, 20 segundos depois de abrir a Central');
  await a.evaluate(() => { const g = cgG(); g.dg.all = Object.assign({}, g.dg.all, { at: new Date(Date.now() - 30 * 3600e3).toISOString() }); delete g.dg.auto; DG.all = null; DG.kick = false; document.querySelector('.cg-nav button[data-k="home"]').click(); });
  await a.waitForFunction(() => DG.all && DG.all.auto && !DG.busy, null, { timeout: 40000 }).catch(() => { }); await a.w(300);
  const K1 = await a.evaluate(() => ({ auto: !!(DG.all && DG.all.auto), n: DG.all ? DG.all.list.length : 0, v: ui.cgv, at: Date.now() - new Date(cgG().dg.all.at).getTime() < 60000 }));
  check(K1.auto && K1.n === 5 && K1.v === 'home' && K1.at, 'com a última revisão de mais de 20 horas, a Central revisa todos sozinha e guarda o resumo, sem sair da tela', JSON.stringify(K1));
  await a.evaluate(() => { DG.all = null; DG.kick = false; document.querySelector('.cg-nav button[data-k="cli"]').click(); }); await a.w(23000);
  check(await a.evaluate(() => DG.all === null && DG.kick === true), 'com a revisão feita há pouco, não repete (uma vez por dia)');
  check(a.errs.length === 0, 'sem erros de JavaScript', a.errs.join('|'));
  await A.ctx.close();
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
