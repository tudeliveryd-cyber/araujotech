// 25/11 (refino): planos padronizados e seção de preços (/anunciar e /negocios) + seção "En portada" e cartões do Qué comer no início.
const L = require('./lib'); const { sec, check, info } = L;
(async () => {
  for (const pg of ['anunciar', 'negocios']) {
    sec('Planos em /' + pg);
    const P = await L.open(); const p = P.p;
    await p.goto('https://araujotechsistemas.com/guia/' + pg + '/'); await p.w(1500);
    const r = await p.evaluate(() => { const cs = [...document.querySelectorAll('.pz-c')]; return { n: cs.map(c => c.querySelector('h3').textContent), pr: cs.map(c => c.querySelector('.pz-pr b').textContent), ins: (document.querySelector('.pz-c-vx .pz-ins') || {}).textContent || '', mock: document.querySelectorAll('.pz-c .pz-m').length, wa: cs.map(c => (c.querySelector('.pz-wa') || {}).href || ''), hl: getComputedStyle(document.querySelector('.pz-c-po')).backgroundColor, over: document.documentElement.scrollWidth - innerWidth }; });
    info(JSON.stringify(Object.assign({}, r, { wa: r.wa.map(x => decodeURIComponent(x).slice(0, 90)) })));
    check(await p.locator('.pz-dif').count() === 1 && /Producto de Araújo Tech, con sus propios planes/.test(await p.locator('.pz-dif').textContent()), 'explica a diferença entre o catálogo Vitrix e os planos da Guía');
    check(r.n.join('|') === 'Vitrix|Presencia + link|Recomendado|Portada' && r.pr.join('|') === 'Desde Gs. 150.000|Gs. 300.000|Gs. 450.000|Gs. 800.000', 'os 4 planos com nomes e preços combinados');
    check(/instalación desde Gs\. 350\.000/.test(r.ins), 'Vitrix mostra a instalação');
    check(r.mock === 4 && r.hl === 'rgb(36, 9, 63)', 'cada plano com exemplo visual; Portada em destaque (escuro)');
    check(r.wa.every(u => /^https:\/\/wa\.me\/595982086171\?text=/.test(u)) && decodeURIComponent(r.wa[3]).includes('Portada (Gs. 800.000 por mes)'), 'botão Contratar por WhatsApp de cada plano com a mensagem pronta');
    check(r.over <= 0, 'sem rolagem lateral no celular');
    const h = await p.evaluate(() => { const a = document.querySelector('.pz-c-rc .pz-wa'); a.addEventListener('click', e => e.preventDefault(), { once: true }); return null; });
    await p.evaluate(() => { localStorage.setItem('at_lang', 'pt'); }); await p.reload(); await p.w(1500);
    const pt = await p.evaluate(() => { const a = document.querySelector('.pz-c-po .pz-wa'); a.addEventListener('click', e => e.preventDefault()); a.click(); return { h: document.querySelector('.pz-c-po h3').textContent, b: document.querySelector('.pz-c-po .pz-wa').textContent, wa: decodeURIComponent(a.href), per: document.querySelector('.pz-c-pr .pz-pr small').textContent }; });
    info(JSON.stringify(pt));
    check(pt.h === 'Capa' && /Contratar pelo WhatsApp/.test(pt.b) && /Olá! Quero contratar Capa \(Gs\. 800\.000 por mês\)/.test(pt.wa) && pt.per === 'por mês', 'em português: textos e mensagem do WhatsApp em português');
    check(!p.errs.length, 'sem erros de JavaScript', p.errs.join(' | '));
    { await p.evaluate(() => { localStorage.setItem('at_lang', 'es'); }); await p.reload(); await p.w(1200);
      const fo = await p.evaluate(() => { const card = [...document.querySelectorAll('.pz-c h3')].map(h => h.textContent); const rad = [...document.querySelectorAll('input[name=pl]')].map(i => i.value); return { card, rad }; });
      info(JSON.stringify(fo));
      check(!fo.rad.some(v => /^(Premium|VIP|Esencial o Crecimiento)$/.test(v) || /\+ link \(Gs\. (450|800)/.test(v)), 'formulário sem opções antigas (Premium/VIP soltos, "Recomendado + link")');
      check(['Presencia + link (Gs. 300.000 por mes)', 'Recomendado (Gs. 450.000 por mes)', 'Portada (Gs. 800.000 por mes)', 'Vitrix — Catálogo online (desde Gs. 150.000 por mes + instalación)'].every(v => fo.rad.includes(v)), 'formulário com os mesmos nomes e preços dos cartões');
      // envio: escolhe Recomendado e confere a mensagem que vai ao WhatsApp
      await p.fill('#n', 'Negocio Prueba'); await p.locator('#r').selectOption({ index: 1 }); await p.fill('#p', 'Ana'); await p.fill('#w', '0981 123 456');
      await p.check('input[name=pl][value="Recomendado (Gs. 450.000 por mes)"]');
      const url = await new Promise(async res => { p.on('request', rq => { if (/wa\.me/.test(rq.url())) res(rq.url()); }); await p.route(/wa\.me/, r => r.abort()); await p.evaluate(() => document.querySelector('#f button[type=submit], #f .go, form#f [type=submit]').click()); setTimeout(() => res(''), 4000); });
      const msg = decodeURIComponent(url.split('text=')[1] || ''); info(msg.replace(/\n/g, ' | '));
      check(/wa\.me\/595982086171/.test(url) && /Negocio Prueba/.test(msg) && /Ana/.test(msg) && /0981 123 456/.test(msg) && /Recomendado \(Gs\. 450\.000 por mes\)/.test(msg), 'formulário: os dados e o plano certo chegam no WhatsApp'); }
    await p.goto('https://araujotechsistemas.com/guia/' + pg + '/'); await p.w(1200);
    if (pg === 'anunciar') {
      check(await p.locator('input[name=pl][value="Vitrix — Catálogo online (desde Gs. 150.000 por mes + instalación)"]').count() === 1, 'formulário: opção Catálogo Vitrix'); }
  }
  sec('Início (rev3): seções, nível do anúncio e cidade');
  { const D = await L.open({ w: 1366 }); const d = D.p; await d.goto('https://araujotechsistemas.com/guia/'); await d.w(2500);
    const r3 = await d.evaluate(async () => { const W = ms => new Promise(f => setTimeout(f, ms)); const L0 = LIST, D0 = G.dir, I0 = Object.assign({}, INFO);
      LIST = [{ id: 'nau', name: 'Náutica X', _g: 'car', segEs: 'Náutica', city: 'Santa Rosa del Monday', vip: true, dest: true }, { id: 'tie', name: 'Tienda X', _g: 'shop', segEs: 'Ropa', city: 'Santa Rita', dest: true }];
      G.dir = [{ id: 'od', n: 'Odonto X', g: 'health', d: 'Odontología', pr: true, rc: true, po: true, wa: '0981000003' }, { id: 'ab', n: 'Abogado X', g: 'serv', d: 'Abogados', pr: true, wa: '0981000004', ci: 'Santa Rosa del Monday' }].concat(Array.from({ length: 10 }, (_, i) => ({ id: 'td' + i, n: 'Aliado ' + i, g: 'food', td: true, wa: '098100001' + i, tu: ['de', 'al', 'me', 'ce'] })));
      CAT = 'home'; render(); await W(80);
      const sec = id => { const e = document.getElementById(id); return e ? { n: [...e.querySelectorAll('.bz-n')].map(b => b.textContent), btn: [...e.querySelectorAll('.sec-all [data-c]')].map(b => b.dataset.c), po: e.querySelectorAll('.bz.t-po').length, cty: [...e.querySelectorAll('.cty')].map(x => x.textContent) } : null; };
      const r = { com: sec('sec-com'), srv: sec('sec-srv'), sal: sec('sec-sal'), gas: !!document.querySelector('#comer .sec-all [data-c="food"]'), rc: document.querySelectorAll('#aliados .fc').length, rcAll: !!document.querySelector('#aliados .sec-all a') };
      document.querySelector('#sec-com .sec-all [data-c="car"]').click(); await W(80); r.cat = CAT;
      const names = () => [...document.querySelectorAll('.cpg .cc h3')].map(h => h.textContent.trim());
      CAT = 'serv'; render(); await W(50); r.locf = document.querySelectorAll('[data-locf]').length; const b = document.querySelector('[data-locf="sr"]'); if (b) { b.click(); await W(50); } r.srOnly = names(); LOCF = ''; render();
      CAT = 'home'; render(); LIST = L0; G.dir = D0; INFO = Object.assign(INFO, I0); render(); return r; });
    info(JSON.stringify(r3));
    check(r3.com && r3.com.n.includes('Náutica X') && r3.com.n.includes('Tienda X') && r3.com.btn.join() === 'car,shop' && r3.com.po === 1 && r3.com.cty.join() === 'Santa Rosa del Monday', 'Comercio: cartões com foto/logo, Portada destacada, cidade de fora identificada e botão Ver todos por categoria');
    check(r3.sal && r3.sal.n.join() === 'Odonto X' && r3.srv && r3.srv.n.join() === 'Abogado X' && r3.srv.cty.join() === 'Santa Rosa del Monday', 'Salud y bienestar e Servicios profesionales com os negócios certos');
    check(r3.gas, 'Gastronomía: botão Ver toda la gastronomía');
    check(r3.rc === 8 && r3.rcAll, 'Aliados Tu Delivery no computador: 2 fileiras e o botão para ver todos');
    check(r3.cat === 'car', 'Ver todos abre a categoria');
    const sl = await d.evaluate(() => { const tg = [...document.querySelectorAll('.sd.cl .tg.vip')].map(e => e.textContent); return { tg, vip: /\bVIP\b/.test(document.querySelector('#atl') ? document.body.innerText : '') }; });
    check(sl.tg.every(x => x === 'Portada') && !sl.vip, 'auditoria: slider mostra "Portada" (nunca o nome interno VIP do Vitrix)', JSON.stringify(sl));
    check(r3.locf === 3 && !r3.srOnly.includes('Abogado X'), 'filtro por localização: Santa Rita esconde quem é de outra cidade');
    check(!d.errs.length, 'sem erros de JavaScript (computador)', d.errs.join(' | ')); }
  sec('Início: En portada e Qué comer');
  const G = await L.open(); const g = G.p;
  await g.goto('https://araujotechsistemas.com/guia/'); await g.w(2500);
  const h = await g.evaluate(async () => { const W = ms => new Promise(f => setTimeout(f, ms)); const A0 = G.ads, D0 = G.dir;
    G.ads = [{ id: 'p1', t: 'Anuncio Pago', s: 'Promo', u: 'https://exemplo.test/', img: '/sitio/gimg.php?i=p1&v=1' }, { id: 'p2', t: 'Da Casa', u: '', img: '/x.png', own: true }];
    const dd = [0,1,2,3,4,5,6].map(() => ({ on: true, a: ['00:00', '23:59'], b: ['', ''] }));
    G.dir = [{ id: 'q1', n: 'Comida Teste', g: 'food', td: true, wa: '0981000001', tu: ['de', 'al', 'me', 'ce'], dy: dd }];
    CAT = 'home'; render(); await W(80);
    const r = { por: [...document.querySelectorAll('#portada .por-c b')].map(b => b.textContent), ext: (document.querySelector('#portada a.por-c') || {}).target, qcv: document.querySelectorAll('#comer .qcv').length, ord: ['portada', 'destacados', 'comer'].map(id => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top) : -1; }) };
    G.ads = []; render(); await W(50); r.none = !document.getElementById('portada') || !/Anuncio Pago/.test(document.getElementById('portada').textContent);
    G.ads = A0; G.dir = D0; render(); return r; });
  info(JSON.stringify(h));
  check(h.por.includes('Anuncio Pago') && !h.por.includes('Da Casa') && h.ext === '_blank', '"En portada": mostra os anúncios pagos (não os da casa), abrindo o site do anunciante');
  check(h.none, 'sem anúncio pago, nada inventado na seção');
  check(h.qcv >= 1, 'cartões do Qué comer com a faixa de imagem');
  const px = await g.evaluate(() => { const b = document.querySelector('.pbx'); return b ? { ver: (b.querySelector('a.pbn') || {}).getAttribute('href'), wa: decodeURIComponent((b.querySelector('.pbx-wa') || {}).href || ''), pr: b.textContent } : null; });
  check(px && px.ver === '/guia/anunciar/' && /wa\.me\/595982086171\?text=¡Hola! Quiero saber cómo aparecer/.test(px.wa) && /Planes de la Guía desde Gs\. 300\.000\/mes · Catálogo Vitrix desde Gs\. 150\.000\/mes/.test(px.pr), 'chamada para comerciantes: Ver planes, WhatsApp e preços de partida separados (Guía x Vitrix)');
  check(!g.errs.length, 'início sem erros de JavaScript', g.errs.join(' | '));
  L.done();
})().catch(e => { console.log('ERRO', e && e.stack || e); process.exit(1); });
