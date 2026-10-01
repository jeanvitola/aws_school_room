"""Convierte las ilustraciones del autor (art/) en sprites del juego (spec 004).

Uso:  npm run art   (equivale a: python scripts/convert-art.py)
Requiere Python 3 y Pillow (pip install pillow). Es una herramienta de autor: el build del sitio
no la ejecuta; los sprites generados se versionan en public/assets/sprites/.

Por cada pieza de art/manifest.json:
  1. recorta la zona indicada de la ilustración original;
  2. quita el fondo magenta y los halos rosados (por tono, no por color exacto);
  3. ajusta el recorte al dibujo y lo reduce al tamaño de src/scene/sprite-sizes.json
     promediando colores (filtro BOX), con transparencia binaria;
  4. reduce todos los sprites a una paleta común (art/palette.gpl, abrible en Aseprite).
Además genera art/preview/comparison.png con el antes y el después.
"""
import colorsys
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
ART_DIR = ROOT / "art"
OUT_DIR = ROOT / "public" / "assets" / "sprites"
SIZES = json.loads((ROOT / "src" / "scene" / "sprite-sizes.json").read_text(encoding="utf-8"))
MANIFEST = json.loads((ART_DIR / "manifest.json").read_text(encoding="utf-8"))

ALPHA_THRESHOLD = 128
PREVIEW_HEIGHT = 256


def is_background(r: int, g: int, b: int) -> bool:
    """Magenta del fondo y sus mezclas con el dibujo (halos), detectados por tono."""
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return 0.75 <= h <= 0.95 and s > 0.25 and v > 0.25


def remove_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = pixels[x, y]
            if is_background(r, g, b):
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def apply_diamond_mask(image: Image.Image) -> Image.Image:
    """Deja solo el rombo isométrico inscrito en el recorte (para baldosas)."""
    mask = Image.new("L", image.size, 0)
    w, h = image.size
    ImageDraw.Draw(mask).polygon([(w / 2, 0), (w, h / 2), (w / 2, h), (0, h / 2)], fill=255)
    image.putalpha(Image.composite(image.getchannel("A"), mask, mask))
    return image


def fit(image: Image.Image, width: int, height: int, anchor: str) -> Image.Image:
    """Reduce la pieza al tamaño del sprite. 'fill' estira; el resto conserva la proporción."""
    if anchor == "fill":
        return image.resize((width, height), Image.Resampling.BOX)
    scale = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.Resampling.BOX)
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    x = (width - size[0]) // 2
    y = height - size[1] if anchor == "bottom" else (height - size[1]) // 2
    canvas.paste(resized, (x, y))
    return canvas


def enhance(image: Image.Image, saturation: float, contrast: float) -> Image.Image:
    """Recupera la intensidad de líneas finas (neones) que se apagan al reducir la pieza."""
    alpha = image.getchannel("A")
    rgb = ImageEnhance.Contrast(ImageEnhance.Color(image.convert("RGB")).enhance(saturation))
    result = rgb.enhance(contrast).convert("RGBA")
    result.putalpha(alpha)
    return result


def first_opaque_row(image: Image.Image, x: int) -> int:
    alpha = image.getchannel("A")
    for y in range(image.height):
        if alpha.getpixel((x, y)) > 0:
            return y
    return image.height


def shear_wall(image: Image.Image, side: str, target: dict) -> Image.Image:
    """Inclina una pared para que su arista caiga con la pendiente isométrica del juego.

    En el sprite final la caída de la arista superior es la mitad del ancho (2:1). La pared del
    autor cae menos, así que se desplaza cada columna hacia abajo de forma proporcional.
    """
    w, h = image.size
    margin = max(1, w // 20)
    left, right = first_opaque_row(image, margin), first_opaque_row(image, w - 1 - margin)
    drop = abs(right - left)
    face = h - drop
    # Proporción final: caída / cara = (ancho / 2) / (alto - ancho / 2).
    final_drop = target["width"] / 2
    wanted = face * final_drop / (target["height"] - final_drop)
    extra = max(0.0, wanted - drop)
    sheared = Image.new("RGBA", (w, h + round(extra) + 1), (0, 0, 0, 0))
    for x in range(w):
        t = x / (w - 1) if side == "left" else (w - 1 - x) / (w - 1)
        column = image.crop((x, 0, x + 1, h))
        sheared.paste(column, (x, round(extra * t)))
    return sheared


def binarize_alpha(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A").point(lambda a: 255 if a >= ALPHA_THRESHOLD else 0)
    image.putalpha(alpha)
    return image


COLORS_PER_SPRITE = 16


def sprite_colors(sprite: Image.Image, weight: float = 1) -> list[tuple[float, tuple[int, int, int]]]:
    """Colores representativos de un sprite, con su peso: píxeles × cuántas veces se ve en pantalla."""
    opaque = [p[:3] for p in sprite.getdata() if p[3] > 0]
    sample = Image.new("RGB", (len(opaque), 1))
    sample.putdata(opaque)
    quantized = sample.quantize(colors=COLORS_PER_SPRITE, method=Image.Quantize.MEDIANCUT)
    raw = quantized.getpalette()
    return [(count * weight, tuple(raw[i * 3 : i * 3 + 3])) for count, i in quantized.getcolors()]


def build_palette(sprites: list[tuple[Image.Image, float]], colors: int) -> Image.Image:
    """Paleta común: cada sprite aporta sus colores (así no se pierden los acentos, que ocupan
    pocos píxeles) y luego se fusionan los pares más parecidos hasta dejar `colors`. Al fusionar,
    el color resultante se acerca al de mayor peso (p. ej. el piso, que se repite en toda la sala)."""
    entries = [list(entry) for sprite, weight in sprites for entry in sprite_colors(sprite, weight)]
    while len(entries) > colors:
        best = None
        for i in range(len(entries)):
            for j in range(i + 1, len(entries)):
                distance = sum((a - b) ** 2 for a, b in zip(entries[i][1], entries[j][1]))
                if best is None or distance < best[0]:
                    best = (distance, i, j)
        _, i, j = best
        (wi, ci), (wj, cj) = entries[i], entries[j]
        merged = tuple(round((a * wi + b * wj) / (wi + wj)) for a, b in zip(ci, cj))
        entries[i] = [wi + wj, merged]
        entries.pop(j)
    palette = Image.new("P", (1, 1))
    flat = [channel for _, color in entries for channel in color]
    palette.putpalette(flat + [0, 0, 0] * (256 - len(entries)))
    palette.info["colors"] = [color for _, color in entries]
    return palette


def apply_palette(sprite: Image.Image, palette: Image.Image) -> Image.Image:
    alpha = sprite.getchannel("A")
    rgb = sprite.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).convert("RGB")
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def write_gpl(palette: Image.Image, path: Path) -> None:
    colors = sorted(palette.info["colors"], key=lambda c: sum(c))
    lines = ["GIMP Palette", "Name: Torre AWS", "Columns: 8", "#"]
    lines += [f"{r:3d} {g:3d} {b:3d}\tTorre AWS {i}" for i, (r, g, b) in enumerate(colors)]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def preview(pieces: list[tuple[str, Image.Image, Image.Image]], path: Path) -> None:
    """Lámina antes/después: original reducido a la izquierda, sprite ampliado ×N a la derecha."""
    rows = []
    for _name, original, sprite in pieces:
        before = original.convert("RGB")
        before = before.resize(
            (round(before.width * PREVIEW_HEIGHT / before.height), PREVIEW_HEIGHT),
            Image.Resampling.LANCZOS,
        )
        factor = max(1, PREVIEW_HEIGHT // sprite.height)
        after = sprite.resize((sprite.width * factor, sprite.height * factor), Image.Resampling.NEAREST)
        rows.append((before, after))
    width = max(b.width + a.width for b, a in rows) + 48
    height = sum(max(b.height, a.height) for b, a in rows) + 16 * (len(rows) + 1)
    sheet = Image.new("RGBA", (width, height), (27, 22, 38, 255))
    y = 16
    for before, after in rows:
        sheet.paste(before, (16, y))
        sheet.alpha_composite(after, (before.width + 32, y))
        y += max(before.height, after.height) + 16
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path)


def convert_frame(original: Image.Image, piece: dict, size: dict) -> Image.Image:
    sprite = remove_background(original)
    if piece.get("mask") == "diamond":
        sprite = apply_diamond_mask(sprite)
    bbox = sprite.getchannel("A").getbbox()
    if bbox:
        sprite = sprite.crop(bbox) if piece["anchor"] != "fill" or "wall" in piece else sprite
    if "wall" in piece:
        sprite = shear_wall(sprite, piece["wall"], size)
        sprite = sprite.crop(sprite.getchannel("A").getbbox())
    sprite = binarize_alpha(fit(sprite, size["width"], size["height"], piece["anchor"]))
    if "enhance" in piece:
        sprite = enhance(sprite, piece["enhance"]["saturation"], piece["enhance"]["contrast"])
    return sprite


def main() -> None:
    converted = []
    for piece in MANIFEST["pieces"]:
        name = piece["sprite"]
        size = SIZES[name]
        source = Image.open(ART_DIR / piece["source"])
        crops = piece.get("frames") or [piece["crop"]]
        if len(crops) != size.get("frames", 1):
            raise SystemExit(f"{name}: el manifiesto tiene {len(crops)} cuadros y sprite-sizes.json pide {size.get('frames', 1)}")
        frames = [convert_frame(source.crop(tuple(crop)), piece, size) for crop in crops]
        strip = Image.new("RGBA", (size["width"] * len(frames), size["height"]), (0, 0, 0, 0))
        for i, frame in enumerate(frames):
            strip.paste(frame, (i * size["width"], 0))
        converted.append((name, source.crop(tuple(crops[0])), strip, piece.get("weight", 1)))

    palette = build_palette([(sprite, weight) for _, _, sprite, weight in converted], MANIFEST["paletteColors"])
    final = []
    for name, original, sprite, _ in converted:
        sprite = apply_palette(sprite, palette)
        sprite.save(OUT_DIR / f"{name}.png")
        final.append((name, original, sprite))
        print(f"✓ {name}.png ({sprite.width}×{sprite.height})")

    write_gpl(palette, ART_DIR / "palette.gpl")
    preview(final, ART_DIR / "preview" / "comparison.png")
    print("✓ art/palette.gpl y art/preview/comparison.png")


if __name__ == "__main__":
    main()
