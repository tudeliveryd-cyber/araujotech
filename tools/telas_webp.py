# Gera a versão .webp (mais leve) de cada foto de tela do site. As .jpg ficam para as redes sociais (og:image).
import glob, os
from PIL import Image
for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), '..', 'araujo-tech-site', 'img', 'sistemas', '*.jpg'))):
    im = Image.open(f).convert('RGB')
    if im.width > 1100: im = im.resize((1100, round(im.height * 1100 / im.width)), Image.LANCZOS)
    out = f[:-4] + '.webp'; im.save(out, 'WEBP', quality=78, method=6)
    print(os.path.basename(out), os.path.getsize(f) // 1024, '->', os.path.getsize(out) // 1024, 'KB')
