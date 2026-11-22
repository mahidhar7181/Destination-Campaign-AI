"""
Advanced Travel Marketing Prompt Synthesizer
Converts user prompts, destinations, and campaign variables into 
hyper-optimized diffusion prompts tailored for travel advertising.
"""

CAMPAIGN_TYPE_MODIFIERS = {
    'Hotel Promotion': (
        "luxury hospitality marketing visual, five-star boutique resort architecture, "
        "private infinity plunge pool overlooking breathtaking panoramic views, designer sun loungers, "
        "crisp linens, seamless indoor-outdoor living, architectural symmetry, magazine editorial cover"
    ),
    'Adventure Tourism': (
        "epic adventure travel photography, dramatic towering peaks and rugged natural topography, "
        "intrepid solo traveler gazing into the vast wilderness, dynamic scale, adrenaline-inspiring atmosphere, "
        "National Geographic expedition aesthetic, cinematic wilderness"
    ),
    'Beach Holiday': (
        "idyllic sun-drenched coastal retreat, crystal-clear turquoise shallow waters, "
        "pristine powdery white sand, swaying coconut palms, gentle ocean ripples, vibrant tropical flora, "
        "ultimate summer vacation brochure visual"
    ),
    'Luxury Travel': (
        "ultra-exclusive luxury tourism advertising, private yacht deck with teak wood, crystal champagne flutes, "
        "impeccable bespoke elegance, Conde Nast Traveler cover aesthetic, glamorous ambiance, opulent details"
    ),
    'Cultural Tourism': (
        "authentic cultural heritage journey, historic centuries-old stone architecture, "
        "intricate handcrafted details, atmospheric warm paper lanterns, timeless cultural immersion, "
        "rich evocative textures, award-winning travel documentary photography"
    ),
    'Honeymoon': (
        "romantic intimate couples sanctuary, secluded private overwater terrace, candlelit beachfront dinner, "
        "fairylight accents, ethereal soft bokeh, warm romantic sunset glow, dreamlike honeymoon paradise"
    ),
    'Family Vacation': (
        "vibrant and cheerful family vacation destination, sunlit resort grounds, playful seaside haven, "
        "clear bright skies, warm welcoming tones, joyful and spacious holiday resort experience"
    )
}

VISUAL_STYLE_MODIFIERS = {
    'Photorealistic': (
        "hyper-realistic 8k masterpiece, photographed on Hasselblad H6D-100c with 24mm f/2.8 prime lens, "
        "true-to-life color grading, pristine focus, crisp natural textures, accurate reflections, high dynamic range"
    ),
    'Cinematic': (
        "cinematic widescreen still from an IMAX travel feature, anamorphic lens flares, 35mm film grain, "
        "moody cinematic color grade, atmospheric volume, dramatic contrast, sweeping epic composition"
    ),
    'Luxury': (
        "Architectural Digest and Vogue Living editorial shoot, ultra-high-end glossy finish, "
        "refined minimalist luxury, soft golden fill lighting, bespoke craftsmanship, immaculate styling"
    ),
    'Minimalist': (
        "modern minimalist aesthetic, vast negative space, clean horizon lines, muted calming pastel palette, "
        "understated elegance, zen tranquility, serene graphic composition"
    ),
    'Vintage': (
        "nostalgic 1970s Kodachrome 64 film aesthetic, warm sun-faded saturation, subtle analog grain, "
        "vintage European travel poster feeling, timeless retro romanticism"
    ),
    'Fantasy': (
        "surreal fairy-tale dreamscape, ethereal bioluminescent flora, shimmering mystical waters, "
        "twilight nebula sky, magical atmospheric glow, enchanted paradise"
    ),
    '3D Art': (
        "stylized 3D digital render, Octane Render, clay and glass materials, playful volumetric lighting, "
        "smooth geometric bevels, vibrant modern travel concept art"
    )
}

LIGHTING_MODIFIERS = {
    'Golden Hour': "bathed in warm liquid golden hour sunlight, long soft shadows, amber sun flare, glowing horizon",
    'Dramatic Sunset': "spectacular sunset with fiery crimson, purple, and coral clouds casting reflections on water",
    'Crisp Daylight': "crystal-clear midday tropical daylight, azure sky, vivid saturated natural colors, bright clarity",
    'Twilight Glow': "magical blue hour twilight, soft ambient glow, glowing warm lanterns contrasting deep sapphire sky",
    'Moody Mist': "atmospheric morning mountain mist rolling over lush ridges, soft diffused ethereal light, mysterious depth",
    'Starry Night': "pristine dark night sky filled with the Milky Way galaxy, starlight reflections, magical night vista"
}

COMPOSITION_MODIFIERS = {
    'Wide-angle Landscape': "expansive ultra-wide 16mm landscape perspective, grand scale, deep depth of field",
    'Drone Aerial': "breathtaking bird-eye drone aerial view from 200 feet, top-down visual geometry, vast coastal scale",
    'Eye-level Medium Shot': "eye-level medium perspective, balanced rule-of-thirds composition, inviting foreground leading lines",
    'Cinematic Macro': "close-up editorial detail with creamy bokeh background, rich textural depth, sharp foreground focal point"
}

DESTINATION_HIGHLIGHTS = {
    'maldives': "Maldives overwater villas, shallow crystalline lagoons, turquoise atolls, pristine coral sandbanks",
    'switzerland': "Swiss Alps mountain panorama, snow-capped Jungfrau summits, lush wildflower meadows, wooden chalets",
    'paris': "Paris Haussmannian wrought-iron balcony, Eiffel Tower in distant morning haze, cobblestone street café",
    'bali': "Bali sacred emerald rice terraces, frangipani blossoms, carved temple gates, lush jungle canopy",
    'santorini': "Santorini Oia whitewashed cliffside architecture, cobalt blue domes, Aegean Sea caldera view",
    'kyoto': "Kyoto Arashiyama serene bamboo forest, vermilion torii gates, Zen stone garden, ancient wooden pagoda",
    'amalfi coast': "Amalfi Coast pastel cliffside village of Positano, Tyrrhenian sea, lemon grove terraces",
    'dubai': "Dubai futuristic skyline, Burj Khalifa towering over desert horizon, sleek luxury super-yacht marina",
    'iceland': "Iceland dramatic black sand beach, cascading waterfalls, volcanic basalt columns, mossy fjords",
    'serengeti': "Serengeti golden savannah plains at dawn, acacia trees silhouette, vast African wildlife horizon",
    'bora bora': "Bora Bora Mount Otemanu rising dramatically over a luminous turquoise lagoon and stilted bungalows",
    'new york': "Manhattan skyline from rooftop lounge, Empire State Building glowing, vibrant cosmopolitan energy",
    'tulum': "Tulum bohemian luxury eco-resort, white sand beach, lush palm jungle, limestone cenote aesthetic"
}

NEGATIVE_PROMPT_DEFAULT = (
    "blurry, out of focus, distorted anatomy, deformed hands, ugly, oversaturated neon artifacts, "
    "low resolution, pixelated, jpeg compression artifacts, watermark, logo, text watermark, "
    "cluttered debris, bad architecture, poor composition, overexposed blown-out highlights"
)

def build_enhanced_prompt(user_prompt, destination='', campaign_type='Luxury Travel',
                          visual_style='Photorealistic', lighting='Golden Hour',
                          composition='Wide-angle Landscape'):
    """
    Synthesizes a high-converting, professional travel marketing image generation prompt.
    """
    clean_user = (user_prompt or '').strip()
    clean_dest = (destination or '').strip()

    parts = []

    # 1. Base destination context
    if clean_dest:
        dest_key = clean_dest.lower()
        matched_highlight = None
        for k, v in DESTINATION_HIGHLIGHTS.items():
            if k in dest_key:
                matched_highlight = v
                break
        if matched_highlight:
            parts.append(f"Destination: {clean_dest} ({matched_highlight})")
        else:
            parts.append(f"Destination: {clean_dest}")

    # 2. Main subject / user idea
    if clean_user:
        parts.append(clean_user)
    else:
        # Generate default travel subject if user prompt is minimal
        parts.append(f"stunning promotional travel visual for {clean_dest or 'a world-class destination'}")

    # 3. Campaign Type
    camp_mod = CAMPAIGN_TYPE_MODIFIERS.get(campaign_type, CAMPAIGN_TYPE_MODIFIERS['Luxury Travel'])
    parts.append(camp_mod)

    # 4. Visual Style & Camera
    style_mod = VISUAL_STYLE_MODIFIERS.get(visual_style, VISUAL_STYLE_MODIFIERS['Photorealistic'])
    parts.append(style_mod)

    # 5. Lighting
    light_mod = LIGHTING_MODIFIERS.get(lighting, LIGHTING_MODIFIERS['Golden Hour'])
    parts.append(light_mod)

    # 6. Composition
    comp_mod = COMPOSITION_MODIFIERS.get(composition, COMPOSITION_MODIFIERS['Wide-angle Landscape'])
    parts.append(comp_mod)

    # 7. Final Travel Marketing Polish Tag
    parts.append("commercial travel advertising quality, award-winning travel campaign visual, ultra-sharp detail")

    enhanced_prompt = ", ".join(parts)
    return enhanced_prompt, NEGATIVE_PROMPT_DEFAULT
