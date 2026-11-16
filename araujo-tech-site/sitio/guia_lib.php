<?php
// Guía Vitrix: banners pagos (platform/sitio.gads) e lugares públicos (platform/sitio.gutil), cadastrados no Panel Araújo Tech.
// Os banners só saem entre as datas escolhidas (hora do Paraguai). A imagem vai por gimg.php (o JSON fica leve).
function guia_doc() {
  $cache = sys_get_temp_dir() . '/at_guia7.json';
  if (is_file($cache) && time() - filemtime($cache) < 180) { $d = json_decode((string)@file_get_contents($cache), true); if (is_array($d)) return $d; }
  $r = at_get('https://firestore.googleapis.com/v1/projects/araujotech-catalogos/databases/(default)/documents/platform/sitio?key=' . AT_KEY . '&mask.fieldPaths=gads&mask.fieldPaths=gutil&mask.fieldPaths=gpro&mask.fieldPaths=gbus&mask.fieldPaths=gturno&mask.fieldPaths=gev&mask.fieldPaths=gnews&mask.fieldPaths=gdir&mask.fieldPaths=gsoc&mask.fieldPaths=gjobs&mask.fieldPaths=gjobx&mask.fieldPaths=gclas&mask.fieldPaths=gadsAt');
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
  $d = ['gads' => $val($f['gads'] ?? null) ?: [], 'gutil' => isset($f['gutil']) ? ($val($f['gutil']) ?: []) : null, 'gpro' => $val($f['gpro'] ?? null) ?: [], 'gbus' => $val($f['gbus'] ?? null) ?: [], 'gturno' => $val($f['gturno'] ?? null) ?: [], 'gev' => $val($f['gev'] ?? null) ?: [], 'gdir' => $val($f['gdir'] ?? null) ?: [], 'gnews' => $val($f['gnews'] ?? null) ?: null, 'gsoc' => $val($f['gsoc'] ?? null) ?: [], 'gjobs' => $val($f['gjobs'] ?? null) ?: [], 'gjobx' => $val($f['gjobx'] ?? null) ?: [], 'gclas' => $val($f['gclas'] ?? null) ?: [], 'at' => (string)($val($f['gadsAt'] ?? null) ?? '')];
  @file_put_contents($cache, json_encode($d));
  return $d;
}
// horário por dia de uma ficha simples (mesmo formato do catálogo: 7 dias, domingo = 0)
function guia_dy($dy) {
  if (!is_array($dy) || count($dy) !== 7) return null;
  $ok = function ($v) { return preg_match('/^\d{2}:\d{2}$/', (string)$v) ? (string)$v : ''; }; $o = []; $any = false;
  foreach (array_values($dy) as $d) { $d = is_array($d) ? $d : []; $a = (array)($d['a'] ?? []); $b = (array)($d['b'] ?? []);
    $x = ['on' => !empty($d['on']), 'a' => [$ok($a[0] ?? ''), $ok($a[1] ?? '')], 'b' => [$ok($b[0] ?? ''), $ok($b[1] ?? '')]];
    if ($x['a'][0] !== '' && $x['a'][1] === '' && $x['b'][0] === '' && $x['b'][1] !== '') { $x['a'][1] = $x['b'][1]; $x['b'] = ['', '']; } // 07:00 … 23:00 nas pontas = horário corrido
    if ($x['on'] && $x['a'][0] !== '' && $x['a'][1] !== '') $any = true; $o[] = $x; }
  return $any ? $o : null;
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
    $ev[] = ['t' => (string)$x['t'], 'k' => in_array($x['k'] ?? '', ['rel', 'dep', 'cul', 'com', 'neg', 'inf', 'otr'], true) ? $x['k'] : 'otr', 'd' => (string)$x['d'], 'h' => (string)($x['h'] ?? ''), 'l' => (string)($x['l'] ?? ''), 'u' => $u];
  }
  usort($ev, function ($a, $b) { return strcmp($a['d'] . $a['h'], $b['d'] . $b['h']); });
  // negócios sem catálogo (ficha simples cadastrada no Panel Araújo Tech)
  $dir = [];
  foreach ((array)($d['gdir'] ?? []) as $x) {
    if (!is_array($x) || ($x['on'] ?? true) === false || trim((string)($x['n'] ?? '')) === '') continue;
    $id = preg_replace('/[^a-z0-9]/i', '', (string)($x['id'] ?? '')); if ($id === '') continue;
    $m = (string)($x['map'] ?? ''); if (!preg_match('#^https://[^\s"\'<>]+$#i', $m)) $m = '';
    $g = (string)($x['g'] ?? 'serv'); if (!in_array($g, ['food', 'shop', 'health', 'home', 'car', 'serv'], true)) $g = 'serv';
    $dir[] = ['id' => $id, 'n' => mb_substr(trim((string)$x['n']), 0, 80), 'g' => $g, 'd' => mb_substr(trim((string)($x['d'] ?? '')), 0, 60), 'tel' => preg_replace('/[^\d+ ()-]/', '', (string)($x['tel'] ?? '')), 'wa' => preg_replace('/[^\d+]/', '', (string)($x['wa'] ?? '')), 'a' => mb_substr(trim((string)($x['a'] ?? '')), 0, 140), 'map' => $m, 'hrs' => mb_substr(trim((string)($x['hrs'] ?? '')), 0, 80), 'ig' => preg_replace('/[^\w.]/', '', (string)($x['ig'] ?? '')), 'td' => !empty($x['td']), 'dy' => guia_dy($x['dy'] ?? null), 'mt' => (($x['mt'] ?? '') === 'cat') ? 'cat' : 'menu', 'mu' => preg_match('#^https://[^\s"\'<>]+$#i', (string)($x['mu'] ?? '')) ? (string)$x['mu'] : '', 'tu' => array_values(array_intersect(['de', 'al', 'me', 'ce'], array_map('strval', (array)($x['tu'] ?? [])))), 'lg' => preg_match('#^data:image/(jpeg|png|webp);base64,#', (string)($x['lg'] ?? '')) ? '/sitio/gimg.php?d=' . $id . '&v=' . substr(md5((string)$x['lg']), 0, 8) : '', 'ph' => preg_match('#^data:image/(jpeg|png|webp);base64,#', (string)($x['ph'] ?? '')) ? '/sitio/gimg.php?d=' . $id . '&k=ph&v=' . substr(md5((string)$x['ph']), 0, 8) : ''];
    if (count($dir) >= 300) break;
  }
  $so = (array)($d['gsoc'] ?? []); $soc = []; // redes da Guía (rodapé), configuradas no painel
  $w = preg_replace('/\D/', '', (string)($so['wa'] ?? '')); if (strlen($w) >= 8) $soc['wa'] = $w;
  foreach (['fb', 'ig', 'yt', 'tt'] as $k) { $u = trim((string)($so[$k] ?? '')); if (preg_match('#^https://[^\s"\'<>]+$#i', $u)) $soc[$k] = $u; }
  return ['ads' => $ads, 'util' => $util, 'pros' => $pros, 'bus' => $bus, 'turno' => $turno, 'ev' => array_slice($ev, 0, 30), 'dir' => $dir, 'soc' => (object)$soc, 'at' => substr((string)($d['at'] ?? ''), 0, 10)];
}

// Notícias do parceiro: lê o feed RSS configurado no painel (só manchete, foto e link para ler no site deles). Cache de 30 minutos.
function guia_news() {
  $cfg = guia_doc()['gnews'] ?? null;
  if (!is_array($cfg) || empty($cfg['on'])) return ['items' => []];
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
  return ['n' => $name, 'site' => $site, 'items' => array_slice(array_merge($man, $items), 0, 8)];
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
