// Painel do local: ubicación do negócio no mapa (Estoy acá / link do Google Maps / coordenadas) e o link "Cómo llegar" usando o ponto marcado.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(4000);
  await a.act('newshop'); await a.w(300);
  await a.locator('[data-act=citypick][data-c="Santa Rosa del Monday"]').click(); await a.w(300);
  await a.set('#ns_name', 'Ubicacion E2E'); await a.set('#ns_wa', '595981000601');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Ubicacion E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  info(JSON.stringify(shop));
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  info('auth do dono: ' + (tk.idToken ? 'ok' : JSON.stringify(tk).slice(0, 200)) + ' | admin errs: ' + a.errs.join('|') + ' cons: ' + (a.cons || []).join('|').slice(0, 300));
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p;
  await O.ctx.grantPermissions(['geolocation'], { origin: HOST }); await O.ctx.setGeolocation({ latitude: -25.81234, longitude: -54.90123 });
  await o.goto(HOST + '/painel/'); await o.w(3000);
  await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter');
  await o.waitForSelector('#np_a', { timeout: 20000 }).catch(async () => info('sem troca de senha: ' + (await o.txt()).slice(0, 300) + ' | ' + o.errs.join('|')));
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  await o.evaluate(() => { ui.tab = 'delivery'; render(); }); await o.w(600);

  sec('A. Campo de ubicación no painel');
  check(await o.locator('#sx_loc').count() === 1, 'campo "Ubicación del local en el mapa" aparece', (await o.txt()).slice(0, 200));
  check(/Sin marcar/.test(await o.txt()), 'começa "Sin marcar" (só o centro da cidade)');

  sec('B. Estoy acá (GPS)');
  await o.act('slocgps'); await o.w(1500);
  let st = await o.evaluate(() => ({ lat: pub.store.lat, lng: pub.store.lng, set: pub.store.locSet, url: mapsUrl(pub.store) }));
  info(JSON.stringify(st));
  check(st.set === true && Math.abs(st.lat + 25.81234) < 1e-4 && Math.abs(st.lng + 54.90123) < 1e-4, 'GPS marcou a ubicación do local');
  check(/query=-25\.81234\d*,-54\.90123/.test(st.url), '"Cómo llegar" usa o ponto marcado');

  sec('C. Colar link do Google Maps');
  await o.set('#sx_loc', 'https://www.google.com/maps/place/Ubicacion/@-25.80000,-54.90000,17z/data=!3m1!4b1!4m6!3m5!8m2!3d-25.80555!4d-54.90777'); await o.w(1200);
  st = await o.evaluate(() => ({ lat: pub.store.lat, lng: pub.store.lng, set: pub.store.locSet }));
  check(Math.abs(st.lat + 25.80555) < 1e-5 && Math.abs(st.lng + 54.90777) < 1e-5, 'link do Maps: usa o ponto exato do local (!3d/!4d)', JSON.stringify(st));
  await o.set('#sx_loc', '-25.79, -55.08'); await o.w(1000);
  st = await o.evaluate(() => ({ lat: pub.store.lat, lng: pub.store.lng }));
  check(st.lat === -25.79 && st.lng === -55.08, 'coordenadas digitadas', JSON.stringify(st));
  await o.set('#sx_loc', 'qualquer coisa'); await o.w(800);
  check((await o.evaluate(() => pub.store.lat)) === -25.79, 'texto inválido não estraga a ubicación');

  sec('D. Salvo na nuvem e no catálogo público');
  await o.w(3500);
  const d = L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json) || {}; const cs = JSON.parse(d.cfg || '{}').store || {};
  check(cs.lat === -25.79 && cs.lng === -55.08 && cs.locSet === true, 'ubicación salva no catálogo da nuvem', JSON.stringify({ lat: cs.lat, lng: cs.lng, set: cs.locSet }));

  sec('E. Mensagem automática do WhatsApp (texto pronto com o link)');
  await O.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: HOST }).catch(() => {});
  await o.evaluate(() => { ui.tab = 'resumo'; render(); }); await o.w(600);
  const wm = await o.evaluate(() => { const e = document.getElementById('waMsg'); return e ? e.value : ''; });
  check(/Ubicacion E2E/.test(wm) && wm.includes(shop.id + '.araujotechsistemas.com') && /(menú|catálogo) con fotos/.test(wm), 'mensagem com o nome da loja e o link do catálogo', wm.replace(/\n/g, ' | ').slice(0, 300));
  await o.locator('[data-act=walg][data-l=pt]').click(); await o.w(400);
  const wp = await o.evaluate(() => document.getElementById('waMsg').value);
  check(/Obrigado por escrever/.test(wp), 'versão em português');
  await o.act('wacopy'); await o.w(500);
  const clip = await o.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  check(clip === wp, 'botão copia a mensagem', clip.slice(0, 60));
  check(!o.errs.length, 'sem erros de JavaScript', o.errs.join(' | '));
  L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); L.done(); });
