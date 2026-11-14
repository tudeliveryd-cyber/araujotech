<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Imagem de um banner pago da Guía Vitrix (gimg.php?i=<id>&v=<versão>) ou foto de profissional (gimg.php?p=<id>&v=). Guarda em cache no servidor.
$i = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['i'] ?? '')); $pp = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['p'] ?? '')); // p = foto de profissional
if ($i === '' && $pp !== '') $i = 'p' . $pp;
if ($i === '') { http_response_code(404); exit; }
require __DIR__ . '/prods_lib.php';
require __DIR__ . '/guia_lib.php';
$v = preg_replace('/[^a-f0-9]/', '', (string)($_GET['v'] ?? ''));
$f = sys_get_temp_dir() . '/at_gimg_' . $i . '_' . $v . '.jpg';
if (!is_file($f)) {
  $bin = null;
  $doc = guia_doc();
  $list = $pp !== '' ? (array)($doc['gpro'] ?? []) : (array)($doc['gads'] ?? []); $want = $pp !== '' ? $pp : $i; $fld = $pp !== '' ? 'ph' : 'img';
  foreach ($list as $x) {
    if (is_array($x) && ($x['id'] ?? '') === $want && preg_match('#^data:image/[a-z+]+;base64,(.+)$#s', (string)($x[$fld] ?? ''), $m)) { $bin = base64_decode($m[1]); break; }
  }
  if (!$bin) { http_response_code(404); exit; }
  @file_put_contents($f, $bin);
}
header('Content-Type: image/jpeg'); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . filesize($f)); readfile($f);
