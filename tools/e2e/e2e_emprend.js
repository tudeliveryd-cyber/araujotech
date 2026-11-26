// 26/11: empreendedores sem local físico (modalidade), busca melhor (serviços, cidade, modalidade, várias palavras) e filtro por cidade nos resultados.
const L = require('./lib'); const P = 'araujotech-catalogos';
const { sec, check, info } = L; const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
(async () => {
  const ADM = ['admin@araujotechsistemas.com', 'AdminTeste#2026']; await L.signUp(...ADM);
  await L.fsReq(P, 'PATCH', 'platform/sitio', 'owner', L.fields({ gdir: [
    { id: 'fis1', n: 'Ferretería Centro', g: 'shop', d: 'Ferretería', wa: '0981 300 001', tel: '', a: 'Av. Central 50', map: '', hrs: '', ig: '', lg: '', tu: [], td: false, pr: true, on: true },
    { id: 'out1', n: 'Taller Monday', g: 'car', d: 'Taller mecánico', wa: '0981 300 002', tel: '', a: 'Ruta 6', map: '', hrs: '', ig: '', lg: '', tu: [], td: false, pr: true, on: true, ci: 'Santa Rosa del Monday' },
    { id: 'sina1', n: 'Cocina de Lu', g: 'food', d: 'Comidas por pedido', wa: '0981 300 005', tel: '', a: '', map: 'https://maps.app.goo.gl/abc123', hrs: '', ig: '', lg: '', tu: [], td: true, pr: false, on: true }] }));
  sec('A. Central: "Cómo atiende" no registro rápido e na ficha');
  const A = await L.open({ w: 1366 }); const a = A.p; const doc = async () => L.unfields((await L.fsReq(P, 'GET', 'platform/sitio', 'owner')).json);
  await a.goto('https://araujotechsistemas.com/admin/'); await a.w(2500);
  await a.fill('#lg_user', ADM[0]); await a.fill('#lg_pass', ADM[1]); await a.press('#lg_pass', 'Enter'); await a.w(5000);
  await a.evaluate(() => { ui.view = 'platform'; render(); }); await a.w(400);
  await a.act('guquick'); await a.w(2500); await a.act('qknew'); await a.w(400);
  check(await a.locator('[data-act="qkmo"]').count() === 5 && /Venta por pedido/.test(await a.txt()) && /Atención con cita previa/.test(await a.txt()), 'registro rápido: 5 formas de atender (físico, a domicilio, por pedido, con cita, solo delivery)');
  await a.fill('#qk_n', 'Dulces de Ana'); await a.fill('#qk_d', 'Tortas y bocaditos por encargo'); await a.locator('#qk_g').selectOption('food'); await a.w(200); await a.fill('#qk_tel', '0981 300 003');
  await a.act('qkmo', '[data-k="ped"]'); await a.w(300);
  check(/no son obligatorias/.test(await a.txt()) && await a.evaluate(() => document.getElementById('qk_n').value) === 'Dulces de Ana', 'aviso de que endereço/ubicação não são obrigatórios, sem perder o que foi digitado');
  await a.act('qksave'); await a.w(3500);
  let d = await doc(); const ana = (d.gdir || []).find(x => x.n === 'Dulces de Ana');
  check(ana && ana.mo === 'ped' && !ana.map && !ana.a && ana.on === true, 'salva sem endereço nem ubicación, como "Venta por pedido"', JSON.stringify(ana && { mo: ana.mo, map: ana.map, a: ana.a }));
  await a.evaluate(() => { closeSheet(); ui.gu = null; render(); }); await a.w(300);
  await a.act('gusite'); await a.w(2500); await a.evaluate(() => { ui.guSt = null; ui.guNav = { sec: 'neg', g: 'shop', t: '*' }; guSheet(); }); await a.w(600);
  const fi = await a.evaluate(() => ui.gu.dir.findIndex(x => x.id === 'fis1'));
  await a.act('gudirmo', `[data-i="${fi}"][data-k="dom"]`); await a.w(300); await a.act('gudirmo', `[data-i="${fi}"][data-k=""]`); await a.w(300);
  await a.act('gusave'); await a.w(4000); d = await doc();
  check(((d.gdir || []).find(x => x.id === 'fis1') || {}).mo === '' && ((d.gdir || []).find(x => x.n === 'Dulces de Ana') || {}).mo === 'ped', 'ficha completa: trocar a forma de atender e voltar a "Establecimiento físico"');
  { const tm = (d.gdir || []).find(x => x.id === 'out1') || {}; check(tm.ci === 'Santa Rosa del Monday', 'abrir e salvar a Guía completa não apaga a cidade de outras fichas', JSON.stringify(tm.ci)); }
  check(!a.errs.length, 'Central sem erros de JavaScript', a.errs.join(' | '));

  sec('B. Servidor: página do negócio e link do Instagram sem endereço de loja');
  const env = () => Object.assign({}, process.env, { TMPDIR: fs.mkdtempSync(path.join(os.tmpdir(), 'gemp-')), GUIA_FS_BASE: 'http://127.0.0.1:8080' });
  const php = (code, dir) => cp.execFileSync('php', ['-r', code], { cwd: path.join(L.DIRS.site, dir || 'sitio'), env: env(), timeout: 40000 }).toString();
  const dir = JSON.parse(php("require 'prods_lib.php'; require 'guia_lib.php'; echo json_encode(guia_pub()['dir']);"));
  const an = dir.find(x => x.n === 'Dulces de Ana') || {}, fe = dir.find(x => x.id === 'fis1') || {};
  check(an.mo === 'ped' && fe.mo === '' && an.sl, 'a Guía recebe a forma de atender', JSON.stringify({ an: an.mo, fe: fe.mo, sl: an.sl }));
  const h = php(`$_SERVER['HTTP_HOST'] = 'guiadesantarita.com'; $_GET = ['k' => 'negocio', 'id' => '${an.sl}']; include 'p.php';`, 'guia');
  const hv = h.replace(/'(Cómo llegar|Ubicación|Dirección)':/g, ''); check(/Venta por pedido/.test(h) && !/Cómo llegar/.test(hv) && !/class="sh2">Ubicación/.test(h) && !/"streetAddress":"/.test(h) && !/hasMap":"/.test(h) && /"areaServed":"Santa Rita"/.test(h), 'página do negócio: mostra "Venta por pedido", sem "Cómo llegar", sem mapa e sem endereço falso no Google');
  const hf = php(`$_SERVER['HTTP_HOST'] = 'guiadesantarita.com'; $_GET = ['k' => 'negocio', 'id' => '${fe.sl}']; include 'p.php';`, 'guia');
  check(/Cómo llegar/.test(hf) && /Av\. Central 50/.test(hf), 'loja física continua com "Cómo llegar" e endereço');
  const lu = dir.find(x => x.id === 'sina1') || {}; const hl = php(`$_SERVER['HTTP_HOST'] = 'guiadesantarita.com'; $_GET = ['k' => 'negocio', 'id' => '${lu.sl}']; include 'p.php';`, 'guia');
  check(!/Cómo llegar/.test(hl.replace(/'(Cómo llegar|Ubicación)':/g, '')) && !/class="sh2">Ubicación/.test(hl) && !/output=embed/.test(hl) && /Cocina de Lu/.test(hl), 'sem endereço cadastrado (só link do mapa): página sem mapa e sem "Cómo llegar"');
  check(!/class="sh2">Horarios/.test(h) && !/class="sh2">Horarios/.test(hl), 'sem horário cadastrado: a página não mostra horários inventados');
  const hlb = php(`$_GET = ['id' => '${lu.sl}']; include 'bio.php';`, 'guia'); check(!/Cómo llegar/.test(hlb.replace(/'Cómo llegar':/g, '')), 'link do Instagram sem "Cómo llegar" quando não há endereço');
  const bio = php(`$_GET = ['id' => '${an.sl}']; include 'bio.php';`, 'guia');
  const bv = bio.replace(/'(Cómo llegar|Dirección)':/g, ''); check(!/Cómo llegar/.test(bv) && !/Dirección/.test(bv) && /Dulces de Ana/.test(bio), 'link do Instagram (/l/) sem "Cómo llegar" nem endereço');

  sec('C. Guía: cartões, busca e filtro por cidade');
  const G = await L.open(); const g = G.p; await g.goto('https://araujotechsistemas.com/guia/'); await g.w(2500);
  const r = await g.evaluate(async (dd) => { const W = ms => new Promise(f => setTimeout(f, ms)); const D0 = G.dir;
    G.dir = dd.concat([{ id: 'sv1', n: 'Clara Uñas', g: 'health', d: 'Manicura', wa: '0981 300 004', mo: 'dom', sv: [{ t: 'Esmaltado semipermanente' }], pr: true }]);
    const find = async q => { document.getElementById('q').value = q; document.getElementById('q').dispatchEvent(new Event('input', { bubbles: true })); await W(350); return [...document.querySelectorAll('#list .cc h3, #list .card h3')].map(x => x.textContent.trim()); };
    const o = {}; o.enc = await find('encomienda'); o.ped = await find('por pedido'); o.dom = await find('a domicilio'); o.sv = await find('semipermanente'); o.multi = await find('ana tortas'); o.city = await find('santa rosa');
    o.loc = document.querySelectorAll('#list [data-locf]').length;
    CAT = 'all'; document.getElementById('q').value = ''; render(); await W(80); o.allLoc = document.querySelectorAll('#list [data-locf]').length;
    document.querySelector('#list [data-locf="out"]') && document.querySelector('#list [data-locf="out"]').click(); await W(80); o.out = [...document.querySelectorAll('#list .cc h3, #list .card h3')].map(x => x.textContent.trim()); LOCF = '';
    CAT = 'food'; render(); await W(80); const c = [...document.querySelectorAll('.cc.dir')].find(x => /Dulces de Ana/.test(x.textContent)); o.card = c ? { map: [...c.querySelectorAll('.cc-ac a')].some(a => /Mapa/.test(a.textContent)), moc: (c.querySelector('.moc') || {}).textContent || '' } : null;
    CAT = 'car'; G.dir = G.dir.concat([{ id: 'sr2', n: 'Taller Centro', g: 'car', d: 'Taller', wa: '0981 300 006', a: 'Calle 1', pr: true }]); render(); await W(80);
    const gr = document.querySelector('.cpg .grid'); const kids = gr ? [...gr.children].map(e => e.classList.contains('lc-sep') ? 'SEP' : (e.querySelector('h3') || {}).textContent) : []; o.sep = kids.join('|');
    const pin = document.querySelector('.locf [data-locf="sr"] svg'); o.pin = pin ? Math.round(pin.getBoundingClientRect().height) : -1;
    CAT = 'food'; L = 'pt'; render(); await W(50); const c2 = [...document.querySelectorAll('.cc.dir')].find(x => /Dulces de Ana/.test(x.textContent)); o.pt = c2 ? (c2.querySelector('.moc') || {}).textContent : ''; L = 'es';
    CAT = 'home'; G.dir = D0; render(); return o; }, dir);
  info(JSON.stringify(r));
  check(r.enc.includes('Dulces de Ana') && r.ped.includes('Dulces de Ana'), 'busca "encomienda" e "por pedido" encontram quem vende por pedido');
  check(r.dom.includes('Clara Uñas') && r.sv.includes('Clara Uñas'), 'busca por "a domicilio" e por um serviço da ficha');
  check(r.multi.includes('Dulces de Ana'), 'busca com várias palavras (nome + o que vende)');
  check(r.city.includes('Taller Monday') && !r.city.includes('Ferretería Centro'), 'busca pela cidade ("santa rosa")');
  check(r.allLoc === 3 && r.out.join() === 'Taller Monday', 'filtro por cidade também em "todos": Otras ciudades mostra só quem é de fora');
  check(r.card && !r.card.map && r.card.moc === 'Venta por pedido' && r.pt === 'Venda por encomenda', 'cartão sem botão de mapa e com "Venta por pedido" (PT: "Venda por encomenda")');
  check(/^Taller Centro\|SEP\|Taller Monday$/.test(r.sep), 'categoria: Santa Rita primeiro e "Otras ciudades cercanas" separado', r.sep);
  check(r.pin > 0 && r.pin <= 18, 'ícone do filtro Santa Rita / Otras ciudades no tamanho do texto', String(r.pin));
  check(!g.errs.length, 'Guía sem erros de JavaScript', g.errs.join(' | '));
  L.done();
})().catch(e => { console.log('ERRO', e && e.stack || e); process.exit(1); });
