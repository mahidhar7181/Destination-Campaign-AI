"""
Automated end-to-end test suite for DestinationCampaign AI Flask REST API.
"""
import sys
import json
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from app import app
from models import init_db

def run_tests():
    print("=" * 60)
    print("DESTINATIONCAMPAIGN AI - REST API VERIFICATION SUITE")
    print("=" * 60)

    client = app.test_client()
    passed = 0
    total = 0

    def assert_test(name, condition, extra=""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name} {extra}")
        else:
            print(f"  [FAIL] {name} {extra}")
            raise AssertionError(f"Test failed: {name}")

    # 1. Health check
    res = client.get('/api/health')
    assert_test("Health Check", res.status_code == 200 and res.json.get('status') == 'healthy')

    # 2. Destinations & Metadata
    res = client.get('/api/destinations')
    assert_test("Destinations Metadata", res.status_code == 200 and len(res.json.get('destinations', [])) > 5)

    # 3. Demo User Login
    res = client.post('/api/auth/login', json={
        'email': 'demo@destinationcampaign.ai',
        'password': 'demo123'
    })
    assert_test("Demo User Login", res.status_code == 200 and 'token' in res.json)
    demo_token = res.json['token']
    demo_headers = {'Authorization': f'Bearer {demo_token}'}

    # 4. Get Current User Info
    res = client.get('/api/auth/me', headers=demo_headers)
    assert_test("Auth Me", res.status_code == 200 and res.json['user']['email'] == 'demo@destinationcampaign.ai')

    # 5. User Registration (New Test User)
    new_email = f"test_{int(res.json['user']['id']) + 999}@travelagency.com"
    res = client.post('/api/auth/register', json={
        'email': new_email,
        'password': 'password123',
        'full_name': 'Jordan Rivera',
        'agency_name': 'Horizon Luxury Tours'
    })
    assert_test("User Registration", res.status_code == 201 and 'token' in res.json)
    user_token = res.json['token']
    user_headers = {'Authorization': f'Bearer {user_token}'}

    # 6. Prompt Enhancer
    res = client.post('/api/enhance-prompt', json={
        'prompt': 'Overwater villa with plunge pool',
        'destination': 'Maldives',
        'campaign_type': 'Beach Holiday',
        'visual_style': 'Photorealistic',
        'lighting': 'Golden Hour',
        'composition': 'Wide-angle Landscape'
    })
    assert_test("Prompt Synthesizer", res.status_code == 200 and 'enhanced_prompt' in res.json)
    print(f"      -> Sample Enhanced Prompt: {res.json['enhanced_prompt'][:90]}...")

    # 7. AI Image Generation (Forced Demo Preset Mode for fast local test)
    res = client.post('/api/generate', headers=user_headers, json={
        'prompt': 'Luxury timber chalet with snowy peaks',
        'destination': 'Swiss Alps, Switzerland',
        'campaign_type': 'Luxury Travel',
        'visual_style': 'Photorealistic',
        'aspect_ratio': '16:9',
        'lighting': 'Golden Hour',
        'composition': 'Wide-angle Landscape',
        'count': 1,
        'add_watermark': True,
        'agency_tag': 'Horizon Luxury Tours',
        'engine': 'demo'
    })
    assert_test("Image Generation (Pillow + Diffusion Pipeline)", res.status_code == 200 and len(res.json.get('images', [])) == 1)
    generated_image = res.json['images'][0]
    img_id = generated_image['id']
    print(f"      -> Generated Image ID: {img_id}, URL: {generated_image['image_url']}")

    # 8. List Images
    res = client.get('/api/images', headers=user_headers)
    assert_test("List User Images", res.status_code == 200 and len(res.json.get('images', [])) >= 1)

    # 9. Toggle Save Image
    res = client.post(f'/api/images/{img_id}/save', headers=user_headers)
    assert_test("Toggle Save Image", res.status_code == 200 and 'is_saved' in res.json)

    # 10. Create Campaign
    res = client.post('/api/campaigns', headers=user_headers, json={
        'title': 'Swiss Winter Retreat 2026',
        'description': 'Editorial winter campaign celebrating panoramic views and alpine luxury.',
        'destination': 'Swiss Alps, Switzerland',
        'category': 'Luxury Travel',
        'target_audience': 'Luxury Couples',
        'season': 'Winter 2026',
        'budget_tier': 'Ultra-Luxury',
        'image_ids': [img_id]
    })
    assert_test("Create Campaign", res.status_code == 201 and 'campaign' in res.json)
    camp_id = res.json['campaign']['id']

    # 11. Get Campaign with attached images
    res = client.get(f'/api/campaigns/{camp_id}', headers=user_headers)
    assert_test("Get Campaign Detail & Images", res.status_code == 200 and len(res.json['campaign'].get('images', [])) == 1)

    # 12. Dashboard Stats
    res = client.get('/api/dashboard/stats', headers=user_headers)
    assert_test("Dashboard Statistics", res.status_code == 200 and res.json['stats']['total_images'] >= 1)

    # 13. Settings Status
    res = client.get('/api/settings/status')
    assert_test("Settings Engine Status", res.status_code == 200 and 'active_engine' in res.json)

    # 14. Download Image (JPEG & PNG format test)
    res = client.get(f'/api/images/{img_id}/download?format=jpeg', headers=user_headers)
    assert_test("Download Image JPEG", res.status_code == 200 and len(res.data) > 100)

    res = client.get(f'/api/images/{img_id}/download?format=png', headers=user_headers)
    assert_test("Download Image PNG", res.status_code == 200 and len(res.data) > 100)

    print("=" * 60)
    print(f"ALL {passed}/{total} BACKEND REST API TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
