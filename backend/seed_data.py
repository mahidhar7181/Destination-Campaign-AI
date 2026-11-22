"""
Seed script to initialize demo user with high-quality destination visuals and sample campaigns.
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from models import init_db, UserModel, ImageModel, CampaignModel, HistoryModel, get_db
from destination_data import PRESET_GALLERY_IMAGES
from image_processor import process_and_save_image
import requests

def seed_demo_data():
    init_db()
    demo_user = UserModel.get_by_email('demo@destinationcampaign.ai')
    if not demo_user:
        demo_user = UserModel.create('demo@destinationcampaign.ai', 'demo123', 'Alex Rivers', 'Aura Luxury Travels')

    user_id = demo_user['id']

    # Check if images already exist for demo user
    existing_images = ImageModel.list_user_images(user_id)
    if existing_images:
        print(f"Demo user already has {len(existing_images)} images. Seeding skipped.")
        return

    print("Seeding demo visuals for DestinationCampaign AI...")

    # Create Sample Campaigns first
    camp1 = CampaignModel.create(
        user_id=user_id,
        title="Maldives Azure Horizons 2026",
        description="Global luxury summer promotion showcasing private overwater villas, sunset yacht charters, and bespoke culinary journeys.",
        destination="Maldives",
        category="Beach Holiday",
        target_audience="High-Net-Worth Couples & Honeymooners",
        season="Summer 2026",
        budget_tier="Ultra-Luxury"
    )

    camp2 = CampaignModel.create(
        user_id=user_id,
        title="Alpine Winter Escape – St. Moritz",
        description="Editorial winter visual kit celebrating fireside chalets, private helicopter ski transfers, and panoramic alpine views.",
        destination="Swiss Alps, Switzerland",
        category="Luxury Travel",
        target_audience="Winter Sports Enthusiasts & Connoisseurs",
        season="Winter 2026",
        budget_tier="Premium"
    )

    camp3 = CampaignModel.create(
        user_id=user_id,
        title="Kyoto Zen Heritage Discovery",
        description="Cultural immersion campaign highlighting quiet bamboo pathways, historic shrines, and matcha tea heritage.",
        destination="Kyoto, Japan",
        category="Cultural Tourism",
        target_audience="Cultural Explorers & Photographers",
        season="Autumn / Spring",
        budget_tier="Boutique"
    )

    # Seed images
    created_img_ids = []
    for i, p in enumerate(PRESET_GALLERY_IMAGES):
        filename = f"preset_visual_{i+1}.jpg"
        save_path = Path(__file__).resolve().parent / 'static' / 'generated' / filename
        
        # Download image from curated travel photography or generate
        try:
            resp = requests.get(p['external_sample_url'], timeout=10)
            if resp.status_code == 200 and len(resp.content) > 1000:
                processed = process_and_save_image(
                    image_bytes=resp.content,
                    output_path=save_path,
                    aspect_ratio=p['aspect_ratio'],
                    add_watermark=True,
                    agency_tag="Aura Luxury Travels",
                    target_format='JPEG'
                )
            else:
                raise Exception("Failed to fetch")
        except Exception as e:
            from PIL import Image, ImageDraw
            img = Image.new('RGB', (1280, 720), color=(14, 41, 64))
            draw = ImageDraw.Draw(img)
            draw.rectangle([0, 360, 1280, 720], fill=(11, 25, 44))
            draw.ellipse([640 - 150, 360 - 150, 640 + 150, 360 + 150], fill=(65, 201, 226))
            draw.text((50, 650), f"{p['title']} - {p['destination']}", fill=(255, 255, 255))
            save_path.parent.mkdir(parents=True, exist_ok=True)
            img.save(save_path, 'JPEG', quality=90)
            
            thumb_path = save_path.parent / f"thumb_{filename}"
            thumb = img.copy()
            thumb.thumbnail((400, 400))
            thumb.save(thumb_path, 'JPEG', quality=85)
            processed = {
                'file_path': str(save_path),
                'thumb_path': str(thumb_path),
                'width': 1280,
                'height': 720
            }

        img_rec = ImageModel.create(
            user_id=user_id,
            title=p['title'],
            destination=p['destination'],
            campaign_type=p['campaign_type'],
            visual_style=p['visual_style'],
            aspect_ratio=p['aspect_ratio'],
            prompt=p['prompt'],
            enhanced_prompt=p['enhanced_prompt'],
            image_url=f"/static/generated/{filename}",
            file_path=processed['file_path'],
            width=processed['width'],
            height=processed['height'],
            engine_used="Pollinations FLUX Diffusion",
            is_preset=0,
            metadata={
                'lighting': 'Golden Hour',
                'composition': 'Wide-angle Landscape',
                'thumb_url': f"/static/generated/thumb_{filename}",
                'agency_tag': 'Aura Luxury Travels'
            }
        )
        created_img_ids.append(img_rec['id'])

    # Attach images to campaigns
    if len(created_img_ids) >= 2:
        CampaignModel.attach_image(camp1['id'], created_img_ids[0], user_id)
        if len(created_img_ids) >= 5:
            CampaignModel.attach_image(camp1['id'], created_img_ids[4], user_id)
        CampaignModel.attach_image(camp2['id'], created_img_ids[1], user_id)
        if len(created_img_ids) >= 4:
            CampaignModel.attach_image(camp3['id'], created_img_ids[3], user_id)

    print(f"Successfully seeded {len(created_img_ids)} visuals and 3 campaigns for demo user.")

if __name__ == '__main__':
    seed_demo_data()
