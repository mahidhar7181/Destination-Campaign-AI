import os
import json
from pathlib import Path
from flask import Flask, request, jsonify, send_file, send_from_directory, g
from flask_cors import CORS
from config import Config
from models import init_db, UserModel, ImageModel, CampaignModel, HistoryModel, StatsModel, SettingsModel
from auth import generate_token, jwt_required
from prompt_enhancer import build_enhanced_prompt
from ai_service import AIService
from image_processor import convert_image_format
from destination_data import DESTINATIONS, CAMPAIGN_CATEGORIES, VISUAL_STYLES, LIGHTING_OPTIONS, COMPOSITION_OPTIONS, ASPECT_RATIOS

# Initialize Flask App
app = Flask(__name__, static_folder='static')
app.config.from_object(Config)

# Enable CORS for frontend Vite dev server & production
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Ensure directories exist
Config.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
Config.PRESETS_DIR.mkdir(parents=True, exist_ok=True)

# Initialize Database Schema
init_db()

# -------------------------------------------------------------
# Static File Serving
# -------------------------------------------------------------
@app.route('/static/generated/<path:filename>')
def serve_generated(filename):
    return send_from_directory(Config.GENERATED_DIR, filename)

@app.route('/static/presets/<path:filename>')
def serve_presets(filename):
    return send_from_directory(Config.PRESETS_DIR, filename)

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'DestinationCampaign AI Backend',
        'version': '1.0.0'
    })

# -------------------------------------------------------------
# User Authentication Routes
# -------------------------------------------------------------
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    full_name = data.get('full_name', '').strip()
    agency_name = data.get('agency_name', '').strip()

    if not email or not password or not full_name:
        return jsonify({'success': False, 'message': 'Email, password, and full name are required.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'}), 400

    existing_user = UserModel.get_by_email(email)
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this email already exists.'}), 409

    user = UserModel.create(email=email, password=password, full_name=full_name, agency_name=agency_name)
    if not user:
        return jsonify({'success': False, 'message': 'Failed to create user account.'}), 500

    token = generate_token(user['id'], user['email'])
    return jsonify({
        'success': True,
        'message': 'Account created successfully!',
        'token': token,
        'user': user
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = UserModel.get_by_email(email)
    if not user or not UserModel.verify_password(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    token = generate_token(user['id'], user['email'])
    user_data = {
        'id': user['id'],
        'email': user['email'],
        'full_name': user['full_name'],
        'agency_name': user['agency_name'],
        'role': user['role'],
        'created_at': user['created_at']
    }

    return jsonify({
        'success': True,
        'message': f"Welcome back, {user['full_name']}!",
        'token': token,
        'user': user_data
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required
def get_current_user():
    return jsonify({
        'success': True,
        'user': g.current_user
    })

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required
def update_profile():
    data = request.get_json() or {}
    full_name = data.get('full_name', g.current_user['full_name'])
    agency_name = data.get('agency_name', g.current_user['agency_name'])

    updated = UserModel.update_profile(g.current_user['id'], full_name, agency_name)
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': updated
    })

# -------------------------------------------------------------
# Destination & Preset Metadata Routes
# -------------------------------------------------------------
@app.route('/api/destinations', methods=['GET'])
def get_destinations_metadata():
    return jsonify({
        'success': True,
        'destinations': DESTINATIONS,
        'campaign_categories': CAMPAIGN_CATEGORIES,
        'visual_styles': VISUAL_STYLES,
        'lighting_options': LIGHTING_OPTIONS,
        'composition_options': COMPOSITION_OPTIONS,
        'aspect_ratios': ASPECT_RATIOS
    })

# -------------------------------------------------------------
# AI Image Generation & Prompt Enhancement
# -------------------------------------------------------------
@app.route('/api/enhance-prompt', methods=['POST'])
def enhance_prompt():
    data = request.get_json() or {}
    user_prompt = data.get('prompt', '')
    destination = data.get('destination', '')
    campaign_type = data.get('campaign_type', 'Luxury Travel')
    visual_style = data.get('visual_style', 'Photorealistic')
    lighting = data.get('lighting', 'Golden Hour')
    composition = data.get('composition', 'Wide-angle Landscape')

    enhanced_prompt, negative_prompt = build_enhanced_prompt(
        user_prompt=user_prompt,
        destination=destination,
        campaign_type=campaign_type,
        visual_style=visual_style,
        lighting=lighting,
        composition=composition
    )

    return jsonify({
        'success': True,
        'enhanced_prompt': enhanced_prompt,
        'negative_prompt': negative_prompt
    })

@app.route('/api/generate', methods=['POST'])
@jwt_required
def generate_images():
    data = request.get_json() or {}
    prompt = data.get('prompt', '').strip()
    destination = data.get('destination', '').strip()
    campaign_type = data.get('campaign_type', 'Luxury Travel')
    visual_style = data.get('visual_style', 'Photorealistic')
    aspect_ratio = data.get('aspect_ratio', '16:9')
    lighting = data.get('lighting', 'Golden Hour')
    composition = data.get('composition', 'Wide-angle Landscape')
    count = int(data.get('count', 1))
    add_watermark = bool(data.get('add_watermark', False))
    agency_tag = data.get('agency_tag', g.current_user.get('agency_name') or 'DestinationCampaign AI')
    forced_engine = data.get('engine', None)

    if not prompt and not destination:
        return jsonify({'success': False, 'message': 'Please provide either a prompt idea or destination name.'}), 400

    try:
        # Run diffusion generation
        results, engine_info = AIService.generate_images(
            user_id=g.current_user['id'],
            prompt=prompt,
            destination=destination,
            campaign_type=campaign_type,
            visual_style=visual_style,
            aspect_ratio=aspect_ratio,
            lighting=lighting,
            composition=composition,
            count=count,
            add_watermark=add_watermark,
            agency_tag=agency_tag,
            forced_engine=forced_engine
        )

        saved_records = []
        for r in results:
            img_rec = ImageModel.create(
                user_id=g.current_user['id'],
                title=f"{destination or 'Travel'} {campaign_type}",
                destination=destination or 'Global',
                campaign_type=campaign_type,
                visual_style=visual_style,
                aspect_ratio=aspect_ratio,
                prompt=prompt,
                enhanced_prompt=r['enhanced_prompt'],
                image_url=r['image_url'],
                file_path=r['file_path'],
                width=r['width'],
                height=r['height'],
                engine_used=r['engine_used'],
                is_preset=r['is_preset'],
                metadata={
                    'lighting': lighting,
                    'composition': composition,
                    'thumb_url': r.get('thumb_url', r['image_url']),
                    'agency_tag': agency_tag
                }
            )
            saved_records.append(img_rec)

        # Record history
        HistoryModel.record(
            user_id=g.current_user['id'],
            destination=destination,
            prompt=prompt,
            enhanced_prompt=results[0]['enhanced_prompt'] if results else '',
            settings=data,
            status='completed'
        )

        return jsonify({
            'success': True,
            'message': f"Generated {len(saved_records)} visual{'s' if len(saved_records) > 1 else ''} successfully!",
            'images': saved_records,
            'engine_info': engine_info
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f"Image generation failed: {str(e)}",
            'engine_info': {'name': 'Engine Error', 'error': str(e)}
        }), 500

# -------------------------------------------------------------
# Image Management Routes
# -------------------------------------------------------------
@app.route('/api/images', methods=['GET'])
@jwt_required
def list_images():
    destination = request.args.get('destination', None)
    campaign_type = request.args.get('campaign_type', None)
    search = request.args.get('search', None)
    saved_only = request.args.get('saved_only', 'false').lower() == 'true'
    limit = int(request.args.get('limit', 100))

    images = ImageModel.list_user_images(
        user_id=g.current_user['id'],
        destination=destination,
        campaign_type=campaign_type,
        search=search,
        saved_only=saved_only,
        limit=limit
    )

    return jsonify({
        'success': True,
        'count': len(images),
        'images': images
    })

@app.route('/api/images/<int:image_id>', methods=['GET'])
@jwt_required
def get_image(image_id):
    img = ImageModel.get_by_id(image_id)
    if not img or img['user_id'] != g.current_user['id']:
        return jsonify({'success': False, 'message': 'Image not found'}), 404
    return jsonify({'success': True, 'image': img})

@app.route('/api/images/<int:image_id>/save', methods=['POST'])
@jwt_required
def toggle_save_image(image_id):
    new_val = ImageModel.toggle_save(image_id, g.current_user['id'])
    if new_val is None:
        return jsonify({'success': False, 'message': 'Image not found'}), 404
    return jsonify({
        'success': True,
        'is_saved': new_val,
        'message': 'Image saved to gallery' if new_val == 1 else 'Image unsaved from gallery'
    })

@app.route('/api/images/<int:image_id>', methods=['DELETE'])
@jwt_required
def delete_image(image_id):
    ok = ImageModel.delete(image_id, g.current_user['id'])
    if not ok:
        return jsonify({'success': False, 'message': 'Image not found'}), 404
    return jsonify({'success': True, 'message': 'Image deleted successfully'})

@app.route('/api/images/<int:image_id>/download', methods=['GET'])
def download_image(image_id):
    img = ImageModel.get_by_id(image_id)
    if not img:
        return jsonify({'success': False, 'message': 'Image not found'}), 404

    target_fmt = request.args.get('format', 'jpeg').lower()
    file_path = Path(img['file_path'])

    if not file_path.exists():
        return jsonify({'success': False, 'message': 'Source file not found on disk'}), 404

    if target_fmt in ('png', 'jpg', 'jpeg'):
        converted_path, err = convert_image_format(str(file_path), target_format=target_fmt)
        if err or not converted_path:
            converted_path = str(file_path)
    else:
        converted_path = str(file_path)

    ext = 'png' if target_fmt == 'png' else 'jpg'
    safe_title = "".join(c for c in img['title'] if c.isalnum() or c in (' ', '-', '_')).strip().replace(' ', '_')
    download_name = f"{safe_title}_{img['id']}.{ext}"

    return send_file(
        converted_path,
        as_attachment=True,
        download_name=download_name,
        mimetype=f"image/{ext}"
    )

# -------------------------------------------------------------
# Campaign Management Routes
# -------------------------------------------------------------
@app.route('/api/campaigns', methods=['GET'])
@jwt_required
def list_campaigns():
    campaigns = CampaignModel.list_user_campaigns(g.current_user['id'])
    return jsonify({
        'success': True,
        'count': len(campaigns),
        'campaigns': campaigns
    })

@app.route('/api/campaigns', methods=['POST'])
@jwt_required
def create_campaign():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    destination = data.get('destination', '').strip()
    category = data.get('category', 'Luxury Travel').strip()
    target_audience = data.get('target_audience', 'Luxury Travelers')
    season = data.get('season', 'All Season')
    budget_tier = data.get('budget_tier', 'Premium')

    if not title or not destination:
        return jsonify({'success': False, 'message': 'Campaign title and destination are required.'}), 400

    campaign = CampaignModel.create(
        user_id=g.current_user['id'],
        title=title,
        description=description,
        destination=destination,
        category=category,
        target_audience=target_audience,
        season=season,
        budget_tier=budget_tier
    )

    # Attach initial images if provided
    initial_images = data.get('image_ids', [])
    for img_id in initial_images:
        CampaignModel.attach_image(campaign['id'], img_id, g.current_user['id'])

    # Reload with attached images
    full_campaign = CampaignModel.get_by_id(campaign['id'])
    return jsonify({
        'success': True,
        'message': f"Campaign '{title}' created successfully!",
        'campaign': full_campaign
    }), 201

@app.route('/api/campaigns/<int:campaign_id>', methods=['GET'])
@jwt_required
def get_campaign(campaign_id):
    camp = CampaignModel.get_by_id(campaign_id)
    if not camp or camp['user_id'] != g.current_user['id']:
        return jsonify({'success': False, 'message': 'Campaign not found'}), 404
    return jsonify({'success': True, 'campaign': camp})

@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT'])
@jwt_required
def update_campaign(campaign_id):
    data = request.get_json() or {}
    camp = CampaignModel.get_by_id(campaign_id)
    if not camp or camp['user_id'] != g.current_user['id']:
        return jsonify({'success': False, 'message': 'Campaign not found'}), 404

    updated = CampaignModel.update(
        campaign_id=campaign_id,
        user_id=g.current_user['id'],
        title=data.get('title', camp['title']),
        description=data.get('description', camp['description']),
        destination=data.get('destination', camp['destination']),
        category=data.get('category', camp['category']),
        target_audience=data.get('target_audience', camp['target_audience']),
        season=data.get('season', camp['season']),
        budget_tier=data.get('budget_tier', camp['budget_tier'])
    )
    return jsonify({
        'success': True,
        'message': 'Campaign updated successfully',
        'campaign': updated
    })

@app.route('/api/campaigns/<int:campaign_id>', methods=['DELETE'])
@jwt_required
def delete_campaign(campaign_id):
    ok = CampaignModel.delete(campaign_id, g.current_user['id'])
    if not ok:
        return jsonify({'success': False, 'message': 'Campaign not found'}), 404
    return jsonify({'success': True, 'message': 'Campaign deleted successfully'})

@app.route('/api/campaigns/<int:campaign_id>/images', methods=['POST'])
@jwt_required
def attach_image_to_campaign(campaign_id):
    data = request.get_json() or {}
    image_id = data.get('image_id')
    if not image_id:
        return jsonify({'success': False, 'message': 'image_id is required'}), 400

    ok, msg = CampaignModel.attach_image(campaign_id, image_id, g.current_user['id'])
    if not ok:
        return jsonify({'success': False, 'message': msg}), 400
    return jsonify({'success': True, 'message': msg})

@app.route('/api/campaigns/<int:campaign_id>/images/<int:image_id>', methods=['DELETE'])
@jwt_required
def detach_image_from_campaign(campaign_id, image_id):
    ok = CampaignModel.detach_image(campaign_id, image_id, g.current_user['id'])
    if not ok:
        return jsonify({'success': False, 'message': 'Failed to detach image'}), 400
    return jsonify({'success': True, 'message': 'Image removed from campaign'})

# -------------------------------------------------------------
# Dashboard & Analytics Routes
# -------------------------------------------------------------
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required
def get_dashboard_stats():
    stats = StatsModel.get_user_stats(g.current_user['id'])
    recent_history = HistoryModel.list_recent(g.current_user['id'], limit=6)
    recent_images = ImageModel.list_user_images(g.current_user['id'], limit=8)
    recent_campaigns = CampaignModel.list_user_campaigns(g.current_user['id'])

    return jsonify({
        'success': True,
        'stats': stats,
        'recent_history': recent_history,
        'recent_images': recent_images,
        'recent_campaigns': recent_campaigns[:4]
    })

@app.route('/api/generation-history', methods=['GET'])
@jwt_required
def get_generation_history():
    history = HistoryModel.list_recent(g.current_user['id'], limit=25)
    return jsonify({
        'success': True,
        'history': history
    })

# -------------------------------------------------------------
# AI Engine Configuration & Status
# -------------------------------------------------------------
@app.route('/api/settings/status', methods=['GET'])
def get_engine_status():
    engine_type, engine_info = AIService.get_configured_engine()
    hf_token = SettingsModel.get('huggingface_api_key', Config.HUGGINGFACE_API_KEY).strip()
    hf_model = SettingsModel.get('hf_model', Config.HF_MODEL).strip()
    user_engine = SettingsModel.get('preferred_engine', Config.AI_ENGINE_MODE)

    return jsonify({
        'success': True,
        'active_engine': engine_type,
        'engine_info': engine_info,
        'user_engine_preference': user_engine,
        'hf_configured': bool(hf_token),
        'hf_token_preview': f"{hf_token[:4]}...{hf_token[-4:]}" if len(hf_token) >= 8 else '',
        'hf_model': hf_model
    })

@app.route('/api/settings/config', methods=['POST'])
@jwt_required
def update_engine_config():
    data = request.get_json() or {}
    
    if 'huggingface_api_key' in data:
        SettingsModel.set('huggingface_api_key', data['huggingface_api_key'].strip())
    if 'hf_model' in data:
        SettingsModel.set('hf_model', data['hf_model'].strip())
    if 'preferred_engine' in data:
        SettingsModel.set('preferred_engine', data['preferred_engine'].strip())

    engine_type, engine_info = AIService.get_configured_engine()
    return jsonify({
        'success': True,
        'message': 'AI engine settings updated successfully!',
        'active_engine': engine_type,
        'engine_info': engine_info
    })

if __name__ == '__main__':
    print(f"Starting DestinationCampaign AI Backend on port {Config.PORT}...")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
