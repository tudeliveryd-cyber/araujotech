// Ponta a ponta da Caja de Entregas: delivery cria conta → dono aprova → entrega anotada → aparece no caixa do dono.
const fs = require('fs'), path = require('path');
const L = require('./lib'); const P = 'tu-delivery-1eb61';
const { ok, bad, info, sec, check } = L;
const URL0 = 'https://tudeliveryd-cyber.github.io/Caj-Entrega/';
// o e-mail do dono vem do arquivo de regras (não fica escrito neste teste)
const OWNER = (fs.readFileSync(path.join(L.DIRS.caja, 'firestore.rules'), 'utf8').match(/token\.email == '([^']+)'/) || [])[1];
// nada do que este teste imprime mostra o e-mail do dono
{ const lg = console.log.bind(console); const red = v => typeof v === 'string' && OWNER ? v.split(OWNER).join('<dono>').split(OWNER.split('@')[0]).join('<dono>') : v; console.log = (...a) => lg(...a.map(red)); }
const step = async (name, fn, pg) => { try { await fn(); } catch (e) { let d = ''; try { if (pg) d = ' | tela: ' + (await pg.txt()).slice(0, 500) + ' | erros: ' + pg.errs.join(';'); } catch (x) {} bad(name + ': exceção ' + String(e.message).split('\n')[0].slice(0, 200) + d); } };
const dd = async (p, t) => console.log('   · ' + t + ': ' + await p.evaluate(() => { const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; }; const top = [...document.querySelectorAll('.modal,.sheet,.ov,.overlay,[role=dialog],#login')].filter(vis).pop() || document.body; return top.tagName + '#' + top.id + '.' + String(top.className).slice(0, 20) + ' => ' + [...top.querySelectorAll('button,input,select,textarea')].filter(vis).map(e => e.tagName[0] + ':' + (e.id || '') + ':' + (e.getAttribute('onclick') || '').slice(0, 24) + ':' + (e.innerText || e.placeholder || '').trim().slice(0, 16).replace(/\n/g, ' ')).slice(0, 45).join(' | ') + ' TXT ' + top.innerText.replace(/\n+/g, ' / ').slice(0, 420); }));
(async () => {
  const DPW = 'Delivery#2026', OPW = 'DonoCaja#2026'; let DUID = '';
  sec('A. Delivery: criar conta');
  const D = await L.open({ w: 390 }); const d = D.p;
  await step('conta', async () => {
    await d.goto(URL0); await d.w(14000);
    check(!/No se pudo conectar/.test(await d.txt()), 'tela de entrada: depois de 14 s parado no login não aparece o aviso falso de "No se pudo conectar"', (await d.txt()).slice(0, 80));
    await d.locator('#login button[type=button]:visible', { hasText: /^Crear cuenta$/ }).first().click(); await d.w(500);
    await d.fill('#lg-name', 'Delivery E2E'); await d.fill('#lg-mail', 'delivery.e2e@example.com'); await d.fill('#lg-pass', '123');
    await d.locator('#login button[type=submit]:visible').click(); await d.w(1500);
    check(await d.locator('#lg-pass:visible').count() > 0, 'criar conta: senha curta é recusada', (await d.txt('#login')).slice(-200));
    check(await d.inputValue('#lg-name') === 'Delivery E2E' && await d.inputValue('#lg-mail') === 'delivery.e2e@example.com', 'criar conta: depois do erro, nome e e-mail continuam preenchidos');
    await d.fill('#lg-pass', DPW); await d.locator('#login button[type=submit]:visible').click(); await d.w(5000);
    const tk = await L.signIn('delivery.e2e@example.com', DPW); DUID = tk.localId;
    const t = L.unfields((await L.fsReq(P, 'GET', 'turnos/' + DUID, 'owner')).json);
    check(!!DUID && !!t && t.aprobado !== true, 'conta criada; delivery novo fica aguardando aprovação (aprobado=false)', JSON.stringify(t).slice(0, 200));
  }, d);

  sec('B. Dono: entrar e aprovar');
  const O = await L.open({ w: 1366 }); const o = O.p;
  await step('dono', async () => {
    const ou = await L.signUp(OWNER, OPW); await L.verifyEmail(ou.localId);
    await o.goto(URL0); await o.w(4000); if (/No se pudo conectar/.test(await o.txt())) { info('aviso ao abrir: ' + (await o.txt()).slice(0, 120) + ' | console: ' + (o.cons || []).join(' | ').slice(0, 600)); }
    await o.fill('#lg-mail', OWNER); await o.fill('#lg-pass', 'errada'); await o.locator('#login button[type=submit]:visible').click({ timeout: 8000 }); await o.w(2500);
    check(await o.locator('#lg-pass:visible').count() > 0, 'entrar: senha errada é recusada');
    await o.fill('#lg-pass', OPW); await o.locator('#login button[type=submit]:visible').click(); await o.w(5000);
    if (await o.locator('#n-val:visible').count()) { await o.fill('#n-val', 'Dueño E2E'); await o.locator('.sheet button:visible', { hasText: 'GUARDAR' }).click(); await o.w(2500); }
    check(/TOTAL DE LA EMPRESA/.test(await o.txt()) && !(await o.locator('#lg-pass:visible').count()), 'dono entra e vê o caixa da empresa', (await o.txt()).slice(0, 200));
    if (!(await o.locator('[data-equipo]:visible').count())) { const cfg = o.locator('button:visible', { hasText: 'Colores y config' }); if (await cfg.count()) { await cfg.first().click(); await o.w(800); } }
    await o.locator('[data-equipo]:visible').first().click(); await o.w(1500);
    check(/Delivery E2E/.test(await o.txt('.sheet')), 'dono: o delivery novo aparece na equipe como pendente', (await o.txt('.sheet')).slice(0, 300));
    await o.locator('[data-aprobar="' + DUID + '"]').click(); await o.w(2500);
    const t = L.unfields((await L.fsReq(P, 'GET', 'turnos/' + DUID, 'owner')).json) || {};
    check(t.aprobado === true, 'Firebase: aprovação do delivery gravada pelo dono', JSON.stringify(t).slice(0, 160));
  }, o);

  sec('C. Delivery aprovado: anotar entrega');
  await step('entrega', async () => {
    await d.reload(); await d.w(5000);
    for (let i = 0; i < 6 && await d.locator('.sheet button:visible', { hasText: /^Saltar$/ }).count(); i++) { await d.locator('.sheet button:visible', { hasText: /^Saltar$/ }).first().click(); await d.w(700); }
    const et = d.locator('button:visible', { hasText: /^Entendido$/ }); if (await et.count()) { await et.first().click(); await d.w(500); }
    await d.locator('button:visible', { hasText: 'Nueva entrega' }).first().click(); await d.w(1200);
    await d.locator('.sheet button:visible', { hasText: /^Efectivo/ }).first().click(); await d.w(300);
    await d.fill('#cli', 'Farmacia E2E'); await d.locator('.sheet button:visible', { hasText: /^15 mil$/ }).click(); await d.w(300);
    await d.locator('#savecamino').click(); await d.w(3500);
    let en = ((await L.fsReq(P, 'GET', 'turnos/' + DUID + '/entregas', 'owner')).json.documents || []).map(L.unfields);
    check(en.length === 1 && JSON.stringify(en[0]).includes('15000') && /Farmacia E2E/.test(JSON.stringify(en[0])), 'Firebase: entrega de Gs. 15.000 em efectivo gravada', JSON.stringify(en).slice(0, 300));
    check(/15\.000/.test(await d.txt()), 'delivery: a entrega soma no dia dele', (await d.txt()).slice(0, 300));
    await d.locator('button:visible', { hasText: 'Nueva entrega' }).first().click(); await d.w(1000);
    await d.locator('.sheet button:visible', { hasText: /^Anotado/ }).first().click(); await d.w(300); await d.fill('#cli', 'Comercio Anotado'); await d.locator('.sheet button:visible', { hasText: /^20 mil$/ }).click(); await d.w(300);
    await d.locator('#savecamino').click(); await d.w(3500);
    en = ((await L.fsReq(P, 'GET', 'turnos/' + DUID + '/entregas', 'owner')).json.documents || []).map(L.unfields);
    check(en.length === 2, 'Firebase: segunda entrega (anotada, Gs. 20.000) gravada', JSON.stringify(en).slice(0, 300));
    info('campos de uma entrega: ' + JSON.stringify(en[0]).slice(0, 260));
  }, d);

  sec('D. Dono vê as entregas do delivery');
  await step('caixa da empresa', async () => {
    const cl = o.locator('.sheet button:visible', { hasText: /Volver/ }); if (await cl.count()) { await cl.first().click(); await o.w(600); }
    await o.locator('#t-dia').click().catch(() => {}); await o.w(3000);
    let tx = await o.txt(); const live = /35\.000/.test(tx);
    if (!live) { await o.reload(); await o.w(6000); tx = await o.txt(); }
    check(/35\.000/.test(tx), 'dono: o total da empresa mostra as duas entregas (Gs. 35.000)' + (live ? ', sem recarregar' : ', ao reabrir'), tx.slice(0, 500));
    const m = tx.match(/Anotado[^₲]*₲\s?([\d.]+)/); check(!!m && m[1] === '20.000', 'dono: o valor anotado na conta da empresa é Gs. 20.000', m ? m[0] : tx.slice(0, 300));
  }, o);

  sec('E. Permissões no Firebase (Caja)');
  await step('regras', async () => {
    const dv = (await L.signIn('delivery.e2e@example.com', DPW)).idToken, ow = (await L.signIn(OWNER, OPW)).idToken;
    const nx = await L.signUp('novo.e2e@example.com', 'Novo#2026'), fk = await L.signUp('falso.' + OWNER.split('@')[0] + '@example.com', 'Falso#2026');
    const T = async (desc, method, pth, tok, exp, body) => { const r = await L.fsReq(P, method, pth, tok, body); check(Array.isArray(exp) ? exp.includes(r.status) : r.status === exp, desc + ' → HTTP ' + r.status, 'esperado ' + exp); };
    await T('delivery lê o próprio cadastro', 'GET', 'turnos/' + DUID, dv, 200);
    await T('delivery lê as próprias entregas', 'GET', 'turnos/' + DUID + '/entregas', dv, 200);
    await T('delivery não lê os dados da empresa', 'GET', 'empresa/pulpito', dv, 403);
    await T('delivery não altera os papéis de administrador', 'PATCH', 'config/roles', dv, 403, L.fields({ socios: [DUID] }));
    await T('delivery não consegue se dar baja/aprovação pela API', 'PATCH', 'turnos/' + DUID + '?updateMask.fieldPaths=aprobado', dv, 403, L.fields({ aprobado: false }));
    await T('usuário novo não consegue se cadastrar já aprovado', 'PATCH', 'turnos/' + nx.localId, nx.idToken, 403, L.fields({ nome: 'x', aprobado: true, baja: false }));
    await T('usuário novo se cadastra como pendente', 'PATCH', 'turnos/' + nx.localId, nx.idToken, 200, L.fields({ nome: 'Novo', aprobado: false, baja: false }));
    await T('usuário pendente não registra entregas', 'POST', 'turnos/' + nx.localId + '/entregas', nx.idToken, 403, L.fields({ val: 1 }));
    await T('usuário pendente não lê as entregas de outro delivery', 'GET', 'turnos/' + DUID + '/entregas', nx.idToken, 403);
    await T('usuário pendente não lê o cadastro de outro delivery', 'GET', 'turnos/' + DUID, nx.idToken, 403);
    await T('anônimo não lê cadastros', 'GET', 'turnos', null, 403);
    await T('anônimo não lê entregas', 'GET', 'turnos/' + DUID + '/entregas', null, 403);
    await T('dono lê todos os cadastros', 'GET', 'turnos', ow, 200);
    await T('dono lê as entregas do delivery', 'GET', 'turnos/' + DUID + '/entregas', ow, 200);
    await T('conta com e-mail parecido com o do dono não vira administradora', 'GET', 'turnos', fk.idToken, 403);
  }, o);
  await L.done();
})().catch(e => { console.log('EXC', e.stack); process.exit(2); });
