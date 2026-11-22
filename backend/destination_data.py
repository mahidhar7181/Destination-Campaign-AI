"""
Curated destination library, prompt templates, and sample marketing campaigns.
"""

DESTINATIONS = [
    {
        "id": "maldives",
        "name": "Maldives",
        "continent": "Asia",
        "category": "Beach Holiday",
        "badge": "Tropical Sanctuary",
        "description": "Turquoise crystalline atolls, secluded overwater luxury villas, and coral lagoons.",
        "sample_prompt": "Private stilted villa terrace with glass floor panel overlooking calm turquoise lagoon, champagne bucket, sunrise golden light"
    },
    {
        "id": "switzerland",
        "name": "Swiss Alps, Switzerland",
        "continent": "Europe",
        "category": "Luxury Travel",
        "badge": "Alpine Majesty",
        "description": "Snow-capped peaks, luxury timber chalets, scenic alpine trains, and wildflower valleys.",
        "sample_prompt": "Cozy wooden luxury chalet balcony with steaming hot chocolate looking out onto snow-dusted Matterhorn at dusk"
    },
    {
        "id": "santorini",
        "name": "Santorini, Greece",
        "continent": "Europe",
        "category": "Honeymoon",
        "badge": "Aegean Romance",
        "description": "Whitewashed cliffside suites, cobalt domes, infinity plunge pools, and caldera sunsets.",
        "sample_prompt": "Private cave suite terrace in Oia with an infinity plunge pool blending seamlessly into the Aegean Sea at twilight"
    },
    {
        "id": "kyoto",
        "name": "Kyoto, Japan",
        "continent": "Asia",
        "category": "Cultural Tourism",
        "badge": "Timeless Heritage",
        "description": "Historic wooden temples, tranquil zen rock gardens, serene bamboo groves, and tea ceremonies.",
        "sample_prompt": "Peaceful moss garden of an ancient wooden Kyoto ryokan, stone lantern glowing in soft morning mist, bamboo background"
    },
    {
        "id": "amalfi",
        "name": "Amalfi Coast, Italy",
        "continent": "Europe",
        "category": "Hotel Promotion",
        "badge": "Mediterranean Glamour",
        "description": "Pastel villages clinging to dramatic cliffs, lemon groves, and classic wooden speedboats.",
        "sample_prompt": "High-end cliffside boutique hotel terrace in Positano overlooking the sparkling blue Tyrrhenian sea, vintage Riva boat below"
    },
    {
        "id": "bali",
        "name": "Bali, Indonesia",
        "continent": "Asia",
        "category": "Beach Holiday",
        "badge": "Tropical Wellness",
        "description": "Emerald rice terraces, jungle eco-villas with infinity pools, and serene spiritual retreats.",
        "sample_prompt": "Luxury bamboo treehouse villa cantilevered above dense tropical rainforest canopy, morning mist, ray of golden sunlight"
    },
    {
        "id": "paris",
        "name": "Paris, France",
        "continent": "Europe",
        "category": "Cultural Tourism",
        "badge": "City of Light",
        "description": "Haussmannian architecture, chic sidewalk cafés, Seine riverwalks, and iconic monuments.",
        "sample_prompt": "Elegant Parisian rooftop terrace breakfast table with croissants and café au lait, Eiffel tower glowing in morning haze"
    },
    {
        "id": "dubai",
        "name": "Dubai, UAE",
        "continent": "Middle East",
        "category": "Luxury Travel",
        "badge": "Futuristic Oasis",
        "description": "Hyper-modern architecture, desert luxury camps, private yachts, and world-class dining.",
        "sample_prompt": "Luxury desert resort pavilion with private plunge pool amidst golden rolling sand dunes under twilight starry sky"
    },
    {
        "id": "iceland",
        "name": "Reykjavik & South Coast, Iceland",
        "continent": "Europe",
        "category": "Adventure Tourism",
        "badge": "Land of Fire & Ice",
        "description": "Glacial lagoons, dramatic basalt waterfalls, black sand beaches, and Northern Lights.",
        "sample_prompt": "Modern glass igloo suite nestled in mossy volcanic lava field with glowing emerald Aurora Borealis swirling in the dark sky"
    },
    {
        "id": "serengeti",
        "name": "Serengeti National Park, Tanzania",
        "continent": "Africa",
        "category": "Adventure Tourism",
        "badge": "Great Migration Safari",
        "description": "Endless golden savannas, luxury tented safari camps, acacia silhouettes, and wildlife spectacles.",
        "sample_prompt": "Exclusive canvas luxury safari tent veranda at dawn overlooking acacia-dotted savanna, hot air balloon floating in distance"
    },
    {
        "id": "bora_bora",
        "name": "Bora Bora, French Polynesia",
        "continent": "Oceania",
        "category": "Honeymoon",
        "badge": "Pacific Crown Jewel",
        "description": "Dramatic Mount Otemanu, luminous lagoon motus, and thatched overwater bungalows.",
        "sample_prompt": "Traditional Polynesian canoe delivering breakfast to overwater bungalow deck, Mount Otemanu rising dramatically behind lagoon"
    },
    {
        "id": "tulum",
        "name": "Tulum & Riviera Maya, Mexico",
        "continent": "North America",
        "category": "Hotel Promotion",
        "badge": "Boho Luxury",
        "description": "Cenotes, rustic-chic eco-resorts, powdery Caribbean sand, and ancient Mayan cliffside ruins.",
        "sample_prompt": "Open-air luxury eco-resort lounge made of warm organic wood and limestone, hammocks swaying between palms, turquoise ocean"
    }
]

CAMPAIGN_CATEGORIES = [
    "Hotel Promotion",
    "Adventure Tourism",
    "Beach Holiday",
    "Luxury Travel",
    "Cultural Tourism",
    "Honeymoon",
    "Family Vacation"
]

VISUAL_STYLES = [
    "Photorealistic",
    "Cinematic",
    "Luxury",
    "Minimalist",
    "Vintage",
    "Fantasy",
    "3D Art"
]

LIGHTING_OPTIONS = [
    "Golden Hour",
    "Dramatic Sunset",
    "Crisp Daylight",
    "Twilight Glow",
    "Moody Mist",
    "Starry Night"
]

COMPOSITION_OPTIONS = [
    "Wide-angle Landscape",
    "Drone Aerial",
    "Eye-level Medium Shot",
    "Cinematic Macro"
]

ASPECT_RATIOS = [
    {"label": "16:9 Landscape (Banner / Web)", "value": "16:9"},
    {"label": "1:1 Square (Instagram Post)", "value": "1:1"},
    {"label": "9:16 Vertical (Stories / Reels)", "value": "9:16"},
    {"label": "4:5 Portrait (Social Feed)", "value": "4:5"}
]

# Preset Curated Images for Demo Mode & Seeding
PRESET_GALLERY_IMAGES = [
    {
        "title": "Overwater Serenity at Sunset",
        "destination": "Maldives",
        "campaign_type": "Beach Holiday",
        "visual_style": "Luxury",
        "aspect_ratio": "16:9",
        "prompt": "Private overwater villa with infinity pool extending into the turquoise ocean at sunset",
        "enhanced_prompt": "Maldives private overwater villa, infinity plunge pool, luxury hospitality marketing, warm golden hour reflections, 8k commercial quality",
        "external_sample_url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80",
        "engine_used": "Curated Demo Preset"
    },
    {
        "title": "Swiss Alpine Chalet Glow",
        "destination": "Swiss Alps, Switzerland",
        "campaign_type": "Luxury Travel",
        "visual_style": "Photorealistic",
        "aspect_ratio": "16:9",
        "prompt": "Luxury timber chalet terrace overlooking snowy peaks of the Swiss Alps in winter dusk",
        "enhanced_prompt": "Swiss Alps luxury wooden chalet veranda, snow-covered mountains, warm lantern glow, cinematic film photography, 8k resolution",
        "external_sample_url": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1400&q=80",
        "engine_used": "Curated Demo Preset"
    },
    {
        "title": "Oia Cliffside Caldera Romance",
        "destination": "Santorini, Greece",
        "campaign_type": "Honeymoon",
        "visual_style": "Cinematic",
        "aspect_ratio": "16:9",
        "prompt": "Whitewashed Santorini balcony with blue dome overlooking Aegean caldera sunset",
        "enhanced_prompt": "Santorini cliffside luxury suite, blue domes, warm pink sunset clouds over caldera, romantic travel editorial photography",
        "external_sample_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80",
        "engine_used": "Curated Demo Preset"
    },
    {
        "title": "Kyoto Bamboo Grove Meditation",
        "destination": "Kyoto, Japan",
        "campaign_type": "Cultural Tourism",
        "visual_style": "Photorealistic",
        "aspect_ratio": "16:9",
        "prompt": "Serene pathway through tall green bamboo stalks with morning sunlight filtering through mist",
        "enhanced_prompt": "Kyoto Arashiyama bamboo forest path, soft morning crepuscular rays, cultural tourism photography, Hasselblad sharp detail",
        "external_sample_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80",
        "engine_used": "Curated Demo Preset"
    },
    {
        "title": "Positano Coastal Elegance",
        "destination": "Amalfi Coast, Italy",
        "campaign_type": "Hotel Promotion",
        "visual_style": "Luxury",
        "aspect_ratio": "16:9",
        "prompt": "Boutique hotel breakfast terrace with view of colorful cliffside houses of Positano",
        "enhanced_prompt": "Amalfi Coast Positano pastel cliffside village, luxury hotel terrace, Mediterranean blue waters, high-end travel magazine aesthetic",
        "external_sample_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80",
        "engine_used": "Curated Demo Preset"
    },
    {
        "title": "Bali Jungle Treehouse Retreat",
        "destination": "Bali, Indonesia",
        "campaign_type": "Adventure Tourism",
        "visual_style": "Photorealistic",
        "aspect_ratio": "16:9",
        "prompt": "Luxury eco-resort swimming pool surrounded by lush tropical jungle canopy in Ubud",
        "enhanced_prompt": "Bali Ubud jungle infinity pool, misty tropical foliage, palm trees, warm golden morning light, nature retreat advertising visual",
        "external_sample_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80",
        "engine_used": "Curated Demo Preset"
    }
]
