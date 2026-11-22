import os
import uuid
import time
import urllib.parse
import requests
from pathlib import Path
from config import Config
from prompt_enhancer import build_enhanced_prompt
from image_processor import process_and_save_image, get_dimensions_for_aspect_ratio
from destination_data import PRESET_GALLERY_IMAGES
from models import SettingsModel

class AIService:
    @staticmethod
    def get_configured_engine():
        """
        Determines which diffusion engine to use based on settings and API key presence.
        Returns: ('huggingface' | 'pollinations' | 'demo', details_dict)
        """
        # Check DB setting first, then env config
        user_engine = SettingsModel.get('preferred_engine', Config.AI_ENGINE_MODE)
        hf_token = SettingsModel.get('huggingface_api_key', Config.HUGGINGFACE_API_KEY).strip()
        hf_model = SettingsModel.get('hf_model', Config.HF_MODEL).strip()

        if user_engine == 'demo':
            return 'demo', {
                'name': 'Demo Presets Mode',
                'description': 'Using curated high-resolution travel campaign presets (no external API calls)',
                'is_demo': True
            }

        if user_engine == 'huggingface' or (user_engine == 'auto' and hf_token):
            return 'huggingface', {
                'name': 'Hugging Face Inference API',
                'model': hf_model,
                'has_token': bool(hf_token),
                'is_demo': False
            }

        # Default fallback is live Pollinations Diffusion (FLUX / SD)
        return 'pollinations', {
            'name': 'Live Diffusion Engine (FLUX / SDXL)',
            'endpoint': 'https://image.pollinations.ai',
            'is_demo': False
        }

    @staticmethod
    def generate_images(user_id, prompt, destination='', campaign_type='Luxury Travel',
                        visual_style='Photorealistic', aspect_ratio='16:9',
                        lighting='Golden Hour', composition='Wide-angle Landscape',
                        count=1, add_watermark=False, agency_tag='DestinationCampaign AI',
                        forced_engine=None):
        """
        Main entry point for generating travel marketing visuals.
        Returns: (list_of_image_dicts, engine_info)
        """
        # Ensure count between 1 and 4
        count = max(1, min(int(count), 4))
        
        # Build enhanced diffusion prompt
        enhanced_prompt, negative_prompt = build_enhanced_prompt(
            user_prompt=prompt,
            destination=destination,
            campaign_type=campaign_type,
            visual_style=visual_style,
            lighting=lighting,
            composition=composition
        )

        engine_type, engine_info = AIService.get_configured_engine()
        if forced_engine in ('huggingface', 'pollinations', 'demo'):
            engine_type = forced_engine

        generated_results = []
        errors = []

        # Attempt generation using selected engine
        if engine_type == 'huggingface':
            hf_token = SettingsModel.get('huggingface_api_key', Config.HUGGINGFACE_API_KEY).strip()
            hf_model = SettingsModel.get('hf_model', Config.HF_MODEL).strip()

            if not hf_token:
                # HF selected but no token provided -> fall back to pollinations with notice
                engine_type = 'pollinations'
                engine_info['fallback_notice'] = "Hugging Face token not found. Auto-routed to live FLUX/SDXL diffusion engine."
            else:
                for i in range(count):
                    try:
                        img_data = AIService._generate_via_huggingface(
                            enhanced_prompt=enhanced_prompt,
                            negative_prompt=negative_prompt,
                            token=hf_token,
                            model=hf_model,
                            aspect_ratio=aspect_ratio,
                            add_watermark=add_watermark,
                            agency_tag=agency_tag,
                            index=i
                        )
                        img_data['engine_used'] = f"Hugging Face ({hf_model.split('/')[-1]})"
                        img_data['is_preset'] = 0
                        generated_results.append(img_data)
                    except Exception as e:
                        errors.append(f"Hugging Face iteration {i+1} failed: {str(e)}")
                        # Fallback to pollinations for remaining
                        break

        # Fallback to Pollinations diffusion if HF had errors or was preferred
        if len(generated_results) < count and engine_type in ('pollinations', 'huggingface'):
            needed = count - len(generated_results)
            for i in range(needed):
                try:
                    img_data = AIService._generate_via_pollinations(
                        enhanced_prompt=enhanced_prompt,
                        aspect_ratio=aspect_ratio,
                        add_watermark=add_watermark,
                        agency_tag=agency_tag,
                        seed_offset=i * 97
                    )
                    img_data['engine_used'] = "FLUX / SDXL Diffusion (Live)"
                    img_data['is_preset'] = 0
                    generated_results.append(img_data)
                except Exception as e:
                    errors.append(f"Live diffusion error on image {i+1}: {str(e)}")

        # If both live engines failed or demo was forced, provide curated demo preset
        if not generated_results:
            needed = count
            for i in range(needed):
                img_data = AIService._generate_via_demo_preset(
                    destination=destination,
                    campaign_type=campaign_type,
                    enhanced_prompt=enhanced_prompt,
                    aspect_ratio=aspect_ratio,
                    index=i
                )
                img_data['engine_used'] = "Curated Demo Mode (Sample Preset)"
                img_data['is_preset'] = 1
                generated_results.append(img_data)
            engine_info['demo_active'] = True
            if errors:
                engine_info['errors'] = errors

        # Attach standard metadata to each result
        for res in generated_results:
            res['prompt'] = prompt or f"Travel visual for {destination or 'destination'}"
            res['enhanced_prompt'] = enhanced_prompt
            res['destination'] = destination or 'Global Travel'
            res['campaign_type'] = campaign_type
            res['visual_style'] = visual_style
            res['aspect_ratio'] = aspect_ratio
            res['lighting'] = lighting
            res['composition'] = composition

        return generated_results, engine_info

    @staticmethod
    def _generate_via_huggingface(enhanced_prompt, negative_prompt, token, model,
                                  aspect_ratio='16:9', add_watermark=False,
                                  agency_tag='DestinationCampaign AI', index=0):
        """
        Calls Hugging Face Inference API for diffusion models.
        """
        api_url = f"https://api-inference.huggingface.co/models/{model}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        target_w, target_h = get_dimensions_for_aspect_ratio(aspect_ratio)
        # HuggingFace SDXL models often expect dimensions divisible by 8 up to 1024
        req_w = min(1024, (target_w // 8) * 8)
        req_h = min(1024, (target_h // 8) * 8)

        payload = {
            "inputs": enhanced_prompt,
            "parameters": {
                "negative_prompt": negative_prompt,
                "width": req_w,
                "height": req_h,
                "guidance_scale": 7.5,
                "num_inference_steps": 28
            }
        }

        # Handle 503 model warming with up to 2 retries
        max_retries = 2
        for attempt in range(max_retries + 1):
            response = requests.post(api_url, headers=headers, json=payload, timeout=45)
            if response.status_code == 200:
                raw_bytes = response.content
                break
            elif response.status_code == 503 and attempt < max_retries:
                # Wait estimated time if returned
                wait_time = min(response.json().get('estimated_time', 15), 20)
                time.sleep(wait_time)
            else:
                try:
                    err_msg = response.json().get('error', response.text)
                except Exception:
                    err_msg = f"HTTP {response.status_code}"
                raise RuntimeError(f"Hugging Face API returned error: {err_msg}")

        # Process with Pillow
        filename = f"gen_{uuid.uuid4().hex[:12]}.jpg"
        save_path = Config.GENERATED_DIR / filename
        processed = process_and_save_image(
            image_bytes=raw_bytes,
            output_path=save_path,
            aspect_ratio=aspect_ratio,
            add_watermark=add_watermark,
            agency_tag=agency_tag,
            target_format='JPEG'
        )

        return {
            'filename': filename,
            'image_url': f"/static/generated/{filename}",
            'thumb_url': f"/static/generated/thumb_{filename}",
            'file_path': processed['file_path'],
            'width': processed['width'],
            'height': processed['height'],
            'title': f"{destination or 'Destination'} Campaign Visual" if 'destination' in locals() else "Campaign Visual"
        }

    @staticmethod
    def _generate_via_pollinations(enhanced_prompt, aspect_ratio='16:9',
                                   add_watermark=False, agency_tag='DestinationCampaign AI',
                                   seed_offset=0):
        """
        Calls live Pollinations diffusion endpoint for real-time FLUX / SDXL generation.
        Free, high-speed, and generates novel unique travel imagery.
        """
        target_w, target_h = get_dimensions_for_aspect_ratio(aspect_ratio)
        seed = int(time.time() * 1000) % 1000000 + seed_offset

        encoded_prompt = urllib.parse.quote(enhanced_prompt[:1200])
        # Pollinations url
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={target_w}&height={target_h}&seed={seed}&nologo=true&model=flux"

        headers = {
            "User-Agent": "DestinationCampaign-AI-Travel-Platform/1.0"
        }

        response = requests.get(url, headers=headers, timeout=50)
        if response.status_code != 200:
            raise RuntimeError(f"Pollinations engine returned status {response.status_code}")

        raw_bytes = response.content
        if len(raw_bytes) < 1000:
            raise RuntimeError("Pollinations returned empty or corrupt image payload")

        # Process with Pillow
        filename = f"gen_{uuid.uuid4().hex[:12]}.jpg"
        save_path = Config.GENERATED_DIR / filename
        processed = process_and_save_image(
            image_bytes=raw_bytes,
            output_path=save_path,
            aspect_ratio=aspect_ratio,
            add_watermark=add_watermark,
            agency_tag=agency_tag,
            target_format='JPEG'
        )

        return {
            'filename': filename,
            'image_url': f"/static/generated/{filename}",
            'thumb_url': f"/static/generated/thumb_{filename}",
            'file_path': processed['file_path'],
            'width': processed['width'],
            'height': processed['height'],
            'title': "AI Campaign Visual"
        }

    @staticmethod
    def _generate_via_demo_preset(destination='', campaign_type='', enhanced_prompt='',
                                  aspect_ratio='16:9', index=0):
        """
        Creates a cleanly labeled demo mode travel visual.
        Downloads or matches a curated travel preset photo, processes with Pillow,
        and saves locally.
        """
        # Pick from curated preset list
        matched_preset = None
        clean_dest = (destination or '').lower()
        clean_camp = (campaign_type or '').lower()

        for p in PRESET_GALLERY_IMAGES:
            if clean_dest and clean_dest in p['destination'].lower():
                matched_preset = p
                break
            elif clean_camp and clean_camp in p['campaign_type'].lower():
                matched_preset = p
                break

        if not matched_preset:
            matched_preset = PRESET_GALLERY_IMAGES[index % len(PRESET_GALLERY_IMAGES)]

        # Fetch external preset image and save locally if needed
        filename = f"preset_{uuid.uuid4().hex[:10]}.jpg"
        save_path = Config.GENERATED_DIR / filename
        
        try:
            resp = requests.get(matched_preset['external_sample_url'], timeout=15)
            if resp.status_code == 200 and len(resp.content) > 1000:
                processed = process_and_save_image(
                    image_bytes=resp.content,
                    output_path=save_path,
                    aspect_ratio=aspect_ratio,
                    add_watermark=True,
                    agency_tag="Demo Mode Preset",
                    target_format='JPEG'
                )
            else:
                raise Exception("Failed to fetch preset content")
        except Exception:
            # Fallback to local colored Pillow canvas if network is completely off
            from PIL import Image, ImageDraw
            target_w, target_h = get_dimensions_for_aspect_ratio(aspect_ratio)
            img = Image.new('RGB', (target_w, target_h), color=(14, 41, 64))
            draw = ImageDraw.Draw(img)
            # Add simple gradient-like bands
            draw.rectangle([0, target_h // 2, target_w, target_h], fill=(11, 25, 44))
            draw.ellipse([target_w // 2 - 120, target_h // 2 - 120, target_w // 2 + 120, target_h // 2 + 120], fill=(65, 201, 226))
            draw.text((40, target_h - 80), f"Demo Mode Visual: {destination or 'Travel Visual'}", fill=(255, 255, 255))
            save_path.parent.mkdir(parents=True, exist_ok=True)
            img.save(save_path, 'JPEG', quality=90)
            
            thumb_path = save_path.parent / f"thumb_{filename}"
            img_thumb = img.copy()
            img_thumb.thumbnail((400, 400))
            img_thumb.save(thumb_path, 'JPEG', quality=85)
            processed = {
                'file_path': str(save_path),
                'thumb_path': str(thumb_path),
                'width': target_w,
                'height': target_h
            }

        return {
            'filename': filename,
            'image_url': f"/static/generated/{filename}",
            'thumb_url': f"/static/generated/thumb_{filename}",
            'file_path': processed['file_path'],
            'width': processed['width'],
            'height': processed['height'],
            'title': matched_preset['title']
        }
