from pathlib import Path
from PIL import Image

SOURCE = Path("/home/ubuntu/webdev-static-assets/olayinka-vinyl-covers")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/olayinka-vinyl-optimized")
MAX_BYTES = 100 * 1024
SIZE = (400, 400)

OUTPUT.mkdir(parents=True, exist_ok=True)

for source in sorted(SOURCE.glob("*.jpg")):
    with Image.open(source) as image:
        converted = image.convert("RGB").resize(SIZE, Image.Resampling.LANCZOS)

        webp_path = OUTPUT / f"{source.stem}.webp"
        jpeg_path = OUTPUT / f"{source.stem}.jpg"

        converted.save(webp_path, "WEBP", quality=80, method=6)
        converted.save(jpeg_path, "JPEG", quality=82, optimize=True, progressive=True)

        for output in (webp_path, jpeg_path):
            if output.stat().st_size > MAX_BYTES:
                raise RuntimeError(f"{output.name} exceeds 100KB")
            print(f"{output.name}\t{output.stat().st_size}")
