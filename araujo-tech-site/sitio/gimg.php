<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Imagem de um banner pago da Guía Vitrix (gimg.php?i=<id>&v=<versão>) ou foto de profissional (gimg.php?p=<id>&v=). Guarda em cache no servidor.
$i = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['i'] ?? '')); $pp = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['p'] ?? '')); // p = foto de profissional
if ($i === '' && $pp !== '') $i = 'p' . $pp;
if ($i === '') { http_response_code(404); exit; }
require __DIR__ . '/prods_lib.php';
require __DIR__ . '/guia_lib.php';
if (strlen($i) > 40) { http_response_code(404); exit; }
// o arquivo em cache leva a assinatura da própria imagem (não o ?v= do endereço, que qualquer um poderia inventar para encher o disco)
$bin = null;
$doc = guia_doc();
$list = $pp !== '' ? (array)($doc['gpro'] ?? []) : (array)($doc['gads'] ?? []); $want = $pp !== '' ? $pp : $i; $fld = $pp !== '' ? 'ph' : 'img'; $src = '';
foreach ($list as $x) { if (is_array($x) && ($x['id'] ?? '') === $want) { $src = (string)($x[$fld] ?? ''); break; } }
if (!preg_match('#^data:image/(jpeg|png|webp);base64,(.+)$#s', $src, $m)) { http_response_code(404); exit; }
$f = sys_get_temp_dir() . '/at_gimg_' . $i . '_' . substr(md5($src), 0, 12) . '.img';
if (!is_file($f)) { $bin = base64_decode($m[2]); if (!$bin) { http_response_code(404); exit; } @file_put_contents($f, $bin); }
header('X-Content-Type-Options: nosniff'); header('Content-Type: image/' . $m[1]); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . filesize($f)); readfile($f);
