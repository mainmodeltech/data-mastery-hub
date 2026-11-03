"""
make-home-photos.py — prépare les photos de l'accueil à partir des originaux de la promotion.

Lit les photos d'origine (dossier SRC) et écrit des WebP légers dans src/assets/home/ :
  - people-1..5.webp   portraits recadrés en hauteur : ils deviennent les « barres » du héros
  - promotion.webp / promotion-sm.webp   photo de la promotion et ses certificats (deux tailles pour srcset)
Les originaux ne sont jamais modifiés. Relancer le script pour régénérer.

  python scripts/make-home-photos.py "<dossier des photos d'origine>"
"""
import sys
from pathlib import Path
from PIL import Image

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("src/assets/photos")
OUT = Path(__file__).resolve().parent.parent / "src" / "assets" / "home"
OUT.mkdir(parents=True, exist_ok=True)

# (fichier d'origine, zone gauche/haut/droite/bas, nom de sortie) : visages choisis à l'œil, ratio proche de 0,6
PORTRAITS = [
    ("Projet Bootcamp-141.jpg", (275, 110, 615, 680), "people-1"),
    ("Projet Bootcamp-125.jpg", (480, 260, 800, 800), "people-2"),
    ("Projet Bootcamp-141.jpg", (470, 230, 830, 775), "people-3"),
    ("Projet Bootcamp-141.jpg", (790, 150, 1085, 700), "people-4"),
    ("Projet Bootcamp-125.jpg", (725, 330, 1035, 850), "people-5"),
]

for name, box, out in PORTRAITS:
    im = Image.open(SRC / name).convert("RGB").crop(box)
    w = 480
    if im.width != w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT / f"{out}.webp", "WEBP", quality=80, method=6)
    print(out, im.size, (OUT / f"{out}.webp").stat().st_size // 1024, "Ko")

group = Image.open(SRC / "25-Model Techologie.jpg").convert("RGB")
group.save(OUT / "promotion.webp", "WEBP", quality=80, method=6)
small = group.resize((800, round(group.height * 800 / group.width)), Image.LANCZOS)
small.save(OUT / "promotion-sm.webp", "WEBP", quality=78, method=6)
print("promotion", group.size, (OUT / "promotion.webp").stat().st_size // 1024, "Ko /", (OUT / "promotion-sm.webp").stat().st_size // 1024, "Ko")
