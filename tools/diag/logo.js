// somente leitura: baixa o logo publicado de uma ficha da Guía (por nome) e imprime em base64 entre marcas.
//   node tools/diag/logo.js "jonathan"
(async () => {
  const q = (process.argv[2] || '').toLowerCase();
  const j = await (await fetch('https://araujotechsistemas.com/sitio/guia.php?g=1&v=' + Date.now())).json();
  const x = (j.dir || []).find(x => String(x.n || '').toLowerCase().includes(q));
  if (!x || !x.lg) { console.log('SEM LOGO'); return; }
  const r = await fetch('https://guiadesantarita.com' + x.lg); const b = Buffer.from(await r.arrayBuffer());
  console.log('TIPO', r.headers.get('content-type'), b.length); console.log('LOGO<<' + b.toString('base64') + '>>');
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
