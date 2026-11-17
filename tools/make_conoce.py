#!/usr/bin/env python3
"""Gera araujo-tech-site/guia/conoce/index.html: "Conocé Santa Rita" (ES/PT).
Só dados com fonte publicada (ver links de cada seção). Vídeos: só vídeos públicos do YouTube, com o link original;
o player do YouTube mostra o canal do autor. Vídeo removido (miniatura vazia) some sozinho da página.
O visual e o cabeçalho vêm de llegar/index.html (mesmo estilo)."""
import os, re
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'araujo-tech-site', 'guia')
OUT = os.path.join(BASE, 'conoce', 'index.html')
REV = '16/11/2026'
LL = open(os.path.join(BASE, 'llegar', 'index.html'), encoding='utf-8').read()
CSS = re.search(r'<style>(.*?)</style>', LL, re.S).group(1)
HDR = re.search(r'<header class="hdr">.*?</header>', LL, re.S).group(0)
I = lambda p: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'
IC = {
 'hist': '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
 'pin': '<path d="M12 21s-6.500-5.600-6.500-11a6.500 6.500 0 0 1 13 0c0 5.400-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
 'city': '<path d="M3 21h18M5 21V8l6-3v16M11 21V10h8v11"/><path d="M8 11v.01M8 14v.01M14 13h2M14 16h2"/>',
 'tree': '<path d="M12 21v-6"/><path d="M12 3c-3.500 0-6 2.700-6 6 0 3.200 2.700 6 6 6s6-2.800 6-6c0-3.300-2.500-6-6-6z"/>',
 'grid': '<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>',
 'play': '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.500 9.500v5l4-2.500z"/>',
 'ext': '<path d="M14 5h5v5M19 5l-8 8M11 6H6v12h12v-5"/>', 'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>', 'back': '<path d="M15 5l-7 7 7 7"/>',
 'map': '<path d="M9 4 3 6.500v13.500l6-2.500 6 2.500 6-2.500V4l-6 2.500z"/><path d="M9 4v13.500M15 6.500V20"/>',
}
def ext(url, es, pt):
    return '<a class="src" href="%s" target="_blank" rel="noopener">%s<span data-l="es">%s</span><span data-l="pt">%s</span></a>' % (url, I(IC['ext']), es, pt)
def gl(href, es, pt):
    return '<a class="go" href="%s"><span data-l="es">%s</span><span data-l="pt">%s</span>%s</a>' % (href, es, pt, I(IC['arrow']))
def mp(q):
    return 'https://www.google.com/maps/search/?api=1&query=' + q.replace(' ', '+')

S_ABC = ext('https://www.abc.com.py/nacionales/2023/01/16/conmemoran-hoy-33-anos-de-santa-rita/', 'ABC Color, 16/01/2023', 'ABC Color, 16/01/2023')
S_WIKI = ext('https://en.wikipedia.org/wiki/Santa_Rita_District,_Paraguay', 'Wikipedia (datos del Censo 2022)', 'Wikipedia (dados do Censo 2022)')
S_LN16 = ext('https://www.lanacion.com.py/2016/11/03/santa-rita-capital-del-progreso-paraguay/', 'La Nación, 03/11/2016', 'La Nación, 03/11/2016')
S_UH = ext('https://www.ultimahora.com/el-tunel-verde-se-convirtio-gran-atractivo-turistico-el-alto-parana-n961499', 'Última Hora: el túnel verde', 'Última Hora: o túnel verde')
S_IN26 = ext('https://infonegocios.com.py/default/santa-rita-celebra-36-anos-de-emancipacion-con-un-presente-economico-en-auge-y-una-agenda-que-convoca-a-miles', 'InfoNegocios, 16/01/2026', 'InfoNegocios, 16/01/2026')
S_IN25 = ext('https://infonegocios.com.py/default/santa-rita-crece-empujada-por-el-comercio-el-servicio-y-el-sector-inmobiliario-que-incremento-20', 'InfoNegocios, 16/01/2025', 'InfoNegocios, 16/01/2025')
S_PP26 = ext('https://diarioprimeraplana.com/expo-santa-rita-2026-alto-parana-reafirma-su-liderazgo-productivo-en-el-dia-del-trabajador/', 'Primera Plana: Expo 2026, 01/05/2026', 'Primera Plana: Expo 2026, 01/05/2026')
S_MOPC = ext('https://mopc.gov.py/planta-de-tratamiento-de-santa-rita-transformara-la-calidad-de-vida-de-29-000-personas-en-alto-parana/', 'MOPC, 14/07/2026', 'MOPC, 14/07/2026')
S_LN22 = ext('https://lanacion.com.py/negocios/2022/08/03/santa-rita-realizaron-el-primer-fam-tour-para-posicionar-a-la-ciudad-como-destino-turistico', 'La Nación: primer Fam Tour, 03/08/2022', 'La Nación: primeiro Fam Tour, 03/08/2022')

T = []
T.append(dict(id='historia', ic='hist', es='Historia', pt='História',
 bes='''<p>Santa Rita nació en <b>1973</b> como una colonia del distrito de Domingo Martínez de Irala, poblada sobre todo por <b>inmigrantes del sur de Brasil</b> que vinieron atraídos por la tierra fértil.</p>
<p>El <b>16 de enero de 1990</b>, la Ley 58/90 la convirtió en distrito. Desde entonces creció rápido, con paraguayos y brasileños trabajando juntos, y hoy se la conoce como la <b>"Capital del Progreso"</b>.</p>
<p>El <b>16 de enero de 2026</b> cumplió <b>36 años como distrito</b>, con serenata en homenaje a los pioneros y el festival aniversario en el predio de la Expo. Nació del agro y hoy suma comercio, servicios, bancos, financieras y casas de cambio, con empresas que llegan del exterior a instalarse.</p>''',
 bpt='''<p>Santa Rita nasceu em <b>1973</b> como uma colônia do distrito de Domingo Martínez de Irala, povoada principalmente por <b>imigrantes do sul do Brasil</b> que vieram atraídos pela terra fértil.</p>
<p>Em <b>16 de janeiro de 1990</b>, a Lei 58/90 transformou a colônia em distrito. Desde então cresceu rápido, com paraguaios e brasileiros trabalhando juntos, e hoje é conhecida como a <b>"Capital do Progresso"</b>.</p>
<p>Em <b>16 de janeiro de 2026</b> completou <b>36 anos como distrito</b>, com serenata em homenagem aos pioneiros e o festival de aniversário no recinto da Expo. Nasceu do agro e hoje soma comércio, serviços, bancos, financeiras e casas de câmbio, com empresas que chegam do exterior para se instalar.</p>''',
 links=[S_IN26, S_ABC, S_LN16]))
T.append(dict(id='donde', ic='pin', es='Dónde queda', pt='Onde fica',
 bes='''<ul><li>En el sur del departamento de <b>Alto Paraná</b>, sobre la <b>Ruta PY06</b>.</li><li>A unos <b>70 km de Ciudad del Este</b> y unos <b>340 km de Asunción</b>.</li><li>Limita con Santa Rosa del Monday, Iruña, Naranjal, San Cristóbal y Tavapy.</li><li>El distrito tiene <b>593 km²</b>; el clima es cálido, con lluvias repartidas en el año.</li></ul>''',
 bpt='''<ul><li>No sul do departamento de <b>Alto Paraná</b>, na <b>Rota PY06</b>.</li><li>A uns <b>70 km de Ciudad del Este</b> e uns <b>340 km de Assunção</b>.</li><li>Faz divisa com Santa Rosa del Monday, Iruña, Naranjal, San Cristóbal e Tavapy.</li><li>O distrito tem <b>593 km²</b>; o clima é quente, com chuvas distribuídas no ano.</li></ul>''',
 links=[S_WIKI, S_UH, S_LN16, gl('/guia/#hoy', 'El clima de hoy en la Guía', 'O clima de hoje na Guia')]))
T.append(dict(id='hoy', ic='city', es='La ciudad hoy', pt='A cidade hoje',
 bes='''<ul><li><b>27.249 habitantes</b> según el Censo 2022, el último publicado por el INE; cerca de 7 de cada 10 viven en la zona urbana.</li><li>La economía gira alrededor del <b>campo</b>: soja, maíz, trigo, girasol y canola. Alrededor del agro crecieron industrias, comercios, bancos, hoteles y restaurantes.</li><li>Tiene universidad nacional y universidades privadas.</li><li>La <b>Expo Santa Rita</b> se hace todos los años. En 2026 fue la <b>edición 32</b>, inaugurada el 1 de mayo. La edición 2024 tuvo más de 500 expositores, más de 120.000 visitantes y negocios estimados en US$ 250 millones.</li><li>En los últimos años crecieron el comercio, los servicios y el sector inmobiliario (loteamientos residenciales y comerciales).</li><li>En 2026 se construye la <b>planta de tratamiento de aguas residuales</b> con 33 km de alcantarillado sanitario (MOPC, G. 82.000 millones): unas 29.000 personas beneficiadas cuando esté terminada.</li><li>Se habla español, portugués y guaraní: en el comercio, muchos atienden en los tres.</li></ul>''',
 bpt='''<ul><li><b>27.249 habitantes</b> segundo o Censo 2022, o último publicado pelo INE; perto de 7 em cada 10 moram na zona urbana.</li><li>A economia gira em torno do <b>campo</b>: soja, milho, trigo, girassol e canola. Em volta do agro cresceram indústrias, comércios, bancos, hotéis e restaurantes.</li><li>Tem universidade nacional e universidades particulares.</li><li>A <b>Expo Santa Rita</b> acontece todos os anos. Em 2026 foi a <b>edição 32</b>, inaugurada em 1º de maio. A edição de 2024 teve mais de 500 expositores, mais de 120.000 visitantes e negócios estimados em US$ 250 milhões.</li><li>Nos últimos anos cresceram o comércio, os serviços e o setor imobiliário (loteamentos residenciais e comerciais).</li><li>Em 2026 está em obra a <b>estação de tratamento de esgoto</b> com 33 km de rede (MOPC, G. 82.000 milhões): cerca de 29.000 pessoas beneficiadas quando estiver pronta.</li><li>Fala-se espanhol, português e guarani: no comércio, muitos atendem nos três.</li></ul>''',
 links=[S_WIKI, S_PP26, S_IN25, S_MOPC]))
PL = [
 ('Túnel verde', 'Túnel verde', 'Cerca de 1 km de árboles que se cierran sobre la Ruta PY06, a unos 2 km del centro, saliendo hacia Naranjal. Nació de plantas sembradas por vecinos en los años 90 como barrera entre la ruta y los sojales. Es el lugar más conocido de la ciudad.', 'Cerca de 1 km de árvores que se fecham sobre a Rota PY06, a uns 2 km do centro, saindo para Naranjal. Nasceu de plantas semeadas por moradores nos anos 90 como barreira entre a rota e as lavouras de soja. É o lugar mais conhecido da cidade.', 'Túnel Verde Santa Rita Alto Paraná', S_UH),
 ('Parroquia Santa Rita', 'Paróquia Santa Rita', 'La iglesia católica que da nombre a la ciudad, parte del recorrido turístico de la ciudad.', 'A igreja católica que dá nome à cidade, parte do roteiro turístico da cidade.', 'Parroquia Santa Rita Alto Paraná', S_LN22),
 ('Centro de Tradiciones Gauchas', 'Centro de Tradições Gaúchas', 'Sede de la Expo Santa Rita. Muestra la herencia gaúcha que trajeron los primeros colonos.', 'Sede da Expo Santa Rita. Mostra a herança gaúcha que os primeiros colonos trouxeram.', 'Centro de Tradiciones Gauchas Santa Rita Paraguay', S_LN22),
 ('Salón de autos clásicos, Cerro Largo', 'Salão de carros clássicos, Cerro Largo', 'Una colección de autos antiguos en la comunidad de Cerro Largo. Fue lo que más llamó la atención en el primer recorrido turístico de la ciudad.', 'Uma coleção de carros antigos na comunidade de Cerro Largo. Foi o que mais chamou a atenção no primeiro roteiro turístico da cidade.', None, S_LN22),
]
def pl(p):
    m = ('<a class="go" href="%s" target="_blank" rel="noopener">%s<span data-l="es">Ver en el mapa</span><span data-l="pt">Ver no mapa</span></a>' % (mp(p[4]), I(IC['map']))) if p[4] else ''
    return '<div class="pl"><b><span data-l="es">%s</span><span data-l="pt">%s</span></b><p data-l="es">%s</p><p data-l="pt">%s</p><p class="lk">%s%s</p></div>' % (p[0], p[1], p[2], p[3], m, p[5])
T.append(dict(id='conocer', ic='tree', es='Lugares para conocer', pt='Lugares para conhecer',
 bes='<div class="pls">' + ''.join(pl(p) for p in PL) + '</div><p class="nt">La Guía también muestra las plazas de la ciudad en la sección de lugares públicos.</p>',
 bpt='', links=[gl('/guia/#util', 'Plazas y lugares públicos', 'Praças e lugares públicos'), gl('/guia/#agenda', 'Agenda de eventos', 'Agenda de eventos')]))
T.append(dict(id='estructura', ic='grid', es='Lo que la ciudad tiene', pt='O que a cidade tem',
 bes='''<p>En la Guía están, con ubicación en el mapa: el <b>hospital distrital y el IPS</b>, <b>escuelas y colegios</b>, <b>bancos y financieras</b>, <b>farmacias</b> (con la de turno de hoy), <b>iglesias</b>, <b>policía y bomberos</b>, la <b>terminal de ómnibus</b> y las <b>plazas</b>. También los negocios, los profesionales y los horarios de ómnibus.</p>
<p>Si te estás mudando, la página <b>Recién llegado</b> explica paso a paso documentos, luz, salud y escuela.</p>''',
 bpt='''<p>Na Guia estão, com localização no mapa: o <b>hospital distrital e o IPS</b>, <b>escolas e colégios</b>, <b>bancos e financeiras</b>, <b>farmácias</b> (com a de plantão de hoje), <b>igrejas</b>, <b>polícia e bombeiros</b>, o <b>terminal de ônibus</b> e as <b>praças</b>. Também os negócios, os profissionais e os horários de ônibus.</p>
<p>Se você está se mudando, a página <b>Cheguei em Santa Rita</b> explica passo a passo documentos, luz, saúde e escola.</p>''',
 links=[gl('/guia/#util', 'Lugares públicos y teléfonos útiles', 'Lugares públicos e telefones úteis'), gl('/guia/#negocios', 'Negocios de Santa Rita', 'Negócios de Santa Rita'), gl('/guia/llegar/', 'Recién llegado: paso a paso', 'Cheguei agora: passo a passo')]))
# Vídeos públicos do YouTube encontrados em busca (16/11/2026). Título = o título publicado pelo autor.
V = [
 ('Hm2awy6FREk', 'Conheça Santa Rita no Paraguay'),
 ('rKGIeOegqs0', 'Conhecemos a cidade mais brasileira no Paraguai: Santa Rita, cidade nova e moderna'),
 ('3LtZMxGdjqw', 'Santa Rita: a cidade dos brasileiros no Paraguai'),
 ('YG05clAmn40', 'A cidade dos brasileiros no Paraguai: Santa Rita'),
 ('dQbydJmHKqI', 'Túnel de árbol natural en Santa Rita, Alto Paraná'),
 ('eajQwzLuwMM', 'Expo Santa Rita 2026'),
]
def vd(v):
    return ('<div class="vd" data-v="%s"><button type="button" class="vp" aria-label="Ver video: %s"><img src="https://i.ytimg.com/vi/%s/hqdefault.jpg" alt="" loading="lazy" width="480" height="360"><span class="pb">%s</span></button>'
            '<p class="vt">%s</p><a class="vy" href="https://www.youtube.com/watch?v=%s" target="_blank" rel="noopener">%s<span data-l="es">Ver en YouTube</span><span data-l="pt">Ver no YouTube</span></a></div>') % (v[0], v[1].replace('"', ''), v[0], I('<path d="M9 7.500v9l7.500-4.500z" fill="currentColor"/>'), v[1], v[0], I(IC['ext']))
T.append(dict(id='videos', ic='play', es='Videos de quien la recorrió', pt='Vídeos de quem conhece',
 bes='<p>Videos publicados en YouTube por sus autores, que muestran la ciudad. El nombre del canal aparece al reproducir.</p>',
 bpt='<p>Vídeos publicados no YouTube pelos seus autores, mostrando a cidade. O nome do canal aparece ao reproduzir.</p>',
 links=[], extra='<div class="vds">' + ''.join(vd(v) for v in V) + '</div><p class="nt" data-l="es">Los videos y sus opiniones son de sus autores; la Guía de Santa Rita no los produjo. ¿Grabaste un video de la ciudad? Mandanos el link por WhatsApp.</p><p class="nt" data-l="pt">Os vídeos e as opiniões são dos seus autores; a Guia de Santa Rita não os produziu. Gravou um vídeo da cidade? Mande o link pelo WhatsApp.</p>'))

def sec(i, t):
    body = ('<div data-l="es">%s</div><div data-l="pt">%s</div>' % (t['bes'], t['bpt'])) if t['bpt'] else t['bes']
    return ('<section class="tp" id="%s"><h2><span class="ti">%s</span><span><small>%d</small><span data-l="es">%s</span><span data-l="pt">%s</span></span></h2>%s%s%s</section>') % (
        t['id'], I(IC[t['ic']]), i + 1, t['es'], t['pt'], body, t.get('extra', ''), ('<p class="lk">' + ''.join(t['links']) + '</p>') if t['links'] else '')
idx = ''.join('<a href="#%s"><span class="ti">%s</span><span data-l="es">%s</span><span data-l="pt">%s</span></a>' % (t['id'], I(IC[t['ic']]), t['es'], t['pt']) for t in T)
FACTS = [('1973', 'fundación', 'fundação'), ('36 años', 'como distrito (desde 1990)', 'como distrito (desde 1990)'), ('27.249', 'habitantes (último censo, 2022)', 'habitantes (último censo, 2022)'), ('70 km', 'de Ciudad del Este', 'de Ciudad del Este')]
facts = ''.join('<div><b>%s</b><span data-l="es">%s</span><span data-l="pt">%s</span></div>' % f for f in FACTS)
EXTRA_CSS = '''
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:22px}.facts div{border-top:2px solid rgba(255,194,26,.7);padding-top:8px}.facts b{display:block;font-family:var(--display);font-weight:900;font-size:clamp(24px,4vw,32px);color:#fff;line-height:1.1}.facts span{font-size:13.5px;color:#E3D3FA}
.pls{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px}.pl{border:1px solid var(--line);border-radius:16px;padding:14px 15px;display:flex;flex-direction:column}.pl>b{font-family:var(--display);font-size:18px;line-height:1.2}.pl p{font-size:15px!important;margin-top:6px}.pl .lk{margin-top:auto!important;padding-top:10px}
.vds{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px}.vd{display:flex;flex-direction:column;gap:6px}
.vp{position:relative;display:block;width:100%;aspect-ratio:16/9;border:0;padding:0;border-radius:14px;overflow:hidden;background:var(--night);cursor:pointer}.vp img{width:100%;height:100%;object-fit:cover;display:block}
.pb{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(36,9,63,.82);color:#fff;display:flex;align-items:center;justify-content:center}.pb svg{width:26px;height:26px}
.vd iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:14px;display:block}.vt{font-size:14.5px!important;font-weight:700;line-height:1.3;margin:0!important}.vy{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;text-decoration:none}.vy svg{width:14px;height:14px}
.vp:focus-visible,.lk a:focus-visible,.idx a:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}

.cta [data-l=pt]{display:none}html[lang=pt] .cta b[data-l=pt],html[lang=pt] .cta p[data-l=pt]{display:block}html[lang=pt] .cta [data-l=es]{display:none}
@media (max-width:760px){.vds{grid-template-columns:1fr 1fr}}
@media (max-width:560px){.facts{grid-template-columns:1fr 1fr}.pls,.vds{grid-template-columns:1fr}}
'''
TI_ES = 'Conocé Santa Rita: historia, lugares y videos | Guía de Santa Rita'
TI_PT = 'Conheça Santa Rita: história, lugares e vídeos | Guia de Santa Rita'
HTML = '''<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>__TI__</title>
<meta name="description" content="Cómo es Santa Rita, Alto Paraná, antes de venir: su historia, dónde queda, de qué vive, lugares para conocer y videos de quienes la recorrieron. En español y portugués.">
<link rel="canonical" href="https://guiadesantarita.com/conoce/">
<meta property="og:type" content="website"><meta property="og:title" content="Conocé Santa Rita | Conheça Santa Rita"><meta property="og:description" content="Historia, lugares para conocer, lo que la ciudad tiene y videos de Santa Rita, Alto Paraná."><meta property="og:image" content="https://araujotechsistemas.com/img/guia/og-guia.jpg?v=2"><meta property="og:url" content="https://guiadesantarita.com/conoce/">
<link rel="icon" href="/img/guia/favicon.png?v=1"><meta name="theme-color" content="#24093F">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@700;900&family=Red+Hat+Text:wght@400;500;700&display=swap" rel="stylesheet">
<style>__CSS__</style>
<script>try{var l=localStorage.getItem('at_lang');if(!l&&/^pt/i.test(navigator.language||''))l='pt';if(l==='pt')document.documentElement.lang='pt'}catch(e){}</script>
</head>
<body>
__HDR__
<section class="hero"><div class="wrap">
<h1><span data-l="es">Conocé Santa Rita</span><span data-l="pt">Conheça Santa Rita</span></h1>
<p data-l="es">Cómo es la ciudad antes de venir: su historia, dónde queda, de qué vive, qué visitar y videos de quienes la recorrieron.</p>
<p data-l="pt">Como é a cidade antes de vir: a história, onde fica, do que vive, o que visitar e vídeos de quem já andou por aqui.</p>
<div class="facts">__FACTS__</div>
</div></section>
<main class="wrap">
<nav class="idx" aria-label="Temas" style="margin-top:18px">__IDX__</nav>
__SECS__
<p class="warn" data-l="es">Datos de fuentes públicas, revisados el __REV__. Cada sección muestra de dónde sale cada dato. ¿Viste algo para corregir? <a href="https://wa.me/595982086171" target="_blank" rel="noopener">WhatsApp 0982 086 171</a>.</p>
<p class="warn" data-l="pt">Dados de fontes públicas, revisados em __REV__. Cada seção mostra de onde vem cada dado. Viu algo para corrigir? <a href="https://wa.me/595982086171" target="_blank" rel="noopener">WhatsApp 0982 086 171</a>.</p>
<section class="cta"><div><b data-l="es">Todo Santa Rita en un solo lugar</b><b data-l="pt">Toda Santa Rita num só lugar</b><p data-l="es">Negocios, ofertas, farmacia de turno, ómnibus y teléfonos útiles.</p><p data-l="pt">Negócios, ofertas, farmácia de plantão, ônibus e telefones úteis.</p></div><a href="/guia/"><span data-l="es">Abrir la Guía de Santa Rita</span><span data-l="pt">Abrir a Guia de Santa Rita</span></a></section>
</main>
<footer id="gft"></footer><script src="/guia/rodape.js" defer></script>
<script>(function(){var h=document.documentElement,bs=document.querySelectorAll('.lang button');function set(){bs.forEach(function(b){b.classList.toggle('on',b.dataset.lang===(h.lang==='pt'?'pt':'es'))});document.title=h.lang==='pt'?'__TIPT__':'__TI__'}bs.forEach(function(b){b.addEventListener('click',function(){h.lang=b.dataset.lang;try{localStorage.setItem('at_lang',b.dataset.lang)}catch(e){}set()})});set();
document.querySelectorAll('.vd').forEach(function(d){var im=d.querySelector('img');function chk(){if(im.naturalWidth&&im.naturalWidth<=120)d.remove()}if(im.complete)chk();im.addEventListener('load',chk);im.addEventListener('error',function(){d.remove()});
d.querySelector('.vp').addEventListener('click',function(){var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+d.dataset.v+'?autoplay=1&rel=0';f.title=d.querySelector('.vt').textContent;f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.loading='lazy';this.replaceWith(f)})});
if(/(^|\\.)guiadesantarita\\.com$/.test(location.hostname))document.querySelectorAll('a[href^="/guia/"]').forEach(function(a){a.setAttribute('href',a.getAttribute('href').replace(/^\\/guia\\//,'/'))});
try{if(!navigator.webdriver&&navigator.sendBeacon)navigator.sendBeacon((location.hostname.endsWith('guiadesantarita.com')?'https://araujotechsistemas.com':'')+'/sitio/guia_hit.php?t=p&id=conoce')}catch(e){}})();</script>
</body></html>
'''
out = (HTML.replace('__CSS__', CSS + EXTRA_CSS).replace('__HDR__', HDR).replace('__IDX__', idx).replace('__FACTS__', facts).replace('__REV__', REV)
       .replace('__TIPT__', TI_PT).replace('__TI__', TI_ES).replace('__SECS__', '\n'.join(sec(i, t) for i, t in enumerate(T))))
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(out)
print('ok', len(out))
