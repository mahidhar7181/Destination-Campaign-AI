import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env if present
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', '').strip()
    if not SECRET_KEY:
        raise RuntimeError('SECRET_KEY must be set in backend/.env or the environment')
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '72'))
    
    DATABASE_PATH = os.environ.get('DATABASE_PATH', str(BASE_DIR / 'database.sqlite'))
    
    STATIC_DIR = BASE_DIR / 'static'
    GENERATED_DIR = STATIC_DIR / 'generated'
    PRESETS_DIR = STATIC_DIR / 'presets'
    
    # Hugging Face Configuration
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', os.environ.get('HF_TOKEN', '')).strip()
    HF_MODEL = os.environ.get('HF_MODEL', 'stabilityai/stable-diffusion-xl-base-1.0')
    
    # Engine mode: 'auto' | 'pollinations' | 'huggingface' | 'demo'
    # 'auto' tries Hugging Face if key is provided, falls back to direct live Pollinations diffusion, or demo mode
    AI_ENGINE_MODE = os.environ.get('AI_ENGINE_MODE', 'auto')
    
    # Port & Host
    PORT = int(os.environ.get('PORT', 5000))
    HOST = os.environ.get('HOST', '127.0.0.1')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
