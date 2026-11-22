import io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

ASPECT_RATIO_SPECS = {
    '1:1': (1024, 1024),
    '16:9': (1280, 720),
    '9:16': (720, 1280),
    '4:5': (1024, 1280),
    '2:3': (853, 1280),
    '21:9': (1280, 548)
}

def get_dimensions_for_aspect_ratio(aspect_ratio):
    return ASPECT_RATIO_SPECS.get(aspect_ratio, (1280, 720))

def process_and_save_image(image_bytes, output_path, aspect_ratio='16:9',
                           add_watermark=False, add_branding=False, agency_tag='DestinationCampaign AI',
                           target_format='JPEG'):
    """
    Opens raw image bytes using Pillow, resizes/crops to exact aspect ratio,
    optionally applies branding watermark, creates thumbnail, and saves to disk.
    """
    apply_watermark = bool(add_watermark or add_branding)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    img = Image.open(io.BytesIO(image_bytes))
    if img.mode in ('RGBA', 'P') and target_format.upper() in ('JPG', 'JPEG'):
        # Convert to RGB with white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    target_w, target_h = get_dimensions_for_aspect_ratio(aspect_ratio)

    # Perform smart center crop to preserve composition
    img_fit = ImageOps.fit(img, (target_w, target_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))

    # Optional branding watermark in bottom right corner
    if apply_watermark and agency_tag:
        draw = ImageDraw.Draw(img_fit)
        text = f"✨ {agency_tag}"
        
        # Draw translucent pill badge
        try:
            # Attempt to use a basic default font
            font = ImageFont.load_default()
        except Exception:
            font = None

        margin_right = 24
        margin_bottom = 24
        padding_x = 14
        padding_y = 6

        # Estimate text bbox
        if hasattr(draw, 'textbbox') and font:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
        else:
            text_w = len(text) * 8
            text_h = 14

        box_w = text_w + (padding_x * 2)
        box_h = text_h + (padding_y * 2)
        box_x = target_w - margin_right - box_w
        box_y = target_h - margin_bottom - box_h

        # Overlay rounded rectangle
        overlay = Image.new('RGBA', img_fit.size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.rounded_rectangle(
            [box_x, box_y, box_x + box_w, box_y + box_h],
            radius=6,
            fill=(11, 25, 44, 180)
        )
        overlay_draw.text((box_x + padding_x, box_y + padding_y), text, fill=(255, 255, 255, 230), font=font)
        
        img_fit = Image.alpha_composite(img_fit.convert('RGBA'), overlay).convert('RGB')

    # Save final high-res image
    fmt = 'PNG' if target_format.upper() == 'PNG' else 'JPEG'
    img_fit.save(output_path, format=fmt, quality=92, optimize=True)

    # Save thumbnail for fast UI loading
    thumb_path = output_path.parent / f"thumb_{output_path.name}"
    thumb = img_fit.copy()
    thumb.thumbnail((400, 400), Image.Resampling.LANCZOS)
    thumb.save(thumb_path, format='JPEG', quality=85)

    return {
        'file_path': str(output_path),
        'thumb_path': str(thumb_path),
        'width': target_w,
        'height': target_h,
        'format': fmt,
        'size_bytes': output_path.stat().st_size
    }

def convert_image_format(source_path, target_format='PNG'):
    """
    Converts an existing image file on disk to PNG or JPEG format.
    """
    src = Path(source_path)
    if not src.exists():
        return None, "File not found"

    img = Image.open(src)
    target_format = target_format.upper()
    if target_format in ('JPG', 'JPEG'):
        ext = '.jpg'
        fmt = 'JPEG'
        if img.mode != 'RGB':
            img = img.convert('RGB')
    else:
        ext = '.png'
        fmt = 'PNG'

    out_name = f"{src.stem}_{target_format.lower()}{ext}"
    out_path = src.parent / out_name
    img.save(out_path, format=fmt, quality=95)
    return str(out_path), None
