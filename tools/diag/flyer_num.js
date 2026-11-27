// gera o flyer "Anunciá en la Guía" com os números do painel (passados à mão, reais). Arg: es|pt
const { chromium } = require('playwright');
(async () => { const lg = (process.argv[2] || 'es').trim() === 'pt' ? 'pt' : 'es';
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('https://araujotechsistemas.com/admin/?v=' + Date.now(), { waitUntil: 'networkidle' });
  await p.evaluate(async (lg) => {
    const T = lg === 'pt' ? { k: 'Para negócios de Santa Rita', h: 'Seu negócio<br>onde as pessoas<br>já procuram', n: [['+1.400', 'visitas no Guia nos últimos 30 dias'], ['+4.000', 'vezes que os anúncios foram vistos'], ['+200', 'toques em negócios do Guia']], c: 'Apareça no Guia com foto, WhatsApp e localização.', f: 'Planos a partir de Gs. 300.000 por mês', w: 'Peça informações pelo WhatsApp' }
      : { k: 'Para negocios de Santa Rita', h: 'Tu negocio<br>donde la gente<br>ya busca', n: [['+1.400', 'visitas a la Guía en los últimos 30 días'], ['+4.000', 'veces que se vieron los anuncios'], ['+200', 'toques en negocios de la Guía']], c: 'Aparecé en la Guía con fotos, WhatsApp y ubicación.', f: 'Planes desde Gs. 300.000 por mes', w: 'Pedí información por WhatsApp' };
    const css = `@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;800;900&display=swap');*{box-sizing:border-box;margin:0}body{background:#000}
    .f{width:1080px;position:relative;overflow:hidden;font-family:'Red Hat Display',system-ui,sans-serif;color:#fff;background:radial-gradient(900px 700px at 90% 0%,#7B1FA2 0%,transparent 60%),linear-gradient(165deg,#4A0A80 0%,#33075C 60%,#1E0438 100%);padding:80px;display:flex;flex-direction:column}
    .fe{height:1350px}.st{height:1920px;padding:150px 80px 130px}
    .top{display:flex;justify-content:space-between;align-items:center}.top img{height:92px}.k{font-weight:800;font-size:30px;color:#FFC21A}
    h1{font-weight:900;font-size:96px;line-height:.98;margin:46px 0 44px;letter-spacing:-.02em}.st h1{font-size:112px;margin:80px 0 70px}
    .n{display:flex;flex-direction:column;gap:18px}.st .n{gap:26px}
    .r{display:flex;align-items:center;gap:30px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.14);border-radius:28px;padding:24px 34px}.st .r{padding:34px 38px}
    .r b{font-size:84px;font-weight:900;color:#FFC21A;min-width:300px;letter-spacing:-.02em}.st .r b{font-size:96px;min-width:330px}
    .r span{font-size:32px;font-weight:700;line-height:1.2}
    .c{font-size:34px;font-weight:600;color:#EADCFB;margin-top:40px}.st .c{margin-top:70px;font-size:38px}
    .ft{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:2px solid rgba(255,255,255,.18);padding-top:34px}
    .ft p{font-size:30px;font-weight:600;color:#EADCFB}.ft .pr{display:block;font-size:40px;font-weight:900;color:#fff;margin-bottom:8px}
    .wa{background:#25D366;color:#fff;border-radius:999px;padding:20px 30px;font-weight:900;font-size:36px;white-space:nowrap}.wa small{display:block;font-size:22px;font-weight:700;opacity:.9}`;
    const one = cls => `<div class="f ${cls}"><div class="top"><p class="k">${T.k}</p><img src="/img/guia/guia-logo-blanco-hd.png"></div><h1>${T.h}</h1>
      <div class="n">${T.n.map(([v, l]) => `<div class="r"><b>${v}</b><span>${l}</span></div>`).join('')}</div><p class="c">${T.c}</p>
      <div class="ft"><p><span class="pr">${T.f}</span>guiadesantarita.com/anunciar</p><div class="wa"><small>${T.w}</small>0982 086 171</div></div></div>`;
    document.head.innerHTML = `<meta charset="utf-8"><style>${css}</style>`; document.body.innerHTML = one('fe') + one('st');
    await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); await new Promise(r => setTimeout(r, 800)); }, lg);
  const fs = await p.$$('.f'); console.log('IMG-feed<<' + (await fs[0].screenshot()).toString('base64') + '>>'); console.log('IMG-status<<' + (await fs[1].screenshot()).toString('base64') + '>>');
  await b.close(); })().catch(e => { console.log('ERRO', e.message); process.exit(1); });
