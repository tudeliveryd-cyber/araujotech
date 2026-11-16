<?php
@ini_set('display_errors', '0'); error_reporting(0);
// Mapa do site da Guía Vitrix para o Google: a Guía e a página de cada negócio publicado.
header('Content-Type: application/xml; charset=utf-8'); header('Cache-Control: public, max-age=3600');
require __DIR__ . '/../sitio/prods_lib.php';
require __DIR__ . '/../sitio/guia_lib.php';
$d = date('Y-m-d');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
echo "<url><loc>https://guiadesantarita.com/</loc><lastmod>$d</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n";
echo "<url><loc>https://guiadesantarita.com/sobre/</loc><lastmod>$d</lastmod><changefreq>monthly</changefreq></url>";
echo "<url><loc>https://guiadesantarita.com/negocios/</loc><lastmod>$d</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n";
echo "<url><loc>https://guiadesantarita.com/llegar/</loc><lastmod>$d</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n";
echo "<url><loc>https://guiadesantarita.com/conoce/</loc><lastmod>$d</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>\n";
echo "<url><loc>https://guiadesantarita.com/terminos/</loc><lastmod>$d</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n";
foreach (guia_clients() as $c) echo '<url><loc>https://guiadesantarita.com/' . htmlspecialchars($c['id'], ENT_XML1) . "</loc><lastmod>$d</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>\n";
echo '</urlset>';
