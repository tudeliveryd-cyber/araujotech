// somente leitura: confere se a rolagem suave da Guía anda de verdade neste navegador (toque em "Categorías" da barra de baixo).
// Serve para separar defeito do sistema de limitação do navegador de teste: mede a rolagem com a página na frente,
// com outra aba aberta por cima e depois de voltar para a frente.
//   node tools/diag/rolar.js [endereço]
const { chromium, devices } = require('playwright');
(async () => {
  const url = process.argv[2] || 'https://guiadesantarita.com/';
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices[process.env.DEV || 'Pixel 5'], locale: 'es-PY', timezoneId: 'America/Asuncion' });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(4000);
  const medir = nome => p.evaluate(async nome => { const W = ms => new Promise(f => setTimeout(f, ms)); window.scrollTo(0, 0); await W(150);
    let raf = 0, on = true; const tick = () => { raf++; if (on) requestAnimationFrame(tick); }; requestAnimationFrame(tick); await W(500); on = false; const fps = raf * 2;
    const c0 = document.getElementById('cats'); const alvo = c0 ? Math.round(c0.getBoundingClientRect().top + scrollY - 76) : null;
    const bt = document.querySelector('#bnav [data-b=cats]'); if (!bt) return { nome, erro: 'sem botão Categorías' }; bt.click();
    const ys = []; for (let k = 0; k < 20; k++) { await W(100); ys.push(Math.round(scrollY)); }
    const c = document.getElementById('cats').getBoundingClientRect();
    return { nome, vis: document.visibilityState, foco: document.hasFocus(), quadrosPorSegundo: fps, alvo, y: ys.filter((v, i) => i % 2 === 1 || i === 0).join(','), fim: Math.round(scrollY), chegou: c.top < innerHeight && c.bottom > 0 && Math.abs(c.top - 76) < 60 }; }, nome);
  console.log('ROLAR ' + JSON.stringify(await medir('1. página sozinha')));
  const p2 = await ctx.newPage(); await p2.goto('about:blank');
  console.log('ROLAR ' + JSON.stringify(await medir('2. com outra aba aberta por cima')));
  await p.bringToFront();
  console.log('ROLAR ' + JSON.stringify(await medir('3. de volta para a frente')));
  await p2.close();
  console.log('ROLAR ' + JSON.stringify(await medir('4. outra aba fechada')));
  // 5. a mesma sequência do teste automático (várias telas seguidas e, logo depois, o toque em "Categorías"), anotando quem manda rolar
  const seq = await p.evaluate(async () => { const W = ms => new Promise(f => setTimeout(f, ms)); const log = [], st = performance.now(), T = () => Math.round(performance.now() - st);
    const o = window.scrollTo.bind(window); window.scrollTo = function (...a) { log.push(T() + ' scrollTo ' + JSON.stringify(a.length === 1 ? a[0] : a) + ' y=' + Math.round(scrollY) + ' ' + (new Error().stack || '').split('\n').slice(2, 4).map(x => x.trim().replace(/https?:\/\/[^ )]*\//, '').slice(0, 50)).join(' < ')); return o(...a); };
    addEventListener('popstate', e => log.push(T() + ' popstate ' + JSON.stringify(e.state).slice(0, 80)));
    const hb = history.back.bind(history); history.back = function () { log.push(T() + ' history.back'); return hb(); };
    window.scrollTo(0, 0); await W(200);
    document.querySelector('#bnav [data-b="home"]').click(); await W(50);
    document.querySelector('#bnav [data-b="more"]').click(); await W(50);
    document.querySelector('#more [data-go="util"]').click(); await W(80);
    UFULL = false; document.querySelector('#bnav [data-b="map"]').click(); await W(50);
    MAPON = false; document.querySelector('.mnav [data-go="all"]').click(); await W(50);
    goHome(); render(); await W(5);
    goHome(); render(); await W(30); SL.sig = ''; slRender(); log.push(T() + ' toque em Categorías y=' + Math.round(scrollY));
    document.querySelector('#bnav [data-b=cats]').click(); const ys = []; for (let k = 0; k < 30; k++) { await W(100); ys.push(Math.round(scrollY)); }
    const c = document.getElementById('cats').getBoundingClientRect(); window.scrollTo = o; history.back = hb;
    return { y: ys.filter((v, i) => i % 3 === 0).join(','), fim: Math.round(scrollY), topoCats: Math.round(c.top), chegou: c.top < innerHeight && c.bottom > 0 && Math.abs(c.top - 76) < 60, log }; });
  console.log('ROLAR ' + JSON.stringify({ nome: '5. sequência do teste', y: seq.y, fim: seq.fim, topoCats: seq.topoCats, chegou: seq.chegou })); for (const l of seq.log) console.log('  LOG ' + l);
  // 6. como nos testes automáticos: outra janela (outro contexto) aberta depois desta
  const ctx2 = await b.newContext({ ...devices[process.env.DEV || 'Pixel 5'] }); const q = await ctx2.newPage(); await q.goto(url, { waitUntil: 'load', timeout: 60000 }).catch(() => {}); await q.waitForTimeout(1500);
  console.log('ROLAR ' + JSON.stringify(await medir('6. com outra janela aberta depois')));
  await q.evaluate(() => window.scrollTo(0, 50)).catch(() => {}); await q.waitForTimeout(300);
  console.log('ROLAR ' + JSON.stringify(await medir('7. depois de mexer na outra janela')));
  await p.bringToFront();
  console.log('ROLAR ' + JSON.stringify(await medir('8. esta janela trazida para a frente')));
  await ctx2.close();
  console.log('ERROS ' + (errs.join(' | ') || 'nenhum'));
  await b.close();
})().catch(e => { console.log('FALHA ' + (e && e.stack || e)); process.exit(1); });
