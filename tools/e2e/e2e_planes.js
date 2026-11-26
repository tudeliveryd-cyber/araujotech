// 25/11 (refino): planos padronizados e seção de preços (/anunciar e /negocios) + seção "En portada" e cartões do Qué comer no início.
const L = require('./lib'); const { sec, check, info } = L;
(async () => {
  for (const pg of ['anunciar', 'negocios']) {
    sec('Planos em /' + pg);
    const P = await L.open(); const p = P.p;
    await p.goto('https://araujotechsistemas.com/guia/' + pg + '/'); await p.w(1500);
    const r = await p.evaluate(() => { const cs = [...document.querySelectorAll('.pz-c')]; return { n: cs.map(c => c.querySelector('h3').textContent), pr: cs.map(c => c.querySelector('.pz-pr b').textContent), ins: (document.querySelector('.pz-c-vx .pz-ins') || {}).textContent || '', mock: document.querySelectorAll('.pz-c .pz-m').length, wa: cs.map(c => (c.querySelector('.pz-wa') || {}).href || ''), hl: getComputedStyle(document.querySelector('.pz-c-po')).backgroundColor, over: document.documentElement.scrollWidth - innerWidth }; });
    info(JSON.stringify(Object.assign({}, r, { wa: r.wa.map(x => decodeURIComponent(x).slice(0, 90)) })));
    check(r.n.join('|') === 'Vitrix|Presencia + link|Recomendado|Portada' && r.pr.join('|') === 'Desde Gs. 150.000|Gs. 300.000|Gs. 450.000|Gs. 800.000', 'os 4 planos com nomes e preços combinados');
    check(/instalación desde Gs\. 350\.000/.test(r.ins), 'Vitrix mostra a instalação');
    check(r.mock === 4 && r.hl === 'rgb(36, 9, 63)', 'cada plano com exemplo visual; Portada em destaque (escuro)');
    check(r.wa.every(u => /^https:\/\/wa\.me\/595982086171\?text=/.test(u)) && decodeURIComponent(r.wa[3]).includes('Portada + link (Gs. 800.000 por mes)'), 'botão Contratar por WhatsApp de cada plano com a mensagem pronta');
    check(r.over <= 0, 'sem rolagem lateral no celular');
    const h = await p.evaluate(() => { const a = document.querySelector('.pz-c-rc .pz-wa'); a.addEventListener('click', e => e.preventDefault(), { once: true }); return null; });
    await p.evaluate(() => { localStorage.setItem('at_lang', 'pt'); }); await p.reload(); await p.w(1500);
    const pt = await p.evaluate(() => { const a = document.querySelector('.pz-c-po .pz-wa'); a.addEventListener('click', e => e.preventDefault()); a.click(); return { h: document.querySelector('.pz-c-po h3').textContent, b: document.querySelector('.pz-c-po .pz-wa').textContent, wa: decodeURIComponent(a.href), per: document.querySelector('.pz-c-pr .pz-pr small').textContent }; });
    info(JSON.stringify(pt));
    check(pt.h === 'Capa' && /Contratar pelo WhatsApp/.test(pt.b) && /Olá! Quero contratar Capa \+ link \(Gs\. 800\.000 por mês\)/.test(pt.wa) && pt.per === 'por mês', 'em português: textos e mensagem do WhatsApp em português');
    check(!p.errs.length, 'sem erros de JavaScript', p.errs.join(' | '));
    if (pg === 'anunciar') { await p.evaluate(() => { localStorage.setItem('at_lang', 'es'); }); await p.reload(); await p.w(1200);
      check(await p.locator('input[name=pl][value="Catálogo Vitrix (desde Gs. 150.000 por mes + instalación)"]').count() === 1, 'formulário: opção Catálogo Vitrix'); }
  }
  sec('Início: En portada e Qué comer');
  const G = await L.open(); const g = G.p;
  await g.goto('https://araujotechsistemas.com/guia/'); await g.w(2500);
  const h = await g.evaluate(async () => { const W = ms => new Promise(f => setTimeout(f, ms)); const A0 = G.ads, D0 = G.dir;
    G.ads = [{ id: 'p1', t: 'Anuncio Pago', s: 'Promo', u: 'https://exemplo.test/', img: '/sitio/gimg.php?i=p1&v=1' }, { id: 'p2', t: 'Da Casa', u: '', img: '/x.png', own: true }];
    const dd = [0,1,2,3,4,5,6].map(() => ({ on: true, a: ['00:00', '23:59'], b: ['', ''] }));
    G.dir = [{ id: 'q1', n: 'Comida Teste', g: 'food', td: true, wa: '0981000001', tu: ['de', 'al', 'me', 'ce'], dy: dd }];
    CAT = 'home'; render(); await W(80);
    const r = { por: [...document.querySelectorAll('#portada .por-c b')].map(b => b.textContent), ext: (document.querySelector('#portada a.por-c') || {}).target, qcv: document.querySelectorAll('#comer .qcv').length, ord: ['comer', 'portada', 'destacados'].map(id => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top) : -1; }) };
    G.ads = []; render(); await W(50); r.none = !document.getElementById('portada') || !/Anuncio Pago/.test(document.getElementById('portada').textContent);
    G.ads = A0; G.dir = D0; render(); return r; });
  info(JSON.stringify(h));
  check(h.por.includes('Anuncio Pago') && !h.por.includes('Da Casa') && h.ext === '_blank', '"En portada": mostra os anúncios pagos (não os da casa), abrindo o site do anunciante');
  check(h.none, 'sem anúncio pago, nada inventado na seção');
  check(h.qcv >= 1, 'cartões do Qué comer com a faixa de imagem');
  check(!g.errs.length, 'início sem erros de JavaScript', g.errs.join(' | '));
  L.done();
})().catch(e => { console.log('ERRO', e && e.stack || e); process.exit(1); });
