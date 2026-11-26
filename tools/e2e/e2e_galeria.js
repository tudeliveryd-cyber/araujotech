// 25/11 (etapa 3 do redesign da Guía): ficha paga ganha capa em boa resolução e galeria de até 6 fotos (a Central sobe,
// guarda à parte em platform/sitio/gimg); a página do negócio mostra galeria, mapa e "abierto ahora"; o Recomendado entra em Negocios destacados.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { sec, check, info } = L; const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026'];
  await L.signUp(...ADM);
  const dy = Array.from({ length: 7 }, () => ({ on: true, a: ['00:00', '23:59'], b: ['', ''] }));
  await L.fsReq(P, 'PATCH', 'platform/sitio', 'owner', L.fields({ gdir: [
    { id: 'gx1', n: 'Panadería Galería', g: 'food', d: 'Panadería', wa: '0981 222 333', tel: '', a: 'Av. Central 123', map: 'https://www.google.com/maps/search/?api=1&query=-25.79,-55.08', hrs: '', ig: '', lg: '', tu: [], td: false, pr: true, rc: true, qk: false, on: true, dy },
    { id: 'gx2', n: 'Ficha Sin Plan', g: 'food', d: 'Bar', wa: '0981 222 444', tel: '', a: '', map: '', hrs: '', ig: '', lg: '', tu: [], td: true, pr: false, on: true }] }));
  const mk = (n, c) => { const f = path.join(os.tmpdir(), 'e2e_gal_' + n + '.jpg'); cp.execFileSync('python3', ['-c', `from PIL import Image,ImageDraw;im=Image.new('RGB',(1800,1200),${c});d=ImageDraw.Draw(im);[d.rectangle((i*60,i*40,1800-i*60,1200-i*40),outline=(255,255,255),width=5) for i in range(12)];im.save('${f}',quality=92)`]); return f; };
  const cover = mk('cv', '(140,40,200)'), ph = [mk('a', '(200,80,40)'), mk('b', '(40,120,90)'), mk('c', '(30,60,160)')];

  sec('A. Central: capa e galeria da ficha paga');
  const A = await L.open({ w: 1366 }); const a = A.p;
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.evaluate(() => { ui.view = 'platform'; render(); }); await a.w(500);
  await a.act('gusite'); await a.w(2500);
  await a.evaluate(() => { ui.guSt = null; ui.guNav = { sec: 'neg', g: 'food', t: '*' }; guSheet(); }); await a.w(800);
  const di = await a.evaluate(() => ui.gu.dir.findIndex(x => x.id === 'gx1')), dj = await a.evaluate(() => ui.gu.dir.findIndex(x => x.id === 'gx2'));
  check(await a.locator(`input[data-gudirgl="${di}"]`).count() === 1 && await a.locator(`input[data-gudirgl="${dj}"]`).count() === 0, 'galeria aparece só na ficha com plano pago');
  check(/Plan pago activo \(Presencia, Recomendado o Portada\)/.test(await a.txt()) && /Negocios destacados con foto de portada/.test(await a.txt()), 'rótulos dos planos iguais aos pacotes novos');
  await a.locator(`input[data-gudirph="${di}"]`).setInputFiles(cover); await a.w(2500);
  await a.locator(`input[data-gudirgl="${di}"]`).setInputFiles(ph); await a.w(4000);
  const pre = await a.evaluate(i => { const x = ui.gu.dir[i]; return { ph: (x.ph || '').length, phh: (x.phh || '').slice(0, 15), gl: (x.gl || []).length, th: document.querySelectorAll(`[data-act="gudirglrm"][data-i="${i}"]`).length }; }, di);
  info(JSON.stringify(pre));
  check(pre.ph > 0 && pre.phh.startsWith('data:image/jp') && pre.gl === 3 && pre.th === 3, 'capa (pequena + grande) e 3 fotos carregadas, com miniaturas');
  await a.act('gudirglrm', `[data-i="${di}"][data-n="1"]`); await a.w(400);
  check(await a.evaluate(i => ui.gu.dir[i].gl.length, di) === 2, 'quitar uma foto');
  await a.act('gusave'); await a.w(5000);
  const doc = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json); const gx = (doc.gdir || []).find(x => x.id === 'gx1') || {};
  info(JSON.stringify({ phh: gx.phh, gl: gx.gl, ph: (gx.ph || '').length }));
  check(/^gimg:pcgx1:[a-f0-9]+$/.test(gx.phh || '') && Array.isArray(gx.gl) && gx.gl.length === 2 && gx.gl.every(v => /^gimg:glgx1_\d_[a-f0-9]+:[a-f0-9]+$/.test(v)) && /^data:image\/jpeg/.test(gx.ph || ''), 'salvo: capa grande e fotos guardadas à parte; o documento da Guía só leva a referência');
  const gid = /^gimg:([A-Za-z0-9_]+):/.exec(gx.gl[0])[1]; const gi = L.unfields((await L.fsReq(P, 'GET', 'platform/sitio/gimg/' + gid, 'owner')).json) || {};
  const dim = await a.evaluate(src => new Promise(f => { const im = new Image(); im.onload = () => f(im.naturalWidth); im.onerror = () => f(0); im.src = src; }), gi.d || '');
  check(dim === 1200, 'foto da galeria guardada com 1200 px (nítida na tela cheia)', String(dim));
  // sem a foto apagada: o servidor limpa o que não é mais usado
  const ids = await a.evaluate(async () => { try { return (await CLOUD.api.listGimg()).map(x => x.id || x); } catch (e) { return []; } });
  check(ids.filter(x => /^glgx1_/.test(x)).length === 2, 'a foto quitada não fica guardada', JSON.stringify(ids));

  sec('B. Servidor: ficha com capa, galeria e página do negócio');
  const env = () => Object.assign({}, process.env, { TMPDIR: fs.mkdtempSync(path.join(os.tmpdir(), 'ggal-')), GUIA_FS_BASE: 'http://127.0.0.1:8080' });
  const php = (code, dir) => cp.execFileSync('php', ['-r', code], { cwd: path.join(L.DIRS.site, dir || 'sitio'), env: env(), timeout: 40000 });
  const dir = JSON.parse(php("require 'prods_lib.php'; require 'guia_lib.php'; echo json_encode(guia_pub()['dir']);").toString());
  const g1 = dir.find(x => x.id === 'gx1') || {}, g2 = dir.find(x => x.id === 'gx2') || {};
  info(JSON.stringify({ phh: g1.phh, gl: g1.gl, sl: g1.sl, g2: Object.keys(g2) }));
  check(/^\/sitio\/gimg\.php\?d=gx1&k=c&v=[a-f0-9]+$/.test(g1.phh || '') && (g1.gl || []).length === 2 && /k=g0&v=/.test(g1.gl[0]) && /k=g1&v=/.test(g1.gl[1]) && !g2.gl && !g2.phh, 'ficha paga sai com capa grande e 2 fotos; ficha sem plano, sem galeria');
  for (const [k, lab] of [['g1', 'foto 2 da galeria'], ['c', 'capa grande']]) { const bin = php(`$_GET = ['d' => 'gx1', 'k' => '${k}', 'v' => 'x']; include 'gimg.php';`);
    check(bin.length > 3000 && bin[0] === 0xFF && bin[1] === 0xD8, 'gimg.php entrega a ' + lab + ' (JPEG)'); }
  { let n = -1; try { n = php("$_GET = ['d' => 'gx2', 'k' => 'g0', 'v' => 'x']; include 'gimg.php';").length; } catch (e) { n = -2; } check(n === 0, 'ficha sem galeria: gimg.php não entrega nada (404)', String(n)); }
  const html = php(`$_SERVER['HTTP_HOST'] = 'guiadesantarita.com'; $_GET = ['k' => 'negocio', 'id' => '${g1.sl}']; include 'p.php';`, 'guia').toString();
  if (process.env.SHOT) fs.writeFileSync(process.env.SHOT + '/negocio.html', html);
  check((html.match(/data-lb="\/sitio\/gimg\.php\?d=gx1&amp;k=g\d/g) || []).length === 2 && /<dialog class="lb" id="lb">/.test(html) && /<h2 class="sh2">Fotos<\/h2>/.test(html), 'página do negócio: galeria com as 2 fotos e visor em tela cheia');
  check(/<img class="ph" src="\/sitio\/gimg\.php\?d=gx1&amp;k=c&amp;v=/.test(html) && /og:image" content="https:\/\/guiadesantarita\.com\/sitio\/gimg\.php\?d=gx1&amp;k=c/.test(html), 'capa grande no topo e na prévia do WhatsApp');
  check(/<h2 class="sh2">Ubicación<\/h2>/.test(html) && /Av\. Central 123/.test(html) && /maps\.google\.com\/maps\?q=-25\.79,-55\.08&amp;z=16&amp;output=embed/.test(html), 'endereço e mapa (pelas coordenadas do link)');
  check(/id="nst"/.test(html) && /class="rc"><svg[^>]*>.*?<\/svg>Recomendado<\/span>/.test(html), 'selo Recomendado e espaço do "abierto ahora"');

  sec('C. Guía: Recomendado em Negocios destacados e cartão novo');
  const G = await L.open(); const g = G.p;
  await g.goto('https://araujotechsistemas.com/guia/'); await g.w(3000);
  const r = await g.evaluate(async (dd) => { const W = ms => new Promise(f => setTimeout(f, ms)); G.dir = dd; CAT = 'home'; render(); await W(80);
    const o = { fd: [...document.querySelectorAll('#destacados .fc-t b')].map(b => b.textContent), tag: (document.querySelector('#destacados .fc-tg.rcg') || {}).textContent || '', cv: (document.querySelector('#destacados .fc-cv > img') || { getAttribute: () => '' }).getAttribute('src') || '' };
    CAT = 'food'; render(); await W(80); o.rec = [...document.querySelectorAll('.cpr .fc-t b')].map(b => b.textContent);
    const c = [...document.querySelectorAll('.cc.dir')].find(x => /Panadería Galería/.test(x.textContent)); o.card = c ? { open: !!c.querySelector('.bd.on'), seal: !!c.querySelector('.bd.st'), cover: !!c.querySelector('.cc-ph img[src*="k=c"]'), vn: (c.querySelector('a.vn') || { getAttribute: () => '' }).getAttribute('href'), ad: /Av\. Central 123/.test(c.textContent), nb: c.querySelectorAll('.bd').length } : null;
    CAT = 'home'; render(); return o; }, dir);
  info(JSON.stringify(r));
  check(r.fd.includes('Panadería Galería') && !r.fd.includes('Ficha Sin Plan') && /Recomendado/.test(r.tag) && /k=c/.test(r.cv), 'Recomendado da Guía entra em Negocios destacados com a foto de capa');
  check(r.rec.includes('Panadería Galería'), 'e em "Recomendados en esta categoría"');
  check(r.card && r.card.open && r.card.seal && r.card.cover && /negocio\/panaderia-galeria/.test(r.card.vn) && r.card.ad && r.card.nb <= 2, 'cartão novo: capa, aberto agora, selo, endereço e "Ver negocio" (no máximo dois selos)');
  if (process.env.SHOT) { // fotos para revisar o visual (não fazem parte das verificações)
    await g.route(u => /\/sitio\/gimg\.php/.test(u.pathname), async rt => { const q = new URL(rt.request().url()).searchParams; try { const b = php(`$_GET = ['d' => '${(q.get('d') || '').replace(/\W/g, '')}', 'k' => '${(q.get('k') || '').replace(/\W/g, '')}', 'v' => 'x']; include 'gimg.php';`); rt.fulfill({ status: 200, contentType: 'image/jpeg', body: b }); } catch (e) { rt.fulfill({ status: 404, body: '' }); } });
    await g.evaluate(async (dd) => { G.dir = dd; CAT = 'food'; render(); scrollTo(0, 0); }, dir); await g.w(1200);
    await g.evaluate(() => { const c = [...document.querySelectorAll('.cc.dir')].find(x => /Panadería Galería/.test(x.textContent)); if (c) c.scrollIntoView({ block: 'start' }); scrollBy(0, -80); }); await g.w(500);
    await g.screenshot({ path: process.env.SHOT + '/cards.png' });
    await g.evaluate(() => { CAT = 'home'; render(); document.getElementById('destacados').scrollIntoView({ block: 'start' }); }); await g.w(800); await g.screenshot({ path: process.env.SHOT + '/destacados.png' });
    let h = html; for (const u of [...new Set(h.match(/\/sitio\/gimg\.php\?d=gx1&amp;k=(?:c|g\d)&amp;v=[a-f0-9]+/g) || [])]) { const k = /k=(\w+)/.exec(u)[1]; const b = php(`$_GET = ['d' => 'gx1', 'k' => '${k}', 'v' => 'x']; include 'gimg.php';`); h = h.split(u).join('data:image/jpeg;base64,' + b.toString('base64')); }
    const Pg = await L.open(); await Pg.p.setContent(h.replace('<footer id="gft"></footer>', ''), { waitUntil: 'load' }); await Pg.p.w(800); await Pg.p.screenshot({ path: process.env.SHOT + '/negocio.png', fullPage: true });
    await Pg.p.click('[data-lb]'); await Pg.p.w(500); await Pg.p.screenshot({ path: process.env.SHOT + '/visor.png' }); }
  check(!g.errs.length && !a.errs.length, 'sem erros de JavaScript', g.errs.concat(a.errs).join(' | '));
  await L.done();
})().catch(e => { console.log("ERRO", e && e.stack || e); process.exit(1); });
