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
  await c.evaluate(() => { try { if (!slots(pub.store).length) { const n = new Date(); window.slots = () => [hhmm(n.getHours() * 60 + n.getMinutes() + 5)]; } } catch (e) {} });
  await c.fill('[data-ck=name]', 'Cliente Camino'); await c.fill('[data-ck=phone]', '0981 333 222');
  const tm = c.locator('[data-ck=time]'); if (await tm.count()) { const ov = await tm.evaluate(e => [...e.options].map(o => o.value).filter(Boolean)); if (ov.length) await tm.selectOption(ov[0]); }
  const fixed = await c.evaluate(() => { try { return openState(pub.store).open } catch (e) { return null } });
  if (fixed === false) info('loja fechada agora pelo horário padrão: o pedido pode ficar agendado');
  await c.act('send'); await c.w(4000);
  const docs = ((await L.fsReq(P, 'GET', 'shops/' + shop.id + '/orders?pageSize=20', 'owner')).json.documents || []).map(L.unfields);
  const od = docs.find(d => d.name === 'Cliente Camino');
  check(!!od, 'o pedido feito no domínio principal chega à loja', od ? 'Nº ' + od.no : (await c.txt('.sheet')).slice(0, 200));

  sec('C. A Guía e o site levam a este endereço');
  const G = await L.open({ w: 390 }); const g = G.p;
  await g.goto('https://araujotechsistemas.com/guia/'); await g.w(1500);
  const lu = await g.evaluate(id => [locU('https://' + id + '.araujotechsistemas.com/'), locU('https://' + id + '.araujotechsistemas.com/?p=x1'), locU('https://fogaomineiro.araujotechsistemas.com/'), locU('https://www.araujotechsistemas.com/'), locU('https://outro.sitio.com/')], shop.id);
  info(JSON.stringify(lu));
  check(lu[0] === '/loja/' + shop.id + '/' && lu[1] === '/loja/' + shop.id + '/?p=x1' && lu[2] === '/loja/fogao-mineiro/' && lu[3] === 'https://www.araujotechsistemas.com/' && lu[4] === 'https://outro.sitio.com/', 'links de catálogo viram /loja/<nome>/ no domínio principal (o resto não muda)');
  check(!c.errs.length && !g.errs.length, 'sem erros de JavaScript', c.errs.concat(g.errs).join(' | '));
  await L.done();
})().catch(e => { L.bad("exceção: " + (e && e.stack || e)); L.done(); });
