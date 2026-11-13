<?php
@ini_set('display_errors', '0'); // avisos do PHP nunca aparecem na página do cliente
// Manifesto do painel no subdomínio da loja: o atalho na tela de início leva o nome e o logo da loja (não "Painel Fogão").
require __DIR__ . '/catalogo_lib.php';
header('Content-Type: application/manifest+json; charset=utf-8');
header('Cache-Control: public, max-age=3600');
$name = '';
try {
  $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
  if (preg_match('/^([a-z0-9][a-z0-9-]{1,60})\.araujotechsistemas\.com$/', $host, $m) && ($s = cat_shop($m[1]))) $name = $s['name'];
} catch (Throwable $x) {}
$short = $name === '' ? 'Panel' : (function_exists('mb_strimwidth') ? mb_strimwidth($name, 0, 14, '…', 'UTF-8') : substr($name, 0, 14));
echo json_encode(['name' => $name === '' ? 'Panel del local' : 'Panel ' . $name, 'short_name' => $short, 'description' => 'Pedidos y administración del local', 'start_url' => '/painel/', 'scope' => '/painel/', 'display' => 'standalone',
  'background_color' => '#F4F2EF', 'theme_color' => '#1A1714', 'lang' => 'es-PY',
  'icons' => [['src' => '/icon-192.png', 'sizes' => '192x192', 'type' => 'image/png'], ['src' => '/icon-512.png', 'sizes' => '512x512', 'type' => 'image/png']]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
