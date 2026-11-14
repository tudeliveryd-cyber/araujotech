<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Guía Vitrix para o Google: entrega o mesmo index.html, mas com a lista de negócios já escrita no HTML
// (o Google lê sem rodar JavaScript) e os dados estruturados. Qualquer falha cai no index.html normal.
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-cache');
$html = @file_get_contents(__DIR__ . '/index.html');
if ($html === false) { http_response_code(500); exit; }
try {
  require __DIR__ . '/../sitio/prods_lib.php';
  require __DIR__ . '/../sitio/guia_lib.php';
  $cl = guia_clients();
  if ($cl) {
    $e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
    $li = ''; $ld = [];
    foreach ($cl as $i => $c) {
      $u = 'https://araujotechsistemas.com/guia/' . $c['id'];
      $li .= '<li><a href="/guia/' . $e($c['id']) . '">' . $e($c['name']) . '</a>' . ($c['segEs'] || $c['city'] ? ' · ' . $e(trim($c['segEs'] . ($c['city'] ? ' · ' . $c['city'] : ''), ' ·')) : '') . '</li>';
      $ld[] = ['@type' => 'ListItem', 'position' => $i + 1, 'url' => $u, 'name' => $c['name']];
    }
    $seo = '<nav class="seo-l" aria-label="Negocios de la Guía"><p class="empty" data-t="loading"></p><ul>' . $li . '</ul></nav>';
    $html = str_replace('<div id="list"><p class="empty" data-t="loading"></p></div>', '<div id="list">' . $seo . '</div>', $html);
    $j = ['@context' => 'https://schema.org', '@type' => 'ItemList', 'name' => 'Guía Vitrix · Negocios de Santa Rita', 'itemListElement' => $ld];
    $html = str_replace('</head>', '<script type="application/ld+json">' . str_replace('</', '<\/', json_encode($j, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) . "</script>\n<style>.seo-l ul{list-style:none;padding:0;margin:0 0 30px;display:grid;gap:8px;font-size:15px;color:var(--muted)}.seo-l a{color:var(--deep);font-weight:700}</style>\n</head>", $html);
  }
} catch (Throwable $e) {}
echo $html;
