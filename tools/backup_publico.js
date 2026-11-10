// Cópia de segurança automática da parte PÚBLICA dos catálogos e das agendas (só leitura, sem login).
// Guarda: dados da loja (produtos, preços, bairros, horários), fotos, contador de pedidos, página pública e fotos da Agenda.
// NÃO guarda (são privados e exigem login): pedidos, custos, clientes/cobrança e turnos da Agenda.
// O arquivo tem o mesmo formato da cópia do admin, então serve em Admin → Copia de seguridad → Restaurar.
const fs = require('fs');
const K = 'AIzaSyBCz2X9BOgO4UZKaXppxlGbiN59qBvUR_U'; // chave pública do site (a mesma que está no catálogo)
const B = 'https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/';
const val = v => { if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return Number(v.integerValue); if ('doubleValue' in v) return v.doubleValue; if ('booleanValue' in v) return v.booleanValue; if ('nullValue' in v) return null; if ('timestampValue' in v) return v.timestampValue; if ('arrayValue' in v) return (v.arrayValue.values || []).map(val); if ('mapValue' in v) return obj(v.mapValue.fields || {}); return null; };
const obj = f => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, val(v)]));
const plain = d => Object.assign({ _id: d.name.split('/').pop() }, obj(d.fields || {}));
async function list(path) { const out = []; let tok = ''; do { const r = await fetch(B + path + '?pageSize=100&key=' + K + (tok ? '&pageToken=' + encodeURIComponent(tok) : '')); if (!r.ok) throw new Error(path + ' -> HTTP ' + r.status); const j = await r.json(); (j.documents || []).forEach(d => out.push(plain(d))); tok = j.nextPageToken || ''; } while (tok); return out; }
(async () => {
  const shops = [];
  for (const d of await list('shops')) {
    const media = await list('shops/' + d._id + '/media'); const meta = await list('shops/' + d._id + '/meta').catch(() => []);
    let np = 0; try { np = (JSON.parse(d.cfg || '{}').products || []).length; } catch (e) {}
    shops.push({ doc: d, media, meta, priv: [], orders: [] }); console.log('OK    | loja ' + d._id + ': ' + np + ' produtos, ' + media.length + ' pacote(s) de fotos');
  }
  const agendas = [];
  for (const d of await list('agendaPub')) { const img = await list('agendas/' + d._id + '/img').catch(() => []); agendas.push({ doc: d, img }); console.log('OK    | agenda ' + d._id + ': página pública e ' + img.length + ' imagem(ns)'); }
  const licencias = await list('licencias').catch(() => []);
  const sitio = await list('platform').catch(() => []);
  const out = { at: new Date().toISOString(), origem: 'automática (só dados públicos)', shops, agendas, licencias, sitio };
  const file = process.argv[2] || 'copia-publica.json'; fs.writeFileSync(file, JSON.stringify(out));
  console.log('== RESULTADO: ' + shops.length + ' loja(s), ' + agendas.length + ' agenda(s), ' + Math.round(fs.statSync(file).size / 1024) + ' KB');
  if (!shops.length) { console.log('FALHA | nenhuma loja lida'); process.exit(1); }
})().catch(e => { console.log('FALHA | ' + e.message); process.exit(1); });
