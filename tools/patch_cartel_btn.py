# Botão "Cartel para el local" (QR para a página na Guía): no painel do local e em cada ficha da Guía no Panel
import sys
R=[
("const T=lang==='pt'?{h:'Seu negócio no Guia Vitrix',c:'Toques no seu negócio',","const T=lang==='pt'?{cartel:'Cartaz para o local',h:'Seu negócio no Guia Vitrix',c:'Toques no seu negócio',"),
(":{h:'Tu negocio en la Guía Vitrix',c:'Toques en tu negocio',",":{cartel:'Cartel para el local',h:'Tu negocio en la Guía Vitrix',c:'Toques en tu negocio',"),
("target=\"_blank\" rel=\"noopener\">${ic('eye',15)}${T.v}</a></h3>","target=\"_blank\" rel=\"noopener\">${ic('eye',15)}${T.v}</a><a class=\"btn sm\" href=\"https://araujotechsistemas.com/guia/cartel.php?id=${encodeURIComponent(SHOP)}\" target=\"_blank\" rel=\"noopener\">${ic('qr',15)}${T.cartel}</a></h3>"),
("${gdIsVx(x.n)?'':`<button class=\"btn sm\" data-act=\"gudir2vx\"","<a class=\"btn sm\" href=\"https://araujotechsistemas.com/guia/cartel.php?id=d-${encodeURIComponent(x.id)}\" target=\"_blank\" rel=\"noopener\" title=\"${T.cartel_n}\">${ic('qr',14)}${T.cartel}</a>${gdIsVx(x.n)?'':`<button class=\"btn sm\" data-act=\"gudir2vx\""),
("nowa:'Falta WhatsApp',gps:'Usar mi ubicación'","nowa:'Falta WhatsApp',cartel:'Cartel',cartel_n:'Cartel para imprimir con QR (guardá la Guía antes)',gps:'Usar mi ubicación'"),
("nowa:'Falta WhatsApp',gps:'Usar minha localização'","nowa:'Falta WhatsApp',cartel:'Cartaz',cartel_n:'Cartaz para imprimir com QR (salve a Guia antes)',gps:'Usar minha localização'"),
]
for f in sys.argv[1:]:
    s=open(f).read()
    if 'guia/cartel.php' in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,s.count(a),a[:70]); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
