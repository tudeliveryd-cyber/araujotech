// Site da Araújo Tech (página inicial nova): seções, soluções com status reais, formulário de orçamento,
// idiomas, menu, menu de baixo no celular, rodapé, páginas de privacidade e termos, sem cortes nem erros.
const L = require('./lib');
const { sec, check, info } = L;
(async () => {
  for (const [w, nome] of [[1366, 'computador'], [820, 'tablet'], [390, 'celular']]) {
    sec('Página inicial no ' + nome + ' (' + w + 'px)');
    const S = await L.open({ w }); const s = S.p;
    await s.addInitScript(() => { window.__opened = []; window.open = u => { window.__opened.push(String(u)); return null; }; });
    await s.goto('https://araujotechsistemas.com/'); await s.w(2500);
    const r = await s.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, lang: document.documentElement.lang, h1: document.querySelector('h1').textContent.trim(),
      secs: ['inicio', 'soluciones', 'servicios', 'para', 'como', 'quienes', 'preguntas', 'contacto'].filter(id => !document.getElementById(id)),
      sols: [...document.querySelectorAll('.sol')].map(a => (a.querySelector('h3 img') || a.querySelector('h3')).getAttribute('alt') || a.querySelector('h3').textContent.trim()),
      st: [...document.querySelectorAll('.sol .st')].map(x => x.className.replace('st ', '') + ':' + x.textContent),
      srv: document.querySelectorAll('.srv').length, seg: document.querySelectorAll('.seg').length, steps: document.querySelectorAll('.step').length, mvv: document.querySelectorAll('.mv').length, faq: document.querySelectorAll('#faqList details').length,
      bnav: getComputedStyle(document.querySelector('.bnav')).display, fab: getComputedStyle(document.querySelector('.wafab')).display,
      badHref: [...document.querySelectorAll('a')].filter(a => { const h = a.getAttribute('href'); if (!h || h === '#') return !a.classList.contains('js-wa') && !a.classList.contains('js-walz') && !a.classList.contains('js-mail') && !a.classList.contains('js-ig'); if (h.startsWith('#')) return !document.getElementById(h.slice(1)); return false; }).map(a => a.outerHTML.slice(0, 80)),
      soc: [...document.querySelectorAll('#soc a')].map(a => a.getAttribute('aria-label')),
      emptyBtn: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
      imgsNoAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length }));
    check(r.sw <= r.cw, 'sem rolagem para o lado (' + r.sw + ' de ' + r.cw + ')');
    check(r.lang === 'es' && r.h1 === 'Tecnología que transforma negocios.', 'abre em espanhol com o título novo');
    check(!r.secs.length, 'todas as seções existem', r.secs.join(','));
    check(r.sols.join('|') === 'Vitrix|Guía de Santa Rita|Meu Púlpito|Caja de Entregas|Agenda para Salones y Barberías|KONTIVA ERP', '6 soluções na ordem', r.sols.join('|'));
    check(r.st.filter(x => x.startsWith('dev')).length === 1 && r.st[5] === 'dev:En desarrollo' && r.st.slice(0, 5).every(x => x === 'ok:Disponible'), 'Kontiva aparece "En desarrollo"; os outros "Disponible"', r.st.join(','));
    check(r.srv === 8 && r.seg === 9 && r.steps === 4 && r.mvv === 4 && r.faq >= 8, 'serviços 8, segmentos 9, etapas 4, missão/visão/valores/compromisso, perguntas ' + r.faq);
    check(!r.badHref.length, 'nenhum link quebrado na página', r.badHref.join(' || '));
    check(r.soc.join(',') === 'WhatsApp,Instagram', 'rodapé mostra só as redes que existem (WhatsApp e Instagram)', r.soc.join(','));
    check(!r.emptyBtn && !r.imgsNoAlt, 'botões com nome e imagens com alt');
    if (w <= 640) check(r.bnav === 'grid' && r.fab === 'none', 'celular: menu de baixo aparece (e o botão flutuante some)'); else check(r.bnav === 'none', 'menu de baixo só no celular');
    // cada solução tem ação
    const acts = await s.evaluate(() => [...document.querySelectorAll('.sol')].map(a => [...a.querySelectorAll('.acts a')].map(x => x.getAttribute('href')).filter(h => h && h !== '#').length));
    check(acts.every(n => n >= 1), 'cada solução tem botão que funciona (demo/abrir e/ou pedir informação)');
    const kon = await s.evaluate(() => [...document.querySelectorAll('.sol')][5].querySelector('.acts').textContent);
    check(/Quiero saber más/.test(kon) && !/demostraci/i.test(kon), 'Kontiva só oferece "Quiero saber más" (sem demonstração)');
    if (w <= 960) {
      await s.click('#burger'); await s.w(300);
      check(await s.evaluate(() => document.getElementById('menu').classList.contains('open') && document.getElementById('burger').getAttribute('aria-expanded') === 'true'), 'menu do celular abre');
      await s.click('#menu a[href="#servicios"]'); await s.w(2200);
      check(await s.evaluate(() => !document.getElementById('menu').classList.contains('open') && Math.abs(document.getElementById('servicios').getBoundingClientRect().top) < 140), 'tocar no menu leva à seção e fecha o menu');
    }
    // formulário
    await s.evaluate(() => document.getElementById('contacto').scrollIntoView()); await s.w(300);
    await s.click('#qform button[type=submit]'); await s.w(200);
    check(/nombre/i.test(await s.txt('#qerr')), 'formulário: sem nome avisa');
    await s.fill('#qform [name=n]', 'Ana Teste'); await s.click('#qform button[type=submit]'); await s.w(200);
    check(/WhatsApp/.test(await s.txt('#qerr')), 'formulário: sem WhatsApp avisa');
    await s.fill('#qform [name=w]', '0981 123 456'); await s.fill('#qform [name=mail]', 'ana@'); await s.click('#qform button[type=submit]'); await s.w(200);
    check(/e-mail/i.test(await s.txt('#qerr')), 'formulário: e-mail inválido avisa');
    await s.fill('#qform [name=mail]', 'ana@empresa.com'); await s.fill('#qform [name=e]', 'Empresa Teste'); await s.selectOption('#qsel', { index: 1 }); await s.fill('#qform [name=m]', 'Quiero un sitio para mi empresa'); await s.click('#qform button[type=submit]'); await s.w(300);
    const op = await s.evaluate(() => window.__opened.slice(-1)[0] || '');
    const msg = decodeURIComponent((op.split('text=')[1] || ''));
    check(op.startsWith('https://wa.me/595982086171?text=') && /Ana Teste/.test(msg) && /Empresa Teste/.test(msg) && /0981 123 456/.test(msg) && /ana@empresa\.com/.test(msg) && /Sitio web profesional/.test(msg) && /Quiero un sitio/.test(msg), 'formulário abre o WhatsApp da Araújo Tech com todos os campos');
    // idioma
    await s.click('[data-lang="pt"]'); await s.w(400);
    const pt = await s.evaluate(() => ({ h1: document.querySelector('h1').textContent.trim(), lang: document.documentElement.lang, s: document.getElementById('s-h').textContent, st: document.querySelectorAll('.sol .st')[5].textContent, opt: document.querySelector('#qsel option').textContent, sel: document.querySelector('#qsel').selectedIndex }));
    check(pt.lang === 'pt-BR' && pt.h1 === 'Tecnologia que transforma negócios.' && pt.s === 'Nossas soluções' && pt.st === 'Em desenvolvimento' && pt.opt === 'Sistema sob medida', 'troca para português');
    check(s.errs.length === 0, 'sem erros de JavaScript', s.errs.join(' | '));
    if (process.env.SHOT) await s.screenshot({ path: process.env.SHOT + '/site-' + w + '.png' });
  }
  sec('Privacidade e termos');
  const P = await L.open({ w: 390 }); const p = P.p;
  for (const [u, t] of [['privacidad', 'Política de privacidad'], ['terminos', 'Términos de uso']]) {
    await p.goto('https://araujotechsistemas.com/' + u + '/'); await p.w(800);
    const r = await p.evaluate(() => ({ h: [...document.querySelectorAll('h1')].find(h => h.offsetParent).textContent, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(r.h === t && r.sw <= r.cw, u + ': abre em espanhol, sem cortes');
    await p.click('[data-set="pt"]'); await p.w(200);
    check(/Política de privacidade|Termos de uso/.test(await p.evaluate(() => [...document.querySelectorAll('h1')].find(h => h.offsetParent).textContent)), u + ': em português');
    await p.click('[data-set="es"]');
  }
  check(p.errs.length === 0, 'páginas legais sem erros de JavaScript', p.errs.join(' | '));
  await L.done();
})().catch(async e => { console.error(e); L.bad('erro: ' + e.message); await L.done(); });
