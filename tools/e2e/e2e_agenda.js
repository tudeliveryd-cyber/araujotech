// Ponta a ponta da Agenda para Salones y Barberías: admin cria o acesso → dono entra → reserva pública → chega na gestão.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { ok, bad, info, sec, check } = L;
const step = async (name, fn, pg) => { try { await fn(); } catch (e) { let d = ''; try { if (pg) d = ' | tela: ' + (await pg.txt()).slice(0, 500) + ' | erros: ' + pg.errs.join(';') + (pg.cons || []).join(';').slice(0, 300); } catch (x) {} bad(name + ': exceção ' + String(e.message).split('\n')[0].slice(0, 200) + d); } };
const fix10 = async p => { const t = new Date(); t.setUTCHours(13, 0, 0, 0); await p.clock.setFixedTime(t); };
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  await L.fsReq(P, 'PATCH', 'billing/semilla', 'owner', L.fields({ name: 'Semilla', status: 'ativo', user: 'semilla', plan: 'basico', due: '2026-12-01', pays: [], created: '2026-11-01' }));
  let ag = null, HOST = '', NEWP = 'SalonNovo#88';

  sec('A. Admin: registrar a Agenda e criar o acesso');
  const A = await L.open({ w: 1366 }); const a = A.p;
  await step('admin', async () => {
    await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
    await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(3500);
    await a.act('newclient'); await a.locator('[data-act=ncsys]', { hasText: 'Agenda' }).click(); await a.w(400);
    const plans = await a.evaluate(() => [...document.querySelector('#nc_plan').options].map(o => o.value));
    check(plans.length > 0 && plans[0], 'admin: existe plano para registrar um cliente da Agenda', JSON.stringify(plans));
    await a.set('#nc_name', 'Salón E2E'); await a.act('createclient'); await a.w(3000);
    const sid = await a.evaluate(() => (PL.shops.find(s => /Salón E2E/.test(s.name)) || {}).id);
    check(!!sid, 'admin: cliente da Agenda registrado', (await a.txt('.sheet')).slice(0, 200)); if (!sid) return;
    await a.locator('[data-act=agacc][data-sid="' + sid + '"]').first().click(); await a.w(4500);
    ag = await a.evaluate(sid => { const s = PL.shops.find(x => x.id === sid); return { id: s.id, user: s.user, pass: s.pass, cloud: s.agCloud }; }, sid);
    check(ag.user && /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(ag.pass || ''), 'admin: acesso criado com usuário e senha provisória aleatória', JSON.stringify(ag));
    HOST = 'https://' + ag.user + '.araujotechsistemas.com';
    const lic = L.unfields((await L.fsReq(P, 'GET', 'licencias/' + ag.user, null)).json) || {};
    check(lic.status === 'activo' && lic.sys === 'agenda', 'Firebase: licença da Agenda criada (pública, só o admin altera)', JSON.stringify(lic).slice(0, 160));
    const tk = await L.signIn(ag.user + '@araujotechsistemas.com', ag.pass);
    const au = L.unfields((await L.fsReq(P, 'GET', 'agendaUsers/' + tk.localId, 'owner')).json) || {};
    check(au.ag === ag.user && au.role === 'owner' && au.mc === true, 'Firebase: dono vinculado à agenda, com troca de senha obrigatória', JSON.stringify(au));
  }, a);
  if (!ag) return L.done();

  sec('B. Dono: primeiro acesso, senha própria e configuração inicial');
  const G = await L.open({ w: 390 }); const g = G.p;
  await step('gestão', async () => {
    const R0 = await L.open({ w: 390 }); await R0.p.goto(HOST + '/agenda/'); await R0.p.w(4000);
    check(/en preparación/i.test(await R0.p.txt()) && !R0.p.errs.length, 'reservas: antes de o dono configurar, a página pública mostra "Página en preparación" sem erros', (await R0.p.txt()).slice(0, 120) + ' | erros: ' + R0.p.errs.join(';')); await R0.ctx.close();
    await g.goto(HOST + '/agenda/gestion.html'); await g.w(2500);
    await g.fill('#au-email', ag.user); await g.fill('#au-pass', 'errada-000'); await g.click('[data-act=authLogin]'); await g.w(2500);
    check(await g.locator('#au-email:visible').count() > 0, 'gestão: senha errada é recusada');
    await g.fill('#au-email', ag.user); await g.fill('#au-pass', ag.pass); await g.click('[data-act=authLogin]'); await g.w(3500);
    check(await g.locator('#np-a:visible').count() > 0, 'gestão: no primeiro acesso exige criar a senha própria', (await g.txt()).slice(0, 200));
    await g.fill('#np-a', ag.pass); await g.fill('#np-b', ag.pass); await g.click('[data-act=setNewPass]'); await g.w(1200);
    check(await g.locator('#np-a:visible').count() > 0, 'gestão: repetir a senha provisória é recusado');
    await g.fill('#np-a', NEWP); await g.fill('#np-b', NEWP); await g.click('[data-act=setNewPass]'); await g.w(3500);
    for (let i = 0; i < 8 && await g.locator('[data-act=wzNext]:visible, [data-act=wzStart]:visible').count(); i++) {
      const ty = g.locator('[data-act=wzType]:visible'); if (await ty.count()) await ty.nth(1).click();
      const ins = g.locator('input:visible[type=text],input:visible:not([type])'); for (let k = 0; k < await ins.count(); k++) if (!(await ins.nth(k).inputValue())) await ins.nth(k).fill('Salón E2E');
      await g.locator('[data-act=wzNext]:visible, [data-act=wzStart]:visible').first().click(); await g.w(700); }
    await g.w(3000);
    check(await g.locator('[data-act=go]:visible').count() > 0, 'gestão: assistente inicial concluído e painel aberto', (await g.txt()).slice(0, 300));
    const R = await L.open({ w: 390 }); await R.p.goto(HOST + '/'); await R.p.w(4000);
    check(/Salón E2E/.test(await R.p.txt()) && await R.p.locator('button:visible', { hasText: 'Reservar' }).count() > 0 && !R.p.errs.length, 'endereço do cliente (sem /agenda) abre direto a página de reservas', R.p.url() + ' | ' + (await R.p.txt()).slice(0, 160) + ' | ' + R.p.errs.join(';') + (R.p.cons || []).join(';').slice(0, 200)); await R.ctx.close();
    const t2 = await L.signIn(ag.user + '@araujotechsistemas.com', NEWP), t1 = await L.signIn(ag.user + '@araujotechsistemas.com', ag.pass);
    check(!!t2.idToken && !t1.idToken, 'Firebase Auth: senha provisória deixou de valer, a nova funciona');
    const pub = await L.fsReq(P, 'GET', 'agendaPub/' + ag.user, null), stt = await L.fsReq(P, 'GET', 'agendas/' + ag.user + '/state/main', 'owner');
    check(pub.status === 200, 'Firebase: página pública de reservas publicada pelo dono', 'HTTP ' + pub.status);
    const stl = await L.fsReq(P, 'GET', 'agendas/' + ag.user + '/state', 'owner');
    check(((stl.json && stl.json.documents) || []).length > 0, 'Firebase: dados da agenda gravados na nuvem', JSON.stringify(stl.json).slice(0, 200));
  }, g);

  sec('C. Cliente: reserva pública que chega na gestão');
  let SLOT = '';
  const book = async (p, name, phone, slotIdx, wantSlot) => {
    await p.locator('button:visible', { hasText: 'Reservar' }).first().click(); await p.w(400);
    const cont = async () => { await p.locator('button:visible', { hasText: /^Continuar|^Confirmar/ }).last().click(); await p.w(500); };
    await cont();
    const slots = p.locator('button:visible').filter({ hasText: /^\d\d:\d\d$/ }); const all = await slots.allInnerTexts();
    let idx = slotIdx; if (wantSlot) { idx = all.indexOf(wantSlot); if (idx < 0) return { all, taken: true }; }
    const s = all[idx]; await slots.nth(idx).click(); await p.w(300); await cont();
    await p.fill('#nm', name); await p.fill('#ph', phone); await cont(); await p.w(2500);
    const full = await p.txt(); const m = full.match(/.{0,40}(reservad|recibimos|confirm)[^/]{0,80}/i); return { all, slot: s, txt: m ? m[0] : full.slice(-200) };
  };
  await step('reserva', async () => {
    const V = await L.open({ w: 390 }); const v = V.p; await fix10(v);
    await v.goto(HOST + '/agenda/'); await v.w(3500);
    check(/Salón E2E/.test(await v.txt()) && await v.locator('button:visible', { hasText: 'Reservar' }).count() > 0, 'reservas: página pública mostra o salão e os serviços do dono', (await v.txt()).slice(0, 200));
    const r = await book(v, 'Ana Reserva', '0981 222 333', 1); SLOT = r.slot;
    check(/reservad/i.test(r.txt), 'reservas: cliente conclui a reserva das ' + SLOT, r.txt);
    const rs = ((await L.fsReq(P, 'GET', 'agendas/' + ag.user + '/reservas', 'owner')).json.documents || []).map(L.unfields);
    check(rs.length === 1 && /Ana Reserva/.test(rs[0].json), 'Firebase: reserva gravada', JSON.stringify(rs).slice(0, 200));
    await g.w(5000);
    const stj = JSON.stringify(((await L.fsReq(P, 'GET', 'agendas/' + ag.user + '/state', 'owner')).json.documents || []).map(L.unfields));
    check(/Ana Reserva/.test(stj), 'gestão (já aberta): recebeu a reserva sozinha e gravou o turno e o cliente na agenda', stj.slice(0, 300));
    await g.evaluate(() => { const e = document.querySelector('[data-act=go][data-v=agenda]'); e && e.click(); }); await g.w(800);
    const bell = await g.evaluate(() => document.body.innerText.match(/.{0,60}(solicitud|pendiente|reserva online|nueva reserva)[^\n]{0,60}/i)); info('gestão mostra: ' + (bell ? bell[0].replace(/\n/g, ' / ') : '(sem aviso visível na tela atual)'));
    const rs2 = ((await L.fsReq(P, 'GET', 'agendas/' + ag.user + '/reservas', 'owner')).json.documents || []).map(L.unfields);
    check(rs2[0] && rs2[0].p === true, 'Firebase: reserva marcada como recebida pela gestão');
    await V.ctx.close();
  }, g);

  sec('D. Mesmo horário para duas pessoas');
  await step('conflito', async () => {
    await g.w(2500);
    const V2 = await L.open({ w: 390 }); const v2 = V2.p; await fix10(v2); await v2.goto(HOST + '/agenda/'); await v2.w(3500);
    const r = await book(v2, 'Beto Tarde', '0981 444 555', 0, SLOT);
    check(!!r.taken, 'reservas: quem entra depois não encontra mais o horário das ' + SLOT + ' (já reservado)', 'horários oferecidos: ' + r.all.slice(0, 8).join(' '));
    await V2.ctx.close();
    // duas pessoas com a página aberta ANTES; a segunda confirma depois que a primeira já reservou
    const prep = async (p, name, phone, idx, want) => { await p.locator('button:visible', { hasText: 'Reservar' }).first().click(); await p.w(400); const cont = async () => { await p.locator('button:visible', { hasText: /^Continuar|^Confirmar/ }).last().click(); await p.w(500); }; await cont(); const sl = p.locator('button:visible').filter({ hasText: /^\d\d:\d\d$/ }); const all = await sl.allInnerTexts(); const k = want ? all.indexOf(want) : idx; if (k < 0) return null; await sl.nth(k).click(); await p.w(300); await cont(); await p.fill('#nm', name); await p.fill('#ph', phone); return all[k]; };
    const fin = async p => { await p.locator('button:visible', { hasText: /^Confirmar/ }).last().click(); await p.w(3000); const f = await p.txt(); const m = f.match(/.{0,10}(reservado!|acaba de ser reservado|acabou de ser reservado)[^/]{0,90}/i); return m ? m[0] : f.slice(-160); };
    const X = await L.open({ w: 390 }), Y = await L.open({ w: 390 }); await fix10(X.p); await fix10(Y.p);
    await X.p.goto(HOST + '/agenda/'); await Y.p.goto(HOST + '/agenda/'); await X.p.w(3500); await Y.p.w(500);
    const sx = await prep(X.p, 'Carla Uno', '0981 111 000', 3), sy = await prep(Y.p, 'Dora Dos', '0981 222 000', 0, sx);
    check(sx && sy === sx, 'duas pessoas com a página aberta escolhem o mesmo horário livre (' + sx + ')');
    const fx = await fin(X.p); await g.w(7000); const fy = await fin(Y.p);
    check(/reservado!/i.test(fx), 'a primeira confirma e reserva', fx);
    check(/acaba de ser reservado/i.test(fy), 'a segunda é avisada de que o horário acabou de ser reservado (não duplica)', fy);
    await X.ctx.close(); await Y.ctx.close();
    // as duas confirmam no MESMO instante (antes de a gestão processar)
    const X2 = await L.open({ w: 390 }), Y2 = await L.open({ w: 390 }); await fix10(X2.p); await fix10(Y2.p);
    await X2.p.goto(HOST + '/agenda/'); await Y2.p.goto(HOST + '/agenda/'); await X2.p.w(3500); await Y2.p.w(500);
    const s2 = await prep(X2.p, 'Eva Tres', '0981 333 000', 5); await prep(Y2.p, 'Fabi Cuatro', '0981 444 000', 0, s2);
    const [f1, f2] = await Promise.all([fin(X2.p), fin(Y2.p)]); await g.w(7000);
    const stj = JSON.stringify(((await L.fsReq(P, 'GET', 'agendas/' + ag.user + '/state', 'owner')).json.documents || []).map(L.unfields));
    const both = /Eva Tres/.test(stj) && /Fabi Cuatro/.test(stj), warn = /ATENCI[ÓO]N: ese horario ya estaba ocupado/.test(stj);
    info('confirmação no mesmo instante (' + s2 + '): 1ª "' + f1.slice(0, 30) + '" · 2ª "' + f2.slice(0, 30) + '"');
    check(both && warn, 'no mesmo instante: as duas entram como pendentes e a gestão marca a segunda com "ATENCIÓN: ese horario ya estaba ocupado"', 'both=' + both + ' warn=' + warn);
    await X2.ctx.close(); await Y2.ctx.close();
  }, g);

  sec('F. Acesso de profissional');
  await step('profissional', async () => {
    const go = async v => { await g.evaluate(v => { const e = document.querySelector('[data-act=go][data-v="' + v + '"]'); e && e.click(); }, v); await g.w(600); };
    await go('more'); const views = await g.evaluate(() => [...new Set([...document.querySelectorAll('[data-act=go]')].map(e => e.dataset.v))]);
    await go('pros');
    if (!(await g.locator('[data-act=editPro]').count())) { info('lista de profissionais não encontrada: ' + (await g.txt()).slice(0, 500) + ' ## ' + await g.evaluate(() => [...new Set([...document.querySelectorAll('[data-act]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.act))].join(' '))); return; }
    await g.locator('[data-act=editPro]').first().click(); await g.w(600);
    if (!(await g.locator('#r-login:visible').count())) { info('campo de acesso do profissional não disponível: ' + (await g.txt('.modal')).slice(0, 300)); return; }
    if (!(await g.inputValue('#r-name'))) await g.fill('#r-name', 'Pro E2E');
    await g.fill('#r-login', 'proe2e'); await g.click('#r-save'); await g.w(4000);
    const mt = await g.txt('.modal'); const m = mt.match(/[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}/);
    check(/proe2e/.test(mt) && !!m, 'gestão: ao criar o acesso do profissional, mostra usuário e senha provisória aleatória uma única vez', mt.slice(0, 300));
    if (!m) return; await g.act('closeM');
    const Pp = await L.open({ w: 390 }); const p = Pp.p; await p.goto(HOST + '/agenda/gestion.html'); await p.w(2500);
    await p.fill('#au-email', 'proe2e'); await p.fill('#au-pass', m[0]); await p.click('[data-act=authLogin]'); await p.w(3500);
    check(await p.locator('#np-a:visible').count() > 0, 'profissional: no primeiro acesso é obrigado a criar a senha', (await p.txt()).slice(0, 200));
    await p.fill('#np-a', 'ProNovo#44'); await p.fill('#np-b', 'ProNovo#44'); await p.click('[data-act=setNewPass]'); await p.w(4000);
    const pvw = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-act=go]')].map(e => e.dataset.v))]); await p.evaluate(() => { const e = document.querySelector('[data-act=go][data-v=more]'); e && e.click(); }); await p.w(500);
    const pv2 = await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-act=go]')].map(e => e.dataset.v))]);
    await p.evaluate(() => { const e = document.querySelector('[data-act=go][data-v=cash]'); e && e.click(); }); await p.w(600); info('profissional na tela Caja vê: ' + (await p.txt()).slice(0, 260));
    check(pv2.length > 0 && !['settings', 'reports', 'pros', 'services', 'products'].some(v => pv2.includes(v)), 'profissional: entra e não vê configurações, relatórios, equipe, serviços nem produtos', JSON.stringify(pv2) + ' | ' + (await p.txt()).slice(0, 200));
    const tk = (await L.signIn('proe2e@araujotechsistemas.com', 'ProNovo#44')).idToken;
    const r1 = await L.fsReq(P, 'PATCH', 'agendaUsers/novo-dono', tk, L.fields({ ag: ag.user, role: 'owner', email: 'x', name: 'x', mc: false }));
    check(r1.status === 403, 'regras: profissional não consegue criar outro dono → HTTP ' + r1.status);
    await Pp.ctx.close();
  }, g);

  sec('E. Permissões no Firebase (Agenda)');
  await step('regras', async () => {
    const own = (await L.signIn(ag.user + '@araujotechsistemas.com', NEWP)).idToken;
    const out = await L.signUp('intruso@araujotechsistemas.com', 'Intruso#123');
    const T = async (desc, method, pth, tok, exp, body) => { const r = await L.fsReq(P, method, pth, tok, body); check(Array.isArray(exp) ? exp.includes(r.status) : r.status === exp, desc + ' → HTTP ' + r.status, 'esperado ' + exp); };
    const B = 'agendas/' + ag.user;
    await T('dono lê os dados da própria agenda', 'GET', B + '/state', own, 200);
    await T('dono lê as reservas', 'GET', B + '/reservas', own, 200);
    await T('anônimo não lê clientes/caixa da agenda', 'GET', B + '/state', null, 403);
    await T('anônimo não lê as reservas dos outros', 'GET', B + '/reservas', null, 403);
    await T('usuário logado de fora não lê a agenda', 'GET', B + '/state', out.idToken, 403);
    await T('usuário de fora não altera a página pública', 'PATCH', 'agendaPub/' + ag.user, out.idToken, 403, L.fields({ json: '{}' }));
    await T('anônimo não altera a licença', 'PATCH', 'licencias/' + ag.user, null, 403, L.fields({ status: 'activo', plan: 'premium' }));
    await T('dono não altera a própria licença (plano)', 'PATCH', 'licencias/' + ag.user, own, 403, L.fields({ status: 'activo', plan: 'premium' }));
    await T('reserva com campos a mais é recusada', 'POST', B + '/reservas', null, 403, L.fields({ json: '{}', at: 'x', p: false, extra: 1 }));
    await T('reserva já marcada como recebida é recusada', 'POST', B + '/reservas', null, 403, L.fields({ json: '{}', at: 'x', p: true }));
    await T('reserva gigante é recusada', 'POST', B + '/reservas', null, 403, L.fields({ json: 'x'.repeat(7000), at: 'x', p: false }));
    await T('usuário de fora não se torna dono de uma agenda', 'PATCH', 'agendaUsers/' + out.localId, out.idToken, 403, L.fields({ ag: ag.user, role: 'owner', email: 'x', name: 'x', mc: false }));
  }, g);
  await L.done();
})().catch(e => { console.log('EXC', e.stack); process.exit(2); });
