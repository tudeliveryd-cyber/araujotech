<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Página própria de uma vaga, um aviso, um evento, um lugar público ou um negócio sem catálogo da Guía:
// /vacante/<id>, /aviso/<id>, /evento/<id>, /lugar/<nome>, /negocio/<nome>.
// Serve para compartilhar no WhatsApp com prévia (título e foto) e para o Google (JobPosting / Event).
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$k = (string)($_GET['k'] ?? ''); $rid = (string)($_GET['id'] ?? '');
$id = ($k === 'lugar' || $k === 'negocio' || $k === 'nota') ? $rid : str_replace('.', ':', $rid);
$x = (in_array($k, ['vacante', 'aviso', 'evento', 'lugar', 'negocio', 'nota'], true) && preg_match('/^[A-Za-z0-9:_-]{2,90}$/', $id)) ? guia_item($k, $id) : null;
$e = function ($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); };
$host = preg_match('/(^|\.)guiadesantarita\.com$/i', (string)($_SERVER['HTTP_HOST'] ?? '')) ? 'https://guiadesantarita.com' : 'https://araujotechsistemas.com/guia';
$G = $host . '/';
$self = $host . '/' . $k . '/' . rawurlencode($rid);
$CK = ['per' => 'Perdidos y encontrados', 'inm' => 'Inmueble', 'veh' => 'Vehículo', 'var' => 'Productos y varios', 'ser' => 'Servicios'];
$TRPT = []; // textos do Jean em espanhol → português (guia_tr), usados quando a pessoa escolheu português
$COP = ['venta' => 'Venta', 'alq' => 'Alquiler', 'perd' => 'Se perdió', 'enc' => 'Se encontró'];
$JK = ['full' => 'Tiempo completo', 'part' => 'Medio tiempo', 'temp' => 'Temporal', 'first' => 'Primer empleo'];
$EK = ['rel' => 'Religioso', 'dep' => 'Deportivo', 'cul' => 'Cultural', 'com' => 'Comunitario', 'neg' => 'Feria o comercial', 'inf' => 'Infantil', 'otr' => 'Evento', 'fer' => 'Feriado'];
$MES = ['', 'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
$fd = function ($d) use ($MES) { return preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', (string)$d, $m) ? (int)$m[3] . ' ' . $MES[(int)$m[2]] . ' ' . $m[1] : ''; };
$wa = function ($n) { $n = preg_replace('/\D/', '', (string)$n); if ($n !== '' && $n[0] === '0') $n = '595' . substr($n, 1); elseif ($n !== '' && strpos($n, '595') !== 0 && strlen($n) <= 10) $n = '595' . $n; return $n; };
$img = 'https://araujotechsistemas.com/img/guia/og-guia.jpg?v=3';
if (!$x) {
  http_response_code(410);
  $title = 'Esta publicación ya no está disponible'; $desc = 'Venció o fue retirada. Mirá lo que hay hoy en la Guía de Santa Rita.'; $tags = []; $body = ''; $btns = ''; $ld = '';
} else {
  if ($k === 'vacante') {
    $co = (string)($x['co']['n'] ?? '');
    $title = 'Vacante: ' . $x['t'] . ($co !== '' ? ' — ' . $co : '');
    $desc = mb_substr(preg_replace('/\s+/u', ' ', $x['d']), 0, 155);
    $tags = array_filter([$JK[$x['k']] ?? '', $x['sal'] ?? '', $x['until'] ? 'Hasta el ' . $fd($x['until']) : '']);
    $body = $x['d'] . ($x['r'] !== '' ? "\n\nRequisitos: " . $x['r'] : '');
    $msg = 'Hola, vi la vacante de ' . $x['t'] . ' en la Guía de Santa Rita y me interesa postularme' . ($co !== '' ? ' para ' . $co : '') . '.';
    $btns = '<a class="btn pri" href="' . $e('https://wa.me/' . $wa($x['wa']) . '?text=' . rawurlencode($msg)) . '" target="_blank" rel="noopener">Postularme por WhatsApp</a>';
    $ld = json_encode(['@context' => 'https://schema.org', '@type' => 'JobPosting', 'title' => $x['t'], 'description' => $x['d'], 'datePosted' => (new DateTime('now', new DateTimeZone('America/Asuncion')))->format('Y-m-d'), 'validThrough' => $x['until'] . 'T23:59:00-03:00',
      'employmentType' => ['full' => 'FULL_TIME', 'part' => 'PART_TIME', 'temp' => 'TEMPORARY', 'first' => 'INTERN'][$x['k']] ?? 'OTHER', 'hiringOrganization' => ['@type' => 'Organization', 'name' => $co ?: 'Empresa de Santa Rita'],
      'jobLocation' => ['@type' => 'Place', 'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY']]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $kind = 'Vacante de empleo';
  } elseif ($k === 'aviso') {
    $title = ($COP[$x['op']] ?? '') !== '' ? $COP[$x['op']] . ': ' . $x['t'] : $x['t'];
    $desc = mb_substr(preg_replace('/\s+/u', ' ', $x['d'] ?: ($CK[$x['k']] ?? 'Aviso')), 0, 155);
    $tags = array_filter([$CK[$x['k']] ?? '', $COP[$x['op']] ?? '', $x['pr'], $x['z']]);
    $body = $x['d'];
    if ($x['ph'] !== '') $img = 'https://araujotechsistemas.com' . $x['ph'];
    $btns = '<a class="btn pri" href="' . $e('https://wa.me/' . $wa($x['wa']) . '?text=' . rawurlencode('Hola, vi tu aviso "' . $x['t'] . '" en la Guía de Santa Rita y quiero más información.')) . '" target="_blank" rel="noopener">Consultar por WhatsApp</a>';
    $ld = ''; $kind = $CK[$x['k']] ?? 'Aviso';
  } elseif ($k === 'negocio') {
    $NG = ['food' => 'Comida y bebidas', 'shop' => 'Tiendas y moda', 'health' => 'Salud y belleza', 'home' => 'Hogar y construcción', 'car' => 'Autos, motos y náutica', 'serv' => 'Servicios'];
    foreach (guia_cat(guia_doc()['gcat'] ?? [])['neg'] as $cg) { if ($cg['n']['es'] !== '') $NG[$cg['k']] = $cg['n']['es']; foreach ($cg['tabs'] as $ct) if ($ct['n']['es'] !== '' && $ct['k'] === ($x['sub'] ?? '')) $NG['_sub'] = $ct['n']['es']; }
    $kind = $NG['_sub'] ?? ($NG[$x['g']] ?? 'Negocio'); $cty = trim((string)($x['ci'] ?? '')) ?: 'Santa Rita'; // rev3: cidade da ficha (vazio = Santa Rita)
    $MOL = ['dom' => 'Servicio a domicilio', 'ped' => 'Venta por pedido', 'cit' => 'Con cita previa', 'del' => 'Solo delivery']; $mo = $MOL[$x['mo'] ?? ''] ?? ''; // 26/11: sem local físico → sem mapa nem "cómo llegar"
    foreach ([$kind, $x['d'] ?? '', $x['hrs'] ?? ''] as $tt) if (($tp = guia_tr($tt)) !== '') $TRPT[$tt] = $tp; // português automático
    $x['t'] = $x['n'];
    if (($x['phh'] ?? '') !== '') $x['ph'] = $x['phh']; // 25/11 (etapa 3): capa em boa resolução (plano pago)
    $nll = null; if (is_array($x['ll'] ?? null) && count($x['ll']) === 2) $nll = [(float)$x['ll'][0], (float)$x['ll'][1]]; elseif (preg_match('/[?&](?:q|query)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/', (string)$x['map'], $mm) || preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', (string)$x['map'], $mm)) $nll = [(float)$mm[1], (float)$mm[2]];
    $sl0 = $mo !== '' || trim((string)$x['a']) === ''; // 26/11 (Jean): mapa e "Cómo llegar" só com endereço físico cadastrado
    if ($sl0) { $nll = null; }
    $emb = $sl0 ? '' : ($nll ? 'https://maps.google.com/maps?q=' . $nll[0] . ',' . $nll[1] . '&z=16&output=embed' : (trim((string)$x['a']) !== '' ? 'https://maps.google.com/maps?q=' . rawurlencode($x['n'] . ', ' . $x['a'] . ', ' . $cty . ', Alto Paraná, Paraguay') . '&z=16&output=embed' : ''));
    $title = $x['n'] . ' — ' . $cty;
    $DN = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; $hrsL = [];
    if (is_array($x['dy'] ?? null)) foreach ([1, 2, 3, 4, 5, 6, 0] as $di) { $dd = $x['dy'][$di] ?? null; if (!is_array($dd)) continue; $rg = []; foreach (['a', 'b'] as $kk) if (!empty($dd['on']) && !empty($dd[$kk][0]) && !empty($dd[$kk][1])) $rg[] = $dd[$kk][0] === $dd[$kk][1] ? '24 horas' : $dd[$kk][0] . '–' . $dd[$kk][1]; $hrsL[] = [$DN[$di], $rg ? implode(' · ', $rg) : 'Cerrado', $di, $rg]; }
    $desc = mb_substr(trim(($x['d'] ? $x['d'] . '. ' : '') . $kind . ' en ' . $cty . ', Alto Paraná.' . ($x['a'] ? ' ' . $x['a'] . '.' : '') . ($x['hrs'] ? ' Horario: ' . $x['hrs'] . '.' : '')), 0, 160);
    $tags = array_filter([$mo, $cty !== 'Santa Rita' ? $cty : '', !empty($x['td']) ? 'Aliado Tu Delivery' : '', $x['hrs']]);
    $body = (string)(($x['dx'] ?? '') ?: ($x['d'] ?? ''));
    $mq = preg_match('#^https://#', (string)$x['map']) ? $x['map'] : 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($x['n'] . ($x['a'] ? ' ' . $x['a'] : '') . ' ' . $cty . ', Alto Paraná, Paraguay');
    $tel = preg_replace('/[^\d+]/', '', (string)$x['tel']); $wn = $x['wa'] ? $wa($x['wa']) : '';
    $wmsg = !empty($x['td']) ? 'Hola, quiero hacer un pedido. Te encontré en la Guía de Santa Rita.' : 'Hola, te encontré en la Guía de Santa Rita y quiero más información.';
    $ico = function ($p) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $p . '</svg>'; };
    $btns = ($wn ? '<a class="btn pri" href="' . $e('https://wa.me/' . $wn . '?text=' . rawurlencode($wmsg)) . '" target="_blank" rel="noopener">' . $ico('<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>') . (!empty($x['td']) ? 'Pedir por WhatsApp' : 'WhatsApp') . '</a>' : '')
      . ($tel ? '<a class="btn" href="tel:' . $e($tel) . '">' . $ico('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>') . 'Llamar</a>' : '')
      . ($sl0 ? '' : '<a class="btn" href="' . $e($mq) . '" target="_blank" rel="noopener">' . $ico('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>') . 'Cómo llegar</a>')
      . ($x['mu'] ? '<a class="btn" href="' . $e($x['mu']) . '" target="_blank" rel="noopener">' . $ico('<path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6M8 11h6"/>') . (($x['mt'] ?? '') === 'cat' ? 'Ver catálogo' : 'Ver menú') . '</a>' : '')
      . (($x['ig'] ?? '') ? '<a class="btn" href="' . $e('https://instagram.com/' . $x['ig']) . '" target="_blank" rel="noopener">' . $ico('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>') . 'Instagram</a>' : '')
      . (preg_match('#^https://#', (string)($x['web'] ?? '')) ? '<a class="btn" href="' . $e($x['web']) . '" target="_blank" rel="noopener">Sitio web</a>' : '');
    $oh = []; foreach ($hrsL as $h) foreach ($h[3] as $r) { [$o, $c] = $r === '24 horas' ? ['00:00', '23:59'] : explode('–', $r); $oh[] = ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => 'https://schema.org/' . ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][$h[2]], 'opens' => $o, 'closes' => $c]; }
    $ld = json_encode(array_filter(['@context' => 'https://schema.org', '@type' => $x['g'] === 'food' ? 'FoodEstablishment' : 'LocalBusiness', 'name' => $x['n'], 'description' => $x['d'] ?: null, 'url' => $self, 'telephone' => $x['tel'] ?: ($wn ? '+' . $wn : null), 'image' => ($im0 = array_values(array_filter(array_map(function ($u) { return $u !== '' ? 'https://guiadesantarita.com' . $u : ''; }, array_merge([($x['ph'] ?? '') ?: ($x['lg'] ?? '')], (array)($x['gl'] ?? [])))))) ? (count($im0) === 1 ? $im0[0] : $im0) : null, 'logo' => ($x['lg'] ?? '') !== '' ? 'https://guiadesantarita.com' . $x['lg'] : null,
      'address' => ['@type' => 'PostalAddress', 'streetAddress' => $mo !== '' ? null : ($x['a'] ?: null), 'addressLocality' => $cty, 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY'], 'areaServed' => $mo !== '' ? $cty : null, 'hasMap' => $mo !== '' ? null : $mq, 'openingHoursSpecification' => $oh ?: null, 'sameAs' => ($x['ig'] ?? '') ? ['https://instagram.com/' . $x['ig']] : null]), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (($x['ph'] ?? '') !== '') $img = 'https://guiadesantarita.com' . $x['ph']; elseif (($x['lg'] ?? '') !== '') $img = 'https://guiadesantarita.com' . $x['lg'];
  } elseif ($k === 'nota') {
    $kind = GUIA_NK[$x['k']][0] ?? 'Noticia';
    $title = $x['t'] . ' — Santa Rita al día';
    $desc = mb_substr($x['r'] !== '' ? $x['r'] : $kind . ' de Santa Rita, Alto Paraná.', 0, 160);
    $tags = array_filter([$kind, $x['d'] ? $fd($x['d']) : '']);
    $body = (string)($x['x'] ?? '');
    $x['ph'] = $x['img'];
    $btns = $x['u'] ? '<a class="btn pri" style="background:var(--deep);border-color:var(--deep)" href="' . $e($x['u']) . '" target="_blank" rel="noopener">' . ($body !== '' ? 'Ver la fuente' : 'Leer la nota completa') . '</a>' : '';
    $ld = json_encode(array_filter(['@context' => 'https://schema.org', '@type' => $x['k'] === 'not' || $x['k'] === 'acon' ? 'NewsArticle' : 'Article', 'headline' => $x['t'], 'datePublished' => $x['d'] ?: null, 'image' => $x['img'] ? 'https://guiadesantarita.com' . $x['img'] : null, 'url' => $self,
      'publisher' => ['@type' => 'Organization', 'name' => 'Guía de Santa Rita', 'url' => 'https://guiadesantarita.com/']]), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($x['img']) $img = 'https://guiadesantarita.com' . $x['img'];
  } elseif ($k === 'lugar') {
    $PC = ['gob' => 'Gobierno y trámites', 'doc' => 'Documentos', 'salud' => 'Salud', 'far' => 'Farmacia', 'seg' => 'Seguridad', 'ocio' => 'Plazas y recreación', 'trans' => 'Transporte', 'serv' => 'Servicios públicos', 'edu' => 'Educación', 'gua' => 'Guardería y jardín', 'escpub' => 'Escuela o colegio público', 'escpri' => 'Colegio privado', 'unipub' => 'Universidad pública', 'unipri' => 'Universidad privada', 'inst' => 'Instituto, cursos e idiomas', 'igl' => 'Iglesia', 'com' => 'Comunidad y ONGs', 'dep' => 'Deportes y clubes', 'ani' => 'Animales y adopción', 'fin' => 'Bancos y finanzas'];
    foreach (guia_cat(guia_doc()['gcat'] ?? [])['pub'] as $cg) { if (!$cg['tabs'] && $cg['n']['es'] !== '') $PC[$cg['k']] = $cg['n']['es']; foreach ($cg['tabs'] as $ct) if ($ct['n']['es'] !== '') $PC[$ct['k']] = $ct['n']['es']; } // nomes das pastas e abas do painel
    $kind = $PC[$x['c']] ?? 'Lugar público';
    foreach ([$kind, $x['h'] ?? '', $x['d'] ?? ''] as $tt) if (($tp = guia_tr($tt)) !== '') $TRPT[$tt] = $tp;
    $x['t'] = $x['n'];
    $title = $x['n'] . ' — Santa Rita';
    $desc = trim($kind . ' en Santa Rita, Alto Paraná.' . ($x['a'] ? ' ' . $x['a'] . '.' : '') . ($x['h'] ? ' Horario: ' . $x['h'] . '.' : '') . ($x['tel'] ? ' Tel. ' . $x['tel'] . '.' : ''));
    $tags = array_filter([$kind, $x['a'], $x['h']]);
    $body = (string)(($x['dx'] ?? '') ?: ($x['d'] ?? ''));
    $mq = preg_match('#^https://#', (string)$x['map']) ? $x['map'] : 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($x['n'] . ($x['a'] ? ' ' . $x['a'] : '') . ' Santa Rita, Alto Paraná, Paraguay');
    $tel = preg_replace('/[^\d+]/', '', (string)$x['tel']);
    $btns = '<a class="btn pri" style="background:var(--deep);border-color:var(--deep)" href="' . $e($mq) . '" target="_blank" rel="noopener">Cómo llegar</a>' . ($tel ? '<a class="btn" href="tel:' . $e($tel) . '">Llamar ' . $e($x['tel']) . '</a>' : '') . (($x['wa'] ?? '') ? '<a class="btn" href="' . $e('https://wa.me/' . $wa($x['wa'])) . '" target="_blank" rel="noopener">WhatsApp</a>' : '');
    $ll = null; if (preg_match('/[?&](?:q|query)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/', (string)$x['map'], $m) || preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', (string)$x['map'], $m)) $ll = [(float)$m[1], (float)$m[2]];
    $ld = json_encode(array_filter(['@context' => 'https://schema.org', '@type' => ['igl' => 'Church', 'edu' => 'School', 'gua' => 'Preschool', 'escpub' => 'School', 'escpri' => 'School', 'unipub' => 'CollegeOrUniversity', 'unipri' => 'CollegeOrUniversity', 'inst' => 'EducationalOrganization', 'salud' => 'Hospital', 'far' => 'Pharmacy', 'fin' => 'BankOrCreditUnion', 'ocio' => 'Park', 'trans' => 'BusStation', 'seg' => 'PoliceStation', 'gob' => 'GovernmentOffice'][$x['c']] ?? 'Place', 'name' => $x['n'], 'telephone' => $x['tel'] ?: null,
      'address' => ['@type' => 'PostalAddress', 'streetAddress' => $x['a'] ?: null, 'addressLocality' => 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY'], 'geo' => $ll ? ['@type' => 'GeoCoordinates', 'latitude' => $ll[0], 'longitude' => $ll[1]] : null, 'hasMap' => $mq]), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (($x['ph'] ?? '') !== '') $img = 'https://araujotechsistemas.com' . $x['ph'];
  } else {
    $title = $x['t'];
    $desc = trim($fd($x['d']) . ($x['h'] ? ' · ' . $x['h'] : '') . ($x['l'] ? ' · ' . $x['l'] : '')) . ' — Agenda de Santa Rita.';
    $tags = array_filter([$EK[$x['k']] ?? 'Evento', $fd($x['d']), $x['h'], $x['l']]);
    $body = ''; $btns = $x['u'] ? '<a class="btn pri" href="' . $e($x['u']) . '" target="_blank" rel="noopener">Más información</a>' : '';
    $ld = json_encode(['@context' => 'https://schema.org', '@type' => 'Event', 'name' => $x['t'], 'startDate' => $x['d'] . ($x['h'] ? 'T' . $x['h'] . ':00-03:00' : ''), 'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
      'location' => ['@type' => 'Place', 'name' => $x['l'] ?: 'Santa Rita', 'address' => ['@type' => 'PostalAddress', 'addressLocality' => 'Santa Rita', 'addressRegion' => 'Alto Paraná', 'addressCountry' => 'PY']]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $kind = 'Agenda de Santa Rita';
  }
}
$back = $k === 'nota' ? $G . '#aldia' : ($k === 'vacante' ? $G . '#empleos' : ($k === 'aviso' ? $G . '#clasificados' : ($k === 'lugar' ? $G . '#util' : ($k === 'negocio' ? $G . '#negocios' : $G . '#agenda'))));
?><!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title><?= $e($title) ?> | Guía de Santa Rita</title>
<meta name="description" content="<?= $e($desc) ?>">
<?php if ($x): ?><link rel="canonical" href="<?= $e($self) ?>"><?php else: ?><meta name="robots" content="noindex"><?php endif; ?>
<meta property="og:type" content="website"><meta property="og:site_name" content="Guía de Santa Rita"><meta property="og:title" content="<?= $e($title) ?>"><meta property="og:description" content="<?= $e($desc) ?>"><meta property="og:image" content="<?= $e($img) ?>"><meta property="og:url" content="<?= $e($self) ?>"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/guia/favicon.png?v=4"><meta name="theme-color" content="#24093F">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'"><noscript><link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet"></noscript>
<?php if ($ld): ?><script type="application/ld+json"><?= $ld ?></script><?php endif; ?>
<style>
:root{--purple:#8A12D6;--deep:#4A0A80;--night:#24093F;--lilac:#F3ECFB;--ink:#1A1222;--muted:#5F566B;--line:#E4DAF0;--yellow:#FFC21A;--display:"Red Hat Display",system-ui,sans-serif;--text:"Red Hat Text",system-ui,sans-serif}
*{box-sizing:border-box;margin:0}body{font-family:var(--text);color:var(--ink);background:#FBF8FE;line-height:1.55}
.hdr{background:#fff;border-bottom:1px solid #ECE6F3}.nav{max-width:760px;margin:0 auto;padding:0 18px;height:64px;display:flex;align-items:center;gap:12px}.nav img{height:40px;width:auto;display:block}.nav .sp{flex:1}
.bk{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-weight:700;font-size:14px;color:var(--deep);border:1px solid var(--line);background:#F4F0F9;border-radius:999px;padding:7px 12px}
main{max-width:760px;margin:0 auto;padding:22px 18px 40px}
.box{background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden;box-shadow:0 24px 50px -32px rgba(36,9,63,.45)}
.ph{display:block;width:100%;max-height:420px;object-fit:cover;background:var(--lilac)}
.in{padding:22px}
.kd{font-size:13px;font-weight:700;color:var(--purple)}
h1{font-family:var(--display);font-weight:900;font-size:clamp(26px,5vw,36px);line-height:1.1;letter-spacing:-.4px;margin-top:6px}
.co{margin-top:6px;font-size:17px;font-weight:700;color:var(--deep)}
.tg{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.tg span{font-size:13.5px;font-weight:700;background:var(--lilac);color:var(--deep);border-radius:999px;padding:5px 11px}
.tx{margin-top:16px;font-size:16px;white-space:pre-line}
.act{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:inherit;font-weight:700;font-size:15px;text-decoration:none;border-radius:14px;padding:12px 16px;border:1px solid var(--line);background:#fff;color:var(--deep);cursor:pointer}
.btn.pri{background:#15803D;border-color:#15803D;color:#fff}
.nlg{width:72px;height:72px;border-radius:18px;object-fit:cover;border:1px solid var(--line);background:#fff;display:block;margin-bottom:12px}
.box .ph+.in .nlg{margin-top:-58px;position:relative;box-shadow:0 0 0 4px #fff}
.sh2{font-family:var(--display);font-weight:900;font-size:19px;margin-top:22px}
.hrs{list-style:none;padding:0;margin:10px 0 0;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.hrs li{display:flex;justify-content:space-between;gap:12px;padding:9px 14px;border-top:1px solid #F0EAF7;font-size:15px}.hrs li:first-child{border-top:0}
.hrs li b{font-weight:600;color:var(--muted);text-align:right}.hrs li.hoy{background:var(--lilac)}.hrs li.hoy b{color:var(--deep);font-weight:800}
.nt{margin-top:16px;font-size:13.5px;color:var(--muted)}
.empty{text-align:center;padding:34px 22px}.empty h1{font-size:26px}.empty p{margin-top:10px;color:var(--muted)}
.btn:focus-visible,.bk:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
.vf{display:inline-flex;vertical-align:-2px;margin-left:8px;color:var(--purple)}.vf svg{display:block}
.vds{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:8px 0 16px}.vd{border:1px solid #EEE7F6;border-radius:14px;overflow:hidden;background:#fff}.vd iframe{display:block;width:100%;aspect-ratio:16/9;border:0;background:#111}.vd.vt iframe{aspect-ratio:9/16;max-height:600px}.vd .vl{display:block;padding:9px 12px;font-weight:700;font-size:14px;color:#4A0A80;text-decoration:none}
.stl{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.stl span{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:700;border-radius:999px;padding:5px 11px}.stl .on{background:#E6F6EC;color:#13723A}.stl .on i{width:8px;height:8px;border-radius:50%;background:#1FA855}.stl .off{background:#F3EFF6;color:var(--muted)}.stl .rc{background:#FFF4D1;color:#7A5200}.stl svg{width:15px;height:15px}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.gal button{padding:0;border:0;background:var(--lilac);border-radius:12px;overflow:hidden;aspect-ratio:1;cursor:zoom-in}.gal img{width:100%;height:100%;object-fit:cover;display:block}.gal button:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
@media(min-width:620px){.gal{grid-template-columns:repeat(4,1fr)}}
dialog.lb{margin:auto;border:0;padding:0;background:transparent;max-width:min(94vw,1000px);max-height:92vh}dialog.lb::backdrop{background:rgba(20,8,34,.88)}dialog.lb img{display:block;max-width:100%;max-height:84vh;border-radius:12px;margin:0 auto}dialog.lb .lbb{display:flex;justify-content:center;gap:10px;margin-top:10px}dialog.lb button{font:inherit;font-weight:700;font-size:15px;border:0;border-radius:999px;padding:10px 18px;background:#fff;color:var(--deep);cursor:pointer;min-height:44px}
.adr{margin-top:10px;font-size:15.5px;display:flex;gap:8px;align-items:flex-start}.adr svg{flex:none;margin-top:3px;color:var(--purple)}.mapf{margin-top:10px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--lilac)}.mapf iframe{display:block;width:100%;height:240px;border:0}
.nt-x{margin:14px 0 4px;font-size:17px;line-height:1.7;color:#2A1F38}.nt-x p{margin:0 0 14px}
</style>
</head>
<body>
<header class="hdr"><div class="nav"><a class="bk" href="<?= $e($back) ?>">Volver a la Guía</a><span class="sp"></span><a href="<?= $e($G) ?>" aria-label="Guía de Santa Rita"><img src="/img/guia/guia-logo-s.webp" alt="Guía de Santa Rita" width="83" height="40"></a></div></header>
<main>
<?php if (!$x): ?>
<div class="box empty"><h1>Esta publicación ya no está disponible</h1><p>Venció o fue retirada por quien la publicó.</p><div class="act" style="justify-content:center"><a class="btn pri" style="background:var(--deep);border-color:var(--deep)" href="<?= $e($G) ?>">Ver lo que hay hoy en la Guía</a></div></div>
<?php else: ?>
<article class="box"><?php if (($k === 'aviso' || $k === 'lugar' || $k === 'negocio' || $k === 'nota') && ($x['ph'] ?? '') !== ''): ?><img class="ph" src="<?= $e($x['ph']) ?>" alt="<?= $e($k === 'negocio' ? 'Foto de ' . $x['n'] : '') ?>"><?php endif; ?><div class="in">
<?php if ($k === 'negocio' && ($x['lg'] ?? '') !== ''): ?><img class="nlg" src="<?= $e($x['lg']) ?>" alt="Logo de <?= $e($x['n']) ?>" width="72" height="72"><?php endif; ?>
<p class="kd"><?= $e($kind) ?></p><h1><?= $e($x['t']) ?><?php if ($k === 'negocio' && !empty($x['td'])): ?><span class="vf" role="img" title="Verificado: trabaja con Tu Delivery" aria-label="Negocio verificado"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12.00 1.00L14.41 3.02L17.50 2.47L18.58 5.42L21.53 6.50L20.98 9.59L23.00 12.00L20.98 14.41L21.53 17.50L18.58 18.58L17.50 21.53L14.41 20.98L12.00 23.00L9.59 20.98L6.50 21.53L5.42 18.58L2.47 17.50L3.02 14.41L1.00 12.00L3.02 9.59L2.47 6.50L5.42 5.42L6.50 2.47L9.59 3.02z"/><path d="m7.8 12.3 2.9 2.9 5.5-5.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><?php endif; ?></h1>
<?php if ($k === 'negocio' && (!empty($x['dy']) || !empty($x['tc']) || !empty($x['rc']))): ?><div class="stl"><?php if (!empty($x['tc'])): ?><span class="off">Cerrado temporalmente</span><?php elseif (!empty($x['dy'])): ?><span id="nst" class="off" data-dy="<?= $e(json_encode($x['dy'])) ?>">Horario</span><?php endif; ?><?php if (!empty($x['rc'])): ?><span class="rc"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>Recomendado</span><?php endif; ?></div><?php endif; ?>
<?php if ($k === 'vacante' && ($x['co']['n'] ?? '') !== ''): ?><p class="co"><?= $e($x['co']['n']) ?></p><?php endif; ?>
<?php if ($tags): ?><div class="tg"><?php foreach ($tags as $t): ?><span><?= $e($t) ?></span><?php endforeach; ?></div><?php endif; ?>
<?php if ($body !== '' && $k === 'nota'): ?><div class="nt-x"><?php foreach (preg_split('/\n\s*\n/', $body) as $pp): if (trim($pp) === '') continue; ?><p><?= nl2br($e(trim($pp))) ?></p><?php endforeach; ?></div><?php elseif ($body !== ''): ?><p class="tx"><?= $e($body) ?></p><?php endif; ?>
<div class="act"><?= $btns ?><button class="btn" type="button" id="sh">Compartir</button><a class="btn" href="<?= $e($back) ?>">Ver más en la Guía</a></div>
<?php if ($k === 'negocio' && !empty($x['sv'])): ?><h2 class="sh2">Servicios</h2><ul class="hrs"><?php foreach ($x['sv'] as $sv): ?><li><span><?= $e($sv['t'] ?? '') ?></span><span><?= $e($sv['p'] ?? '') ?></span></li><?php endforeach; ?></ul><?php endif; ?>
<?php if ($k === 'negocio' && !empty($hrsL)): ?><h2 class="sh2">Horarios</h2><ul class="hrs"><?php foreach ($hrsL as $h): ?><li<?= $h[2] === (int)(new DateTime('now', new DateTimeZone('America/Asuncion')))->format('w') ? ' class="hoy"' : '' ?>><span><?= $e($h[0]) ?></span><b><?= $e($h[1]) ?></b></li><?php endforeach; ?></ul><?php endif; ?>
<?php if ($k === 'negocio' && !empty($x['gl'])): ?><h2 class="sh2">Fotos</h2><div class="gal"><?php foreach ($x['gl'] as $gi => $gu): ?><button type="button" data-lb="<?= $e($gu) ?>" aria-label="Ver foto <?= $gi + 1 ?> de <?= $e($x['n']) ?>"><img src="<?= $e($gu) ?>" alt="Foto <?= $gi + 1 ?> de <?= $e($x['n']) ?>" loading="lazy"></button><?php endforeach; ?></div><dialog class="lb" id="lb"><img src="" alt="Foto de <?= $e($x['n']) ?>"><div class="lbb"><button type="button" data-lbm="-1">Anterior</button><button type="button" data-lbm="1">Siguiente</button><button type="button" data-lbx="1">Cerrar</button></div></dialog><?php endif; ?>
<?php if ($k === 'negocio' && !$sl0): ?><h2 class="sh2">Ubicación</h2><?php if (trim((string)$x['a']) !== ''): ?><p class="adr"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg><span><?= $e($x['a']) ?></span></p><?php endif; ?><?php if ($emb !== ''): ?><div class="mapf"><iframe src="<?= $e($emb) ?>" title="Mapa de <?= $e($x['n']) ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><?php endif; ?><?php endif; ?>
<?php $vids = ($k === 'negocio' && empty($x['bas'])) ? guia_vids('d:' . ($x['id'] ?? '')) : []; if ($vids): ?><h2 class="sh2">Videos</h2><div class="vds"><?php foreach ($vids as $v): ?><div class="vd<?= $v['v'] ? ' vt' : '' ?>"><?php if ($v['src']): ?><iframe src="<?= $e($v['src']) ?>" title="Video de <?= $e($x['n']) ?>" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe><?php endif; ?><a class="vl" href="<?= $e($v['u']) ?>" target="_blank" rel="noopener"><?= $v['k'] === 'yt' ? 'Ver en YouTube' : ($v['k'] === 'tt' ? 'Ver en TikTok' : 'Ver en Instagram') ?></a></div><?php endforeach; ?></div><?php endif; ?>
<?php if ($k === 'negocio' || $k === 'lugar'): ?><p class="nt"><a href="<?= $e('https://wa.me/595982086171?text=' . rawurlencode('Hola, en la Guía de Santa Rita hay un dato incorrecto de ' . $x['n'] . ' (' . $self . '): ')) ?>" target="_blank" rel="noopener nofollow" style="color:var(--deep)">¿Algún dato incorrecto? Avisale a la Guía</a></p><?php endif; ?>
<p class="nt"><?= $k === 'vacante' ? 'La Guía no garantiza la contratación: el contacto es directo con quien publica.' : ($k === 'aviso' ? 'Nunca pagues por adelantado sin ver el producto o el inmueble.' : ($k === 'negocio' ? '¿Es tu negocio? Para actualizar los datos o tener tu catálogo con pedidos, escribinos por WhatsApp al 0982 086 171.' : ($k === 'lugar' ? 'Datos de fuentes públicas' . (($x['src'] ?? '') ? ' (' . $e($x['src']) . ')' : '') . '. ¿Ves algo mal? Escribinos por WhatsApp al 0982 086 171.' : 'Confirmá horario y lugar con los organizadores.'))) ?></p>
</div></article>
<?php endif; ?>
</main>
<footer id="gft"></footer><script src="/guia/rodape.js" defer></script>
<script>/* 24/11 (Jean): quem escolheu português vê a página toda em português (textos da página + o que foi escrito em espanhol, traduzido) */
(function(){try{if(localStorage.getItem('at_lang')!=='pt')return}catch(e){return}document.documentElement.lang='pt';
var D=<?= json_encode((object)$TRPT, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) ?>,U={'Servicio a domicilio':'Serviço a domicílio','Venta por pedido':'Venda por encomenda','Con cita previa':'Com hora marcada','Solo delivery':'Só delivery','Fotos':'Fotos','Ubicación':'Localização','Anterior':'Anterior','Siguiente':'Próxima','Cerrar':'Fechar','Cerrado temporalmente':'Fechado temporariamente','Abierto ahora':'Aberto agora','Cerrado ahora':'Fechado agora','Recomendado':'Recomendado','Volver a la Guía':'Voltar ao Guia','Horarios':'Horários','Servicios':'Serviços','Lunes':'Segunda','Martes':'Terça','Miércoles':'Quarta','Jueves':'Quinta','Viernes':'Sexta','Sábado':'Sábado','Domingo':'Domingo','Cerrado':'Fechado','Llamar':'Ligar','Cómo llegar':'Como chegar','Compartir':'Compartilhar','Ver más en la Guía':'Ver mais no Guia','¿Algún dato incorrecto? Avisale a la Guía':'Algum dado errado? Avise o Guia','¿Es tu negocio? Para actualizar los datos o tener tu catálogo con pedidos, escribinos por WhatsApp al 0982 086 171.':'É o seu negócio? Para atualizar os dados ou ter seu catálogo com pedidos, fale com a gente pelo WhatsApp 0982 086 171.','Sitio web':'Site','Videos':'Vídeos','Más información':'Mais informações','Consultar por WhatsApp':'Perguntar pelo WhatsApp','Postularme por WhatsApp':'Me candidatar pelo WhatsApp','Ver la fuente':'Ver a fonte','Leer la nota completa':'Ler a notícia completa','La Guía no garantiza la contratación: el contacto es directo con quien publica.':'O Guia não garante a contratação: o contato é direto com quem publica.','Nunca pagues por adelantado sin ver el producto o el inmueble.':'Nunca pague adiantado sem ver o produto ou o imóvel.','Esta publicación ya no está disponible':'Esta publicação não está mais disponível','Venció o fue retirada por quien la publicó.':'Venceu ou foi retirada por quem publicou.','Ver lo que hay hoy en la Guía':'Ver o que tem hoje no Guia','Se perdió':'Perdido','Se encontró':'Encontrado','Venta':'Venda','Alquiler':'Aluguel','Aliado Tu Delivery':'Aliado Tu Delivery','Comida y bebidas':'Comida e bebidas','Tiendas y moda':'Lojas e moda','Salud y belleza':'Saúde e beleza','Hogar y construcción':'Casa e construção','Autos, motos y náutica':'Carros, motos e náutica','Servicios':'Serviços','Negocio':'Negócio','Lugar público':'Lugar público','Vacante de empleo':'Vaga de emprego','Agenda de Santa Rita':'Agenda de Santa Rita','Datos de fuentes públicas':'Dados de fontes públicas'};
var tr=function(k){return D[k]||U[k]||(/^Llamar /.test(k)?'Ligar '+k.slice(7):/^Datos de fuentes públicas/.test(k)?k.replace('Datos de fuentes públicas','Dados de fontes públicas'):null)};
var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n,L=[];while(n=w.nextNode())L.push(n);
L.forEach(function(n){var t=n.nodeValue,k=t.trim();if(!k)return;var v=tr(k)||tr(k.replace(/ · (hoy|hoje)$/,''));if(v)n.nodeValue=t.replace(k,v)});})();</script>
<script>/* etapa 3: aberto/fechado agora (horário do Paraguai) e fotos em tela cheia */
(function(){var el=document.getElementById('nst');if(el){try{var dy=JSON.parse(el.getAttribute('data-dy')),pt=document.documentElement.lang==='pt';
var now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Asuncion'})),d=now.getDay(),m=now.getHours()*60+now.getMinutes(),mn=function(s){var p=String(s||'').split(':');return p.length===2?(+p[0])*60+(+p[1]):null};
var chk=function(day,off){var x=dy[day];if(!x||!x.on)return null;var r=[x.a,x.b],i;for(i=0;i<2;i++){var o=mn(r[i]&&r[i][0]),c=mn(r[i]&&r[i][1]);if(o==null||c==null)continue;if(c<=o)c+=1440;var t=m+off;if(t>=o&&t<c)return r[i][1]}return null};
var u=chk(d,0);if(u==null)u=chk((d+6)%7,1440);if(u!=null){el.className='on';el.innerHTML='<i></i>'+(pt?'Aberto agora · até ':'Abierto ahora · hasta ')+u}else el.textContent=pt?'Fechado agora':'Cerrado ahora'}catch(e){el.remove()}}
var lb=document.getElementById('lb');if(!lb||!lb.showModal)return;var L=[].slice.call(document.querySelectorAll('[data-lb]')).map(function(b){return b.getAttribute('data-lb')}),k=0,im=lb.querySelector('img');
var show=function(i){k=(i+L.length)%L.length;im.src=L[k]};if(L.length<2)[].forEach.call(lb.querySelectorAll('[data-lbm]'),function(b){b.hidden=true});
document.addEventListener('click',function(e){var b=e.target.closest('[data-lb]');if(b){show(L.indexOf(b.getAttribute('data-lb')));lb.showModal();return}var m=e.target.closest('[data-lbm]');if(m){show(k+(+m.getAttribute('data-lbm')));return}if(e.target.closest('[data-lbx]')||e.target===lb)lb.close()});
document.addEventListener('keydown',function(e){if(!lb.open)return;if(e.key==='ArrowRight')show(k+1);if(e.key==='ArrowLeft')show(k-1)})})();</script>
<script>(function(){var b=document.getElementById('sh');if(!b)return;b.addEventListener('click',function(){var d={title:document.title,text:<?= json_encode($title, JSON_UNESCAPED_UNICODE) ?>,url:<?= json_encode($self, JSON_UNESCAPED_SLASHES) ?>};if(navigator.share)navigator.share(d).catch(function(){});else location.href='https://wa.me/?text='+encodeURIComponent(d.text+' '+d.url)})})();</script>
</body></html>
