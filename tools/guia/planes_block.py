# Gera a seção de planos e preços da Guía (mesmo bloco em /anunciar e /negocios). Uso: python3 tools/guia/planes_block.py
# Textos dos planos: exatamente os combinados com o Jean (25/11/2026). Vitrix: desde Gs. 150.000 por mes + instalación desde Gs. 350.000.
import re, json, urllib.parse, sys
WA = '595982086171'
CK = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>'
WAI = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.2z"/></svg>'
def wa(msg): return 'https://wa.me/' + WA + '?text=' + urllib.parse.quote(msg)
P = [
 dict(k='vx', tag='Catálogo online', n='Vitrix', ex='Para vender online: tu catálogo con fotos y precios, y los pedidos te llegan por WhatsApp.',
      pr='Desde Gs. 150.000', per='por mes', ins='+ instalación desde Gs. 350.000',
      b=['Página propia en la Guía', 'Catálogo con fotos y precios', 'Pedidos por WhatsApp, sin comisión por pedido', 'Panel, caja y stock'],
      pl='Catálogo Vitrix (desde Gs. 150.000 por mes + instalación)', more=('Ver los planes Vitrix', '/negocios/#planes')),
 dict(k='pr', tag='Publicidad en la Guía', n='Presencia + link', ex='Para que te encuentren: tu ficha completa en la Guía y tu link para el Instagram.',
      pr='Gs. 300.000', per='por mes', ins='',
      b=['Tu ficha en la Guía: logo, rubro, WhatsApp, horarios, dirección y mapa', 'Aparecés en la búsqueda y en tu categoría', 'Tu link propio para el Instagram'],
      pl='Presencia + link (Gs. 300.000 por mes)'),
 dict(k='rc', tag='Más visibilidad', n='Recomendado', ex='Para destacar: más lugar y prioridad dentro de la Guía.',
      pr='Gs. 450.000', per='por mes', ins='',
      b=['Todo lo de Presencia', 'Sello Recomendado', 'Lugar en Negocios destacados con foto de portada', 'Primero en las listas'],
      pl='Recomendado (Gs. 450.000 por mes)'),
 dict(k='po', tag='Máxima visibilidad', n='Portada', ex='Para que te vea todo el que entra: tu anuncio arriba de todo.',
      pr='Gs. 800.000', per='por mes', ins='',
      b=['Todo lo de Recomendado', 'Tu anuncio en el slider de la portada', 'Lo primero que ve quien entra a la Guía'],
      pl='Portada (Gs. 800.000 por mes)'),
]
MOCK = {
 'vx': '<div class="pz-m pz-mvx" aria-hidden="true"><div class="mh"><i></i><b>Tu negocio</b><span>Abierto</span></div><div class="mg"><span><em></em><b>Producto</b><small>Gs. 25.000</small></span><span><em></em><b>Producto</b><small>Gs. 40.000</small></span><span><em></em><b>Producto</b><small>Gs. 18.000</small></span></div><div class="mb">Pedir por WhatsApp</div></div>',
 'pr': '<div class="pz-m pz-mpr" aria-hidden="true"><div class="mc"><i></i><span><b>Tu negocio</b><small>Tu rubro</small><em>Abierto ahora</em></span></div><div class="mw"><span>WhatsApp</span><span>Mapa</span></div><div class="ml">guiadesantarita.com/l/tu-negocio</div></div>',
 'rc': '<div class="pz-m pz-mrc" aria-hidden="true"><div class="mv"><span class="st">Recomendado</span></div><div class="mn"><i></i><span><b>Tu negocio</b><small>Tu rubro</small></span><em></em></div><p class="mt">Negocios destacados</p></div>',
 'po': '<div class="pz-m pz-mpo" aria-hidden="true"><div class="mt"><i></i><span></span><span></span></div><div class="ms"><small>Publicidad</small><b>Tu anuncio acá</b><span>Lo primero que ve la ciudad</span></div><div class="md"><i class="on"></i><i></i><i></i></div></div>',
}
def card(p):
    msg = '¡Hola! Quiero contratar ' + p['pl'] + ' en la Guía de Santa Rita.'
    more = ('<a class="pz-more" href="%s">%s</a>' % (p['more'][1], p['more'][0])) if p.get('more') else ''
    return ('<article class="pz-c pz-c-%s"><p class="pz-tag">%s</p><h3>%s</h3><p class="pz-ex">%s</p>%s'
            '<p class="pz-pr"><b>%s</b> <small>%s</small></p>%s<p class="pz-l">Así aparecés</p><ul>%s</ul>'
            '<a class="pz-wa" href="%s" target="_blank" rel="noopener" data-wpl="%s">%s<span>Contratar por WhatsApp</span></a>%s</article>') % (
        p['k'], p['tag'], p['n'], p['ex'], MOCK[p['k']], p['pr'], p['per'], ('<p class="pz-ins">%s</p>' % p['ins']) if p['ins'] else '',
        ''.join('<li>%s<span>%s</span></li>' % (CK, x) for x in p['b']), wa(msg), p['pl'], WAI, more)
# ordem na tela: Portada fica por último e maior (no celular também por último, como fecho)
HTML = ('<!-- PLANES-GUIA:INICIO (gerado por tools/guia/planes_block.py) -->\n'
 '<div class="pz" id="precios"><div class="pz-g">' + ''.join(card(p) for p in P) + '</div>'
 '<p class="pz-inc">' + CK + '<span><b>Incluido en Presencia, Recomendado y Portada:</b> tu link propio para el Instagram y tu panel para cambiar horarios, servicios y fotos cuando quieras.</span></p>'
 '<p class="pz-cnd">Planes de la Guía: pago adelantado, mínimo 3 meses. En 6 meses pagás 5; en 12 meses pagás 10. Vitrix tiene sus propias condiciones.</p></div>\n'
 '<script>(function(){document.querySelectorAll(\'.pz-wa[data-wpl]\').forEach(function(a){a.addEventListener(\'click\',function(){var pt=document.documentElement.lang===\'pt\',pl=a.getAttribute(\'data-wpl\');var PL={\'Catálogo Vitrix (desde Gs. 150.000 por mes + instalación)\':\'Catálogo Vitrix (a partir de Gs. 150.000 por mês + instalação)\',\'Presencia + link (Gs. 300.000 por mes)\':\'Presença + link (Gs. 300.000 por mês)\',\'Recomendado (Gs. 450.000 por mes)\':\'Recomendado (Gs. 450.000 por mês)\',\'Portada (Gs. 800.000 por mes)\':\'Capa (Gs. 800.000 por mês)\'};a.href=\'https://wa.me/' + WA + '?text=\'+encodeURIComponent(pt?\'Olá! Quero contratar \'+(PL[pl]||pl)+\' no Guia de Santa Rita.\':\'¡Hola! Quiero contratar \'+pl+\' en la Guía de Santa Rita.\')})})})();</script>\n'
 '<!-- PLANES-GUIA:FIM -->')
CSS = '''/* PLANES-GUIA:CSS */
.pz{margin-top:22px}.pz-g{display:grid;gap:16px;grid-template-columns:1fr}
@media(min-width:720px){.pz-g{grid-template-columns:1fr 1fr}}
.pz-c{margin:0;position:relative;display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px 20px 20px;box-shadow:0 22px 44px -34px rgba(36,9,63,.55)}
.pz-tag{margin:0;font-size:12.5px;font-weight:800;color:var(--purple)}
.pz-c h3{margin:4px 0 0;font-family:var(--display);font-weight:900;font-size:26px;line-height:1.1;letter-spacing:-.3px;color:var(--ink)}
.pz-ex{margin:8px 0 14px;font-size:15px;line-height:1.45;color:var(--muted)}
.pz-pr{margin:14px 0 0;line-height:1}.pz-pr b{font-family:var(--display);font-weight:900;font-size:30px;letter-spacing:-.5px;color:var(--ink)}.pz-pr small{font-size:14px;color:var(--muted);font-weight:600}
.pz-ins{margin:6px 0 0;font-size:13.5px;font-weight:700;color:var(--deep)}
.pz-l{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.pz-c ul{list-style:none;padding:0;margin:16px 0 18px;display:grid;gap:9px;align-content:start;flex:1}
.pz-c li{display:flex;gap:9px;align-items:flex-start;font-size:15px;line-height:1.4;color:var(--ink)}.pz-c li svg{flex:none;margin-top:3px;color:var(--ok)}
.pz-wa{display:flex;align-items:center;justify-content:center;text-align:center;gap:8px;min-height:50px;padding:8px 14px;line-height:1.2;border-radius:14px;background:var(--ok);color:#fff;font-weight:800;font-size:16px;text-decoration:none}
.pz-wa:focus-visible,.pz-more:focus-visible{outline:3px solid var(--yellow);outline-offset:2px}
.pz-more{display:block;margin-top:4px;padding:11px 0;text-align:center;font-weight:700;font-size:14.5px;color:var(--deep)}
.pz-c-vx{background:#FBF8FE}.pz-c-vx .pz-tag{color:#0E7A6E}
.pz-c-po{background:var(--night);border-color:var(--night);color:#fff;box-shadow:0 26px 50px -26px rgba(36,9,63,.9)}
.pz-c-po::before{content:"";position:absolute;inset:-2px;border-radius:26px;padding:2px;background:linear-gradient(135deg,var(--yellow),rgba(255,194,26,0) 60%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.pz-c-po .pz-tag{color:var(--yellow)}.pz-c-po h3,.pz-c-po .pz-pr b,.pz-c-po li{color:#fff}.pz-c-po .pz-ex,.pz-c-po .pz-pr small{color:#D9C6F7}.pz-c-po li svg{color:var(--yellow)}
.pz-c-po .pz-wa{background:var(--yellow);color:var(--night)}
.pz-inc{display:flex;gap:10px;align-items:flex-start;margin:20px 0 0;padding:14px 16px;border-radius:16px;background:var(--lilac);font-size:15px;line-height:1.45;color:var(--ink)}.pz-inc svg{flex:none;margin-top:3px;color:var(--purple)}
.pz-cnd{margin:12px 0 0;font-size:14px;color:var(--muted)}
/* exemplos de como aparece (desenhados, sem dados de clientes) */
.pz-m{line-height:1.25;position:relative;height:150px;border-radius:16px;background:var(--lilac);overflow:hidden;padding:12px;font-family:var(--text)}
.pz-m i{display:block;flex:none;background:linear-gradient(135deg,#B57BF0,#7A2BD1);border-radius:10px}
.pz-mvx .mh{display:flex;align-items:center;gap:8px}.pz-mvx .mh i{width:26px;height:26px;border-radius:50%}.pz-mvx .mh b{font-size:13px;color:var(--ink)}.pz-mvx .mh span{margin-left:auto;font-size:10.5px;font-weight:800;color:#13723A;background:#E6F6EC;border-radius:999px;padding:3px 7px}
.pz-mvx .mg{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.pz-mvx .mg span{background:#fff;border-radius:10px;padding:5px;display:grid;gap:2px;min-width:0}.pz-mvx .mg b,.pz-mvx .mg small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pz-mvx .mg em{display:block;height:30px;border-radius:7px;background:linear-gradient(135deg,#FFE29A,#FFB547)}.pz-mvx .mg b{font-size:10.5px;color:var(--ink)}.pz-mvx .mg small{font-size:10px;font-weight:800;color:var(--deep)}
.pz-mvx .mb{position:absolute;left:12px;right:12px;bottom:10px;height:24px;border-radius:8px;background:#15803D;color:#fff;font-size:11px;font-weight:800;display:grid;place-items:center}
.pz-mpr .mc{display:flex;gap:10px;align-items:center;background:#fff;border-radius:12px;padding:9px}.pz-mpr .mc i{width:40px;height:40px}.pz-mpr .mc span{display:grid;gap:1px}.pz-mpr b{font-size:13.5px;color:var(--ink)}.pz-mpr small{font-size:11px;color:var(--muted)}.pz-mpr em{font-style:normal;font-size:10.5px;font-weight:800;color:#13723A}
.pz-mpr .mw{display:flex;gap:6px;margin-top:8px}.pz-mpr .mw span{flex:1;text-align:center;font-size:11px;font-weight:800;border-radius:8px;padding:6px 0;background:#fff;color:var(--deep)}.pz-mpr .mw span:first-child{background:#15803D;color:#fff}
.pz-mpr .ml{margin-top:8px;font-size:11px;font-weight:800;color:var(--deep);background:#fff;border:1px dashed #C9B3E8;border-radius:999px;padding:5px 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pz-mrc{padding:0}.pz-mrc .mv{height:78px;background:linear-gradient(135deg,#7A2BD1,#C46BF0 55%,#FFB547);position:relative}.pz-mrc .st{position:absolute;top:9px;left:9px;font-size:11px;font-weight:800;background:var(--yellow);color:var(--night);border-radius:999px;padding:3px 9px}
.pz-mrc .mn{display:flex;align-items:center;gap:9px;background:#fff;margin:-16px 10px 0;position:relative;border-radius:12px;padding:8px;box-shadow:0 8px 18px -12px rgba(36,9,63,.6)}.pz-mrc .mn i{width:32px;height:32px;border-radius:50%}.pz-mrc .mn span{display:grid}.pz-mrc b{font-size:13px;color:var(--ink)}.pz-mrc small{font-size:11px;color:var(--muted)}.pz-mrc .mn em{margin-left:auto;width:26px;height:26px;border-radius:50%;background:#15803D}
.pz-mrc .mt{margin:7px 12px 0;font-size:10.5px;font-weight:800;color:var(--deep)}
.pz-mpo{background:#2E0F4F}.pz-mpo .mt{display:flex;align-items:center;gap:6px}.pz-mpo .mt i{width:42px;height:14px;border-radius:5px;background:rgba(255,255,255,.85)}.pz-mpo .mt span{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.18);margin-left:auto}.pz-mpo .mt span+span{margin-left:0}
.pz-mpo .ms{margin-top:10px;height:88px;border-radius:12px;background:linear-gradient(120deg,var(--yellow),#FF8A3D);padding:10px 12px;display:grid;align-content:center;gap:2px;color:var(--night)}.pz-mpo .ms small{font-size:9.5px;font-weight:800;opacity:.75}.pz-mpo .ms b{font-family:var(--display);font-weight:900;font-size:19px;line-height:1.05}.pz-mpo .ms span{font-size:11px;font-weight:700}
.pz-mpo .md{display:flex;gap:5px;justify-content:center;margin-top:7px}.pz-mpo .md i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.35)}.pz-mpo .md i.on{width:16px;background:var(--yellow)}
/* PLANES-GUIA:CSS-FIM */'''
PT = {
 'Catálogo online':'Catálogo online','Para vender online: tu catálogo con fotos y precios, y los pedidos te llegan por WhatsApp.':'Para vender online: seu catálogo com fotos e preços, e os pedidos chegam pelo WhatsApp.',
 'Desde Gs. 150.000':'A partir de Gs. 150.000','por mes':'por mês','+ instalación desde Gs. 350.000':'+ instalação a partir de Gs. 350.000',
 'Página propia en la Guía':'Página própria no Guia','Catálogo con fotos y precios':'Catálogo com fotos e preços','Pedidos por WhatsApp, sin comisión por pedido':'Pedidos pelo WhatsApp, sem comissão por pedido','Panel, caja y stock':'Painel, caixa e estoque',
 'Ver los planes Vitrix':'Ver os planos Vitrix','Publicidad en la Guía':'Publicidade no Guia','Presencia + link':'Presença + link',
 'Para que te encuentren: tu ficha completa en la Guía y tu link para el Instagram.':'Para que te encontrem: sua ficha completa no Guia e seu link para o Instagram.',
 'Tu ficha en la Guía: logo, rubro, WhatsApp, horarios, dirección y mapa':'Sua ficha no Guia: logo, ramo, WhatsApp, horários, endereço e mapa','Aparecés en la búsqueda y en tu categoría':'Você aparece na busca e na sua categoria','Tu link propio para el Instagram':'Seu link próprio para o Instagram',
 'Más visibilidad':'Mais visibilidade','Para destacar: más lugar y prioridad dentro de la Guía.':'Para se destacar: mais espaço e prioridade dentro do Guia.','Todo lo de Presencia':'Tudo do Presença','Sello Recomendado':'Selo Recomendado','Lugar en Negocios destacados con foto de portada':'Lugar em Negócios em destaque com foto de capa','Primero en las listas':'Primeiro nas listas',
 'Máxima visibilidad':'Máxima visibilidade','Portada':'Capa','Para que te vea todo el que entra: tu anuncio arriba de todo.':'Para que todos que entram te vejam: seu anúncio lá em cima.','Todo lo de Recomendado':'Tudo do Recomendado','Tu anuncio en el slider de la portada':'Seu anúncio no slider da capa','Lo primero que ve quien entra a la Guía':'A primeira coisa que vê quem entra no Guia',
 'Contratar por WhatsApp':'Contratar pelo WhatsApp','Incluido en Presencia, Recomendado y Portada:':'Incluído no Presença, Recomendado e Capa:',
 'tu link propio para el Instagram y tu panel para cambiar horarios, servicios y fotos cuando quieras.':'seu link próprio para o Instagram e seu painel para mudar horários, serviços e fotos quando quiser.',
 'Planes de la Guía: pago adelantado, mínimo 3 meses. En 6 meses pagás 5; en 12 meses pagás 10. Vitrix tiene sus propias condiciones.':'Planos do Guia: pagamento adiantado, mínimo 3 meses. Em 6 meses você paga 5; em 12 meses paga 10. O Vitrix tem condições próprias.',
 'Así aparecés':'Assim você aparece',
 'Tu negocio':'Seu negócio','Producto':'Produto','Abierto':'Aberto','Pedir por WhatsApp':'Pedir pelo WhatsApp','Tu rubro':'Seu ramo','Abierto ahora':'Aberto agora','Negocios destacados':'Negócios em destaque','Publicidad':'Publicidade','Tu anuncio acá':'Seu anúncio aqui','Lo primero que ve la ciudad':'A primeira coisa que a cidade vê',
}
if __name__ == '__main__' and '--inject' not in sys.argv:
    json.dump({'html': HTML, 'css': CSS, 'pt': PT}, open(sys.argv[1] if len(sys.argv) > 1 else '/dev/stdout', 'w'), ensure_ascii=False)

def inject():
    """Atualiza o bloco já colocado nas páginas (entre as marcas PLANES-GUIA)."""
    import os
    for p, extra in [('araujo-tech-site/guia/anunciar/index.html', ''), ('araujo-tech-site/guia/negocios/index.html', ' pz-n')]:
        s = open(p).read()
        h = HTML.replace('<div class="pz" id="precios">', '<div class="pz%s" id="precios">' % extra)
        s = re.sub(r'<!-- PLANES-GUIA:INICIO.*?<!-- PLANES-GUIA:FIM -->', lambda m: h, s, flags=re.S)
        s = re.sub(r'/\* PLANES-GUIA:CSS \*/.*?/\* PLANES-GUIA:CSS-FIM \*/', lambda m: CSS, s, flags=re.S)
        open(p, 'w').write(s)
if __name__ == '__main__' and '--inject' in sys.argv: inject()
