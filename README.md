# DestinationCampaign AI – Travel Marketing Visual Generator ✈️🎨

DestinationCampaign AI is a modern, full-stack, AI-powered travel marketing platform engineered for travel agencies, luxury hotels, resorts, tourism boards, and creators. It synthesizes magazine-grade destination advertising visuals using diffusion AI models and organizes them into high-converting marketing campaign kits.

---

## 🌟 Key Features

### 1. 🏝️ Travel Marketing Diffusion Studio
- **Advanced Travel Prompt Synthesizer**: Converts simple destination concepts into hyper-optimized diffusion prompts with Hasselblad camera optics, ray-traced lighting, and National Geographic / Condé Nast Traveler aesthetics.
- **Top World Destinations**: 25+ curated global hotspots (Maldives, Swiss Alps, Santorini, Kyoto, Amalfi Coast, Bali, Paris, Dubai, Iceland, Serengeti, Bora Bora, Tulum) with one-click chips.
- **Campaign Categories**: Specialized modifiers for Hotel Promotion, Adventure Tourism, Beach Holiday, Luxury Travel, Cultural Tourism, Honeymoon, and Family Vacations.
- **Multi-Format Aspect Ratios**: Enforces exact aspect ratios via Pillow post-processing:
  - `16:9 Landscape` (Hero banners, YouTube, Website headers)
  - `1:1 Square` (Instagram posts, social squares)
  - `9:16 Vertical` (Instagram Reels, TikTok, Stories)
  - `4:5 Portrait` (Instagram feed portraits)
- **Lighting & Atmospheric Moods**: Golden Hour, Dramatic Sunset, Crisp Daylight, Twilight Glow, Moody Mist, Starry Night.
- **Camera Compositions**: Wide-angle Landscape (16mm), Drone Aerial (4K top-down), Eye-level Medium Shot, Cinematic Macro Detail.
- **Agency Branding Stamps**: Optionally stamps subtle, elegant agency watermarks directly onto visuals via Pillow.

### 2. ⚡ Dual Diffusion Engine Architecture
- **Live FLUX / Stable Diffusion Engine**: Real-time novel diffusion image generation out of the box without requiring a credit card or mandatory API key.
- **Hugging Face Inference API**: Direct integration with Hugging Face diffusion models (e.g., `stabilityai/stable-diffusion-xl-base-1.0`, `black-forest-labs/FLUX.1-schnell`, `runwayml/stable-diffusion-v1-5`).
- **Curated Demo Presets Mode**: Transparent offline demo mode with curated travel advertising visuals if offline or when testing without network latency.
- **Honest AI Reporting**: Never displays placeholder visuals as real AI outputs; clearly displays the active engine name on every visual asset.

### 3. 📂 Campaign Management & Kits
- Create multi-channel marketing campaigns with destinations, target audiences, seasonal timing, and budget tiers.
- Attach generated visuals directly into campaign moodboards.
- Organize assets for client presentations, brochure printing, and digital ad campaigns.

### 4. 🖼️ Saved Asset Gallery & Lightbox
- High-resolution visual inspection with full prompt details, camera attributes, and technical parameters.
- One-click downloads in high-res **JPEG** or lossless **PNG** formats.
- Instant search and filtering by destination, category, and date.

### 5. 📊 Analytics Dashboard
- Track total generated visuals, saved assets, active campaigns, and unique destinations explored.
- Category distribution breakdown.
- Prompt generation audit history with one-click "Iterate / Re-run" action.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend** | Python 3.12, Flask, Flask-CORS, PyJWT, Werkzeug |
| **Database** | SQLite3 (`database.sqlite`) with foreign key constraints |
| **AI Diffusion** | Live FLUX/SDXL Diffusion Pipeline + Hugging Face Inference API |
| **Image Processing** | Pillow (PIL) for aspect ratio cropping, watermarks, format conversions |
| **Authentication** | Secure JWT Bearer tokens with hashed passwords (Werkzeug PBKDF2:SHA256) |

---

## 📁 Project Structure

```
GEN AI PROJECT/
├── backend/
│   ├── app.py                  # Flask REST API application & route handlers
│   ├── config.py               # Environment configuration & file paths
│   ├── models.py               # SQLite database models (Users, Images, Campaigns, History)
│   ├── auth.py                 # JWT token generation & @jwt_required decorator
│   ├── ai_service.py           # Multi-provider diffusion engine (HF, Pollinations, Demo)
│   ├── prompt_enhancer.py      # Travel marketing prompt synthesizer
│   ├── image_processor.py      # Pillow aspect ratio cropping, watermark, format export
│   ├── destination_data.py     # Curated destination tags, categories & demo presets
│   ├── seed_data.py            # Initial database seeder
│   ├── test_api.py             # 15/15 automated API test suite
│   ├── requirements.txt        # Python pip dependencies
│   ├── .env.example            # Sample environment variables
│   └── static/
│       └── generated/          # Storage for synthesized marketing visuals
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Centralized REST API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state, tokens, toast notifications, engine status
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation, engine status pill, user avatar menu
│   │   │   ├── Sidebar.jsx     # SaaS dashboard sidebar navigation
│   │   │   ├── ImageCard.jsx   # Interactive visual card with hover actions
│   │   │   ├── ImageModal.jsx  # Fullscreen high-res lightbox inspector
│   │   │   ├── CampaignModal.jsx# Campaign kit creation & editing modal
│   │   │   ├── EngineSettingsModal.jsx # Diffusion engine & HF API key configuration
│   │   │   └── Toast.jsx       # Floating notifications
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # SaaS Hero, showcase gallery, features, testimonials
│   │   │   ├── GeneratorStudio.jsx # Main AI generation dashboard & prompt studio
│   │   │   ├── MyGallery.jsx       # Saved visual library with search & filters
│   │   │   ├── CampaignManager.jsx # Marketing campaign kit organizer
│   │   │   ├── Dashboard.jsx       # User analytics & prompt history
│   │   │   ├── LoginPage.jsx       # Sign in with 1-Click Demo shortcut
│   │   │   └── RegisterPage.jsx    # Agency registration
│   │   ├── App.jsx             # Root layout & page routing
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind custom utilities & design system
│   ├── index.html              # HTML shell with Google Fonts
│   ├── package.json            # NPM dependencies
│   ├── vite.config.js          # Vite config with backend proxy
│   └── tailwind.config.js      # Custom theme colors (Deep Navy, Sky Blue, Sand)
├── run_backend.bat             # Convenience batch runner for Flask backend
├── run_frontend.bat            # Convenience batch runner for Vite frontend
├── start_app.ps1               # Automated PowerShell launcher
└── README.md                   # Complete documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.12+** (installed on your system)
- **Node.js 18+** & **npm**

### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy the sample configuration and set a unique SECRET_KEY in .env
Copy-Item .env.example .env
# Generate a key, then paste it after SECRET_KEY= in .env
python -c "import secrets; print(secrets.token_urlsafe(48))"

# (Optional) Seed demo user with sample visuals & campaigns
python seed_data.py

# Run the Flask backend server
python app.py
```
> The backend server will start on: **`http://127.0.0.1:5000`**
> The backend requires `SECRET_KEY` to be set in `backend/.env` or the environment. Never commit `.env`; local secrets and databases are ignored by Git.

### 2. Frontend Setup
Open a second terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
> The frontend application will be live at: **`http://localhost:5173`**

---

## 🔑 Pre-Configured Demo Account

For rapid evaluation, a complete demo account with seeded marketing campaigns and visuals is ready:
- **Email**: `demo@destinationcampaign.ai`
- **Password**: `demo123`
- *Or simply click the **"One-Click Demo Agency Login"** button on the Login page.*

---

## ⚙️ AI Engine & Hugging Face Configuration

DestinationCampaign AI comes ready out of the box with the **Live FLUX / SDXL Diffusion Engine** enabled.

To connect your own Hugging Face model or token:
1. Click the **AI Provider Pill** in the top navigation bar or sidebar.
2. Select **Hugging Face** mode.
3. Paste your free Hugging Face User Access Token (from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).
4. Choose your preferred diffusion model (e.g. `stabilityai/stable-diffusion-xl-base-1.0` or `black-forest-labs/FLUX.1-schnell`).
5. Click **Test Connection** and **Save Settings**.

You can also set environment variables in `backend/.env`:
```env
HUGGINGFACE_API_KEY=hf_your_actual_token_here
HF_MODEL=stabilityai/stable-diffusion-xl-base-1.0
AI_ENGINE_MODE=auto
SECRET_KEY=your-secure-random-secret-key
```

---

## 🧪 Automated Test Suite

A complete verification suite is included to test all REST API endpoints and image operations:
```bash
cd backend
python test_api.py
```
**Test Results:**
- `[PASS]` Health Check
- `[PASS]` Destinations Metadata
- `[PASS]` Demo User Login
- `[PASS]` Auth Me
- `[PASS]` User Registration
- `[PASS]` Prompt Synthesizer
- `[PASS]` Image Generation (Pillow + Diffusion Pipeline)
- `[PASS]` List User Images
- `[PASS]` Toggle Save Image
- `[PASS]` Create Campaign
- `[PASS]` Get Campaign Detail & Images
- `[PASS]` Dashboard Statistics
- `[PASS]` Settings Engine Status
- `[PASS]` Download Image JPEG
- `[PASS]` Download Image PNG

---

## 📜 REST API Documentation

### Authentication
- `POST /api/auth/register` – Register new agency account
- `POST /api/auth/login` – Login & receive JWT token
- `GET /api/auth/me` – Get authenticated user profile (`Bearer <token>`)
- `PUT /api/auth/profile` – Update full name or agency name

### AI Visual Studio
- `GET /api/destinations` – Retrieve destination presets, lighting styles, categories, aspect ratios
- `POST /api/enhance-prompt` – Synthesize optimized diffusion prompt for travel advertising
- `POST /api/generate` – Generate diffusion marketing visuals with Pillow post-processing

### Asset Gallery
- `GET /api/images` – List user visuals (query params: `destination`, `campaign_type`, `search`, `saved_only`)
- `GET /api/images/<id>` – Retrieve visual details & prompt metadata
- `POST /api/images/<id>/save` – Toggle saved/favorite status
- `DELETE /api/images/<id>` – Delete visual asset from database & disk
- `GET /api/images/<id>/download?format=jpeg|png` – Download high-res image

### Campaign Kits
- `GET /api/campaigns` – List marketing campaign kits
- `POST /api/campaigns` – Create new campaign kit
- `GET /api/campaigns/<id>` – View campaign kit with attached visuals
- `PUT /api/campaigns/<id>` – Update campaign metadata
- `DELETE /api/campaigns/<id>` – Delete campaign
- `POST /api/campaigns/<id>/images` – Attach visual to campaign kit
- `DELETE /api/campaigns/<id>/images/<image_id>` – Remove visual from campaign kit

### Analytics & System
- `GET /api/dashboard/stats` – Aggregate metrics & category breakdown
- `GET /api/generation-history` – Recent generation prompt history
- `GET /api/settings/status` – AI engine status & HF configuration
- `POST /api/settings/config` – Update AI engine settings & API keys

---

## 🎨 UI/UX Design System
- **Colors**:
  - Pure white: `#FFFFFF`
  - Soft ivory: `#F8FAF7`
  - Emerald: `#047857`, dark emerald: `#064E3B`, light emerald: `#D1FAE5`
- **Typography**: Playfair Display, Manrope
- **Interactions**: Editorial photography, restrained motion, card hover elevation, responsive layouts, modal lightboxes, and toast notifications.

---

© 2026 DestinationCampaign AI. Built for travel agencies, luxury hotels, resorts, and tourism marketers.
