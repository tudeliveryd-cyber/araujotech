// Vídeo do produto: envio em partes pelo painel (video.php de verdade, rodando no PHP local, conferindo o login no emulador),
// vídeo por último na galeria do catálogo, segurança do envio e remoção do arquivo quando o vídeo sai do produto.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { info, sec, check } = L;
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const FX = __dirname + '/fix/';
const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'atvid-')); fs.copyFileSync(path.join(__dirname, '..', '..', 'video.php'), path.join(ROOT, 'video.php'));
const PHP = spawn('php', ['-S', '127.0.0.1:8098', '-t', ROOT], { env: Object.assign({}, process.env, { AT_IDT_BASE: 'http://127.0.0.1:9099/identitytoolkit.googleapis.com', AT_FS_BASE: 'http://127.0.0.1:8080' }), stdio: 'ignore' });
const php = async (q, o = {}) => { const r = await fetch('http://127.0.0.1:8098/video.php' + q, Object.assign({ method: 'POST' }, o)); let j = {}; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; };
async function phpRoute(ctx) { // os endereços oficiais do servidor de vídeos vão para o PHP local; /v/ com suporte a Range (o navegador pede pedaços do vídeo)
  await ctx.route(u => /\.araujotechsistemas\.com$/.test(u.hostname) && (u.pathname === '/video.php' || u.pathname.startsWith('/v/')), async r => {
    const u = new URL(r.request().url()), rq = r.request();
    if (u.pathname.startsWith('/v/')) { const f = path.join(ROOT, decodeURIComponent(u.pathname)); if (!f.startsWith(ROOT) || !fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
      const buf = fs.readFileSync(f); const m = /bytes=(\d*)-(\d*)/.exec(rq.headers().range || '');
      if (m) { const a = +m[1] || 0, b = m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1; return r.fulfill({ status: 206, headers: { 'content-type': 'video/mp4', 'accept-ranges': 'bytes', 'content-range': `bytes ${a}-${b}/${buf.length}` }, body: buf.subarray(a, b + 1) }); }
      return r.fulfill({ status: 200, headers: { 'content-type': 'video/mp4', 'accept-ranges': 'bytes' }, body: buf }); }
    const h = {}; for (const [k, v] of Object.entries(rq.headers())) if (/^(authorization|x-at-token|content-type|origin)$/i.test(k)) h[k] = v;
    const rs = await fetch('http://127.0.0.1:8098' + u.pathname + u.search, { method: rq.method(), headers: h, body: rq.method() === 'POST' ? rq.postDataBuffer() || Buffer.alloc(0) : undefined });
    const hh = {}; rs.headers.forEach((v, k) => { if (/^(content-type|access-control-)/i.test(k)) hh[k] = v; });
    return r.fulfill({ status: rs.status, headers: hh, body: Buffer.from(await rs.arrayBuffer()) });
  });
}
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  await L.fsReq(P, 'PATCH', 'billing/loja-teste', 'owner', L.fields({ id: 'loja-teste', name: 'Loja Teste', status: 'ativo', due: hoje, plan: 'basico', pays: [], sys: 'catalogo', contact: '0981000111', created: hoje }));
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.act('newshop'); await a.w(300);
  await a.set('#ns_name', 'Video E2E'); await a.set('#ns_wa', '595981000964');
  await a.act('createshop'); await a.w(4000);
  const shop = await a.evaluate(() => { const s = PL.shops.find(x => x.name === 'Video E2E'); return s && { id: s.id, user: s.user, pass: s.pass }; });
  let tk = {}; for (let i = 0; i < 15 && !tk.idToken; i++) { await a.w(1000); tk = await L.signIn(shop.user + '@araujotechsistemas.com', shop.pass); }
  const HOST = 'https://' + shop.id + '.araujotechsistemas.com';
  const O = await L.open({ w: 390 }); const o = O.p; await phpRoute(O.ctx);
  await o.goto(HOST + '/painel/'); await o.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 20000 }).catch(() => {});
  for (let k = 0; k < 3 && !(await o.locator('#np_a').count()); k++) { if (await o.locator('#lg_user').count()) { await o.fill('#lg_user', shop.user); await o.fill('#lg_pass', shop.pass); await o.press('#lg_pass', 'Enter'); } await o.waitForSelector('#np_a', { timeout: 15000 }).catch(() => {}); } // no CI o primeiro login às vezes demora: tenta de novo
  await o.fill('#np_a', 'DonoNovo#77'); await o.fill('#np_b', 'DonoNovo#77'); await o.press('#np_b', 'Enter'); await o.w(4000);
  await o.evaluate(() => { window.TDC_VCH = 131072; ui.tab = 'products'; render(); }); await o.w(600); // partes pequenas no teste: o envio em várias partes é exercitado com um vídeo leve
  const dir = path.join(ROOT, 'v', shop.id); const files = () => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.mp4$/.test(f)) : [];

  sec('A. Painel: enviar o vídeo do produto');
  await o.evaluate(() => acts.newprod()); await o.w(500);
  await o.set('#ed_nes', 'Campera con video'); await o.set('#ed_pr', '210000');
  await o.setInputFiles('#prodFile', FX + 'prod-alto.jpg'); await o.w(3000);
  check(await o.locator('#prodVid').count() === 1, 'o editor tem "Subir video" (opcional)');
  await o.setInputFiles('#prodVid', FX + 'video-longo.mp4'); await o.w(1200);
  const t1 = await o.txt('#toastRoot');
  check(/60 segundos/.test(t1) && files().length === 0, 'vídeo de mais de 60 s é recusado antes de enviar', t1);
  await o.evaluate(() => { window.__bar = false; new MutationObserver(() => { if (document.getElementById('vupbar')) window.__bar = true; }).observe(document.body, { childList: true, subtree: true }); });
  await o.setInputFiles('#prodVid', FX + 'video-curto.mp4');
  await o.waitForFunction(() => ui.edit && ui.edit.video, null, { timeout: 30000 }).catch(() => {});
  const ev = await o.evaluate(() => ui.edit.video || '');
  info(ev);
  check(await o.evaluate(() => window.__bar), 'mostra a barra de progresso enquanto envia');
  check(new RegExp('^' + HOST.replace(/\./g, '\\.') + '/v/' + shop.id + '/[a-f0-9]{16}\\.mp4$').test(ev), 'o vídeo fica no endereço da loja (/v/<loja>/…mp4)');
  const fl = files(); check(fl.length === 1 && fs.statSync(path.join(dir, fl[0])).size === fs.statSync(FX + 'video-curto.mp4').size, 'o arquivo chega inteiro ao servidor (enviado em 3 partes)');
  check(await o.evaluate(() => !!document.querySelector('.vprev video')), 'o editor mostra o vídeo enviado');
  await o.evaluate(() => acts.saveprod()); await o.w(5000);
  const pid = await o.evaluate(() => (pub.products.find(p => tr(p.n) === 'Campera con video') || {}).id);
  const cfg = JSON.parse(L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json).cfg);
  check((cfg.products.find(x => x.id === pid) || {}).video === ev, 'o catálogo publicado guarda o endereço do vídeo');

  sec('B. Segurança do envio');
  tk = await L.signIn(shop.user + '@araujotechsistemas.com', 'DonoNovo#77'); // a senha mudou no primeiro acesso
  const chunk = fs.readFileSync(FX + 'video-curto.mp4').subarray(0, 4096);
  const q = (s, up) => `?op=up&shop=${s}&up=${up}&i=0&n=1&off=0`;
  check((await php(q(shop.id, 'aaaaaaaaaaaaaaaa'), { body: chunk })).s === 401, 'sem login: recusado');
  check((await php(q(shop.id, 'aaaaaaaaaaaaaaaa'), { body: chunk, headers: { authorization: 'Bearer ' + 'x'.repeat(40) } })).s === 401, 'login falso: recusado');
  check((await php(q('outraloja', 'aaaaaaaaaaaaaaaa'), { body: chunk, headers: { authorization: 'Bearer ' + tk.idToken } })).s === 403, 'login de uma loja não envia vídeo para outra');
  check((await php(q(shop.id, 'bbbbbbbbbbbbbbbb'), { body: Buffer.from('<?php echo 1; ?>' + 'x'.repeat(100)), headers: { authorization: 'Bearer ' + tk.idToken } })).s === 415, 'arquivo que não é vídeo: recusado');
  check((await php(`?op=del&shop=${shop.id}&f=../video.php`, { headers: { authorization: 'Bearer ' + tk.idToken } })).s === 400 && fs.existsSync(path.join(ROOT, 'video.php')), 'não dá para apagar nada fora da pasta de vídeos');
  check(fs.existsSync(path.join(ROOT, 'v', '.htaccess')) && /Require all denied/.test(fs.readFileSync(path.join(ROOT, 'v', '.htaccess'), 'utf8')), 'a pasta de vídeos não executa PHP');

  sec('C. Catálogo: o vídeo vem por último');
  const C = await L.open({ w: 390 }); const c = C.p; await phpRoute(C.ctx);
  await c.goto(HOST + '/'); await c.w(5000);
  check(await c.locator('.pcard[data-pid="' + pid + '"] .vbadge').count() === 1, 'o cartão mostra o selo de vídeo');
  await c.locator('.pcard[data-pid="' + pid + '"]').first().click(); await c.w(3000);
  const g = await c.evaluate(() => { const s = [...document.querySelectorAll('.sheet .pgal .gtrack > *')]; return { n: s.length, last: s.length && s[s.length - 1].className, first: s[0] && s[0].tagName, gn: (document.querySelector('.sheet [data-gn]') || {}).textContent }; });
  info(JSON.stringify(g));
  check(g.n === 2 && /gv/.test(g.last) && g.first === 'BUTTON' && g.gn === '1 / 2', 'a ficha mostra a foto primeiro e o vídeo por último (1 / 2)');
  await c.evaluate(() => { const t = document.querySelector('.sheet [data-gal]'); t.scrollLeft = t.clientWidth; }); await c.w(2500);
  const v = await c.evaluate(async () => { const el = document.querySelector('.sheet .gv video'); try { el.muted = true; await el.play(); } catch (e) {} await new Promise(r => setTimeout(r, 1200)); return { rs: el.readyState, t: el.currentTime, d: Math.round(el.duration), ctl: el.controls, inl: el.playsInline }; });
  info(JSON.stringify(v));
  check(v.rs >= 2 && v.t > 0.3 && v.d === 6 && v.ctl && v.inl, 'o vídeo carrega e toca dentro da página (com controles)');
  await c.evaluate(() => { const t = document.querySelector('.sheet [data-gal]'); t.scrollLeft = 0; }); await c.w(800);
  check(await c.evaluate(() => document.querySelector('.sheet .gv video').paused), 'ao voltar para a foto, o vídeo pausa');
  await c.locator('.sheet .pgal .gs').first().click(); await c.w(1000);
  check(await c.evaluate(() => document.querySelectorAll('#pv .pvs').length === 2 && !!document.querySelector('#pv .pvv video')), 'em tela cheia, o vídeo também aparece por último');
  await c.locator('#pv [data-act=pvclose]').click(); await c.w(300);

  sec('D. Tirar o vídeo apaga o arquivo');
  await o.evaluate(id => acts.editprod({ dataset: { pid: id } }), pid); await o.w(800);
  await o.locator('[data-act=rmvid]').click(); await o.w(300);
  check(await o.locator('#prodVid').count() === 1, 'depois de tirar, volta o botão "Subir video"');
  await o.evaluate(() => acts.saveprod()); await o.w(6000);
  check(files().length === 0, 'o arquivo do vídeo é apagado do servidor');
  const c2 = JSON.parse(L.unfields((await L.fsReq(P, 'GET', 'shops/' + shop.id, 'owner')).json).cfg);
  check(!(c2.products.find(x => x.id === pid) || {}).video, 'o produto fica sem vídeo no catálogo');
  check(!o.errs.length && !c.errs.length, 'sem erros de JavaScript', o.errs.concat(c.errs).join(' | '));
  if (process.env.SHOT) { await c.reload(); await c.w(3000); }
  PHP.kill(); L.done();
})().catch(e => { L.bad('exceção: ' + (e && e.stack || e)); PHP.kill(); L.done(); });
