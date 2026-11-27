// somente leitura: flyer "Nuevo en la Guía" de um negócio publicado (logo, descrição e WhatsApp da ficha). Arg: "<slug> es|pt"
const { chromium } = require('playwright');
(async () => { const [sl, l0] = (process.argv[2] || '').trim().split(/\s+/); const lg = l0 === 'pt' ? 'pt' : 'es';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('https://araujotechsistemas.com/admin/?v=' + Date.now(), { waitUntil: 'networkidle' });
  const info = await p.evaluate(async ([sl, lg]) => {
    const j = await (await fetch('/sitio/guia.php?g=1&v=' + Date.now())).json(); const x = (j.dir || []).find(y => y && y.sl === sl); if (!x) return 'nao achei ' + sl;
    const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const wa = String(x.wa || x.tel || '').replace(/\D/g, '').replace(/^595/, '0'); const waF = wa.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
    const T = lg === 'pt' ? { k: 'Novo no Guia de Santa Rita', d: x.dP || x.d, h: 'Dê as boas-vindas a', c: 'Fale direto pelo WhatsApp', u: 'Veja no Guia' } : { k: 'Nuevo en la Guía de Santa Rita', d: x.d, h: 'Dale la bienvenida a', c: 'Escribiles directo por WhatsApp', u: 'Miralo en la Guía' };
    const css = `@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;800;900&display=swap');*{box-sizing:border-box;margin:0}body{background:#000}
    .f{width:1080px;position:relative;overflow:hidden;font-family:'Red Hat Display',system-ui,sans-serif;color:#fff;background:radial-gradient(800px 600px at 100% 0%,#7B1FA2 0%,transparent 60%),linear-gradient(165deg,#4A0A80 0%,#33075C 60%,#1E0438 100%);padding:76px 80px 70px;display:flex;flex-direction:column;align-items:center;text-align:center}
    .fe{height:1350px}.st{height:1920px;padding:150px 80px 130px}
    .bd{display:inline-flex;align-items:center;gap:12px;background:#FFC21A;color:#2A0650;font-weight:900;font-size:30px;border-radius:999px;padding:14px 30px}
    .bd svg{width:30px;height:30px}
    .h{font-size:36px;font-weight:700;color:#EADCFB;margin-top:40px}.st .h{margin-top:80px;font-size:40px}
    .card{margin-top:26px;background:#fff;border-radius:40px;padding:30px;width:640px;height:640px;display:flex;align-items:center;justify-content:center;box-shadow:0 30px 60px -30px rgba(0,0,0,.6)}.fe .card{width:520px;height:520px}
    .card img{max-width:100%;max-height:100%;object-fit:contain}
    h1{font-size:76px;font-weight:900;line-height:1;margin-top:40px;letter-spacing:-.01em}.st h1{font-size:88px;margin-top:60px}
    .d{font-size:36px;font-weight:600;color:#EADCFB;margin-top:16px}.st .d{font-size:40px}
    .ft{margin-top:auto;width:100%;display:flex;justify-content:space-between;align-items:center;gap:24px;border-top:2px solid rgba(255,255,255,.18);padding-top:32px;text-align:left}
    .wa{background:#25D366;border-radius:999px;padding:18px 30px;font-weight:900;font-size:40px;white-space:nowrap}.wa small{display:block;font-size:22px;font-weight:700;opacity:.92}
    .ft p{font-size:26px;font-weight:600;color:#EADCFB}.ft p b{display:block;font-size:30px;color:#fff;font-weight:800;margin-top:4px}.ft img{height:84px}
    .r{display:flex;flex-direction:column;align-items:flex-end;gap:14px;text-align:right}`;
    const star = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>`;
    const one = cls => `<div class="f ${cls}"><span class="bd">${star}${T.k}</span><p class="h">${T.h}</p><div class="card"><img src="${esc(x.lg)}"></div><h1>${esc(x.n)}</h1><p class="d">${esc(T.d)}</p>
      <div class="ft">${wa ? `<div class="wa"><small>${T.c}</small>${waF}</div>` : '<div></div>'}<div class="r"><img src="/img/guia/guia-logo-blanco-hd.png"><p>${T.u}<b>guiadesantarita.com</b></p></div></div></div>`;
    document.head.innerHTML = `<meta charset="utf-8"><style>${css}</style>`; document.body.innerHTML = one('fe') + one('st');
    await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await new Promise(r => setTimeout(r, 800));
    return x.n + ' | ' + waF + ' | imgs ' + [...document.images].filter(i => i.naturalWidth).length + '/' + document.images.length; }, [sl, lg]);
  console.log('INFO ' + info); const fs = await p.$$('.f'); if (fs.length) { console.log('IMG-feed<<' + (await fs[0].screenshot()).toString('base64') + '>>'); console.log('IMG-status<<' + (await fs[1].screenshot()).toString('base64') + '>>'); }
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
