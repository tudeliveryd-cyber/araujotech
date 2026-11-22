// Diagnóstico de um cliente na Central: colar o link/nome, achar os problemas e a solução.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  const mk = async (n, wa) => { await a.act('newshop'); await a.w(300); await a.set('#ns_name', n); await a.set('#ns_wa', wa); await a.act('createshop'); await a.w(4000); return a.evaluate(n => PL.shops.find(x => x.name === n).id, n); };
  const OK = await mk('Local Sano', '595981000001'), BAD = await mk('Local Roto', '595981000002');
  const sq = (la, ln, d) => [[la - d, ln - d], [la - d, ln + d], [la + d, ln + d], [la + d, ln - d]];
  const days = on => [0, 1, 2, 3, 4, 5, 6].map(() => ({ on, a: ['00:00', '23:59'], b: ['', ''] }));
  const prod = (i, o) => Object.assign({ id: 'p' + i, cat: 'c1', n: { es: 'Producto ' + i, pt: 'Produto ' + i }, d: { es: '', pt: '' }, price: 10000, promo: 0, photo: 'https://example.com/f.jpg', on: true, g: [] }, o || {});
  const put = (id, cfg) => L.fsReq(P, 'PATCH', 'shops/' + id + '?updateMask.fieldPaths=cfg', 'owner', L.fields({ cfg: JSON.stringify(cfg) }));
  await put(OK, { store: { name: 'Local Sano', whatsapp: '595981555444', logo: 'https://example.com/l.png', delivery: true, pickup: true, pay: { cash: true }, days: days(true), allowSched: true, feeMode: 'bairro', lat: -25.79, lng: -55.09, locSet: true, bairros: [{ name: 'Centro', fee: 8000, zone: sq(-25.79, -55.09, 0.01) }, { name: 'Anillo', fee: 15000, zone: sq(-25.79, -55.09, 0.03) }] }, zones: [], cats: [{ id: 'c1', n: { es: 'Comidas', pt: 'Comidas' } }], products: [prod(1), prod(2), prod(3)] });
  await put(BAD, { store: { name: 'Local Roto', whatsapp: '', delivery: true, pickup: false, pay: { pix: true }, pixKey: '', days: days(false), feeMode: 'bairro', bairros: [{ name: '', fee: null, zone: sq(-25.79, -55.09, 0.01) }] }, zones: [], cats: [{ id: 'c1', n: { es: 'Comidas', pt: 'Comidas' } }], products: [prod(1, { price: 0 }), prod(2, { cat: 'noexiste' })] });

  sec('A. Abrir o Diagnóstico e achar o cliente pelo link');
  check(await a.evaluate(() => !!document.querySelector('[data-act="dgopen"]')), 'a Central tem o botão "Diagnóstico"');
  const F = await a.evaluate(({ OK, BAD }) => ({ sub: (dgFind('https://' + OK + '.araujotechsistemas.com/') || {}).id, guia: (dgFind('guiadesantarita.com/' + BAD) || {}).id, nome: (dgFind('local roto') || {}).id, loja: (dgFind('https://araujotechsistemas.com/loja/' + OK + '/') || {}).id, nada: dgFind('https://example.com/xyz123') }), { OK, BAD });
  check(F.sub === OK && F.guia === BAD && F.nome === BAD && F.loja === OK && F.nada === null, 'acha o cliente pelo subdomínio, pelo link da Guía, por /loja/ e pelo nome; link desconhecido não acha ninguém', JSON.stringify(F));
  await a.act('dgopen'); await a.w(400);
  await a.set('#dg_q', 'https://' + OK + '.araujotechsistemas.com/'); await a.set('#dg_gps', '-25.79, -55.09'); await a.act('dgrun');
  await a.waitForSelector('#dg_out .dg-i', { timeout: 30000 }).catch(() => { }); await a.w(600);
  const R1 = await a.evaluate(() => ({ err: DG_LAST.R.filter(x => x.sev === 'err').map(x => x.t), warn: DG_LAST.R.filter(x => x.sev === 'warn').map(x => x.t), ok: DG_LAST.R.filter(x => x.sev === 'ok').map(x => x.t), txt: document.getElementById('dg_out').textContent }));
  info('são: erros=' + JSON.stringify(R1.err) + ' avisos=' + JSON.stringify(R1.warn));
  check(R1.err.filter(t => !/no respondi/.test(t)).length === 0, 'local em ordem: nenhum problema (fora a página, que o emulador não serve)', JSON.stringify(R1.err));
  check(R1.ok.some(t => /Centro/.test(t) && /8\.000/.test(t)), 'a localização testada cai na zona menor (Centro) e mostra o preço', JSON.stringify(R1.ok));
  check(/Todo en orden|Sin problemas graves|problema/.test(R1.txt) && /Local Sano/.test(R1.txt), 'mostra o resumo com o nome do cliente');

  sec('B. Local com problemas: cada um aparece com a solução');
  await a.evaluate(id => document.querySelector(`.sheet [data-act="dgpick"][data-id="${id}"]`).click(), BAD);
  await a.waitForFunction(id => typeof DG_LAST !== 'undefined' && DG_LAST && DG_LAST.s.id === id, BAD, { timeout: 30000 }).catch(() => { }); await a.w(600);
  const R2 = await a.evaluate(() => ({ err: DG_LAST.R.filter(x => x.sev === 'err').map(x => x.t), warn: DG_LAST.R.filter(x => x.sev === 'warn').map(x => x.t), nofix: DG_LAST.R.filter(x => (x.sev === 'err' || x.sev === 'warn') && !x.fix).map(x => x.t), txt: document.getElementById('dg_out').textContent }));
  info('roto: erros=' + JSON.stringify(R2.err) + ' avisos=' + JSON.stringify(R2.warn));
  const has = (l, rx) => l.some(t => rx.test(t));
  if (process.env.SHOT) { try { await a.setViewportSize({ width: 430, height: 1500 }); await a.w(300); await a.locator('.sheet').screenshot({ path: process.env.SHOT }); await a.setViewportSize({ width: 1366, height: 900 }); } catch (e) { info('foto: ' + e.message); } }
  check(has(R2.err, /Sin WhatsApp/), 'sem WhatsApp de pedidos');
  check(has(R2.err, /Ningún día con horario/), 'nenhum dia com horário');
  check(has(R2.err, /categoría que no existe/), 'produto em categoria que não existe');
  check(has(R2.warn, /sin precio/) && has(R2.warn, /zona\(s\) sin precio/), 'produto sem preço e zona sem preço');
  check(has(R2.warn, /PIX activado sin clave/), 'PIX sem chave');
  check(R2.nofix.length === 0, 'todo problema ou aviso vem com a solução', JSON.stringify(R2.nofix));
  check(/Solución:/.test(R2.txt) && /problema\(s\) para resolver/.test(R2.txt), 'a tela mostra "Solución" e o total de problemas');
  const TX = await a.evaluate(() => dgText(DG_LAST.s, DG_LAST.R));
  check(/Diagnóstico · Local Roto/.test(TX) && /\[X\] Sin WhatsApp/.test(TX) && /Solución:/.test(TX), '"Copiar informe" gera o texto com problemas e soluções');

  sec('C. Mapa da Tu Delivery desatualizado: detecta e corrige com um toque');
  await a.evaluate(async ({ OK, z }) => { closeSheet(); const T = tdtAll(); const m = { id: tdtNewId(), name: 'Mapa X', feeMode: 'bairro', feeOrigin: 'local', minFee: 0, nightFrom: '18:00', bairros: [{ name: 'Centro', fee: 9000, zone: z }] }; T.maps.push(m); await tdtSave(); await tdfCopy('_tdt:' + m.id, [{ id: OK, night: false }]); T.as[OK] = { m: m.id, n: false }; await tdtSave(); m.bairros[0].fee = 11000; await tdtSave(); }, { OK, z: sq(-25.79, -55.09, 0.02) });
  await a.w(800); await a.evaluate(id => acts.dgpick({ dataset: { id } }), OK);
  await a.waitForFunction(id => typeof DG_LAST !== 'undefined' && DG_LAST && DG_LAST.s.id === id && document.querySelector('#dg_out .dg-i'), OK, { timeout: 30000 }).catch(() => { }); await a.w(600);
  const R3 = await a.evaluate(() => ({ stale: DG_LAST.R.filter(x => x.act && x.act.k === 'map').map(x => x.t), btn: !!document.querySelector('#dg_out [data-act="dgfix"]') }));
  check(R3.stale.length === 1 && R3.btn, 'detecta que o cliente está com a cópia antiga do mapa e oferece "Actualizar ahora"', JSON.stringify(R3));
  await a.evaluate(() => document.querySelector('#dg_out [data-act="dgfix"]').click()); await a.w(6000);
  const R4 = await a.evaluate(async OK => { const api = await CLOUD.init(); const d = await api.getShopDoc(OK); return { fee: JSON.parse(d.cfg).store.bairros[0].fee, stale: DG_LAST.R.filter(x => x.act).length, ok: DG_LAST.R.some(x => x.sev === 'ok' && /al día/.test(x.t)) }; }, OK);
  check(R4.fee === 11000 && R4.stale === 0 && R4.ok, 'depois do toque o cliente recebe o mapa novo e o diagnóstico fica em dia', JSON.stringify(R4));
  check(a.errs.length === 0, 'sem erros de JavaScript', a.errs.join('|'));
  await A.ctx.close();
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
