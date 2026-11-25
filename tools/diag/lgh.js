// somente leitura: o logo grande (platform/sitio/gimg/lh<id>) existe? e a ficha tem lgh? node tools/diag/lgh.js <id>
(async () => { const B = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/', K = '?key=AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U';
  const g = await fetch(B + 'platform/sitio/gimg/lh' + process.argv[2] + K); const gj = await g.json().catch(() => ({}));
  console.log('GIMG', g.status, String(((gj.fields || {}).d || {}).stringValue || '').length, ((gj.fields || {}).at || {}).stringValue || '');
  const s = await (await fetch(B + 'platform/sitio' + K + '&mask.fieldPaths=gdir')).json();
  const dir = (((s.fields || {}).gdir || {}).arrayValue || {}).values || [];
  const x = dir.map(v => v.mapValue.fields).find(f => f.id && f.id.stringValue === process.argv[2]);
  console.log('DIRX', x ? JSON.stringify({ n: x.n.stringValue, lg: (x.lg || {}).stringValue ? x.lg.stringValue.length : 0, lgh: (x.lgh || {}).stringValue || null }) : 'nao achou');
})().catch(e => { console.log('ERRO', e.message); process.exit(1); });
