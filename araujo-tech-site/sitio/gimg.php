<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Imagem de um banner pago da Guía Vitrix: gimg.php?i=<id do banner>&v=<versão>. Guarda em cache no servidor.
$i = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['i'] ?? ''));
if ($i === '') { http_response_code(404); exit; }
require __DIR__ . '/prods_lib.php';
require __DIR__ . '/guia_lib.php';
$v = preg_replace('/[^a-f0-9]/', '', (string)($_GET['v'] ?? ''));
$f = sys_get_temp_dir() . '/at_gimg_' . $i . '_' . $v . '.jpg';
if (!is_file($f)) {
  $bin = null;
  foreach ((array)(guia_doc()['gads'] ?? []) as $x) {
    if (is_array($x) && ($x['id'] ?? '') === $i && preg_match('#^data:image/[a-z+]+;base64,(.+)$#s', (string)($x['img'] ?? ''), $m)) { $bin = base64_decode($m[1]); break; }
  }
  if (!$bin) { http_response_code(404); exit; }
  @file_put_contents($f, $bin);
}
header('Content-Type: image/jpeg'); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . filesize($f)); readfile($f);
