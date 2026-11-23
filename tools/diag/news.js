// somente leitura: roda a busca automática de notícias da Guía (o mesmo PHP do servidor) e mostra o que sairia.
//   node tools/diag/news.js
const { execFileSync } = require('child_process');
const code = 'require "araujo-tech-site/sitio/prods_lib.php"; require "araujo-tech-site/sitio/guia_lib.php"; $a = guia_auto_news(); echo json_encode(["auto" => $a, "guia" => guia_news()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);';
try { const out = execFileSync('php', ['-r', code], { encoding: 'utf8', timeout: 60000 }); const j = JSON.parse(out);
  console.log('NEWS automáticas: ' + j.auto.length); for (const n of j.auto) console.log('  ' + n.d + ' | ' + n.s + ' | ' + n.t + ' | ' + n.u.slice(0, 70));
  console.log('NEWS o que a Guía mostra agora: auto=' + (j.guia.auto || 0) + ' itens=' + j.guia.items.length + ' parceiro=' + (j.guia.n || '-'));
} catch (e) { console.log('FALHA ' + (e.stdout || '') + (e.stderr || '') + e.message); process.exit(1); }
