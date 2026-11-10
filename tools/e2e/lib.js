// Infra dos testes de ponta a ponta: navegador real + emulador oficial do Firebase (Firestore e Auth) com as regras do repositório.
// As páginas são as do repositório, servidas nos endereços oficiais (interceptados); o SDK do Firebase é o mesmo da produção,
// apenas apontado para o emulador. Nada toca a produção.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const REPO = path.join(__dirname, '..', '..');
const DIRS = { cat: REPO, site: path.join(REPO, 'araujo-tech-site'), barber: process.env.BARBER_DIR || path.join(REPO, '..', 'barber-a-loli'), pulpito: process.env.PULPITO_DIR || path.join(REPO, '..', 'meu-pulpito'), caja: process.env.CAJA_DIR || path.join(REPO, '..', 'caj-entrega') };
const SDK = process.env.SDK_DIR || path.join(REPO, '..', 'emu', 'pkg', 'sdk');
const FSH = '127.0.0.1', FSP = 8080, AUP = 9099;
const MIME = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', webp: 'image/webp', ico: 'image/x-icon', webmanifest: 'application/manifest+json', txt: 'text/plain', xml: 'text/xml', woff2: 'font/woff2' };
let fails = 0, oks = 0; const log = [];
const ok = m => { oks++; console.log('OK    | ' + m); log.push(['ok', m]); };
const bad = m => { fails++; console.log('FALHA | ' + m); log.push(['bad', m]); };
const info = m => console.log('INFO  | ' + m);
const sec = m => console.log('\n== ' + m);
const check = (c, m, extra) => c ? ok(m) : bad(m + (extra ? ' → ' + extra : ''));

function localFile(u) {
  const h = u.hostname, p = decodeURIComponent(u.pathname);
  let root, rel = p;
  if (h === 'araujotechsistemas.com' || h === 'www.araujotechsistemas.com') root = DIRS.site;
  else if (h === 'barberialoli.araujotechsistemas.com') root = DIRS.barber;
  else if (h.endsWith('.araujotechsistemas.com')) root = DIRS.cat;
  else if (h === 'meupulpito.com' || h === 'www.meupulpito.com') root = DIRS.pulpito;
  else if (h === 'tudeliveryd-cyber.github.io' && p.startsWith('/Caj-Entrega')) { root = DIRS.caja; rel = p.slice('/Caj-Entrega'.length) || '/'; }
  else return null;
  let f = path.join(root, rel);
  if (!f.startsWith(root)) return { status: 403 };
  try { if (fs.statSync(f).isDirectory()) { if (!p.endsWith('/')) return { redirect: u.origin + p + '/' + u.search }; f = path.join(f, 'index.html'); } } catch (e) {}
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return { file: f };
  if (root === DIRS.cat && fs.existsSync(path.join(root, '404.html')) && !/\.[a-z0-9]{2,5}$/i.test(p)) return { file: path.join(root, '404.html') }; // mesmo comportamento do .htaccess curinga
  return { status: 404 };
}
const emuWrap = (file, kind) => {
  const real = 'https://www.gstatic.com/firebasejs/10.12.2/' + file + '?real';
  if (kind === 'firestore') return `export * from '${real}';import * as R from '${real}';const seen=new WeakSet();export function getFirestore(...a){const db=R.getFirestore(...a);if(!seen.has(db)){seen.add(db);R.connectFirestoreEmulator(db,'${FSH}',${FSP})}return db}`;
  return `export * from '${real}';import * as R from '${real}';const seen=new WeakSet();export function getAuth(...a){const au=R.getAuth(...a);if(!seen.has(au)){seen.add(au);R.connectAuthEmulator(au,'http://${FSH}:${AUP}',{disableWarnings:true})}return au}`;
};
const COMPAT_PATCH = `;(function(){if(!self.firebase||firebase.__emu)return;firebase.__emu=1;const o=firebase.initializeApp;firebase.initializeApp=function(){const a=o.apply(this,arguments);try{a.firestore().useEmulator('${FSH}',${FSP})}catch(e){}try{a.auth().useEmulator('http://${FSH}:${AUP}',{disableWarnings:true})}catch(e){}return a}})();`;

async function route(ctx) {
  await ctx.route(u => u.protocol === 'https:', async r => {
    const u = new URL(r.request().url());
    try {
      if (u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/')) {
        const file = u.pathname.split('/').pop(); const f = path.join(SDK, file);
        if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' });
        let body = fs.readFileSync(f, 'utf8');
        if (u.search !== '?real') { if (file === 'firebase-firestore.js') body = emuWrap(file, 'firestore'); else if (file === 'firebase-auth.js') body = emuWrap(file, 'auth'); else if (/-compat\.js$/.test(file)) body += COMPAT_PATCH; }
        return r.fulfill({ status: 200, contentType: MIME.js, body, headers: { 'access-control-allow-origin': '*' } });
      }
      if (u.hostname === 'cdn.jsdelivr.net' && /zxing/.test(u.pathname) && fs.existsSync(path.join(SDK, 'zxing.min.js'))) return r.fulfill({ status: 200, contentType: MIME.js, body: fs.readFileSync(path.join(SDK, 'zxing.min.js')) });
      if (u.hostname === 'open.er-api.com') return r.fulfill({ status: 200, contentType: MIME.json, headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ result: 'success', rates: { USD: 1, PYG: 6250, BRL: 5.5 } }) });
      if (u.hostname === 'firestore.googleapis.com') { // páginas que usam a API REST direto (reservas, licenças): mesma rota no emulador
        const rq = r.request(); const h = {}; for (const [k, v] of Object.entries(rq.headers())) if (/^(content-type|authorization)$/i.test(k)) h[k] = v;
        const rs = await fetch('http://' + FSH + ':' + FSP + u.pathname + u.search, { method: rq.method(), headers: h, body: ['GET', 'HEAD'].includes(rq.method()) ? undefined : rq.postData() });
        return r.fulfill({ status: rs.status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: await rs.text() }); }
      const lf = localFile(u);
      if (!lf) return r.abort();
      if (lf.redirect) return r.fulfill({ status: 301, headers: { location: lf.redirect } });
      if (lf.status) return r.fulfill({ status: lf.status, body: 'nao encontrado' });
      const ext = lf.file.split('.').pop().toLowerCase();
      return r.fulfill({ status: 200, contentType: MIME[ext] || 'application/octet-stream', body: fs.readFileSync(lf.file) });
    } catch (e) { try { await r.abort(); } catch (x) {} }
  });
}
let browser;
async function open(opt = {}) {
  if (!browser) browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--disable-web-security', '--allow-running-insecure-content', '--disable-features=PrivateNetworkAccessSendPreflights,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessRespectPreflightResults,LocalNetworkAccessChecks'] });
  const W = opt.w || 390;
  const ctx = await browser.newContext({ viewport: { width: W, height: W < 500 ? 844 : 800 }, isMobile: W < 500, hasTouch: W < 500, timezoneId: 'America/Asuncion', locale: opt.locale || 'es-PY', serviceWorkers: 'block' });
  await route(ctx);
  const p = await ctx.newPage(); p.errs = []; p.dialogs = []; p.autoDialog = true;
  p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 200)));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') { const t = m.text(); if (!/Failed to load resource|net::ERR|ERR_FAILED|favicon|emulator/i.test(t)) (p.cons = p.cons || []).push(t.slice(0, 220)); } });
  p.on('dialog', d => { p.dialogs.push(d.message()); if (p.autoDialog) d.accept().catch(() => {}); else d.dismiss().catch(() => {}); });
  await p.addInitScript(() => { window.__opened = []; const o = window.open; window.open = (u) => { window.__opened.push(String(u)); return null; }; });
  p.w = ms => p.waitForTimeout(ms || 400);
  p.act = async (a, extra, n) => { const l = p.locator('[data-act=' + a + ']' + (extra || '') + ':visible'); const c = await l.count(); if (!c) return false; await (n == null ? l.first() : l.nth(n)).click(); await p.w(); return true; };
  p.set = async (sel, v) => { await p.fill(sel, v); await p.dispatchEvent(sel, 'input'); await p.dispatchEvent(sel, 'change'); };
  p.txt = async sel => p.evaluate(sel => { const s = document.querySelector(sel || 'body'); return s ? s.innerText.replace(/\n+/g, ' / ') : '(nada)'; }, sel);
  p.dump = async (t, n) => console.log('   · ' + t + ': ' + (await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-act],input[id],select[id],textarea[id],button[type=submit]')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.dataset.act ? '@' + e.dataset.act + (e.dataset.tab ? '=' + e.dataset.tab : '') + (e.dataset.t ? '=' + e.dataset.t : '') + (e.dataset.v ? '=' + e.dataset.v : '') : '#' + (e.id || 'submit') + '(' + e.tagName[0] + (e.type || '') + ')')))].join(' '))).slice(0, n || 900) + '\n     TXT ' + (await p.txt()).slice(0, n || 500));
  return { ctx, p };
}
// ---- acesso direto ao emulador (preparação e conferência) ----
const FSB = proj => `http://${FSH}:${FSP}/v1/projects/${proj}/databases/(default)/documents`;
async function signUp(email, password) { const r = await fetch(`http://${FSH}:${AUP}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) }); return r.json(); }
async function signIn(email, password) { const r = await fetch(`http://${FSH}:${AUP}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) }); return r.json(); }
// requisição ao Firestore: token = idToken de usuário (regras valem), 'owner' (ignora regras, só para preparar/conferir) ou null (anônimo)
async function fsReq(proj, method, docPath, token, body) { const h = { 'content-type': 'application/json' }; if (token) h.authorization = 'Bearer ' + token; const r = await fetch(FSB(proj) + '/' + docPath, { method, headers: h, body: body ? JSON.stringify(body) : undefined }); let j = null; try { j = await r.json(); } catch (e) {} return { status: r.status, json: j }; }
const val = v => v == null ? { nullValue: null } : typeof v === 'string' ? { stringValue: v } : typeof v === 'boolean' ? { booleanValue: v } : Number.isInteger(v) ? { integerValue: String(v) } : typeof v === 'number' ? { doubleValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(val) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x)])) } };
const fields = o => ({ fields: Object.fromEntries(Object.entries(o).map(([k, x]) => [k, val(x)])) });
const unval = v => !v ? null : 'stringValue' in v ? v.stringValue : 'integerValue' in v ? +v.integerValue : 'doubleValue' in v ? v.doubleValue : 'booleanValue' in v ? v.booleanValue : 'arrayValue' in v ? (v.arrayValue.values || []).map(unval) : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, unval(x)])) : 'timestampValue' in v ? v.timestampValue : null;
const unfields = d => d && d.fields ? Object.fromEntries(Object.entries(d.fields).map(([k, x]) => [k, unval(x)])) : null;
async function done() { if (browser) await browser.close(); console.log('\n== RESULTADO: ' + oks + ' aprovado(s), ' + fails + ' falha(s)'); if (process.env.E2E_OUT) fs.writeFileSync(process.env.E2E_OUT, JSON.stringify(log)); process.exit(fails ? 1 : 0); }
module.exports = { open, ok, bad, info, sec, check, signUp, signIn, fsReq, fields, unfields, val, done, DIRS, get fails() { return fails; } };
