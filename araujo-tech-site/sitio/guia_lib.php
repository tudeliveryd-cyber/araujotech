<?php
// Guía Vitrix: banners pagos (platform/sitio.gads) e lugares públicos (platform/sitio.gutil), cadastrados no Panel Araújo Tech.
// Os banners só saem entre as datas escolhidas (hora do Paraguai). A imagem vai por gimg.php (o JSON fica leve).
function guia_doc() {
  $cache = sys_get_temp_dir() . '/at_guia4.json';
  if (is_file($cache) && time() - filemtime($cache) < 180) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $r = at_get('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' . AT_KEY . '&mask.fieldPaths=gads&mask.fieldPaths=gutil&mask.fieldPaths=gpro&mask.fieldPaths=gbus&mask.fieldPaths=gturno&mask.fieldPaths=gev&mask.fieldPaths=gadsAt');
  if ($r === null) { if (is_file($cache)) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; } return []; }
  $f = json_decode($r, true)['fields'] ?? [];
  $val = function ($v) use (&$val) {
    if (!is_array($v)) return null;
    if (isset($v['stringValue'])) return $v['stringValue'];
    if (isset($v['booleanValue'])) return $v['booleanValue'];
    if (isset($v['integerValue'])) return (int)$v['integerValue'];
    if (isset($v['mapValue'])) { $o = []; foreach (($v['mapValue']['fields'] ?? []) as $k => $x) $o[$k] = $val($x); return $o; }
    if (isset($v['arrayValue'])) return array_map($val, $v['arrayValue']['values'] ?? []);
    return null;
  };
  $d = ['gads' => $val($f['gads'] ?? null) ?: [], 'gutil' => isset($f['gutil']) ? ($val($f['gutil']) ?: []) : null, 'gpro' => $val($f['gpro'] ?? null) ?: [], 'gbus' => $val($f['gbus'] ?? null) ?: [], 'gturno' => $val($f['gturno'] ?? null) ?: [], 'gev' => $val($f['gev'] ?? null) ?: [], 'at' => (string)($val($f['gadsAt'] ?? null) ?? '')];
  @file_put_contents($cache, json_encode($d));
  return $d;
}
function guia_pub() {
  $d = guia_doc();
  $now = new DateTime('now', new DateTimeZone('America/Asuncion')); $day = $now->format('Y-m-d');
  $ads = [];
  foreach ((array)($d['gads'] ?? []) as $x) {
    if (!is_array($x) || empty($x['img']) || ($x['on'] ?? true) === false) continue;
    if (!empty($x['from']) && $x['from'] > $day) continue;
    if (!empty($x['to']) && $x['to'] < $day) continue;
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $u = (string)($x['u'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $u)) $u = '';
    $ads[] = ['id' => $id, 't' => (string)($x['t'] ?? ''), 's' => (string)($x['s'] ?? ''), 'u' => $u, 'img' => '/sitio/gimg.php?i=' . $id . '&v=' . substr(md5((string)$x['img']), 0, 8)];
  }
  $util = null;
  if (is_array($d['gutil'] ?? null)) {
    $util = [];
    foreach ($d['gutil'] as $x) {
      if (!is_array($x) || trim((string)($x['n'] ?? '')) === '') continue;
      $m = (string)($x['map'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $m)) $m = '';
      $util[] = ['c' => (string)($x['c'] ?? 'gob'), 'n' => (string)$x['n'], 'a' => (string)($x['a'] ?? ''), 'tel' => preg_replace('/[^\d+ ()-]/', '', (string)($x['tel'] ?? '')), 'h' => (string)($x['h'] ?? ''), 'map' => $m];
    }
  }
  $pros = [];
  foreach ((array)($d['gpro'] ?? []) as $x) {
    if (!is_array($x) || trim((string)($x['n'] ?? '')) === '' || ($x['on'] ?? true) === false) continue;
    if (!empty($x['from']) && $x['from'] > $day) continue;
    if (!empty($x['to']) && $x['to'] < $day) continue;
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $w = (string)($x['web'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $w)) $w = '';
    $pros[] = ['id' => $id, 'n' => (string)$x['n'], 'a' => (string)($x['a'] ?? 'otro'), 'e' => (string)($x['e'] ?? ''), 'd' => (string)($x['d'] ?? ''),
      'wa' => preg_replace('/[^\d]/', '', (string)($x['wa'] ?? '')), 'ig' => preg_replace('/[^\w.]/', '', (string)($x['ig'] ?? '')), 'web' => $w,
      'ph' => !empty($x['ph']) ? '/sitio/gimg.php?p=' . $id . '&v=' . substr(md5((string)$x['ph']), 0, 8) : ''];
  }
  $bus = [];
  foreach ((array)($d['gbus'] ?? []) as $x) {
    if (!is_array($x) || !preg_match('/^\d{1,2}:\d{2}$/', (string)($x['h'] ?? ''))) continue;
    $bus[] = ['d' => in_array($x['d'] ?? '', ['cde', 'asu', 'enc', 'otro'], true) ? $x['d'] : 'otro', 'dn' => (string)($x['dn'] ?? ''), 'e' => (string)($x['e'] ?? ''), 'h' => (string)$x['h'], 'dias' => (string)($x['dias'] ?? ''), 'obs' => (string)($x['obs'] ?? '')];
  }
  $turno = null;
  foreach ((array)($d['gturno'] ?? []) as $x) {
    if (!is_array($x) || trim((string)($x['n'] ?? '')) === '' || empty($x['from'])) continue;
    if ($x['from'] > $day || (($x['to'] ?? $x['from']) < $day)) continue;
    $m = (string)($x['map'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $m)) $m = '';
    $turno = ['n' => (string)$x['n'], 'tel' => preg_replace('/[^\d+ ()-]/', '', (string)($x['tel'] ?? '')), 'a' => (string)($x['a'] ?? ''), 'map' => $m, 'to' => (string)($x['to'] ?? '')];
  }
  $ev = [];
  foreach ((array)($d['gev'] ?? []) as $x) {
    if (!is_array($x) || trim((string)($x['t'] ?? '')) === '' || empty($x['d']) || $x['d'] < $day) continue;
    $u = (string)($x['u'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $u)) $u = '';
    $ev[] = ['t' => (string)$x['t'], 'd' => (string)$x['d'], 'h' => (string)($x['h'] ?? ''), 'l' => (string)($x['l'] ?? ''), 'u' => $u];
  }
  usort($ev, function ($a, $b) { return strcmp($a['d'] . $a['h'], $b['d'] . $b['h']); });
  return ['ads' => $ads, 'util' => $util, 'pros' => $pros, 'bus' => $bus, 'turno' => $turno, 'ev' => array_slice($ev, 0, 8), 'at' => substr((string)($d['at'] ?? ''), 0, 10)];
}
