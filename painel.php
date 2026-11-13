<?php
@ini_set('display_errors', '0'); // avisos do PHP nunca aparecem na página do cliente
// Painel do local pelo subdomínio (nome.araujotechsistemas.com/painel/): o mesmo painel/index.html,
// mas com o nome e o logo da própria loja no título da aba, no histórico e no ícone da tela de início.
// Qualquer falha aqui só faz cair no painel normal, sem mudar nada.
require __DIR__ . '/catalogo_lib.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
$html = @file_get_contents(__DIR__ . '/painel/index.html');
if ($html === false) { http_response_code(500); exit('Error'); }
try {
  $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
  if (preg_match('/^([a-z0-9][a-z0-9-]{1,60})\.araujotechsistemas\.com$/', $host, $m) && ($s = cat_shop($m[1]))) {
    $e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
    $html = preg_replace('#<title>[^<]*</title>#', '<title>' . $e($s['name'] . ' · Panel del local') . '</title>', $html, 1);
    $html = preg_replace('#<meta name="apple-mobile-web-app-title" content="[^"]*">#', '<meta name="apple-mobile-web-app-title" content="' . $e($s['name']) . '">', $html, 1);
    if ($s['logo'] !== '') {
      $v = substr(md5($s['logo']), 0, 10);
      $html = preg_replace('#<link rel="(icon|shortcut icon|apple-touch-icon)"[^>]*>\s*#', '', $html);
      $html = preg_replace('#</head>#i', "<link rel=\"icon\" type=\"image/png\" sizes=\"64x64\" href=\"/favicon.png?v={$v}\">\n<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"/icon-192.png?v={$v}\">\n<link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png?v={$v}\">\n</head>", $html, 1);
    }
  }
} catch (Throwable $x) { /* segue com o painel normal */ }
echo $html;
