// Diagnóstico de uma loja real (SÓ LEITURA): tamanho dos dados que o painel baixa e quanto tempo a tela de login leva para ficar pronta.
const { chromium } = require('playwright');
const LOJA = process.env.LOJA || 'nauticabrustolin';
const KEY = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
const FS = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents';
const kb = n => Math.round(n / 1024) + ' KB';
(async () => {
  if (/^\*/.test(LOJA)) { const q = LOJA.slice(1).toLowerCase(); let tok = '', ids = []; do { const r = await (await fetch(FS + '/shops?pageSize=300&mask.fieldPaths=status' + (tok ? '&pageToken=' + tok : '') + '&key=' + KEY)).json(); (r.documents || []).forEach(d => ids.push(d.name.split('/').pop())); tok = r.nextPageToken || ''; if (r.error) { console.log('erro: ' + JSON.stringify(r.error).slice(0, 200)); break; } } while (tok); console.log('lojas (' + ids.length + '): ' + ids.filter(i => !q || i.includes(q)).join(', ')); return; }
  const t0 = Date.now(); const r = await fetch(FS + '/shops/' + LOJA + '?key=' + KEY); const txt = await r.text();
  console.log('loja ' + LOJA + ': HTTP ' + r.status + ', documento ' + kb(txt.length) + ' em ' + (Date.now() - t0) + ' ms');
  let n = 0; try { const f = JSON.parse(txt).fields || {}; n = +(f.mediaCount && f.mediaCount.integerValue || 0); console.log('campos: ' + Object.keys(f).map(k => k + ':' + kb(JSON.stringify(f[k]).length)).join(', ')); } catch (e) {}
  let tot = 0; for (let i = 0; i < Math.max(n, 1); i++) { const t = Date.now(); const m = await fetch(FS + '/shops/' + LOJA + '/media/p' + i + '?key=' + KEY); const s = await m.text(); tot += s.length; let k = 0; try { k = Object.keys(JSON.parse(s).fields.m.mapValue.fields).length } catch (e) {} console.log('  imagens p' + i + ': HTTP ' + m.status + ', ' + kb(s.length) + ', ' + k + ' imagens, ' + (Date.now() - t) + ' ms'); }
  console.log('total de imagens: ' + kb(tot));
  const b = await chromium.launch();
  for (const [net, path] of [['rápida', '/#painel'], ['rápida', '/painel/'], ['4G lento', '/painel/']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('response', x => { if (x.status() >= 400) errs.push(x.status() + ' ' + x.url().slice(0, 140)); }); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    if (net !== 'rápida') { const c = await ctx.newCDPSession(p); await c.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.5e6 / 8, uploadThroughput: 750e3 / 8 }); }
    const t = Date.now(); await p.goto('https://' + LOJA + '.araujotechsistemas.com' + path, { waitUntil: 'load', timeout: 90000 });
    const tl = Date.now() - t; let pronto = -1;
    try { await p.waitForFunction(() => { const b = document.querySelector('#loginForm button[type=submit]'); return b && !b.disabled; }, null, { timeout: 45000 }); pronto = Date.now() - t; } catch (e) {}
    const st = await p.evaluate(() => ({ url: location.href, mode: typeof MODE !== 'undefined' ? MODE : '?', loading: typeof CLOUD !== 'undefined' ? CLOUD.loading : '?', boot: typeof CLOUD !== 'undefined' ? CLOUD.boot : '?', api: typeof CLOUD !== 'undefined' ? !!CLOUD.api : '?', err: typeof CLOUD !== 'undefined' ? CLOUD.err : '?', form: !!document.querySelector('#loginForm'), btn: (document.querySelector('#loginForm button[type=submit]') || {}).textContent, txt: document.body.innerText.slice(0, 160).replace(/\n+/g, ' / ') })).catch(e => String(e));
    console.log('   estado: ' + JSON.stringify(st));
    console.log('[' + net + ' ' + path + '] página carregou em ' + tl + ' ms; botão Ingresar pronto em ' + (pronto < 0 ? 'NUNCA (90 s)' : pronto + ' ms') + (errs.length ? '; avisos: ' + errs.slice(0, 5).join(' | ') : ''));
    await ctx.close();
  }

  // catálogo: o que aparece na tela ao longo do tempo (1ª e 2ª visita)
  for (const net of ['rápida', '4G lento']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    if (net !== 'rápida') { const c = await ctx.newCDPSession(p); await c.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.5e6 / 8, uploadThroughput: 750e3 / 8 }); }
    for (const vis of ['1ª', '2ª']) {
      const t = Date.now(); await p.goto('https://' + LOJA + '.araujotechsistemas.com/', { waitUntil: 'commit', timeout: 90000 }); const seen = [];
      for (const ms of [500, 1000, 1500, 2000, 3000, 4000, 6000, 9000]) { await p.waitForTimeout(Math.max(0, ms - (Date.now() - t))); const st = await p.evaluate(() => ({ h: (document.querySelector('.chead h1') || {}).textContent || '', pc: document.querySelectorAll('.pcard').length, img: !!document.querySelector('.chead-in .logo img'), body: document.body ? document.body.innerText.slice(0, 70).replace(/\n+/g, ' / ') : '' })).catch(e => ({ err: String(e).slice(0, 60) })); seen.push(ms + 'ms: ' + JSON.stringify(st)); }
      console.log('[catálogo ' + net + ' ' + vis + ' visita]'); seen.forEach(x => console.log('   ' + x));
    }
    if (errs.length) console.log('   erros: ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close();
})();
