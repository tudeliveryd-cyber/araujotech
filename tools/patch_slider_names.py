# Nomes legíveis no "Slider" dos números da Guía (banners da casa e anúncios pagos)
import sys
OLD="${esc(k.startsWith('c-')?nm(k.slice(2)):((g.ads.find(a=>'a-'+a.id===k)||{}).t||k))}"
NEW="${esc(k.startsWith('c-')?nm(k.slice(2)):(({'h-td':'Banner Tu Delivery','h-vx':'Banner Planes Vitrix','h-at':'Banner Araújo Tech'})[k]||(k.startsWith('a-')?((g.ads.find(a=>'a-'+a.id===k)||{}).t?T.st_ad+' · '+(g.ads.find(a=>'a-'+a.id===k)||{}).t:T.st_ad0):k)))}"
R=[(OLD,NEW),
("st_sl:'Slider (VIP y banners)'","st_sl:'Slider: veces que apareció cada uno',st_ad:'Publicidad',st_ad0:'Publicidad (ya borrada)'"),
("st_sl:'Slider (VIP e banners)'","st_sl:'Slider: vezes que apareceu cada um',st_ad:'Publicidade',st_ad0:'Publicidade (já apagada)'")]
for f in sys.argv[1:]:
    s=open(f).read()
    if NEW in s: print('ok',f); continue
    for a,b in R:
        assert s.count(a)==1,(f,a); s=s.replace(a,b)
    open(f,'w').write(s); print('patched',f)
