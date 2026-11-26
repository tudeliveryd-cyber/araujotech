// somente leitura: lista as cidades dos negócios publicados na Guía (Vitrix e fichas) para revisar o filtro por localização.
(async () => { const r = await fetch('https://guiadesantarita.com/sitio/guia.php?v=' + Date.now()); const j = await r.json(); const c = {};
  for (const x of (j.clients || j.list || [])) { const k = (x.city || '(vazio)'); (c[k] = c[k] || []).push(x.name); }
  console.log('CID ' + JSON.stringify(c)); console.log('KEYS ' + Object.keys(j).join(','));
  const d = (j.dir || (j.guia && j.guia.dir) || []); console.log('DIR ' + d.length + ' ' + JSON.stringify(d.slice(0, 2).map(x => Object.keys(x))));
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
