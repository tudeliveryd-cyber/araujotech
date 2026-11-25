<?php
// Guía Vitrix: banners pagos (platform/sitio.gads) e lugares públicos (platform/sitio.gutil), cadastrados no Panel Araújo Tech.
// Os banners só saem entre as datas escolhidas (hora do Paraguai). A imagem vai por gimg.php (o JSON fica leve).
function guia_doc() {
  $cache = sys_get_temp_dir() . '/at_guia8.json';
  if (is_file($cache) && time() - filemtime($cache) < 60) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $r = at_get((getenv('GUIA_FS_BASE') ?: 'https://firestore.googleapis.com') . '/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' . AT_KEY . '&mask.fieldPaths=gads&mask.fieldPaths=gatl&mask.fieldPaths=gcat&mask.fieldPaths=gutil&mask.fieldPaths=gpro&mask.fieldPaths=gbus&mask.fieldPaths=gturno&mask.fieldPaths=gev&mask.fieldPaths=gnews&mask.fieldPaths=gdir&mask.fieldPaths=gsoc&mask.fieldPaths=gjobs&mask.fieldPaths=gjobx&mask.fieldPaths=gclas&mask.fieldPaths=gpromo&mask.fieldPaths=gvid&mask.fieldPaths=gnotas&mask.fieldPaths=gadsAt');
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
  $d = ['gcat' => $val($f['gcat'] ?? null) ?: [], 'gatl' => $val($f['gatl'] ?? null) ?: [], 'gads' => $val($f['gads'] ?? null) ?: [], 'gutil' => isset($f['gutil']) ? ($val($f['gutil']) ?: []) : null, 'gpro' => $val($f['gpro'] ?? null) ?: [], 'gbus' => $val($f['gbus'] ?? null) ?: [], 'gturno' => $val($f['gturno'] ?? null) ?: [], 'gev' => $val($f['gev'] ?? null) ?: [], 'gdir' => $val($f['gdir'] ?? null) ?: [], 'gnews' => $val($f['gnews'] ?? null) ?: null, 'gsoc' => $val($f['gsoc'] ?? null) ?: [], 'gjobs' => $val($f['gjobs'] ?? null) ?: [], 'gjobx' => $val($f['gjobx'] ?? null) ?: [], 'gclas' => $val($f['gclas'] ?? null) ?: [], 'gpromo' => $val($f['gpromo'] ?? null) ?: [], 'gvid' => $val($f['gvid'] ?? null) ?: [], 'gnotas' => $val($f['gnotas'] ?? null) ?: [], 'at' => (string)($val($f['gadsAt'] ?? null) ?? '')];
  @file_put_contents($cache, json_encode($d));
  return $d;
}

// ===== Contas próprias (gfichas) e opiniões do público (gresenas) =====
// Só entra o que a Guía aprovou (st = 'ok'). As fotos das fichas ficam em cache no servidor (gimg.php?f=).
function guia_fv($v) {
  if (!is_array($v)) return null;
  if (array_key_exists('stringValue', $v)) return $v['stringValue'];
  if (array_key_exists('booleanValue', $v)) return $v['booleanValue'];
  if (array_key_exists('integerValue', $v)) return (int)$v['integerValue'];
  if (array_key_exists('doubleValue', $v)) return (float)$v['doubleValue'];
  if (isset($v['mapValue'])) { $o = []; foreach (($v['mapValue']['fields'] ?? []) as $k => $x) $o[$k] = guia_fv($x); return $o; }
  if (isset($v['arrayValue'])) return array_map('guia_fv', $v['arrayValue']['values'] ?? []);
  return null;
}
function guia_fsq($col, $limit) { // documentos aprovados de uma coleção (consulta pública: as regras só deixam ler st == 'ok')
  $base = getenv('GUIA_FS_BASE') ?: 'https://firestore.googleapis.com'; // GUIA_FS_BASE só nos testes (emulador)
  $url = $base . '/v1/projects/araujotech-catalogos/databases/(default)/documents:runQuery?key=' . AT_KEY;
  $body = json_encode(['structuredQuery' => ['from' => [['collectionId' => $col]], 'where' => ['fieldFilter' => ['field' => ['fieldPath' => 'st'], 'op' => 'EQUAL', 'value' => ['stringValue' => 'ok']]], 'limit' => $limit]]);
  if (!function_exists('curl_init')) return null;
  $c = curl_init($url); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_TIMEOUT => 12, CURLOPT_CONNECTTIMEOUT => 4]);
  $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE);
  if ($r === false || $code !== 200) return null;
  $out = [];
  foreach ((array)json_decode($r, true) as $row) {
    if (empty($row['document']['name'])) continue;
    $o = []; foreach (($row['document']['fields'] ?? []) as $k => $x) $o[$k] = guia_fv($x);
    $o['_id'] = basename($row['document']['name']); $out[] = $o;
  }
  return $out;
}
// 25/11 (Jean): cliente pago com painel próprio (convite da Guía). dl = id da ficha da Guía ligada (só o admin define ao aprovar).
// O dono muda horário por dia, serviços, botões do link, cor e "cerrado hasta"; o resto da ficha (categoria, plano, selo) continua da Guía.
const GUIA_BT = ['wa', 'tel', 'mu', 'map', 'ig', 'web', 'gu', 'sh'];
const GUIA_COR = ['pur', 'azu', 'ver', 'roj', 'nar', 'neg'];
function guia_lk($x) {
  $dl = preg_replace('/[^a-z0-9]/i', '', (string)($x['dl'] ?? '')); if ($dl === '') return [];
  $sv = [];
  foreach (array_slice((array)($x['sv'] ?? []), 0, 12) as $v) { if (!is_array($v)) continue; $t = mb_substr(trim((string)($v['t'] ?? '')), 0, 60); if (mb_strlen($t) < 2) continue; $sv[] = ['t' => $t, 'p' => mb_substr(trim((string)($v['p'] ?? '')), 0, 30)]; }
  $bt = []; foreach ((array)($x['bt'] ?? []) as $k) if (is_string($k) && in_array($k, GUIA_BT, true) && !in_array($k, $bt, true)) $bt[] = $k;
  $cz = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['cz'] ?? '')) ? (string)$x['cz'] : '';
  return ['dl' => $dl, 'dy' => guia_dy($x['dy'] ?? null), 'sv' => $sv, 'bt' => $bt, 'btx' => is_array($x['bt'] ?? null), 'cor' => in_array($x['cor'] ?? '', GUIA_COR, true) ? $x['cor'] : '', 'cz' => $cz];
}
// junta o que o dono mudou no painel dele com a ficha da Guía (só os campos preenchidos; o endereço do link não muda)
function guia_own($y, $x, $day) {
  $y['sn'] = $y['n'];
  foreach (['n', 'tel', 'wa', 'a', 'map', 'ig', 'web', 'lg', 'ph'] as $k) if (($x[$k] ?? '') !== '') $y[$k] = $x[$k];
  $dd = trim((string)($x['d'] ?? '')); if ($dd !== '') { $y['d'] = mb_substr(preg_split('/\R/', $dd)[0], 0, 60); if (mb_strlen($dd) > 60 || strpos($dd, "\n") !== false) $y['dx'] = mb_substr($dd, 0, 600); }
  if (!empty($x['dy'])) { $y['dy'] = $x['dy']; $y['hrs'] = ''; }
  if ($x['sv']) $y['sv'] = $x['sv'];
  if (!empty($x['btx'])) $y['bt'] = $x['bt'];
  if ($x['cor'] !== '') $y['cor'] = $x['cor'];
  if ($x['cz'] !== '' && $x['cz'] >= $day) { $y['cz'] = $x['cz']; $y['tc'] = 1; }
  $y['own'] = 1;
  return $y;
}
function guia_acc() {
  $cache = sys_get_temp_dir() . '/at_gacc2.json';
  if (is_file($cache) && time() - filemtime($cache) < 300) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $fi = guia_fsq('gfichas', 400); $re = guia_fsq('gresenas', 2000);
  if ($fi === null || $re === null) { if (is_file($cache)) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) { @touch($cache); return $d; } } $e = ['fichas' => [], 'rv' => []]; @file_put_contents($cache, json_encode($e)); return $e; } // falhou: tenta de novo só daqui a 5 minutos
  $day = (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('Y-m-d');
  $https = function ($u) { $u = trim((string)$u); return preg_match('#^https://[^\s"\'<>]+$#i', $u) ? $u : ''; };
  $fichas = [];
  foreach ($fi as $x) {
    $uid = preg_replace('/[^a-z0-9]/i', '', (string)$x['_id']); $n = trim((string)($x['n'] ?? ''));
    if ($uid === '' || mb_strlen($n) < 2) continue;
    $img = [];
    foreach (['lg', 'ph'] as $k) {
      if (!preg_match('#^data:image/(jpeg|png|webp);base64,(.+)$#s', (string)($x[$k] ?? ''), $m)) continue;
      $h = substr(md5((string)$x[$k]), 0, 10); $f = sys_get_temp_dir() . '/at_gfimg_' . $uid . '_' . $k . '_' . $h . '.' . $m[1];
      if (!is_file($f)) { $bin = base64_decode($m[2]); if ($bin) @file_put_contents($f, $bin); }
      if (is_file($f)) $img[$k] = '/sitio/gimg.php?f=' . $uid . '&k=' . $k . '&v=' . $h;
    }
    $ev = [];
    foreach (array_slice((array)($x['ev'] ?? []), 0, 10) as $e) {
      if (!is_array($e) || mb_strlen(trim((string)($e['t'] ?? ''))) < 3 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($e['d'] ?? '')) || $e['d'] < $day) continue;
      $ev[] = ['t' => mb_substr(trim((string)$e['t']), 0, 80), 'd' => (string)$e['d'], 'h' => preg_match('/^\d{1,2}:\d{2}$/', (string)($e['h'] ?? '')) ? (string)$e['h'] : '', 'l' => mb_substr(trim((string)($e['l'] ?? '')), 0, 80)];
    }
    $cla = []; // avisos grátis da conta (perdidos e encontrados, venda, aluguel, serviços): só dentro da data
    foreach (array_slice((array)($x['cla'] ?? []), 0, 5) as $i => $c) {
      if (!is_array($c)) continue; $u = (string)($c['until'] ?? ''); $wa = preg_replace('/\D/', '', (string)($c['wa'] ?? '')); $t = trim((string)($c['t'] ?? ''));
      if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $u) || $u < $day || strlen($wa) < 8 || mb_strlen($t) < 3) continue;
      $cla[] = ['id' => 'f' . $uid . 'x' . $i, 'k' => in_array($c['k'] ?? '', ['per', 'inm', 'veh', 'var', 'ser'], true) ? $c['k'] : 'var', 'op' => in_array($c['op'] ?? '', ['venta', 'alq', 'perd', 'enc', 'na'], true) ? $c['op'] : 'na',
        't' => mb_substr($t, 0, 80), 'pr' => mb_substr(trim((string)($c['pr'] ?? '')), 0, 40), 'z' => mb_substr(trim((string)($c['z'] ?? '')), 0, 60), 'd' => mb_substr(trim((string)($c['d'] ?? '')), 0, 400), 'wa' => $wa, 'until' => $u, 'ph' => ''];
    }
    $fichas[] = ['uid' => $uid, 'tipo' => (string)($x['tipo'] ?? 'otro'), 'g' => (string)($x['g'] ?? ''), 'n' => mb_substr($n, 0, 80), 'd' => mb_substr(trim((string)($x['d'] ?? '')), 0, 600),
      'wa' => preg_replace('/\D/', '', (string)($x['wa'] ?? '')), 'tel' => preg_replace('/[^\d+ ()-]/', '', (string)($x['tel'] ?? '')), 'a' => mb_substr(trim((string)($x['a'] ?? '')), 0, 120),
      'map' => $https($x['map'] ?? ''), 'hrs' => mb_substr(trim((string)($x['hrs'] ?? '')), 0, 200), 'ig' => preg_replace('/[^\w.]/', '', (string)($x['ig'] ?? '')), 'web' => $https($x['web'] ?? ''),
      'lg' => $img['lg'] ?? '', 'ph' => $img['ph'] ?? '', 'ev' => $ev, 'jobs' => array_slice(array_values(array_filter((array)($x['jobs'] ?? []), 'is_array')), 0, 10), 'cla' => $cla]
      + guia_lk($x);
  }
  // opiniões aprovadas: nota média e as 3 mais recentes com texto, por ficha/negócio
  $by = [];
  foreach ($re as $x) {
    $t = preg_replace('/[^a-z0-9]/i', '', (string)($x['t'] ?? '')); $r = (int)($x['r'] ?? 0);
    if ($t === '' || $r < 1 || $r > 5) continue;
    $by[$t][] = ['n' => mb_substr(explode(' ', trim((string)($x['n'] ?? '')))[0], 0, 30), 'r' => $r, 'x' => mb_substr(trim((string)($x['x'] ?? '')), 0, 400), 'at' => substr((string)($x['at'] ?? ''), 0, 10)];
  }
  $rv = [];
  foreach ($by as $t => $l) {
    usort($l, function ($a, $b) { return strcmp($b['at'], $a['at']); });
    $sum = 0; foreach ($l as $y) $sum += $y['r'];
    $rv[$t] = ['a' => round($sum / count($l), 1), 'n' => count($l), 'x' => array_slice(array_values(array_filter($l, function ($y) { return $y['x'] !== ''; })), 0, 3)];
  }
  $d = ['fichas' => $fichas, 'rv' => $rv];
  @file_put_contents($cache, json_encode($d));
  return $d;
}
const GUIA_FU = ['iglesia' => 'igl', 'escuela' => 'edu', 'ong' => 'com', 'club' => 'dep', 'animales' => 'ani']; // fichas gratuitas da comunidade → página pública da categoria
// horário por dia de uma ficha simples (mesmo formato do catálogo: 7 dias, domingo = 0)
function guia_dy($dy) {
  if (!is_array($dy) || count($dy) !== 7) return null;
  $ok = function ($v) { return preg_match('/^\d{2}:\d{2}$/', (string)$v) ? (string)$v : ''; }; $o = []; $any = false;
  foreach (array_values($dy) as $d) { $d = is_array($d) ? $d : []; $a = (array)($d['a'] ?? []); $b = (array)($d['b'] ?? []);
    $x = ['on' => !empty($d['on']), 'a' => [$ok($a[0] ?? ''), $ok($a[1] ?? '')], 'b' => [$ok($b[0] ?? ''), $ok($b[1] ?? '')]];
    if ($x['a'][0] !== '' && $x['a'][1] === '' && $x['b'][0] === '' && $x['b'][1] !== '') { $x['a'][1] = $x['b'][1]; $x['b'] = ['', '']; } // 07:00 … 23:00 nas pontas = horário corrido
    if ($x['on'] && (($x['a'][0] !== '' && $x['a'][1] !== '') || ($x['b'][0] !== '' && $x['b'][1] !== ''))) $any = true; /* vale também só o horário da tarde/noite */ $o[] = $x; }
  return $any ? $o : null;
}
// Categorias organizadas pelo painel ("pastas"): pub = informação pública (lugares), neg = negócios. Cada grupo pode ter abas.
// 24/11 (Jean): "quando a pessoa coloca em português, traduz tudo". O que o Jean escreve só em espanhol (nome de categoria
// sem versão em português, "qué hace", horário em texto) ganha tradução automática para o português (MyMemory, grátis),
// guardada para sempre no servidor. Nunca traduz nomes de empresas. Se a tradução falhar, mostra o espanhol.
function guia_tr($t) {
  static $C = null, $file = null, $novas = 0, $mud = false;
  $t = trim((string)$t); if ($t === '' || mb_strlen($t) > 160 || !preg_match('/\pL{3}/u', $t)) return '';
  if ($C === null) { $file = sys_get_temp_dir() . '/at_tr_pt1.json'; $C = is_file($file) ? (json_decode((string)@file_get_contents($file), true) ?: []) : [];
    register_shutdown_function(function () use (&$C, &$file, &$mud) { if ($mud) @file_put_contents($file, json_encode($C, JSON_UNESCAPED_UNICODE), LOCK_EX); }); }
  $k = md5(mb_strtolower($t));
  if (isset($C[$k])) { if ($C[$k]['p'] !== '' || time() - (int)$C[$k]['t'] < 3600) return $C[$k]['p']; }
  if (getenv('GUIA_FS_BASE') || $novas >= 4 || !function_exists('curl_init')) return '';
  $novas++;
  $c = curl_init('https://api.mymemory.translated.net/get?langpair=es%7Cpt-BR&q=' . rawurlencode($t));
  curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 4, CURLOPT_CONNECTTIMEOUT => 2]);
  $r = curl_exec($c); $code = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c);
  $j = ($r !== false && $code === 200) ? json_decode((string)$r, true) : null; $p = '';
  if (is_array($j) && (int)($j['responseStatus'] ?? 0) === 200) { $p = trim(html_entity_decode((string)($j['responseData']['translatedText'] ?? ''), ENT_QUOTES, 'UTF-8'));
    if ($p === '' || mb_strlen($p) > 200 || preg_match('/MYMEMORY|QUERY LENGTH|INVALID/i', $p)) $p = ''; elseif (mb_strtolower($p) === mb_strtolower($t)) $p = $t; }
  $C[$k] = ['p' => mb_substr($p, 0, 160), 't' => time()]; $mud = true;
  return $C[$k]['p'];
}
function guia_cat($raw) {
  $txt = function ($n) { $n = is_array($n) ? $n : []; $es = mb_substr(trim((string)($n['es'] ?? '')), 0, 40); $pt = mb_substr(trim((string)($n['pt'] ?? '')), 0, 40); if ($pt === '' && $es !== '') $pt = mb_substr(guia_tr($es), 0, 40); return ['es' => $es, 'pt' => $pt]; };
  $key = function ($k) { $k = (string)$k; return preg_match('/^[a-z][a-z0-9]{0,15}$/', $k) ? $k : ''; };
  $out = ['pub' => [], 'neg' => []];
  foreach (['pub', 'neg'] as $sec) {
    foreach (array_slice((array)(($raw[$sec] ?? []) ?: []), 0, 40) as $g) {
      if (!is_array($g) || ($k = $key($g['k'] ?? '')) === '') continue;
      $tabs = [];
      foreach (array_slice((array)($g['tabs'] ?? []), 0, 12) as $t) { if (is_array($t) && ($tk = $key($t['k'] ?? '')) !== '') $tabs[] = ['k' => $tk, 'n' => $txt($t['n'] ?? [])]; }
      $out[$sec][] = ['k' => $k, 'n' => $txt($g['n'] ?? []), 'ic' => $key($g['ic'] ?? '') ?: 'grid', 'kw' => mb_substr(trim((string)($g['kw'] ?? '')), 0, 120), 'tabs' => $tabs];
    }
  }
  return $out;
}
function guia_pub() {
  $d = guia_doc();
  $cat = guia_cat($d['gcat'] ?? []); $negk = array_merge(['food', 'shop', 'health', 'home', 'car', 'serv'], array_column($cat['neg'], 'k'));
  $now = new DateTime('now', new DateTimeZone('America/Asuncion')); $day = $now->format('Y-m-d');
  $ads = [];
  foreach ((array)($d['gads'] ?? []) as $x) {
    if (!is_array($x) || empty($x['img']) || ($x['on'] ?? true) === false) continue;
    if (!empty($x['from']) && $x['from'] > $day) continue;
    if (!empty($x['to']) && $x['to'] < $day) continue;
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $u = (string)($x['u'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $u)) $u = '';
    $ads[] = ['id' => $id, 't' => (string)($x['t'] ?? ''), 's' => (string)($x['s'] ?? ''), 'u' => $u, 'img' => '/sitio/gimg.php?i=' . $id . '&v=' . substr(md5((string)$x['img']), 0, 8), 'imgd' => preg_match('#^(data:image/(jpeg|png|webp);base64,|gimg:)#', (string)($x['imgd'] ?? '')) ? '/sitio/gimg.php?i=' . $id . '&k=d&v=' . substr(md5((string)$x['imgd']), 0, 8) : '', 'own' => empty($x['own']) ? 0 : 1];
  }
  $promo = []; // promo del día: só as do dia de hoje (horário do Paraguai)
  foreach ((array)($d['gpromo'] ?? []) as $x) {
    if (!is_array($x) || ($x['d'] ?? '') !== $day) continue;
    if (!preg_match('/^([vd]):([A-Za-z0-9_-]{1,70})$/', (string)($x['fid'] ?? ''), $pm)) continue;
    $tx = trim((string)($x['t'] ?? '')); if ($tx === '') continue;
    if ($pm[1] === 'd') { $okp = false; foreach ((array)($d['gdir'] ?? []) as $y) if (is_array($y) && preg_replace('/[^a-z0-9]/i', '', (string)($y['id'] ?? '')) === $pm[2]) { $okp = !empty($y['td']) || !empty($y['pr']); break; } if (!$okp) continue; } // promo só para ficha com Premium ou Aliado
    $promo[] = ['k' => $pm[1], 'id' => $pm[2], 't' => mb_substr($tx, 0, 90)];
    if (count($promo) >= 12) break;
  }
  $util = null;
  if (is_array($d['gutil'] ?? null)) {
    $util = [];
    foreach ($d['gutil'] as $x) {
      if (!is_array($x) || trim((string)($x['n'] ?? '')) === '' || !empty($x['of'])) continue; // 23/11 (Jean): lugar desativado não aparece
      $m = (string)($x['map'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $m)) $m = '';
      $vsx = in_array($x['vs'] ?? '', ['ver', 'pend', 'tmp', 'cer', 'fue'], true) ? $x['vs'] : '';
      $util[] = (in_array($vsx, ['cer', 'fue'], true) ? ['off' => 1] : []) + ($vsx === 'tmp' ? ['tc' => 1] : []) + ($vsx === 'ver' ? ['vs' => 'ver', 'vd' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['vd'] ?? '')) ? $x['vd'] : ''] : []) + ['c' => preg_match('/^[a-z][a-z0-9]{0,15}$/', (string)($x['c'] ?? '')) ? (string)$x['c'] : 'gob', 'n' => (string)$x['n'], 'a' => (string)($x['a'] ?? ''), 'tel' => preg_replace('/[^\d+ ()-]/', '', (string)($x['tel'] ?? '')), 'h' => (string)($x['h'] ?? ''), 'map' => $m, 'o' => empty($x['o']) ? 0 : 1];
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
    $ev[] = ['id' => substr(md5((string)$x['t'] . '|' . (string)$x['d'] . '|' . (string)($x['h'] ?? '')), 0, 10), 't' => (string)$x['t'], 'k' => in_array($x['k'] ?? '', ['rel', 'dep', 'cul', 'com', 'neg', 'inf', 'otr'], true) ? $x['k'] : 'otr', 'd' => (string)$x['d'], 'h' => (string)($x['h'] ?? ''), 'l' => (string)($x['l'] ?? ''), 'u' => $u];
  }
  $acc = guia_acc(); $fu = [];
  foreach ($acc['fichas'] as $x) {
    foreach ($x['ev'] as $e) $ev[] = ['id' => substr(md5($e['t'] . '|' . $e['d'] . '|' . $e['h']), 0, 10), 't' => $e['t'], 'k' => $x['tipo'] === 'iglesia' ? 'rel' : ($x['tipo'] === 'club' ? 'dep' : 'com'), 'd' => $e['d'], 'h' => $e['h'], 'l' => $e['l'] !== '' ? $e['l'] : $x['n'], 'u' => ''];
    if (isset(GUIA_FU[$x['tipo']])) $fu[] = ['id' => 'f' . $x['uid'], 'c' => ($x['tipo'] === 'escuela' && in_array($x['g'], ['gua', 'escpub', 'escpri', 'unipub', 'unipri', 'inst'], true)) ? $x['g'] : GUIA_FU[$x['tipo']], 'n' => $x['n'], 'a' => $x['a'], 'tel' => $x['tel'], 'h' => $x['hrs'], 'map' => $x['map'], 'd' => $x['d'], 'wa' => $x['wa'], 'ig' => $x['ig'], 'web' => $x['web'], 'lg' => $x['lg'], 'ph' => $x['ph']];
  }
  usort($ev, function ($a, $b) { return strcmp($a['d'] . $a['h'], $b['d'] . $b['h']); });
  // negócios sem catálogo (ficha simples cadastrada no Panel Araújo Tech)
  $dir = []; $own = []; foreach ($acc['fichas'] as $x) if (!empty($x['dl'])) $own[$x['dl']] = $x;
  foreach ((array)($d['gdir'] ?? []) as $x) {
    if (!is_array($x) || ($x['on'] ?? true) === false || trim((string)($x['n'] ?? '')) === '' || in_array($x['vs'] ?? '', ['cer', 'fue'], true)) continue; // cerrado ou fora de Santa Rita: não aparece
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $m = (string)($x['map'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $m)) $m = '';
    $g = (string)($x['g'] ?? 'serv'); if (!in_array($g, $negk, true)) $g = 'serv';
    $dir[] = ['id' => $id, 'n' => mb_substr(trim((string)$x['n']), 0, 80), 'g' => $g, 'sub' => preg_match('/^[a-z][a-z0-9]{0,15}$/', (string)($x['sub'] ?? '')) ? (string)$x['sub'] : '', 'd' => mb_substr(trim((string)($x['d'] ?? '')), 0, 60), 'tel' => preg_replace('/[^\d+ ()-]/', '', (string)($x['tel'] ?? '')), 'wa' => preg_replace('/[^\d+]/', '', (string)($x['wa'] ?? '')), 'a' => mb_substr(trim((string)($x['a'] ?? '')), 0, 140), 'map' => $m, 'hrs' => mb_substr(trim((string)($x['hrs'] ?? '')), 0, 80), 'ig' => preg_replace('/[^\w.]/', '', (string)($x['ig'] ?? '')), 'td' => !empty($x['td']), 'rc' => !empty($x['rc']) && !empty($x['pr']), // 25/11: pacote Recomendado/Portada (só com plano pago)
       'dy' => guia_dy($x['dy'] ?? null), 'mt' => (($x['mt'] ?? '') === 'cat') ? 'cat' : 'menu', 'mu' => preg_match('#^https://[^\s"\'<>]+$#i', (string)($x['mu'] ?? '')) ? (string)$x['mu'] : '', 'tu' => array_values(array_intersect(['de', 'al', 'me', 'ce'], array_map('strval', (array)($x['tu'] ?? [])))), 'lg' => preg_match('#^data:image/(jpeg|png|webp);base64,#', (string)($x['lg'] ?? '')) ? '/sitio/gimg.php?d=' . $id . '&v=' . substr(md5((string)$x['lg']), 0, 8) : '', 'ph' => preg_match('#^data:image/(jpeg|png|webp);base64,#', (string)($x['ph'] ?? '')) ? '/sitio/gimg.php?d=' . $id . '&k=ph&v=' . substr(md5((string)$x['ph']), 0, 8) : ''];
    { $li = count($dir) - 1; if (!empty($x['pr'])) $dir[$li]['pr'] = 1; if (($x['vs'] ?? '') === 'tmp') { $dir[$li]['tc'] = 1; $dir[$li]['dy'] = null; } // cerrado temporalmente
      if (empty($dir[$li]['td']) && empty($x['pr']) && empty($x['qk'])) { array_pop($dir); continue; } } // 23/11 (Jean): ficha do cadastro rápido (qk) aparece mesmo sem plano // 20/11 (Jean): negócio comercial sem plano ativo (Premium) nem Aliado Tu Delivery não aparece; a ficha continua guardada no painel e volta ao ativar
    if (isset($own[$id])) { $li = count($dir) - 1; if ($li >= 0 && $dir[$li]['id'] === $id) $dir[$li] = guia_own($dir[$li], $own[$id], $day); }
    if (count($dir) >= 300) break;
  }
  foreach ($acc['fichas'] as $x) { // negócios e profissionais com conta própria (aprovados pela Guía depois do pagamento)
    if (isset(GUIA_FU[$x['tipo']]) || $x['tipo'] === 'avisos') continue; // 'avisos': conta grátis só de vagas e avisos, sem ficha no diretório
    if (!empty($x['dl'])) continue; // conta ligada a uma ficha da Guía: entra junto com a ficha (acima), não como outra
    $dir[] = ['id' => 'f' . $x['uid'], 'n' => $x['n'], 'g' => in_array($x['g'], ['food', 'shop', 'health', 'home', 'car', 'serv'], true) ? $x['g'] : 'serv', 'd' => mb_substr(preg_split('/\R/', $x['d'])[0], 0, 60), 'tel' => $x['tel'], 'wa' => $x['wa'], 'a' => $x['a'], 'map' => $x['map'], 'hrs' => mb_substr($x['hrs'], 0, 80), 'ig' => $x['ig'], 'td' => false, 'dy' => null, 'mt' => 'menu', 'mu' => '', 'web' => $x['web'], 'tu' => [], 'lg' => $x['lg'], 'ph' => $x['ph'], 'acc' => 1];
  }
  $clas = []; // clasificados e inmuebles publicados pela Guía (só os ativos e dentro da data)
  foreach (array_slice((array)($d['gclas'] ?? []), 0, 40) as $x) { // até 15 com foto (painel) + aprovados sem conta
    if (!is_array($x) || empty($x['on'])) continue; $u = (string)($x['until'] ?? ''); $wa = preg_replace('/\D/', '', (string)($x['wa'] ?? '')); $t = trim((string)($x['t'] ?? ''));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $u) || $u < $day || strlen($wa) < 8 || mb_strlen($t) < 3) continue;
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $clas[] = ['id' => $id, 'k' => in_array($x['k'] ?? '', ['per', 'inm', 'veh', 'var', 'ser'], true) ? $x['k'] : 'var', 'op' => in_array($x['op'] ?? '', ['venta', 'alq', 'perd', 'enc', 'na'], true) ? $x['op'] : 'na', 't' => mb_substr($t, 0, 80), 'pr' => mb_substr(trim((string)($x['pr'] ?? '')), 0, 40), 'z' => mb_substr(trim((string)($x['z'] ?? '')), 0, 60), 'd' => mb_substr(trim((string)($x['d'] ?? '')), 0, 500), 'wa' => $wa, 'until' => $u, 'ph' => preg_match('#^data:image/(jpeg|png|webp);base64,#', (string)($x['ph'] ?? '')) ? '/sitio/gimg.php?c=' . $id . '&v=' . substr(md5((string)$x['ph']), 0, 8) : ''];
  }
  foreach ($acc['fichas'] as $x) foreach ($x['cla'] ?? [] as $c) { $clas[] = $c; if (count($clas) >= 60) break 2; } // avisos das contas grátis
  $so = (array)($d['gsoc'] ?? []); $soc = []; // redes da Guía (rodapé), configuradas no painel
  $w = preg_replace('/\D/', '', (string)($so['wa'] ?? '')); if (strlen($w) >= 8) $soc['wa'] = $w;
  foreach (['fb', 'ig', 'yt', 'tt'] as $k) { $u = trim((string)($so[$k] ?? '')); if (preg_match('#^https://[^\s"\'<>]+$#i', $u)) $soc[$k] = $u; }
  if (($so['slo'] ?? '') === 'list') $soc['slo'] = 'list'; // slider: na ordem do painel (senão alterna ao acaso)
  if (in_array((int)($so['slt'] ?? 0), [4, 6, 8, 10], true)) $soc['slt'] = (int)$so['slt']; // segundos entre um banner e outro
  $tv = array_values(array_filter((array)($so['tdv'] ?? []), function ($x) { return is_string($x) && preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', $x); })); if ($tv) $soc['tdv'] = array_slice($tv, 0, 60); // clientes Vitrix que também são aliados Tu Delivery
  $atl = []; // accesos da portada, na ordem do painel
  foreach (array_slice((array)($d['gatl'] ?? []), 0, 16) as $x) { if (!is_array($x)) continue; $k = (string)($x['k'] ?? ''); if (!in_array($k, ['all', 'gas', 'del', 'em', 'sal', 'far', 'igl', 'edu', 'tra', 'ev', 'job', 'mas', 'q', 'p'], true)) continue;
    $atl[] = ['k' => $k, 'es' => mb_substr(trim((string)($x['es'] ?? '')), 0, 24), 'pt' => mb_substr(trim((string)($x['pt'] ?? '')), 0, 24), 'ic' => preg_replace('/[^a-z]/', '', (string)($x['ic'] ?? '')), 'q' => mb_substr(trim((string)($x['q'] ?? '')), 0, 60)]; }
  // endereço próprio de cada negócio sem catálogo: /negocio/<nome> (único; se repetir, leva o começo do id)
  $seen = [];
  foreach ($dir as $i => $x) { $sl = guia_nslug($x['sn'] ?? $x['n']); unset($dir[$i]['sn']); if ($sl === '') $sl = 'negocio'; if (isset($seen[$sl])) $sl .= '-' . strtolower(substr($x['id'], 0, 5)); $seen[$sl] = 1; $dir[$i]['sl'] = $sl; }
  foreach ($dir as $i => $x) if ($ll = guia_dir_ll($x['map'] ?? '')) $dir[$i]['ll'] = $ll; // ponto no mapa e 'Cerca de mí' (link curto do Maps convertido no servidor)
  foreach ($dir as &$dd) foreach (['d' => 'dP', 'hrs' => 'hP'] as $a => $b) { $tp = guia_tr($dd[$a] ?? ''); if ($tp !== '' && $tp !== ($dd[$a] ?? '')) $dd[$b] = $tp; } unset($dd); // português automático (ver guia_tr)
  return ['ads' => $ads, 'util' => $util, 'pros' => $pros, 'bus' => $bus, 'turno' => $turno, 'ev' => array_slice($ev, 0, 30), 'dir' => $dir, 'soc' => (object)$soc, 'clas' => $clas, 'fu' => $fu, 'rv' => (object)$acc['rv'], 'at' => substr((string)($d['at'] ?? ''), 0, 10), 'cat' => $cat, 'atl' => $atl, 'promo' => $promo];
}

// Vídeos de um negócio (painel da Guía → Videos de los negocios): só links do Instagram, TikTok e YouTube, mostrados embutidos.
// $fid = 'v:<id do cliente Vitrix>' ou 'd:<id da ficha>'. Nada é baixado nem guardado na hospedagem.
function guia_vid_embed($u) {
  $u = trim((string)$u); if (!preg_match('#^https://#i', $u) || strlen($u) > 300) return null;
  if (preg_match('#^https://(?:www\.|m\.)?youtube\.com/(?:watch\?(?:.*&)?v=|shorts/|embed/)([\w-]{11})#i', $u, $m) || preg_match('#^https://youtu\.be/([\w-]{11})#i', $u, $m))
    return ['k' => 'yt', 'u' => $u, 'src' => 'https://www.youtube-nocookie.com/embed/' . $m[1] . '?rel=0', 'v' => preg_match('#/shorts/#i', $u) ? 1 : 0];
  if (preg_match('#^https://(?:www\.|m\.)?tiktok\.com/@[\w.-]+/video/(\d{8,25})#i', $u, $m)) return ['k' => 'tt', 'u' => $u, 'src' => 'https://www.tiktok.com/embed/v2/' . $m[1], 'v' => 1];
  if (preg_match('#^https://(?:vm|vt)\.tiktok\.com/[\w-]{5,20}/?$#i', $u)) return ['k' => 'tt', 'u' => $u, 'src' => '', 'v' => 1];
  if (preg_match('#^https://(?:www\.)?instagram\.com/(p|reels?|tv)/([\w-]{5,40})#i', $u, $m)) return ['k' => 'ig', 'u' => $u, 'src' => 'https://www.instagram.com/' . (strtolower($m[1]) === 'p' ? 'p' : 'reel') . '/' . $m[2] . '/embed', 'v' => 1];
  return null;
}
function guia_vids($fid) {
  foreach ((array)(guia_doc()['gvid'] ?? []) as $x) {
    if (!is_array($x) || ($x['fid'] ?? '') !== $fid) continue; $o = [];
    foreach (array_slice((array)($x['u'] ?? []), 0, 4) as $u) if ($v = guia_vid_embed($u)) $o[] = $v;
    return $o;
  }
  return [];
}

// "Santa Rita al día": notas escritas pela própria Guía no painel (noticias, acontecimientos, turismo, lugares para conocer).
// Cada uma tem página própria (/nota/<id>). $full = true traz o texto inteiro (página da nota); senão só um resumo (portada).
const GUIA_NK = ['not' => ['Noticia', 'Notícia'], 'acon' => ['Acontecimiento', 'Acontecimento'], 'tur' => ['Turismo', 'Turismo'], 'lug' => ['Lugar para conocer', 'Lugar para conhecer']];
function guia_notas($full = false) {
  $out = [];
  foreach (array_slice((array)(guia_doc()['gnotas'] ?? []), 0, 30) as $x) {
    if (!is_array($x)) continue; $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); $t = trim((string)($x['t'] ?? ''));
    if ($id === '' || mb_strlen($t) < 3) continue;
    $tx = trim(str_replace("\r", '', (string)($x['x'] ?? ''))); $u = preg_match('#^https://[^\s"\'<>]{4,400}$#i', (string)($x['u'] ?? '')) ? (string)$x['u'] : '';
    if ($tx === '' && $u === '') continue;
    $k = isset(GUIA_NK[$x['k'] ?? '']) ? $x['k'] : 'not'; $d = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['d'] ?? '')) ? (string)$x['d'] : '';
    $ph = (string)($x['ph'] ?? ''); $img = '';
    if (preg_match('#^gimg:[A-Za-z0-9_]{1,60}:([a-f0-9]{1,16})$#', $ph, $m)) $img = '/sitio/gimg.php?t=' . $id . '&v=' . $m[1];
    elseif (preg_match('#^data:image/(jpeg|png|webp);base64,#', $ph)) $img = '/sitio/gimg.php?t=' . $id . '&v=' . substr(md5($ph), 0, 8);
    $o = ['id' => $id, 'k' => $k, 't' => mb_substr($t, 0, 140), 'd' => in_array($k, ['tur', 'lug'], true) ? '' : $d, 'img' => $img, 'u' => $u, 'dest' => !empty($x['dest'])];
    $o['r'] = mb_substr(preg_replace('/\s+/u', ' ', $tx), 0, 200) . (mb_strlen($tx) > 200 ? '…' : '');
    if ($full) $o['x'] = mb_substr($tx, 0, 4000);
    $o['_s'] = $d; $out[] = $o;
  }
  usort($out, function ($a, $b) { return ($b['dest'] <=> $a['dest']) ?: strcmp($b['_s'], $a['_s']); });
  return array_map(function ($o) { unset($o['_s']); return $o; }, $out);
}

// Notícias do parceiro: lê o feed RSS configurado no painel (só manchete, foto e link para ler no site deles). Cache de 30 minutos.
// Notícias automáticas: busca no Google Notícias matérias que citam Santa Rita (Alto Paraná) e mostra só o título, o nome do jornal,
// a data e o link para ler no site do jornal (não copia texto nem foto). Cache de 1 hora; se a busca falhar, fica a última lista boa.
function guia_auto_news() {
  $cache = sys_get_temp_dir() . '/at_news_auto1.json';
  if (is_file($cache) && time() - filemtime($cache) < 3600) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $q = rawurlencode('"Santa Rita" "Alto Paraná" when:30d');
  $r = at_get('https://news.google.com/rss/search?q=' . $q . '&hl=es-419&gl=PY&ceid=PY:es-419');
  $items = []; $seen = [];
  if ($r && function_exists('simplexml_load_string')) {
    $x = @simplexml_load_string($r, 'SimpleXMLElement', LIBXML_NOCDATA | LIBXML_NONET);
    if ($x && isset($x->channel->item)) {
      foreach ($x->channel->item as $it) {
        if (count($items) >= 8) break;
        $src = trim((string)$it->source); $t = trim(html_entity_decode(strip_tags((string)$it->title), ENT_QUOTES, 'UTF-8'));
        if ($src !== '' && mb_substr($t, -mb_strlen(' - ' . $src)) === ' - ' . $src) $t = trim(mb_substr($t, 0, -mb_strlen(' - ' . $src)));
        $l = (string)$it->link;
        if (mb_strlen($t) < 12 || !preg_match('#^https://[^\s"\'<>]+$#i', $l)) continue;
        $k = mb_strtolower(preg_replace('/\W+/u', '', $t)); if (isset($seen[$k])) continue; $seen[$k] = 1;   // a mesma matéria em vários jornais: fica uma
        $ts = strtotime((string)$it->pubDate);
        if (preg_match('#^(https?://)?(www\.)?([^/]+)/?$#i', $src, $m) && strpos($src, '.') !== false) $src = $m[3];   // jornal sem nome: fica o endereço curto (latribuna.com.py)
        $items[] = ['t' => mb_substr($t, 0, 140), 'u' => $l, 'img' => '', 'd' => $ts ? date('Y-m-d', $ts) : '', 's' => mb_substr($src, 0, 40)];
      }
    }
  }
  usort($items, function ($a, $b) { return strcmp($b['d'], $a['d']); });   // a mais nova primeiro
  if ($items) @file_put_contents($cache, json_encode($items, JSON_UNESCAPED_UNICODE));
  elseif (is_file($cache)) { @touch($cache, time() - 3000); $items = json_decode((string)@file_get_contents($cache), true) ?: []; }   // falhou: usa a última lista e tenta de novo em 10 min
  return $items;
}

// Parceiro: Grupo Santa Rita Visión (autorizado pelo dono em 23/11/2026). O site deles entrega as publicações do Facebook
// (Santa Rita Visión Noticias e Regional News). Mostra a primeira linha como título, a foto, a data e o link para o Facebook;
// tira os anúncios pagos (posts com telefone, preço ou chamada de venda). Cache de 1 hora; se falhar, fica a última lista boa.
const GUIA_SRV = 'https://santaritavision.paracapcut2026usuario.workers.dev/api/';
function guia_srv_news() {
  $cache = sys_get_temp_dir() . '/at_news_srv2.json';
  if (is_file($cache) && time() - filemtime($cache) < 3600) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $items = []; $seen = [];
  foreach (['facebook-news', 'regional-news'] as $ep) {
    $j = json_decode((string)at_get(GUIA_SRV . $ep), true);
    foreach ((array)($j['data'] ?? []) as $x) {
      if (!is_array($x)) continue;
      $msg = trim((string)($x['message'] ?? '')); $u = (string)($x['permalink_url'] ?? '');
      if ($msg === '' || !preg_match('#^https://(www\.)?facebook\.com/[^\s"\'<>]+$#i', $u)) continue;
      // anúncio pago: telefone, preço ou chamada de venda
      if (preg_match('/(\(?09\d{2}\)?[\s.\-]?\d{3}[\s.\-]?\d{3})|\bGs\.?\s?\d|precio|promo|oferta|descuento|llam[aá] (ya|al)|consult(as|á)|whats ?app|delivery|reservas|inscripciones|cupos/iu', $msg)) continue;
      $t = '';
      foreach (preg_split('/\R/u', $msg) as $ln) { $ln = trim(preg_replace('/[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}\x{200D}\x{2B00}-\x{2BFF}]/u', '', $ln)); $ln = trim($ln, " \t-–—•|:¡!"); if ($ln === '') continue; $t = $t === '' ? $ln : $t . ' · ' . $ln; if (mb_strlen($t) >= 24) break; }   // linha curta ("SANTA RITA") junta com a seguinte
      if (mb_strlen($t) < 8) continue;
      if (mb_strtoupper($t) === $t) {   // TÍTULO TODO EM MAIÚSCULAS fica normal, mantendo os nomes próprios
        $t = mb_strtoupper(mb_substr($t, 0, 1)) . mb_strtolower(mb_substr($t, 1));
        foreach (['Santa Rita', 'Santa Rosa del Monday', 'Santa Rosa', 'Alto Paraná', 'Paraguay', 'Ciudad del Este', 'Naranjal', 'Ande', 'Policía Nacional', 'Junta Municipal'] as $nm) $t = preg_replace('/\b' . preg_quote($nm, '/') . '\b/iu', $nm, $t);
        $t = str_replace('Ande', 'ANDE', $t);
      }
      $k = mb_strtolower(preg_replace('/\W+/u', '', $t)); if (isset($seen[$k])) continue; $seen[$k] = 1;
      $img = (string)($x['full_picture'] ?? ''); if (!preg_match('#^https://[a-z0-9.\-]+\.fbcdn\.net/[^\s"\'<>]+$#i', $img)) $img = '';
      $ts = strtotime((string)($x['created_time'] ?? ''));
      $items[] = ['t' => mb_substr($t, 0, 140), 'u' => $u, 'img' => $img, 'd' => $ts ? (new DateTime('@' . $ts))->setTimezone(new DateTimeZone('America/Asuncion'))->format('Y-m-d') : '', 's' => mb_substr(trim((string)($x['page_name'] ?? 'Santa Rita Visión')), 0, 40), 'ts' => $ts, 'x' => mb_substr(trim(preg_replace('/\n{3,}/', "\n\n", str_replace("\r", '', $msg))), 0, 3000)];   // texto do post (autorizado pelo parceiro): a Guía mostra a notícia completa
    }
  }
  usort($items, function ($a, $b) { return $b['ts'] <=> $a['ts']; });
  $items = array_map(function ($x) { unset($x['ts']); return $x; }, array_slice($items, 0, 8));
  if ($items) @file_put_contents($cache, json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
  elseif (is_file($cache)) { @touch($cache, time() - 3000); $items = json_decode((string)@file_get_contents($cache), true) ?: []; }
  return $items;
}

function guia_news() {
  $cfg = guia_doc()['gnews'] ?? null;
  // sem parceiro ligado: mostra as notícias automáticas (podem ser desligadas com gnews.auto = false)
  if (!is_array($cfg) || empty($cfg['on'])) {
    if (is_array($cfg) && ($cfg['auto'] ?? true) === false) return ['items' => []];
    $srv = guia_srv_news();   // parceiro Santa Rita Visión primeiro; Google Notícias completa até 8
    $all = $srv; $k = []; foreach ($all as $x) $k[mb_strtolower(preg_replace('/\W+/u', '', $x['t']))] = 1;
    if (count($all) < 8) foreach (guia_auto_news() as $x) { if (count($all) >= 8) break; $kk = mb_strtolower(preg_replace('/\W+/u', '', $x['t'])); if (!isset($k[$kk])) { $all[] = $x; $k[$kk] = 1; } }
    return $srv ? ['n' => 'Santa Rita Visión', 'site' => 'https://www.facebook.com/SantaRitaVisionNoticias', 'auto' => 1, 'items' => $all] : ['auto' => 1, 'items' => $all];
  }
  $name = (string)($cfg['n'] ?? ''); $site = preg_match('#^https://[^\s"\'<>]+$#i', (string)($cfg['site'] ?? '')) ? (string)$cfg['site'] : '';
  // notícias cadastradas à mão no painel (parceiro que só publica no Instagram): saem primeiro, a mais nova em cima
  $man = [];
  foreach ((array)($cfg['man'] ?? []) as $x) {
    if (!is_array($x) || trim((string)($x['t'] ?? '')) === '' || !preg_match('#^https://[^\s"\'<>]+$#i', (string)($x['u'] ?? ''))) continue;
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $dd = preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)($x['d'] ?? '')) ? (string)$x['d'] : '';
    $man[] = ['t' => mb_substr(trim((string)$x['t']), 0, 140), 'u' => (string)$x['u'], 'img' => !empty($x['ph']) ? '/sitio/gimg.php?n=' . $id . '&v=' . substr(md5((string)$x['ph']), 0, 8) : '', 'd' => $dd];
    if (count($man) >= 8) break;
  }
  usort($man, function ($a, $b) { return strcmp($b['d'], $a['d']); });
  if (!preg_match('#^https://[^\s"\'<>]+$#i', (string)($cfg['feed'] ?? ''))) return ['n' => $name, 'site' => $site, 'items' => $man];
  $cache = sys_get_temp_dir() . '/at_news_' . md5($cfg['feed']) . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 1800) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return ['n' => $name, 'site' => $site, 'items' => array_slice(array_merge($man, $d), 0, 8)]; }
  $r = at_get($cfg['feed']); $items = [];
  if ($r && function_exists('simplexml_load_string')) {
    $x = @simplexml_load_string($r, 'SimpleXMLElement', LIBXML_NOCDATA | LIBXML_NONET);
    if ($x) {
      $list = isset($x->channel->item) ? $x->channel->item : (isset($x->entry) ? $x->entry : []);
      foreach ($list as $it) {
        if (count($items) >= 6) break;
        $t = trim(html_entity_decode(strip_tags((string)$it->title), ENT_QUOTES, 'UTF-8'));
        $l = (string)$it->link; if ($l === '' && isset($it->link['href'])) $l = (string)$it->link['href'];
        if ($t === '' || !preg_match('#^https?://#i', $l)) continue;
        $img = '';
        $media = $it->children('media', true);
        if (isset($media->content) && $media->content->attributes()->url) $img = (string)$media->content->attributes()->url;
        elseif (isset($media->thumbnail) && $media->thumbnail->attributes()->url) $img = (string)$media->thumbnail->attributes()->url;
        elseif (isset($it->enclosure) && preg_match('#^image/#', (string)$it->enclosure['type'])) $img = (string)$it->enclosure['url'];
        else { $html = (string)$it->children('content', true)->encoded . (string)$it->description; if (preg_match('#<img[^>]+src="(https://[^"]+)"#i', $html, $m)) $img = $m[1]; }
        if (!preg_match('#^https://#i', $img)) $img = '';
        $date = (string)($it->pubDate ?? $it->published ?? $it->updated ?? ''); $ts = $date ? strtotime($date) : 0;
        $items[] = ['t' => mb_substr($t, 0, 140), 'u' => preg_replace('#^http://#i', 'https://', $l), 'img' => $img, 'd' => $ts ? date('Y-m-d', $ts) : ''];
      }
    }
  }
  if ($items || !is_file($cache)) @file_put_contents($cache, json_encode($items));
  elseif (is_file($cache)) { $items = json_decode((string)@file_get_contents($cache), true) ?: []; }
  $all = array_merge($man, $items);
  if (count($all) < 4 && ($cfg['auto'] ?? true) !== false) $all = array_merge($all, guia_auto_news());   // parceiro com poucas notícias: completa com as automáticas
  return ['n' => $name, 'site' => $site, 'items' => array_slice($all, 0, 8)];
}

// Clientes publicados pelo Panel Araújo Tech (platform/sitio → clientes), só catálogos. Cache de 10 minutos.
// Empleos: vagas publicadas pelos próprios negócios no painel (cfg.jobs) + vagas cadastradas pela Guía (gjobs). Só as ativas e dentro da data.
function guia_jobs($all = false) {
  $cache = sys_get_temp_dir() . '/at_gjobs2_' . ($all ? 'a' : 'p') . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 300) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $today = (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('Y-m-d');
  $doc = guia_doc(); $hide = array_flip(array_map('strval', (array)($doc['gjobx'] ?? [])));
  $A = ['ven', 'coc', 'rep', 'adm', 'ofi', 'lim', 'sal', 'edu', 'tec', 'agr', 'otr']; $K = ['full', 'part', 'temp', 'first'];
  $one = function ($x, $co, $src) use ($today, $A, $K, $hide, $all) {
    if (!is_array($x) || empty($x['on'])) return null;
    $t = trim((string)($x['t'] ?? '')); $d = trim((string)($x['d'] ?? '')); $wa = preg_replace('/\D/', '', (string)($x['wa'] ?? '')); $u = (string)($x['until'] ?? '');
    if (mb_strlen($t) < 3 || mb_strlen($d) < 10 || strlen($wa) < 8 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $u) || $u < $today) return null;
    $id = $src . ':' . preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? ''));
    if (isset($hide[$id]) && !$all) return null;
    return ['id' => $id, 't' => mb_substr($t, 0, 70), 'a' => in_array($x['a'] ?? '', $A, true) ? $x['a'] : 'otr', 'k' => in_array($x['k'] ?? '', $K, true) ? $x['k'] : 'full', 'd' => mb_substr($d, 0, 700), 'r' => mb_substr(trim((string)($x['r'] ?? '')), 0, 400), 'sal' => mb_substr(trim((string)($x['sal'] ?? '')), 0, 40), 'n' => max(1, min(999, (int)($x['n'] ?? 1))), 'wa' => $wa, 'until' => $u, 'co' => $co, 'hid' => isset($hide[$id])];
  };
  $out = [];
  foreach (guia_clients() as $c) {
    $s = at_shop_cfg($c['id']); if (!$s || ($s['status'] ?? '') === 'suspenso') continue;
    foreach (array_slice((array)($s['cfg']['jobs'] ?? []), 0, 20) as $x) { $j = $one($x, ['n' => $c['name'], 'id' => $c['id'], 'logo' => $c['logo']], $c['id']); if ($j) $out[] = $j; }
  }
  foreach (array_slice((array)($doc['gjobs'] ?? []), 0, 100) as $x) { $j = $one($x, ['n' => mb_substr(trim((string)($x['co'] ?? '')), 0, 80), 'id' => '', 'logo' => ''], 'g'); if ($j && $j['co']['n'] !== '') $out[] = $j; }
  foreach (guia_acc()['fichas'] as $f) foreach ($f['jobs'] as $x) { $j = $one($x, ['n' => $f['n'], 'id' => '', 'logo' => $f['lg']], 'f' . $f['uid']); if ($j) $out[] = $j; }
  usort($out, function ($a, $b) { return strcmp($a['until'], $b['until']); });
  @file_put_contents($cache, json_encode($out));
  return $out;
}
function guia_clients() {
  $cache = sys_get_temp_dir() . '/at_gcl1.json';
  if (is_file($cache) && time() - filemtime($cache) < 600) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $r = at_get('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' . AT_KEY . '&mask.fieldPaths=clientes');
  if ($r === null) { if (is_file($cache)) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; } return []; }
  $f = json_decode($r, true)['fields']['clientes']['arrayValue']['values'] ?? [];
  $out = [];
  foreach ($f as $v) {
    $m = $v['mapValue']['fields'] ?? []; $g = function ($k) use ($m) { $x = $m[$k] ?? null; if (!$x) return null; return $x['stringValue'] ?? ($x['booleanValue'] ?? null); };
    if ($g('sys') !== 'catalogo' || !preg_match('/^[a-z0-9][a-z0-9-]{1,60}$/', (string)$g('id'))) continue;
    $out[] = ['id' => $g('id'), 'name' => (string)$g('name'), 'segEs' => (string)$g('segEs'), 'segPt' => (string)$g('segPt'), 'city' => (string)$g('city'), 'url' => (string)$g('url'), 'logo' => (string)$g('logo'), 'dest' => (bool)$g('dest'), 'vip' => (bool)$g('vip')];
  }
  usort($out, function ($a, $b) { return strcasecmp($a['name'], $b['name']); });
  @file_put_contents($cache, json_encode($out));
  return $out;
}

// Localização confiável de um catálogo para a Guía (mapa, "Cerca de mí", página do negócio):
// 1) a ubicación marcada no catálogo (store.locSet); 2) o link do Google/Apple Maps do site do negócio;
// nunca a coordenada padrão de exemplo (centro de Santa Rita). Sem nenhuma: null (o mapa busca pelo nome e endereço).
// Coordenadas do link do Maps de uma ficha (inclusive maps.app.goo.gl e maps.apple/p): usa o maps.php do servidor principal.
// Fica 30 dias em cache (link sem coordenada: 1 dia). No máximo 4 links novos por vez, para a Guía nunca demorar.
function guia_dir_ll($u) {
  static $budget = 4; $u = (string)$u; if (!preg_match('#^https://[^\s"\'<>]{8,300}$#i', $u)) return null;
  $cache = sys_get_temp_dir() . '/at_gdll_' . md5($u) . '.json';
  if (is_file($cache)) { $c = json_decode((string)@file_get_contents($cache), true); $age = time() - filemtime($cache);
    if (is_array($c) && ((isset($c['lat']) && $age < 30 * 86400) || (!isset($c['lat']) && $age < 86400))) return isset($c['lat']) ? [$c['lat'], $c['lng']] : null; }
  if ($budget <= 0) return null; $budget--;
  $r = at_get('https://araujotechsistemas.com/maps.php?u=' . rawurlencode($u)); $c = $r ? json_decode($r, true) : null; $ok = null;
  if (is_array($c) && isset($c['lat'], $c['lng']) && is_numeric($c['lat']) && is_numeric($c['lng'])) { $la = (float)$c['lat']; $ln = (float)$c['lng'];
    if (abs($la + 25.7917) >= 0.00005 || abs($ln + 55.0886) >= 0.00005) if (abs($la) <= 90 && abs($ln) <= 180 && abs($la) > 0.01) $ok = [round($la, 6), round($ln, 6)]; }
  if ($r !== null) @file_put_contents($cache, json_encode($ok ? ['lat' => $ok[0], 'lng' => $ok[1]] : ['none' => 1]));
  return $ok;
}
function guia_loc($id, $sh) {
  $st = $sh['cfg']['store'] ?? []; $dflt = function ($la, $ln) { return abs($la + 25.7917) < 0.00005 && abs($ln + 55.0886) < 0.00005; };
  if (!empty($st['locSet']) && is_numeric($st['lat'] ?? null) && is_numeric($st['lng'] ?? null) && abs($st['lat']) > 0.01) return ['lat' => round((float)$st['lat'], 6), 'lng' => round((float)$st['lng'], 6), 'src' => 'cat'];
  $m = (string)($sh['site']['maps'] ?? '');
  if (preg_match('#^https://#i', $m)) {
    $cache = sys_get_temp_dir() . '/at_gloc_' . md5($m) . '.json';
    if (is_file($cache) && time() - filemtime($cache) < 7 * 86400) $c = json_decode((string)@file_get_contents($cache), true);
    else { $r = at_get('https://araujotechsistemas.com/maps.php?u=' . rawurlencode($m)); $c = $r ? json_decode($r, true) : null; if (is_array($c)) @file_put_contents($cache, json_encode($c)); }
    if (is_array($c) && isset($c['lat'], $c['lng']) && !$dflt($c['lat'], $c['lng'])) return ['lat' => round((float)$c['lat'], 6), 'lng' => round((float)$c['lng'], 6), 'src' => 'site'];
  }
  return null;
}

// Opiniões dos clientes de um catálogo (as mesmas regras do catálogo: só as não ocultas; a nota aparece com 3 ou mais;
// o texto, só de 4 e 5 estrelas). Respeita "mostrar opiniones" desligado e o plano sem opiniões. 30 minutos em cache.
function guia_reviews($id, $sh) {
  if (!$sh || (($sh['cfg']['store']['showRev'] ?? true) === false) || in_array('reviews', (array)($sh['off'] ?? []), true)) return null;
  $cache = sys_get_temp_dir() . '/at_grev_' . md5($id) . '.json';
  if (is_file($cache) && time() - filemtime($cache) < 1800) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d ?: null; }
  $r = at_get(AT_FS . rawurlencode($id) . '/reviews?pageSize=100&key=' . AT_KEY);
  if ($r === null) return null;
  $n = 0; $sum = 0; $top = [];
  foreach ((json_decode($r, true)['documents'] ?? []) as $doc) {
    $f = $doc['fields'] ?? []; if (!empty($f['hidden']['booleanValue'])) continue;
    $st = (int)($f['stars']['integerValue'] ?? 0); if ($st < 1 || $st > 5) continue;
    $n++; $sum += $st;
    $tx = trim((string)($f['text']['stringValue'] ?? ''));
    if ($st >= 4 && $tx !== '') $top[] = ['s' => $st, 't' => mb_substr($tx, 0, 400), 'n' => mb_substr(explode(' ', trim((string)($f['name']['stringValue'] ?? '')))[0], 0, 30), 'd' => substr((string)($f['date']['stringValue'] ?? ($f['date']['timestampValue'] ?? '')), 0, 10)];
  }
  usort($top, function ($a, $b) { return strcmp($b['d'], $a['d']); });
  $out = $n >= 3 ? ['n' => $n, 'avg' => round($sum / $n, 1), 'top' => array_slice($top, 0, 4)] : [];
  @file_put_contents($cache, json_encode($out));
  return $out ?: null;
}
// "Lo nuevo en la Guía": as últimas vagas e avisos publicados (a ordem salva já põe o mais novo primeiro; 'at' quando existe)
function guia_nov() {
  $doc = guia_doc(); $today = (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('Y-m-d'); $o = [];
  foreach (array_slice((array)($doc['gjobs'] ?? []), 0, 30) as $i => $x) {
    if (!is_array($x) || empty($x['on']) || ($x['until'] ?? '') < $today || mb_strlen(trim((string)($x['t'] ?? ''))) < 3 || trim((string)($x['co'] ?? '')) === '') continue;
    $o[] = ['k' => 'job', 'id' => 'g:' . preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')), 't' => mb_substr(trim((string)$x['t']), 0, 70), 's' => mb_substr(trim((string)$x['co']), 0, 60), 'at' => (string)($x['at'] ?? ''), 'i' => $i, 'ph' => ''];
  }
  foreach (guia_pub()['clas'] as $i => $x) $o[] = ['k' => 'cla', 'id' => $x['id'], 't' => $x['t'], 's' => $x['k'], 'op' => $x['op'], 'at' => '', 'i' => $i + 0.5, 'ph' => $x['ph']];
  usort($o, function ($a, $b) { return [$b['at'], $a['i']] <=> [$a['at'], $b['i']]; });
  return array_map(function ($x) { unset($x['at'], $x['i']); return $x; }, array_slice($o, 0, 8));
}
// uma vaga, um aviso ou um evento pelo id (página própria /vacante/<id>, /aviso/<id>, /evento/<id>)
function guia_item($k, $id) {
  if ($k === 'lugar') { foreach (guia_lugares() as $l) if ($l['slug'] === $id) return $l; return null; }
  if ($k === 'negocio') { foreach (guia_pub()['dir'] as $x) if (($x['sl'] ?? '') === $id) return $x; return null; }
  if ($k === 'vacante') { foreach (guia_jobs(false) as $j) if ($j['id'] === $id) return $j; return null; }
  $p = guia_pub();
  if ($k === 'aviso') { foreach ($p['clas'] as $c) if ($c['id'] === $id) return $c; return null; }
  if ($k === 'nota') { foreach (guia_notas(true) as $n) if ($n['id'] === $id) return $n; return null; }
  if ($k === 'evento') { foreach ($p['ev'] as $e) if (($e['id'] ?? '') === $id) return $e; return null; }
  if ($k === 'lugar') { foreach (guia_lugares() as $l) if ($l['slug'] === $id) return $l; return null; }
  return null;
}
// endereço de um negócio da Guía sem catálogo: "boi-de-ouro" (mesma regra para a página e para os links)
function guia_nslug($n) {
  $t = class_exists('Normalizer') ? Normalizer::normalize((string)$n, Normalizer::FORM_D) : (string)$n;
  $t = preg_replace('/\p{Mn}+/u', '', $t); $t = mb_strtolower($t);
  return substr(trim(preg_replace('/[^a-z0-9]+/', '-', $t), '-'), 0, 70);
}
// endereço curto de um lugar público: "hospital-distrital-de-santa-rita-salud" (mesma regra do index.html)
function guia_slug($n, $c) {
  $t = class_exists('Normalizer') ? Normalizer::normalize((string)$n, Normalizer::FORM_D) : (string)$n;
  $t = preg_replace('/\p{Mn}+/u', '', $t); $t = mb_strtolower($t);
  $t = trim(preg_replace('/[^a-z0-9]+/', '-', $t), '-');
  return substr($t, 0, 70) . '-' . preg_replace('/[^a-z]/', '', (string)$c);
}
// lugares públicos com página própria: os do painel (ou a lista de lugares-publicos.json) e as fichas grátis da comunidade
function guia_lugares() {
  $p = guia_pub(); $o = [];
  $base = is_array($p['util'] ?? null) && $p['util'] ? $p['util'] : [];
  if (!$base) { $j = json_decode((string)@file_get_contents(__DIR__ . '/../guia/lugares-publicos.json'), true); foreach ((array)($j['items'] ?? []) as $x) if (is_array($x) && !empty($x['n'])) $base[] = ['c' => (string)($x['c'] ?? ''), 'n' => (string)$x['n'], 'a' => (string)($x['a'] ?? ''), 'tel' => (string)($x['tel'] ?? ''), 'h' => (string)($x['h'] ?? ''), 'map' => (string)($x['map'] ?? ''), 'd' => '', 'src' => (string)($x['src'] ?? '')]; }
  // como na Guía: se o painel não trouxe a lista inteira (nenhum item 'o'), os lugares do arquivo público também valem (sem repetir)
  if ($base && !array_filter($base, function ($x) { return !empty($x['o']); })) {
    $nm = function ($s) { return guia_nslug($s); }; $have = array_map(function ($x) use ($nm) { return [(string)($x['c'] ?? ''), $nm($x['n'] ?? '')]; }, $base);
    $j = json_decode((string)@file_get_contents(__DIR__ . '/../guia/lugares-publicos.json'), true);
    foreach ((array)($j['items'] ?? []) as $x) { if (!is_array($x) || empty($x['n'])) continue; $c = (string)($x['c'] ?? ''); $h = $nm($x['n']); $dup = false;
      foreach ($have as $hv) if (($hv[0] === $c || ($c === 'far' && $hv[0] === 'salud')) && ($hv[1] === $h || ($h !== '' && strpos($hv[1], $h) !== false))) { $dup = true; break; }
      if (!$dup) $base[] = ['c' => $c, 'n' => (string)$x['n'], 'a' => (string)($x['a'] ?? ''), 'tel' => (string)($x['tel'] ?? ''), 'h' => (string)($x['h'] ?? ''), 'map' => (string)($x['map'] ?? ''), 'd' => '', 'src' => (string)($x['src'] ?? '')]; }
  }
  foreach ($base as $x) $o[] = $x + ['d' => '', 'wa' => '', 'web' => '', 'ig' => '', 'ph' => '', 'lg' => ''];
  foreach ((array)($p['fu'] ?? []) as $x) $o[] = $x + ['h' => '', 'src' => ''];
  $o = array_values(array_filter($o, function ($x) { return empty($x['off']) && !in_array($x['vs'] ?? '', ['cer', 'fue'], true); })); // cerrado ou fora de Santa Rita: sem página
  foreach ($o as &$x) $x['slug'] = guia_slug($x['n'], $x['c']); unset($x);
  return $o;
}
