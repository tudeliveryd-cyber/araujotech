// Catálogo pelo domínio principal (araujotechsistemas.com/loja/<nome>/): abre a loja certa, mostra produtos,
// manda o pedido, conta a visita e os links de compartilhar levam ao endereço oficial (subdomínio).
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const VT = () => { window.TDC_VTEST = true; };
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300); await a.set('#ns_name', 'Loja Camino'); await a.set('#ns_wa', '595981000771'); await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Loja Camino'); return s && { id: s.id }; });
  info('loja: ' + JSON.stringify(shop));
  const day = await a.evaluate(() => dayKey(new Date()));
  for (let i = 0; i < 15; i++) { if ((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).status === 200) break; await a.w(1000); }

  { // publica a loja na nuvem (o catálogo de exemplo, com outro nome e aberta o dia todo)
    const T0 = await L.open({ w: 390 }); await T0.p.goto('https://araujotechsistemas.com/loja/' + shop.id + '/'); await T0.p.w(3000);
    const cfg = await T0.p.evaluate(() => { const c = JSON.parse(JSON.stringify(pub)); c.store.name = 'Loja Camino'; c.store.days = Array(7).fill(0).map(() => ({ on: true, a: ['00:00', '23:59'], b: ['', ''] })); return JSON.stringify(c); });
    const r = await L.fsReq(P, 'PATCH', 'shops/' + shop.id + '?updateMask.fieldPaths=cfg&updateMask.fieldPaths=status', 'owner', L.fields({ cfg, status: 'ativo' }));
    info('loja publicada na nuvem: HTTP ' + r.status); await T0.ctx.close();
  }
  sec('A. Abre pelo domínio principal, igual ao subdomínio');
  const S = await L.open({ w: 390, init: VT }); const sp = S.p;
  await sp.goto('https://' + shop.id + '.araujotechsistemas.com/'); await sp.w(6000);
  const ref = await sp.evaluate(() => ({ shop: SHOP, name: pub && pub.store && pub.store.name, n: document.querySelectorAll('[data-act=open]').length }));
  info('no subdomínio: ' + JSON.stringify(ref));
  const nv = async () => { const r = await L.fsReq(P, 'GET', `shops/${shop.id}/visitas/${day}`, 'owner'); return r.status === 200 ? +L.unfields(r.json).n : 0; };
  const v0 = await nv(); info('visitas depois do subdomínio: ' + v0);
  const C = await L.open({ w: 390, init: VT }); const c = C.p;
  await c.goto('https://araujotechsistemas.com/loja/' + shop.id + '/');
  await c.w(6000);
  const st = await c.evaluate(() => ({ shop: typeof SHOP !== 'undefined' ? SHOP : null, name: pub && pub.store && pub.store.name, n: document.querySelectorAll('[data-act=open]').length, host: location.hostname, cat: typeof CAT_URL !== 'undefined' ? CAT_URL : null }));
  info(JSON.stringify(st));
  check(st.shop === shop.id && st.name === ref.name && st.n === ref.n, 'abre a mesma loja e os mesmos produtos que o subdomínio (/loja/' + shop.id + '/)');
  check(st.n > 0, 'mostra os produtos');
  check(st.host === 'araujotechsistemas.com', 'continua no domínio principal (sem trocar de endereço)');
  check(st.cat === 'https://' + shop.id + '.araujotechsistemas.com/', 'compartilhar usa o endereço oficial da loja');
  const v1 = await nv();
  check(v1 === v0 + 1, 'a visita conta para a loja (' + v0 + ' → ' + v1 + ')');

  sec('B. Pedido');
  await c.locator('[data-act=open]:visible').first().click(); await c.w(600); await c.act('addcart'); await c.act('cart');
  const ct = c.locator('.sheet button:visible', { hasText: 'Continuar' }); if (await ct.count()) { await ct.first().click(); await c.w(400); } else await c.act('checkout');
  await c.locator('[data-act=mode]:visible').nth(1).click(); await c.w(400);
  // perto da hora de fechar não sobra horário de retirada para hoje: o teste usa um horário de mentira e redesenha a tela (senão o pedido falhava só de noite)
  await c.evaluate(() => { try { if (!slots(pub.store).length) { const n = new Date(); window.slots = () => [hhmm(n.getHours() * 60 + n.getMinutes() + 5)]; checkoutSheet(); } } catch (e) {} }); await c.w(300);
  await c.fill('[data-ck=name]', 'Cliente Camino'); await c.fill('[data-ck=phone]', '0981 333 222');
  const tm = c.locator('[data-ck=time]'); if (await tm.count()) { const ov = await tm.evaluate(e => [...e.options].map(o => o.value).filter(Boolean)); if (ov.length) await tm.selectOption(ov[0]); }
  const fixed = await c.evaluate(() => { try { return openState(pub.store).open } catch (e) { return null } });
  if (fixed === false) info('loja fechada agora pelo horário padrão: o pedido pode ficar agendado');
  await c.act('send'); await c.w(4000);
  const docs = ((await L.fsReq(P, 'GET', 'shops/' + shop.id + '/orders?pageSize=20', 'owner')).json.documents || []).map(L.unfields);
  const od = docs.find(d => d.name === 'Cliente Camino');
  check(!!od, 'o pedido feito no domínio principal chega à loja', od ? 'Nº ' + od.no : (await c.txt('.sheet')).slice(0, 200));

  sec('D. "Días en que aparece" só vale para comida');
  const dz = await c.evaluate(() => { const r0 = pub.store.ramo; const nf = (typeof RAMOS !== 'undefined' ? RAMOS : []).find(x => !x.food); const f0 = (typeof RAMOS !== 'undefined' ? RAMOS : []).find(x => x.food); const nunca = { days: [9] }; pub.store.ramo = f0 && f0.id; const food = availDay(nunca); pub.store.ramo = nf && nf.id; const loja = availDay(nunca); pub.store.ramo = r0; return { nf: nf && nf.id, f0: f0 && f0.id, food, loja }; });
  info(JSON.stringify(dz));
  check(dz.nf && dz.f0 && dz.food === false && dz.loja === true, 'em restaurante o produto some fora dos dias marcados; em loja aparece sempre');
  sec('C. A Guía e o site levam a este endereço');
  const G = await L.open({ w: 390 }); const g = G.p;
  await g.goto('https://araujotechsistemas.com/guia/'); await g.w(1500);
  const lu = await g.evaluate(id => [locU('https://' + id + '.araujotechsistemas.com/'), locU('https://' + id + '.araujotechsistemas.com/?p=x1'), locU('https://fogaomineiro.araujotechsistemas.com/'), locU('https://www.araujotechsistemas.com/'), locU('https://outro.sitio.com/')], shop.id);
  info(JSON.stringify(lu));
  check(lu[0] === '/loja/' + shop.id + '/' && lu[1] === '/loja/' + shop.id + '/?p=x1' && lu[2] === '/loja/fogao-mineiro/' && lu[3] === 'https://www.araujotechsistemas.com/' && lu[4] === 'https://outro.sitio.com/', 'links de catálogo viram /loja/<nome>/ no domínio principal (o resto não muda)');
  sec('E. Horário que passa da meia-noite: o catálogo e a Guía dizem a mesma coisa');
  const HR = { noite: [0, 1, 2, 3, 4, 5, 6].map(i => ({ on: i === 5, a: ['18:00', '02:00'], b: ['', ''] })), meia: [0, 1, 2, 3, 4, 5, 6].map(() => ({ on: true, a: ['11:00', '00:00'], b: ['', ''] })), d24: [0, 1, 2, 3, 4, 5, 6].map(() => ({ on: true, a: ['08:00', '08:00'], b: ['', ''] })) };
  const QS = [['noite', '2026-11-27T17:00', false], ['noite', '2026-11-27T23:00', true], ['noite', '2026-11-28T00:30', true], ['noite', '2026-11-28T01:59', true], ['noite', '2026-11-28T02:10', false], ['noite', '2026-11-27T01:00', false], ['meia', '2026-11-28T23:50', true], ['meia', '2026-11-28T00:10', false], ['d24', '2026-11-28T03:00', true], ['d24', '2026-11-28T15:00', true]];
  const oc = await c.evaluate(({ HR, QS }) => QS.map(([k, d]) => { const r = openState0({ days: HR[k] }, new Date(d + ':00')); return [!!r.open, r.open ? r.closeAt : null, r.open ? r.left : null]; }), { HR, QS });
  const og = await g.evaluate(({ HR, QS }) => QS.map(([k, d]) => !!(openNow(HR[k], new Date(d + ':00')) || {}).on), { HR, QS });
  info('catálogo: ' + JSON.stringify(oc.map(x => x[0])) + ' · Guía: ' + JSON.stringify(og));
  check(QS.every((q, i) => oc[i][0] === q[2]), 'catálogo: local que fecha às 02:00 continua aberto depois da meia-noite (e fecha às 02:00); quem fecha à meia-noite fecha à meia-noite', JSON.stringify(QS.map((q, i) => q[0] + ' ' + q[1].slice(5) + '=' + oc[i][0])));
  check(oc[2][1] === 120 && oc[2][2] === 90, 'à 00:30 o catálogo sabe que fecha às 02:00 (faltam 90 minutos)', JSON.stringify(oc[2]));
  check(QS.every((q, i) => oc[i][0] === og[i]), 'o catálogo e a Guía concordam em todos os horários testados');
  sec('F. WhatsApp do local cadastrado como se disca (0981…): os links saem com o código do país');
  const wsr = await c.evaluate(() => { const r = [waStore('0981 100 711'), waStore('981100711'), waStore('595981100711'), waStore('595 0981 100711'), waStore('5493764123456'), waStore('+55 45 99999-0000'), waStore('0673 220 470'), waStore('')]; const old = pub.store.whatsapp; pub.store.whatsapp = '0981 100 711'; render(); const fab = (document.querySelector('.wafab') || {}).href || ''; pub.store.whatsapp = old; render(); return { r, fab }; });
  check(wsr.r.join() === '595981100711,595981100711,595981100711,595981100711,5493764123456,5545999990000,595673220470,', 'número local ganha o 595; número já completo (Paraguai, Brasil, Argentina) fica como está', wsr.r.join());
  check(/^https:\/\/wa\.me\/595981100711\?text=/.test(wsr.fab), 'o botão de WhatsApp do catálogo abre a conversa com o número completo', wsr.fab.slice(0, 50));
  check(!c.errs.length && !g.errs.length, 'sem erros de JavaScript', c.errs.concat(g.errs).join(' | '));
  await L.done();
})().catch(e => { L.bad("exceção: " + (e && e.stack || e)); L.done(); });
