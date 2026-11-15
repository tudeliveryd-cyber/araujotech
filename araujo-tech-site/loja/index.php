<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Catálogo pelo domínio principal: araujotechsistemas.com/loja/<nome>/ (o .htaccess manda para cá).
// Mesmo catálogo de nome.araujotechsistemas.com. A Guía e o site usam este endereço porque o iPhone, ao trocar de
// araujotechsistemas.com para um subdomínio, recebe "Misdirected Request" da hospedagem.
require __DIR__ . '/catalogo_lib.php';
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-cache');
$id = strtolower((string)($_GET['s'] ?? ''));
if (!preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $id)) { header('Location: /guia/', true, 302); exit; }
$html = @file_get_contents(__DIR__ . '/catalogo.html');
if ($html === false) { header('Location: https://' . $id . '.araujotechsistemas.com/', true, 302); exit; }
try {
  $shop = cat_shop($id);
  if (!$shop) { header('Location: https://' . $id . '.araujotechsistemas.com/', true, 302); exit; } // não é catálogo (agenda, site…): endereço próprio
  $e = function ($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); };
  $title = $shop['name'] . ' — Vitrix';
  $desc = $shop['slogan'] !== '' ? $shop['slogan'] . ' · Mirá el catálogo y pedí por WhatsApp.' : 'Mirá el catálogo y pedí por WhatsApp.';
  $canon = 'https://' . $id . '.araujotechsistemas.com/'; // endereço oficial continua sendo o subdomínio
  $meta = "<title>{$e($title)}</title>\n<meta name=\"description\" content=\"{$e($desc)}\">\n<link rel=\"canonical\" href=\"{$e($canon)}\">\n"
    . "<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:title\" content=\"{$e($title)}\">\n<meta property=\"og:description\" content=\"{$e($desc)}\">\n<meta property=\"og:url\" content=\"{$e($canon)}\">\n";
  if ($shop['logo'] !== '') { $v = substr(md5($shop['logo']), 0, 10); $meta .= "<meta property=\"og:image\" content=\"https://{$id}.araujotechsistemas.com/logo.php?v={$v}\">\n"; }
  $html = preg_replace('#<title>[^<]*</title>#', $meta, $html, 1);
  $html = preg_replace('#<meta name="apple-mobile-web-app-title" content="[^"]*">#', '<meta name="apple-mobile-web-app-title" content="' . $e($shop['name']) . '">', $html, 1);
  if (!empty($shop['cfg']) && strlen($shop['cfg']) < 400000) {
    $pre = '<script>window.TDC_PRE=' . json_encode(['id' => $shop['id'], 'cfg' => $shop['cfg']], JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
    $html = preg_replace('#</head>#i', $pre . '</head>', $html, 1);
  }
} catch (Throwable $x) { /* segue com o catálogo normal */ }
echo $html;
