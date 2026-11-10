// Ponta a ponta do Meu Púlpito: conta → sermão salvo → recuperado em outro aparelho → apagado. Regras reais do repositório.
const L = require('./lib'); const P = 'meu-pulpito-app';
const { ok, bad, info, sec, check } = L;
const step = async (name, fn, pg) => { try { await fn(); } catch (e) { let d = ''; try { if (pg) d = ' | tela: ' + (await pg.txt()).slice(0, 400) + ' | camada: ' + (await pg.txt('#layer')).slice(0, 300) + ' | erros: ' + pg.errs.join(';'); } catch (x) {} bad(name + ': exceção ' + String(e.message).split('\n')[0].slice(0, 200) + d); } };
const EM = 'pastor.e2e@example.com', PW = 'Pastor#2026';
const act = (p, a) => p.locator('[data-act="' + a + '"]:visible, #' + a + ':visible').first();
const acts = p => p.evaluate(() => [...new Set([...document.querySelectorAll('[data-act]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.act + (e.innerText ? '(' + e.innerText.trim().slice(0, 14).replace(/\n/g, ' ') + ')' : '')))].join(' '));
let UIDG = '';
const allDocs = async () => { const out = []; for (const c of ['pulpito/' + UIDG + '/sermoes', 'pulpito/' + UIDG + '/notas', 'pulpito/' + UIDG + '/meta', 'empresa/pulpito/' + UIDG, 'empresa/pulpito/' + UIDG + '_meta']) { const q = await L.fsReq(P, 'GET', c + '?pageSize=100', 'owner'); for (const d of ((q.json && q.json.documents) || [])) out.push([d.name.split('/documents/')[1], JSON.stringify(L.unfields(d) || {})]); } return out; };
const clear = async p => { for (let i = 0; i < 6; i++) { await p.w(900); if (await act(p, 'welGo').count()) { await act(p, 'welGo').click(); continue; } if (await p.locator('#layer button:visible', { hasText: /^Saltar|^Pular/ }).count()) { await p.locator('#layer button:visible', { hasText: /^Saltar|^Pular/ }).first().click(); continue; } if (await p.locator('#layer input[type=tel]:visible').count()) { await p.locator('#layer input[type=tel]:visible').first().fill('981000111'); await p.locator('#layer button:visible', { hasText: 'Guardar' }).first().click(); await p.w(2000); continue; } if (!(await p.evaluate(() => (document.querySelector('#layer') || {}).innerText || '').catch(() => ''))) break; } };
const login = async p => { await p.goto('https://meupulpito.com/app/'); await p.w(3500); await p.fill('#lgE', EM); await p.fill('#lgP', PW); await p.click('#lgIn'); await p.w(5000); };
(async () => {
  let UID = '';
  sec('A. Conta');
  const D1 = await L.open({ w: 390 }); const p = D1.p;
  await step('conta', async () => {
    await p.goto('https://meupulpito.com/app/'); await p.w(3500);
    await p.fill('#lgE', EM); await p.fill('#lgP', '123'); await p.click('#lgUp'); await p.w(1500);
    check(/al menos 6 caracteres/.test(await p.txt()), 'criar conta: senha curta é recusada com explicação');
    await p.fill('#lgP', PW); await p.click('#lgUp'); await p.w(5000);
    const tk = await L.signIn(EM, PW); UID = tk.localId; UIDG = UID;
    check(!!UID && /Premium gratis|prueba/i.test(await p.txt()), 'conta criada no Firebase Auth e app aberto com o período de teste', (await p.txt()).slice(0, 200));
    await clear(p);
    const u = L.unfields((await L.fsReq(P, 'GET', 'pulpito/' + UID, 'owner')).json);
    info('perfil gravado: ' + JSON.stringify(u).slice(0, 220));
  }, p);

  sec('B. Sermão: escrever, salvar sozinho e reabrir');
  await step('sermão', async () => {
    await act(p, 'new').click(); await p.w(1500);
    await p.click('#ed'); await p.keyboard.type('Fe que mueve montanas E2E'); await p.keyboard.press('Enter'); await p.keyboard.type('Primer punto: confiar. Texto de prueba con acentos: oración, corazón.');
    let docs = [], hit = null, secs = 0; for (; secs < 20 && !hit; secs++) { await p.w(1000); docs = await allDocs(); hit = docs.find(d => /montanas E2E/.test(d[1])); }
    info('salvamento automático: ' + (hit ? 'gravado na nuvem ' + secs + ' s depois de parar de escrever' : 'não gravou em 20 s sem fechar o editor'));
    check(!!hit, 'Firebase: o sermão foi salvo sozinho enquanto escrevia', docs.map(d => d[0] + '(' + d[1].slice(0, 80) + ')').join(', ').slice(0, 600));
    if (hit) info('documento: ' + hit[0]);
    await act(p, 'edBack').click(); await p.w(1200);
    await p.reload(); await p.w(5000); await clear(p);
    const tabS = p.locator('[data-act=tab]:visible', { hasText: 'Sermones' }).last(); if (await tabS.count()) { await tabS.click(); await p.w(1200); }
    check(/montanas E2E/.test(await p.txt()), 'depois de fechar e reabrir o app, o sermão está na lista', (await p.txt()).slice(0, 300));
    info('ações na lista: ' + (await acts(p)).slice(0, 500));
  }, p);

  sec('C. Outro aparelho');
  const D2 = await L.open({ w: 1366 }); const q = D2.p;
  await step('segundo aparelho', async () => {
    await q.goto('https://meupulpito.com/app/'); await q.w(3500);
    await q.fill('#lgE', EM); await q.fill('#lgP', 'senha-errada'); await q.click('#lgIn'); await q.w(2500);
    check(await q.locator('#lgE:visible').count() > 0, 'entrar: senha errada é recusada', (await q.txt()).slice(0, 200));
    await q.fill('#lgP', PW); await q.click('#lgIn'); await q.w(5000); await clear(q);
    const tabS = q.locator('[data-act=tab]:visible', { hasText: 'Sermones' }).last(); if (await tabS.count()) { await tabS.click(); await q.w(1500); }
    check(/montanas E2E/.test(await q.txt()), 'computador: entra com a mesma conta e encontra o sermão escrito no celular', (await q.txt()).slice(0, 300));
    await q.locator('[data-act=open]:visible').first().click(); await q.w(1500);
    const edt = await q.evaluate(() => (document.querySelector('#ed') || {}).innerText || '');
    check(/Primer punto: confiar/.test(edt) && /oración, corazón/.test(edt), 'computador: o texto do sermão abre completo, com acentos', edt.slice(0, 200));
    if (await q.locator('#ed').count()) { await q.click('#ed'); await q.keyboard.press('Control+End'); await q.keyboard.press('Enter'); await q.keyboard.type('Segundo punto escrito en la computadora.'); }
    let okk = false; for (let i = 0; i < 20 && !okk; i++) { await q.w(1000); okk = (await allDocs()).some(d => /Segundo punto escrito en la computadora/.test(d[1])); }
    check(okk, 'Firebase: edição feita no computador foi salva sozinha');
    await act(q, 'edBack').click(); await q.w(1500);
    info('ações no editor: ' + (await acts(q)).slice(0, 400));
  }, q);

  sec('D. Pregar, apagar e permissões');
  await step('final', async () => {
    await p.reload(); await p.w(5000); await clear(p);
    const tabS = p.locator('[data-act=tab]:visible', { hasText: 'Sermones' }).last(); await tabS.click(); await p.w(1200);
    await p.locator('[data-act=open]:visible').first().click(); await p.w(1500);
    check(/Segundo punto escrito en la computadora/.test(await p.evaluate(() => (document.querySelector('#ed') || {}).innerText || '')), 'celular: ao reabrir, o texto escrito no computador está lá');
    await act(p, 'edPreach').click(); await p.w(1500);
    const pr = await p.txt(); check(/montanas E2E/.test(pr) && /Primer punto/.test(pr), 'modo pregar abre com o texto do sermão', pr.slice(0, 200));
    info('ações no modo pregar: ' + (await acts(p)).slice(0, 300));
    const out = await L.signUp('otro.pastor@example.com', 'OtroPastor#1'); const me = (await L.signIn(EM, PW)).idToken;
    const T = async (desc, method, pth, tok, exp, body) => { const r = await L.fsReq(P, method, pth, tok, body); check(Array.isArray(exp) ? exp.includes(r.status) : r.status === exp, desc + ' → HTTP ' + r.status, 'esperado ' + exp); };
    const docs = await allDocs(); const sd = (docs.find(d => /montanas E2E/.test(d[1])) || [''])[0];
    await T('dono lê os próprios sermões', 'GET', 'pulpito/' + UID + '/sermoes', me, 200);
    await T('outro usuário logado não lê os sermões deste pastor', 'GET', 'pulpito/' + UID + '/sermoes', out.idToken, 403);
    await T('outro usuário não lê um sermão pelo endereço', 'GET', sd, out.idToken, 403);
    await T('outro usuário não altera um sermão alheio', 'PATCH', sd + '?updateMask.fieldPaths=t', out.idToken, 403, L.fields({ t: 'x' }));
    await T('anônimo não lê sermões', 'GET', 'pulpito/' + UID + '/sermoes', null, 403);
    await T('usuário não consegue se dar o plano Premium', 'PATCH', 'planos/' + UID, me, 403, L.fields({ plan: 'premium', until: 4102444800000 }));
    await T('usuário não lê os planos dos outros', 'GET', 'planos', me, 403);
    await T('usuário não altera a configuração do app', 'PATCH', 'config/app', me, 403, L.fields({ x: 1 }));
  }, p);

  sec('E. Apagar e recuperar senha');
  await step('apagar', async () => {
    if (await act(p, 'pgClose').count()) { await act(p, 'pgClose').click(); await p.w(800); }
    if (await act(p, 'edBack').count()) { await act(p, 'edBack').click(); await p.w(1200); }
    await p.locator('[data-act=menu]:visible').first().click(); await p.w(800);
    const opts = await p.evaluate(() => [...document.querySelectorAll('#layer button, #layer [data-act]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.act || '') + ':' + e.innerText.trim().slice(0, 20)).join(' | '));
    const del = p.locator('#layer button:visible, #layer [data-act]:visible').filter({ hasText: /Eliminar|Borrar|Excluir/ }).first();
    if (!(await del.count())) { info('opção de apagar não encontrada no menu: ' + opts); return; }
    await del.click(); await p.w(1000);
    check(/papelera/i.test(await p.txt('#layer')) && !/para siempre/i.test(await p.txt('#layer')), 'apagar: a confirmação explica que vai para a papelera (não diz "para siempre")', (await p.txt('#layer')).slice(0, 160));
    await p.locator('#dYes').click();
    let gone = false, trash = false; for (let i = 0; i < 15 && !gone; i++) { await p.w(1000); const d = (await allDocs()).filter(x => /montanas E2E/.test(x[1])); gone = !d.length; trash = d.some(x => /"(del|trash|deleted|lixo|papelera|delAt|trashed)":(true|\d)/.test(x[1])); if (trash) break; if (i === 14) info('doc após apagar: ' + d.map(x => x[1].slice(-200)).join(' || ')); }
    check(gone || trash, 'apagar: o sermão sai da biblioteca na nuvem' + (trash ? ' (vai para a lixeira)' : ''), 'menu: ' + opts + ' | ' + (await p.txt('#layer')).slice(0, 200));
    await q.reload(); await q.w(5000); await clear(q); const tabS = q.locator('[data-act=tab]:visible', { hasText: 'Sermones' }).last(); if (await tabS.count()) { await tabS.click(); await q.w(1500); }
    check(!(await q.locator('[data-act=open]:visible', { hasText: 'montanas E2E' }).count()), 'apagar: o sermão também some no outro aparelho', (await q.txt()).slice(0, 200));
    const R = await L.open({ w: 390 }); await R.p.goto('https://meupulpito.com/app/'); await R.p.w(3500); await R.p.click('#lgF'); await R.p.w(800); await R.p.locator('input[type=email]:visible').first().fill(EM); await R.p.locator('button:visible', { hasText: /Enviar enlace|Enviar link/ }).first().click(); await R.p.w(2500);
    const oob = await (await fetch('http://127.0.0.1:9099/emulator/v1/projects/' + P + '/oobCodes')).json();
    check((oob.oobCodes || []).some(c => c.email === EM && c.requestType === 'PASSWORD_RESET'), 'recuperar senha: o pedido de redefinição chega ao Firebase para o e-mail da conta', (await R.p.txt()).slice(0, 200)); await R.ctx.close();
  }, p);

  sec('F. Escritório: identificador da conta do administrador');
  await step('identificador', async () => {
    const fs = require('fs'), path = require('path');
    const ADM = (fs.readFileSync(path.join(L.DIRS.pulpito, 'firestore.rules'), 'utf8').match(/token\.email == '([^']+)'/) || [])[1]; if (!ADM) { info('e-mail do administrador não encontrado nas regras'); return; }
    const au = await L.signUp(ADM, 'AdminPulpito#26');
    const E = await L.open({ w: 1100 }); const e = E.p; await e.goto('https://meupulpito.com/escritorio/'); await e.w(3000);
    await e.fill('#lgE', ADM); await e.fill('#lgP', 'AdminPulpito#26'); await e.press('#lgP', 'Enter'); await e.w(5000);
    check(await e.locator('#idc').count() === 1 && !e.errs.length, 'escritório: o administrador entra e vê o botão do identificador, sem erros', (await e.txt()).split(ADM).join('<adm>').slice(0, 200) + ' | erros: ' + e.errs.join(';').split(ADM).join('<adm>'));
    await e.evaluate(() => { window.__cp = ''; try { navigator.clipboard.writeText = t => { window.__cp = t; return Promise.resolve(); }; } catch (x) {} }); e.dialogs.length = 0;
    await e.click('#idc'); await e.w(800);
    const got = (await e.evaluate(() => window.__cp)) || e.dialogs.join(' ');
    check(got.includes(au.localId) && /e-mail verificado: (sim|não)/.test(got) && !got.includes('@'), 'escritório: o texto copiado traz o identificador e se o e-mail está verificado, sem o e-mail', got.replace(au.localId, '<uid correto>'));
    await e.evaluate(() => { window.__cp = ''; }); await e.locator('#idc2').scrollIntoViewIfNeeded(); await e.click('#idc2'); await e.w(600);
    check(((await e.evaluate(() => window.__cp)) || e.dialogs.join(' ')).includes(au.localId), 'escritório: o mesmo botão existe no fim da página (para navegadores que cobrem o topo)');
    await E.ctx.close();
  }, p);
  await L.done();
})().catch(e => { console.log('EXC', e.stack); process.exit(2); });
