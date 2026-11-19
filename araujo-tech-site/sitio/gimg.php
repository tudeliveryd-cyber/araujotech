<?php
@ini_set('display_errors', '0'); error_reporting(0); // avisos do PHP nunca aparecem na página
// Imagem de um banner pago da Guía Vitrix (gimg.php?i=<id>&v=<versão>) ou foto de profissional (gimg.php?p=<id>&v=) ou de notícia manual (gimg.php?n=<id>&v=) ou logo de ficha simples (gimg.php?d=<id>&v=). Guarda em cache no servidor.
$i = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['i'] ?? '')); $pp = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['p'] ?? '')); // p = foto de profissional
$nn = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['n'] ?? '')); // n = foto de notícia cadastrada à mão
$dd = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['d'] ?? '')); // d = logo de negócio sem catálogo (aliado Tu Delivery)
if ($i === '' && $pp !== '') $i = 'p' . $pp;
if ($i === '' && $nn !== '') $i = 'n' . $nn;
$cc = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['c'] ?? '')); // c = foto de clasificado
$tt = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['t'] ?? '')); // t = foto de uma nota de "Santa Rita al día"
$ff = preg_replace('/[^a-z0-9]/i', '', (string)($_GET['f'] ?? '')); // f = logo/foto de uma conta própria aprovada (gfichas)
if ($ff !== '' && $i === '') {
  require __DIR__ . '/prods_lib.php'; require __DIR__ . '/guia_lib.php';
  $k = (($_GET['k'] ?? '') === 'ph') ? 'ph' : 'lg'; $want = '/sitio/gimg.php?f=' . $ff . '&k=' . $k . '&v=';
  foreach (guia_acc()['fichas'] as $x) {
    if ($x['uid'] !== $ff || strpos((string)$x[$k], $want) !== 0) continue;
    $h = substr((string)$x[$k], strlen($want)); $g = glob(sys_get_temp_dir() . '/at_gfimg_' . $ff . '_' . $k . '_' . $h . '.*');
    if (!$g) break; $ext = pathinfo($g[0], PATHINFO_EXTENSION);
    header('X-Content-Type-Options: nosniff'); header('Content-Type: image/' . $ext); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . filesize($g[0])); readfile($g[0]); exit;
  }
  http_response_code(404); exit;
}
$dk = (($_GET['k'] ?? '') === 'ph') ? 'ph' : 'lg'; // ficha simples: logo (lg) ou foto do local (ph)
if ($i === '' && $dd !== '') $i = 'd' . $dd;
if ($i === '' && $cc !== '') $i = 'c' . $cc;
if ($i === '' && $tt !== '') $i = 't' . $tt;
if ($i === '') { http_response_code(404); exit; }
require __DIR__ . '/prods_lib.php';
require __DIR__ . '/guia_lib.php';
if (strlen($i) > 40) { http_response_code(404); exit; }
// o arquivo em cache leva a assinatura da própria imagem (não o ?v= do endereço, que qualquer um poderia inventar para encher o disco)
$bin = null;
$doc = guia_doc();
$list = $pp !== '' ? (array)($doc['gpro'] ?? []) : (array)($doc['gads'] ?? []); $want = $pp !== '' ? $pp : $i; $fld = $pp !== '' ? 'ph' : 'img'; $src = '';
if ($pp === '' && $nn !== '' && $i === 'n' . $nn) { $list = (array)(($doc['gnews'] ?? [])['man'] ?? []); $want = $nn; $fld = 'ph'; }
if ($pp === '' && $nn === '' && $dd !== '' && $i === 'd' . $dd) { $list = (array)($doc['gdir'] ?? []); $want = $dd; $fld = $dk; }
if ($pp === '' && $nn === '' && $dd === '' && $cc !== '' && $i === 'c' . $cc) { $list = (array)($doc['gclas'] ?? []); $want = $cc; $fld = 'ph'; }
if ($pp === '' && $nn === '' && $dd === '' && $cc === '' && $tt !== '' && $i === 't' . $tt) { $list = (array)($doc['gnotas'] ?? []); $want = $tt; $fld = 'ph'; }
$wd = ($tt === '') && ($pp === '' && $nn === '' && $dd === '' && $cc === '' && (($_GET['k'] ?? '') === 'd')); if ($wd) $fld = 'imgd'; // imagem larga do banner, só para computador
foreach ($list as $x) { if (is_array($x) && ($x['id'] ?? '') === $want) { $src = (string)($x[$fld] ?? ''); break; } }
// banner guardado à parte (platform/sitio/gimg/<id>): o gads só tem "gimg:<id>:<versão>"; busca a imagem uma vez e guarda em cache
if (preg_match('#^gimg:([A-Za-z0-9_]{1,60}):([a-f0-9]{1,16})$#', $src, $gm)) {
  $gc = sys_get_temp_dir() . '/at_gimgx_' . $gm[1] . '_' . $gm[2] . '.txt';
  if (is_file($gc)) $src = (string)@file_get_contents($gc);
  else {
    $r = at_get((getenv('GUIA_FS_BASE') ?: 'https://firestore.googleapis.com') . '/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio/gimg/' . $gm[1] . '?key=' . AT_KEY);
    $src = $r === null ? '' : (string)((json_decode($r, true)['fields']['d']['stringValue'] ?? ''));
    if (preg_match('#^data:image/(jpeg|png|webp);base64,#', $src)) @file_put_contents($gc, $src);
  }
}
if (!preg_match('#^data:image/(jpeg|png|webp);base64,(.+)$#s', $src, $m)) { http_response_code(404); exit; }
$f = sys_get_temp_dir() . '/at_gimg_' . $i . ($fld === 'ph' && $dd !== '' ? 'ph' : '') . ($wd ? 'd' : '') . '_' . substr(md5($src), 0, 12) . '.img';
if (!is_file($f)) { $bin = base64_decode($m[2]); if (!$bin) { http_response_code(404); exit; } @file_put_contents($f, $bin); }
header('X-Content-Type-Options: nosniff'); header('Content-Type: image/' . $m[1]); header('Cache-Control: public, max-age=86400'); header('Content-Length: ' . filesize($f)); readfile($f);
