<?php
// Catálogo do cliente pelo subdomínio (nome.araujotechsistemas.com).
// Entrega o mesmo 404.html (o catálogo genérico), mas já com o nome, a descrição e o LOGO da loja
// nas etiquetas que o WhatsApp, o Facebook e o Google leem para montar a prévia do link.
// Qualquer falha aqui só faz cair no 404.html normal, sem mudar nada.
require __DIR__ . '/catalogo_lib.php';
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache');
$html = @file_get_contents(__DIR__ . '/404.html');
if ($html === false) { http_response_code(500); exit('Error'); }
try {
  $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
  if (preg_match('/^([a-z0-9][a-z0-9-]{1,60})\.araujotechsistemas\.com$/', $host, $m)) {
    $shop = cat_shop($m[1]);
    if ($shop) $html = cat_meta($html, $shop, $host);
  }
} catch (Throwable $e) { /* segue com o html normal */ }
echo $html;

function cat_meta($html, $s, $host) {
  $e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
  $title = $s['name'] . ' — Vitrix';
  $desc = $s['slogan'] !== '' ? $s['slogan'] . ' · Mirá el catálogo y pedí por WhatsApp.' : 'Mirá el catálogo y pedí por WhatsApp.';
  $url = 'https://' . $host . '/';
  $meta = "<title>{$e($title)}</title>\n"
    . "<meta name=\"description\" content=\"{$e($desc)}\">\n"
    . "<meta property=\"og:type\" content=\"website\">\n"
    . "<meta property=\"og:site_name\" content=\"{$e($s['name'])}\">\n"
    . "<meta property=\"og:title\" content=\"{$e($title)}\">\n"
    . "<meta property=\"og:description\" content=\"{$e($desc)}\">\n"
    . "<meta property=\"og:url\" content=\"{$e($url)}\">\n"
    . "<meta property=\"og:locale\" content=\"es_PY\">\n";
  if ($s['logo'] !== '') {
    $img = 'https://' . $host . '/logo.php?v=' . substr(md5($s['logo']), 0, 10);
    $meta .= "<meta property=\"og:image\" content=\"{$e($img)}\">\n"
      . "<meta property=\"og:image:width\" content=\"600\">\n<meta property=\"og:image:height\" content=\"600\">\n"
      . "<meta property=\"og:image:alt\" content=\"{$e($s['name'])}\">\n"
      . "<meta name=\"twitter:card\" content=\"summary\">\n";
    // ícones (o iPhone usa o ícone na prévia): logo da loja no lugar do ícone genérico
    $html = preg_replace('#<link rel="(icon|shortcut icon|apple-touch-icon)"[^>]*>\s*#', '', $html);
    $v = substr(md5($s['logo']), 0, 10);
    $meta .= "<link rel=\"icon\" type=\"image/png\" sizes=\"64x64\" href=\"/favicon.png?v={$v}\">\n<link rel=\"icon\" type=\"image/png\" sizes=\"192x192\" href=\"/icon-192.png?v={$v}\">\n<link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png?v={$v}\">\n";
  }
  $html = preg_replace('#<meta name="apple-mobile-web-app-title" content="[^"]*">#', '<meta name="apple-mobile-web-app-title" content="' . $e($s['name']) . '">', $html, 1);
  return preg_replace('#<title>[^<]*</title>#', $meta, $html, 1);
}
