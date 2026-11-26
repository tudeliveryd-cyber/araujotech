// 25/11 (Jean): cliente pago da Guía ganha painel próprio. A Central cria o convite, o cliente aceita em /cuenta/?inv=<código>,
// personaliza horário, serviços, botões, cor e "cerrado hoy"; a Central ativa; o servidor junta tudo na ficha da Guía e no link /l/<nome>.
// Regras v20 (ginv + campos novos de gfichas).
const L = require('./lib'); const P = 'araujotech-catalogos';
const { sec, check, info } = L; const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const AU = 'http://127.0.0.1:9099';
const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Asuncion' });
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM); const admTok = (await L.signIn(...ADM)).idToken;
  const dy = Array.from({ length: 7 }, (_, i) => ({ on: i > 0 && i < 6, a: i > 0 && i < 6 ? ['08:00', '12:00'] : ['', ''], b: ['', ''] }));
  await L.fsReq(P, 'PATCH', 'platform/sitio', 'owner', L.fields({ gdir: [
    { id: 'dj1', n: 'Dr. Teste Salinas', g: 'health', d: 'Odontología', wa: '0981 555 444', tel: '', a: 'Centro', map: '', hrs: '', ig: '', lg: '', tu: [], td: false, pr: true, qk: true, on: true, dy },
    { id: 'zz2', n: 'Otra Ficha Paga', g: 'serv', d: 'Servicios', wa: '0981 111 000', tel: '', a: '', map: '', hrs: '', ig: '', lg: '', tu: [], td: false, pr: true, qk: true, on: true }] }));
  const st = r => r.status;

  sec('A. Regras v20: convites (ginv)');
  const IV = 'abcdefghijkmnpqrstuvwx23';
  const u1 = await L.signUp('curioso@teste.py', 'Senha#123'); await L.verifyEmail(u1.localId); const t1 = (await L.signIn('curioso@teste.py', 'Senha#123')).idToken;
  check(st(await L.fsReq(P, 'PATCH', 'ginv/' + IV, t1, L.fields({ id: 'dj1', n: 'X' }))) === 403, 'cliente não cria convite');
  check(st(await L.fsReq(P, 'PATCH', 'ginv/' + IV, admTok, L.fields({ id: 'dj1', n: 'Dr. Teste Salinas' }))) === 200, 'a Guía (admin) cria convite');
  check(st(await L.fsReq(P, 'GET', 'ginv/' + IV, null)) === 200, 'quem tem o código lê o convite (sem login)');
  check(st(await L.fsReq(P, 'GET', 'ginv?pageSize=10', t1)) === 403, 'ninguém lista os convites');
  check(st(await L.fsReq(P, 'DELETE', 'ginv/' + IV, t1)) === 403, 'cliente não apaga convite');
  const FF = o => L.fields(Object.assign({ tipo: 'negocio', g: 'serv', n: 'Curioso', wa: '0981000111', st: 'pend', at: '2026-11-25T10:00:00Z', inv: IV }, o));
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId, t1, FF({ dl: 'dj1' }))) === 403, 'ninguém cria a ficha já ligada a um negócio da Guía (dl)');
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId, t1, FF({ dy: [1, 2, 3] }))) === 403, 'horário precisa ter os 7 dias');
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId, t1, FF({ sv: Array.from({ length: 13 }, () => ({ t: 'x' })) }))) === 403, 'no máximo 12 serviços');
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId, t1, FF({ dy, sv: [{ t: 'Limpieza', p: '' }], bt: ['wa', 'map'], cor: 'ver', cz: hoy }))) === 200, 'cliente cria a ficha do convite em revisão, com horário, serviços, botões, cor e fechado');
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId + '?updateMask.fieldPaths=st&updateMask.fieldPaths=dl', admTok, L.fields({ st: 'ok', dl: 'zz2' }))) === 200, 'a Guía ativa e liga a conta à ficha');
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId, t1, FF({ st: 'ok', dl: 'dj1' }))) === 403, 'o dono não troca a ficha ligada (dl)');
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + u1.localId, t1, FF({ st: 'ok', dl: 'zz2', sv: [{ t: 'Plomería', p: '50.000' }] }))) === 200, 'o dono edita a ficha ativa mantendo a ligação');
  await L.fsReq(P, 'DELETE', 'gfichas/' + u1.localId, 'owner'); await L.fsReq(P, 'DELETE', 'ginv/' + IV, 'owner');

  sec('B. Central: criar o convite na ficha do cadastro rápido');
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.evaluate(() => { ui.view = 'platform'; render(); }); await a.w(500);
  await a.act('guquick'); await a.w(3000);
  await a.fill('#qk_q', 'teste salinas'); await a.w(400); await a.locator('[data-act="qkedit"]').first().click(); await a.w(2500);
  check(/Acceso del cliente a su panel/.test(await a.txt()) && await a.locator('[data-act="qkinv"]').count() === 1, 'a ficha paga mostra "Acceso del cliente" com "Crear invitación"');
  { // 25/11 (Jean): "o logo está em péssima qualidade": além do logo pequeno (140 px) a Central guarda um em boa resolução (480 px) à parte
    const big = path.join(os.tmpdir(), 'e2e_logo_big.png'); cp.execFileSync('python3', ['-c', "from PIL import Image,ImageDraw;im=Image.new('RGB',(900,900),(20,20,20));d=ImageDraw.Draw(im);[d.ellipse((i*40,i*40,900-i*40,900-i*40),outline=(200,160,40),width=6) for i in range(10)];im.save('" + big + "')"]);
    check(!/resolución/.test(await a.txt()), 'sem logo: nenhum aviso de resolução');
    await a.locator('input[data-qklogo]').setInputFiles(big); await a.w(1500);
    check(/Logo en buena resolución/.test(await a.txt()), 'logo novo: avisa que está em boa resolução');
    await a.locator('[data-act="qksave"]').click(); await a.w(3500);
    const dd = (L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json).gdir || []).find(x => x.id === 'dj1') || {};
    const giR = await L.fsReq(P, 'GET', 'platform/sitio/gimg/lhdj1', 'owner'); info('gimg ' + giR.status + ' ' + JSON.stringify(giR.json).slice(0, 200)); const gl = await a.evaluate(async () => { try { return (await CLOUD.api.listGimg()).map(x => x.id || x); } catch (e) { return String(e); } }); info('list ' + JSON.stringify(gl).slice(0, 200));
    const gi = L.unfields(giR.json) || {};
    const dim = await a.evaluate(src => new Promise(f => { const im = new Image(); im.onload = () => f(im.naturalWidth); im.onerror = () => f(0); im.src = src; }), gi.d || '');
    info(JSON.stringify({ lg: (dd.lg || '').length, lgh: dd.lgh, dim, gi: Object.keys(gi), gil: String(gi.d || '').slice(0, 40) }));
    check(/^data:image\/jpeg/.test(dd.lg || '') && /^gimg:lhdj1:[a-f0-9]+$/.test(dd.lgh || '') && dim === 480, 'logo novo: pequeno na ficha e um de 480 px guardado à parte (boa resolução)');
    if (!(await a.locator('[data-act="qkinv"]').count())) { await a.evaluate(() => { ui.qkV = 'home'; qkSheet(); }); await a.w(500); await a.fill('#qk_q', 'teste salinas'); await a.w(400); await a.locator('[data-act="qkedit"]').first().click(); await a.w(2500); }
  }
  await a.locator('[data-act="qkinv"]').click(); await a.w(2500);
  const invs = ((await L.fsReq(P, 'GET', 'ginv?pageSize=10', 'owner')).json.documents || []).map(d => ({ code: d.name.split('/').pop(), ...L.unfields(d) }));
  const iv = invs.find(x => x.id === 'dj1');
  const shown = await a.evaluate(() => (document.querySelector('#qk_acc input') || {}).value || '');
  info(JSON.stringify({ shown, iv: iv && { code: iv.code, n: iv.n, lk: iv.lk, dy: !!iv.dy } }));
  check(iv && iv.code.length === 24 && iv.n === 'Dr. Teste Salinas' && iv.lk === 'https://guiadesantarita.com/l/dr-teste-salinas' && Array.isArray(iv.dy), 'convite salvo com o código, os dados da ficha e o link');
  check(shown === 'https://araujotechsistemas.com/cuenta/?inv=' + (iv && iv.code) && await a.locator('#qk_acc a[href*="wa.me/595981555444"]').count() === 2, 'mostra o link do convite e os botões para mandar pelo WhatsApp do cliente (espanhol e português)');
  { const w = decodeURIComponent(await a.locator('#qk_acc a[href*="wa.me/595981555444"]').first().getAttribute('href'));
    check(w.includes('https://guiadesantarita.com/l/dr-teste-salinas') && w.includes('https://araujotechsistemas.com/cuenta/?inv=' + iv.code) && /Cómo entrar/.test(w), 'a mensagem do WhatsApp já leva o link do Instagram, o link do acesso e como entrar'); }

  sec('C. Cliente: aceitar o convite e personalizar');
  const C = await L.open(); const c = C.p;
  await c.goto('https://araujotechsistemas.com/cuenta/?inv=' + iv.code); await c.w(2500);
  check(/te dio acceso a la ficha de Dr\. Teste Salinas/.test(await c.txt()) && await c.evaluate(() => document.querySelector('[data-v="up"]').getAttribute('aria-selected') === 'true'), 'abre com o nome do negócio e já em "Crear cuenta"');
  await c.fill('#ae', 'dr@salinas.py'); await c.fill('#ap', 'Senha#789'); await c.click('#fau button[type=submit]'); await c.w(2500);
  const oob = await (await fetch(AU + '/emulator/v1/projects/' + P + '/oobCodes')).json();
  const code = (oob.oobCodes || []).find(o => o.email === 'dr@salinas.py' && o.requestType === 'VERIFY_EMAIL');
  check(code && /inv=/.test(decodeURIComponent(code.oobLink || '')), 'o e-mail de confirmação volta para o convite');
  await fetch(AU + '/identitytoolkit.googleapis.com/v1/accounts:update?key=x', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ oobCode: code.oobCode }) });
  await c.click('[data-a="verdone"]'); await c.w(3000);
  const f0 = await c.evaluate(() => ({ n: (document.getElementById('f_n') || {}).value, wa: (document.getElementById('f_wa') || {}).value, lk: [...document.querySelectorAll('input[readonly]')].map(i => i.value).join(), mon: (document.querySelector('[data-dy="1.a.0"]') || {}).value, sun: (document.querySelector('[data-dyon="0"]') || {}).checked, tipo: !!document.querySelector('input[name=tipo]') }));
  info(JSON.stringify(f0));
  check(f0.n === 'Dr. Teste Salinas' && f0.wa === '0981 555 444' && f0.mon === '08:00' && f0.sun === false && !f0.tipo, 'abre "Mi negocio en la Guía" já preenchido com os dados da ficha e o horário (sem escolher tipo)');
  check(/guiadesantarita\.com\/l\/dr-teste-salinas/.test(f0.lk), 'mostra o link para o Instagram');
  check(await c.locator('.thumb img[src*="gimg.php?d=dj1&k=h"]').count() === 1, 'mostra o logo atual da Guía (em boa resolução)');
  await c.locator('[data-dyon="6"]').check(); await c.w(300);
  await c.fill('[data-dy="6.a.0"]', '08:00'); await c.click('#ffi button[type=submit]'); await c.w(500);
  check(/Revisá el horario/.test(await c.txt('#am')), 'dia aberto só com a hora de abrir: avisa');
  await c.fill('[data-dy="6.a.1"]', '11:30');
  await c.fill('[data-dy="1.b.0"]', '14:00'); await c.fill('[data-dy="1.b.1"]', '18:00');
  await c.click('[data-a="svadd"]'); await c.w(200); await c.fill('[data-sv="0.t"]', 'Limpieza dental'); await c.fill('[data-sv="0.p"]', 'Gs. 150.000');
  await c.click('[data-a="svadd"]'); await c.w(200); await c.fill('[data-sv="1.t"]', 'Blanqueamiento');
  { const tx = await c.txt(); check(!/Botones de tu link|Color de tu link/.test(tx) && /Eso es Vitrix/.test(tx) && await c.locator('a.btn.wa[href*="saber%20de%20Vitrix"]').count() === 1, 'painel simples: sem botões nem cor do link; convida para o Vitrix (catálogo completo)'); }
  check(/Las fotos se habilitan cuando la Guía active tu ficha/.test(await c.txt()) && await c.locator('input[data-gl]').count() === 0, 'fotos do negócio: só depois que a Guía ativa');
  for (let k = 2; k < 5; k++) { await c.click('[data-a="svadd"]'); await c.w(150); }
  check(await c.locator('[data-a="svadd"]').count() === 0 && await c.locator('[data-sv$=".t"]').count() === 5, 'no máximo 5 serviços principais');
  for (let k = 4; k >= 2; k--) { await c.locator(`[data-a="svrm"][data-i="${k}"]`).click(); await c.w(150); }
  await c.click('[data-a="czhoy"]'); await c.w(300);
  check(/Ahora figura cerrado hasta el/.test(await c.txt()), '"Cerrado hoy" avisa até quando fica fechado');
  if (process.env.SHOT) await c.screenshot({ path: process.env.SHOT + '/cuenta.png', fullPage: true });
  await c.click('#ffi button[type=submit]'); await c.w(2500);
  const uid = (await L.signIn('dr@salinas.py', 'Senha#789')).localId;
  const fx = L.unfields((await L.fsReq(P, 'GET', 'gfichas/' + uid, 'owner')).json);
  info(JSON.stringify({ st: fx.st, inv: fx.inv, bt: fx.bt, cor: fx.cor, cz: fx.cz, sv: fx.sv, d1: fx.dy && fx.dy[1], d6: fx.dy && fx.dy[6] }));
  check(fx.st === 'pend' && fx.inv === iv.code && fx.tipo === 'negocio' && !fx.dl && !fx.lg, 'salvo em revisão, com o código do convite e sem ligação (a Guía ativa)');
  check(fx.dy[1].a.join() === '08:00,12:00' && fx.dy[1].b.join() === '14:00,18:00' && fx.dy[6].on && fx.dy[6].a.join() === '08:00,11:30', 'horário por dia com dois turnos e o sábado novo');
  check(fx.sv.length === 2 && fx.sv[0].t === 'Limpieza dental' && fx.sv[0].p === 'Gs. 150.000' && fx.sv[1].p === '', 'serviços com e sem preço');
  check(!('bt' in fx) && !('cor' in fx) && fx.cz === hoy, 'fechado hoje salvo; sem botões nem cor (o link fica no padrão da Guía)');
  check(/avisamos a la Guía/.test(await c.txt()) && await c.locator('a.btn.wa[href*="wa.me/595982086171"][href*="Acept"]').count() === 1, 'mostra que falta a Guía ativar e o botão para avisar pelo WhatsApp');
  const ctok = (await L.signIn('dr@salinas.py', 'Senha#789')).idToken;
  check(st(await L.fsReq(P, 'PATCH', 'gfichas/' + uid + '?updateMask.fieldPaths=dl', ctok, L.fields({ dl: 'dj1' }))) === 403, 'o cliente não se liga sozinho à ficha');

  sec('D. Central: ativar o acesso');
  await a.evaluate(() => { ui.qkAcc = null; qkAccPaint(); }); await a.w(2500);
  if (process.env.SHOT) { const el = await a.$('#qk_acc'); if (el) { await el.scrollIntoViewIfNeeded(); await a.screenshot({ path: process.env.SHOT + '/central.png' }); } }
  check(/dr@salinas\.py/.test(await a.txt('#qk_acc')) && await a.locator('[data-act="qkaccok"]').count() === 1, 'a Central mostra quem aceitou e o botão "Activar acceso"');
  await a.locator('[data-act="qkaccok"]').click(); await a.w(2500);
  const fy = L.unfields((await L.fsReq(P, 'GET', 'gfichas/' + uid, 'owner')).json);
  check(fy.st === 'ok' && fy.dl === 'dj1' && fy.plan === 'paid', 'ativado: ficha da conta publicada e ligada à ficha da Guía');
  check(st(await L.fsReq(P, 'GET', 'ginv/' + iv.code, null)) === 404, 'o convite usado é apagado (o link não serve de novo)');
  check(/ya entra a su panel/.test(await a.txt('#qk_acc')) && await a.locator('[data-act="qkaccoff"]').count() === 1, 'mostra "ya entra a su panel" com "Quitar acceso"');
  check(A.p.errs.length === 0, 'Central sem erros de JavaScript', A.p.errs.join(' | '));

  sec('E. Servidor: a ficha da Guía usa o que o cliente mudou');
  const php = (code, dir) => cp.execFileSync('php', ['-r', code], { cwd: path.join(L.DIRS.site, dir || 'sitio'), env: Object.assign({}, process.env, { TMPDIR: fs.mkdtempSync(path.join(os.tmpdir(), 'gacc-')), GUIA_FS_BASE: 'http://127.0.0.1:8080' }), timeout: 40000 }).toString();
  const out = JSON.parse(php("require 'prods_lib.php'; require 'guia_lib.php'; echo json_encode(guia_pub()['dir']);"));
  const dj = out.filter(x => x.id === 'dj1' || /Salinas/.test(x.n));
  info(JSON.stringify(dj.map(x => ({ id: x.id, n: x.n, sl: x.sl, own: x.own, tc: x.tc, cz: x.cz, cor: x.cor, bt: x.bt, sv: x.sv && x.sv.length }))));
  check(dj.length === 1 && dj[0].id === 'dj1' && dj[0].own === 1 && dj[0].sl === 'dr-teste-salinas', 'uma ficha só (a da Guía), com o mesmo endereço');
  check(dj[0].sv.length === 2 && dj[0].cz === hoy && dj[0].tc === 1 && dj[0].dy[6].on && !dj[0].cor && !dj[0].bt, 'traz serviços, fechado hoje e horário novo');
  await L.fsReq(P, 'PATCH', 'gfichas/' + uid + '?updateMask.fieldPaths=n&updateMask.fieldPaths=cz', 'owner', L.fields({ n: 'Consultorio Salinas', cz: '' }));
  const out2 = JSON.parse(php("require 'prods_lib.php'; require 'guia_lib.php'; echo json_encode(guia_pub()['dir']);")).find(x => x.id === 'dj1');
  check(out2.n === 'Consultorio Salinas' && out2.sl === 'dr-teste-salinas' && !out2.tc && !out2.cz, 'o cliente muda o nome: a ficha muda, o link para o Instagram continua o mesmo; reaberto, não figura fechado');
  await L.fsReq(P, 'PATCH', 'gfichas/' + uid + '?updateMask.fieldPaths=cz', 'owner', L.fields({ cz: hoy }));
  const html = php("$_GET = ['id' => 'dr-teste-salinas']; include 'bio.php';", 'guia');
  if (process.env.SHOT) fs.writeFileSync(process.env.SHOT + '/bio.html', html); info((html.match(/<div class="lg">.{0,160}/) || [''])[0]);
  const order = ['data-c="wa"', 'data-c="map"', 'data-c="gu"'].map(k => html.indexOf(k));
  check(/class="lng"/.test(html) && /data-l="pt"/.test(html) && /gimg\.php\?d=dj1&amp;k=h&amp;v=/.test(html), 'link /l/: botão ES/PT e logo em boa resolução');
  { const lgv = (/gimg\.php\?d=dj1&amp;k=h&amp;v=([a-f0-9]+)/.exec(html) || [])[1] || '';
    const bin = cp.execFileSync('php', ['-r', "$_GET = ['d' => 'dj1', 'k' => 'h', 'v' => '" + lgv + "']; include 'gimg.php';"], { cwd: path.join(L.DIRS.site, 'sitio'), env: Object.assign({}, process.env, { TMPDIR: fs.mkdtempSync(path.join(os.tmpdir(), 'gacc-')), GUIA_FS_BASE: 'http://127.0.0.1:8080' }) });
    check(bin.length > 5000 && bin[0] === 0xFF && bin[1] === 0xD8, 'gimg.php entrega o logo grande (JPEG)'); }
  check(/<span>Servicios<\/span><\/h2>/.test(html) && /id="vc"/.test(html) && /Limpieza dental/.test(html) && /Gs\. 150\.000/.test(html), 'link /l/: mostra os serviços com preço');
  check(/id="sh"/.test(html) && order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2], 'link /l/: botões no padrão da Guía');
  check(/theme-color" content="#24093F"/.test(html) && html.includes('CZ="' + hoy + '"'), 'link /l/: cor da Guía e aviso de fechado hoje');

  sec('F. Toques da ficha ligada (guia_stats.php)');
  { const dr = fs.mkdtempSync(path.join(os.tmpdir(), 'gst-')); fs.mkdirSync(path.join(dr, 'datos'));
    for (const f of ['guia_stats.php', 'prods_lib.php', 'guia_lib.php']) fs.copyFileSync(path.join(L.DIRS.site, 'sitio', f), path.join(dr, f));
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Asuncion' })); const ym = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    fs.writeFileSync(path.join(dr, 'datos', 'hits-' + ym(now) + '.json'), JSON.stringify({ c: { 'd-dj1': 5, 'bio-dr-teste-salinas': 2, 'd-zz2': 40 } }));
    const srv = cp.spawn('php', ['-S', '127.0.0.1:8098', '-t', dr], { env: Object.assign({}, process.env, { GUIA_ID_BASE: AU + '/identitytoolkit.googleapis.com', GUIA_FS_BASE: 'http://127.0.0.1:8080', TMPDIR: fs.mkdtempSync(path.join(os.tmpdir(), 'gacc-')) }), stdio: 'ignore' });
    await new Promise(f => setTimeout(f, 800));
    let r = {}; try { r = await (await fetch('http://127.0.0.1:8098/guia_stats.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ t: ctok, ficha: 1 }) })).json(); } catch (e) { r = { err: String(e) }; }
    srv.kill(); info(JSON.stringify(r));
    check(r.ok && r.mes === 7 && r.sl === 'dr-teste-salinas', 'o cliente vê os toques da ficha + do link dele (5 + 2), nada dos outros'); }

  sec('G. Cliente depois de ativado');
  await c.reload(); await c.w(3500);
  check(/aparece en la Guía y en tu link en unos minutos/.test(await c.txt()) && await c.locator('#ffi').count() === 1, 'o cliente vê que já está ativo e continua editando');
  await c.click('[data-l="pt"]'); await c.w(300);
  check(/Meu negócio no Guia/.test(await c.txt()) && /Serviços principais/.test(await c.txt()), 'painel do cliente em português');
  check(c.errs.length === 0, 'página do cliente sem erros de JavaScript', c.errs.join(' | '));

  sec('G2. Fotos do negócio pelo painel (regras v21, gfotos)');
  { const mk = (n, col) => { const f = path.join(os.tmpdir(), 'e2e_acc_' + n + '.jpg'); cp.execFileSync('python3', ['-c', `from PIL import Image,ImageDraw;im=Image.new('RGB',(2400,1600),${col});d=ImageDraw.Draw(im);[d.rectangle((i*80,i*50,2400-i*80,1600-i*50),outline=(255,255,255),width=7) for i in range(14)];im.save('${f}',quality=95)`]); return f; };
    const fa = mk('a', '(190,60,40)'), fb = mk('b', '(40,110,80)'), fc = mk('c', '(40,60,170)'), fcv = mk('cv', '(120,30,170)');
    await c.click('[data-l="es"]'); await c.w(300);
    check(/Fotos de tu negocio/.test(await c.txt()) && await c.locator('input[data-gl]').count() === 1 && await c.locator('input[data-img="ph"]').count() === 1, 'ativado: aparece "Fotos de tu negocio" com portada e galería');
    await c.locator('input[data-img="ph"]').setInputFiles(fcv); await c.w(1500);
    await c.locator('input[data-gl]').setInputFiles([fa, fb, fc]); await c.w(3000);
    check(await c.locator('[data-a="glrm"]').count() === 3, '3 fotos carregadas (reduzidas no celular)');
    await c.locator('[data-a="glrm"][data-i="1"]').click(); await c.w(300);
    await c.click('#ffi button[type=submit]'); await c.w(3000);
    const gf = L.unfields((await L.fsReq(P, 'GET', 'gfotos/' + uid, 'owner')).json) || {}; const fq = L.unfields((await L.fsReq(P, 'GET', 'gfichas/' + uid, 'owner')).json);
    info(JSON.stringify({ n: (gf.f || []).length, sz: (gf.f || []).map(x => x.length), ph: (fq.ph || '').length, note: (await c.txt('#am')).slice(0, 80) }));
    check(Array.isArray(gf.f) && gf.f.length === 2 && gf.f.every(x => /^data:image\/jpeg/.test(x) && x.length <= 150000) && /^data:image\/jpeg/.test(fq.ph || '') && fq.dl === 'dj1' && fq.st === 'ok', 'salvo: 2 fotos em gfotos e a portada na ficha (continua ligada e ativa)');
    check(/Guardado|guardad/i.test(await c.txt('#am')), 'mensagem de salvo');
    const img = gf.f[0];
    check(st(await L.fsReq(P, 'PATCH', 'gfotos/' + uid, t1, L.fields({ f: [img] }))) === 403, 'outra pessoa não grava as fotos do negócio');
    check(st(await L.fsReq(P, 'PATCH', 'gfotos/' + u1.localId, t1, L.fields({ f: [img] }))) === 403, 'conta sem negócio pago (sem dl) não grava fotos');
    check(st(await L.fsReq(P, 'PATCH', 'gfotos/' + uid, ctok, L.fields({ f: Array(7).fill(img) }))) === 403, 'no máximo 6 fotos');
    check(st(await L.fsReq(P, 'PATCH', 'gfotos/' + uid, ctok, L.fields({ f: ['data:image/jpeg;base64,' + 'A'.repeat(150100)] }))) === 403, 'foto grande demais é recusada');
    check(st(await L.fsReq(P, 'PATCH', 'gfotos/' + uid, ctok, L.fields({ f: ['javascript:alert(1)'] }))) === 403, 'só imagem (data:image) é aceita');
    check(st(await L.fsReq(P, 'PATCH', 'gfotos/' + uid, ctok, L.fields({ f: [img], x: 'y' }))) === 403, 'campos estranhos recusados');
    check(st(await L.fsReq(P, 'GET', 'gfotos/' + uid, null)) === 200 && st(await L.fsReq(P, 'GET', 'gfotos?pageSize=5', null)) === 403, 'qualquer um vê as fotos do negócio ativo, ninguém lista todas');
    const out4 = JSON.parse(php("require 'prods_lib.php'; require 'guia_lib.php'; echo json_encode(guia_pub()['dir']);")).find(x => x.id === 'dj1') || {};
    info(JSON.stringify({ gl: out4.gl, ph: out4.ph }));
    check((out4.gl || []).length === 2 && out4.gl.every((u, i) => u.startsWith('/sitio/gimg.php?f=' + uid + '&k=g' + i + '&v=')) && /gimg\.php\?f=/.test(out4.ph || ''), 'servidor: a ficha da Guía usa as fotos e a portada do dono');
    const v1 = /v=([a-f0-9]+)/.exec(out4.gl[1])[1];
    const bin = cp.execFileSync('php', ['-r', "$_GET = ['f' => '" + uid + "', 'k' => 'g1', 'v' => '" + v1 + "']; include 'gimg.php';"], { cwd: path.join(L.DIRS.site, 'sitio'), env: Object.assign({}, process.env, { TMPDIR: fs.mkdtempSync(path.join(os.tmpdir(), 'gacc-')), GUIA_FS_BASE: 'http://127.0.0.1:8080' }) });
    check(bin.length > 3000 && bin[0] === 0xFF && bin[1] === 0xD8, 'gimg.php entrega a foto 2 do dono (JPEG)');
    const ph2 = php("$_SERVER['HTTP_HOST'] = 'guiadesantarita.com'; $_GET = ['k' => 'negocio', 'id' => 'dr-teste-salinas']; include 'p.php';", 'guia');
    check((ph2.match(/data-lb="\/sitio\/gimg\.php\?f=/g) || []).length === 2, 'página do negócio mostra as 2 fotos do dono');
    await c.reload(); await c.w(3500);
    check(await c.locator('[data-a="glrm"]').count() === 2, 'ao voltar ao painel, as fotos salvas aparecem');
    check(c.errs.length === 0, 'painel sem erros de JavaScript', c.errs.join(' | ')); }

  sec('H. Central: tirar o acesso');
  await a.evaluate(() => { window.confirm = () => true; }); await a.locator('[data-act="qkaccoff"]').click(); await a.w(2500);
  const fz = L.unfields((await L.fsReq(P, 'GET', 'gfichas/' + uid, 'owner')).json);
  const out3 = JSON.parse(php("require 'prods_lib.php'; require 'guia_lib.php'; echo json_encode(guia_pub()['dir']);"));
  check(fz.st === 'off' && !fz.dl && out3.find(x => x.id === 'dj1').n === 'Dr. Teste Salinas' && !out3.some(x => x.n === 'Consultorio Salinas'), 'sem acesso: a ficha volta a ter só os dados da Guía e a conta não aparece sozinha');
  L.done();
})().catch(e => { console.log('ERRO', e && e.stack || e); process.exit(1); });
