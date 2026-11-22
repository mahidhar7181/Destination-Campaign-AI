import sqlite3
import json
from pathlib import Path
from datetime import datetime
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = Path(Config.DATABASE_PATH)

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        agency_name TEXT DEFAULT '',
        role TEXT DEFAULT 'creator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Generated Images Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS generated_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        campaign_type TEXT NOT NULL,
        visual_style TEXT NOT NULL,
        aspect_ratio TEXT DEFAULT '16:9',
        prompt TEXT NOT NULL,
        enhanced_prompt TEXT NOT NULL,
        image_url TEXT NOT NULL,
        file_path TEXT NOT NULL,
        width INTEGER DEFAULT 1280,
        height INTEGER DEFAULT 720,
        is_saved INTEGER DEFAULT 1,
        engine_used TEXT DEFAULT 'Pollinations Diffusion',
        is_preset INTEGER DEFAULT 0,
        metadata_json TEXT DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)

    # Marketing Campaigns Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        destination TEXT NOT NULL,
        category TEXT NOT NULL,
        target_audience TEXT DEFAULT 'Luxury Travelers',
        season TEXT DEFAULT 'All Season',
        budget_tier TEXT DEFAULT 'Premium',
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)

    # Campaign Images Junction Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS campaign_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campaign_id INTEGER NOT NULL,
        image_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(campaign_id, image_id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES generated_images (id) ON DELETE CASCADE
    )
    """)

    # Generation History Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS generation_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        destination TEXT NOT NULL,
        prompt TEXT NOT NULL,
        enhanced_prompt TEXT NOT NULL,
        settings_json TEXT DEFAULT '{}',
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)

    # System Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()

    # Seed Default Demo User if not exists
    cursor.execute("SELECT id FROM users WHERE email = ?", ('demo@destinationcampaign.ai',))
    demo_user = cursor.fetchone()
    if not demo_user:
        hashed_pwd = generate_password_hash('demo123')
        cursor.execute("""
            INSERT INTO users (email, password_hash, full_name, agency_name, role)
            VALUES (?, ?, ?, ?, ?)
        """, ('demo@destinationcampaign.ai', hashed_pwd, 'Alex Rivers', 'Aura Luxury Travels', 'agency_lead'))
        conn.commit()

    conn.close()

class UserModel:
    @staticmethod
    def create(email, password, full_name, agency_name=''):
        conn = get_db()
        cursor = conn.cursor()
        password_hash = generate_password_hash(password)
        try:
            cursor.execute("""
                INSERT INTO users (email, password_hash, full_name, agency_name)
                VALUES (?, ?, ?, ?)
            """, (email.lower().strip(), password_hash, full_name.strip(), agency_name.strip()))
            conn.commit()
            user_id = cursor.lastrowid
            return UserModel.get_by_id(user_id)
        except sqlite3.IntegrityError:
            return None
        finally:
            conn.close()

    @staticmethod
    def get_by_id(user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name, agency_name, role, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_by_email(email):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def verify_password(stored_hash, password):
        return check_password_hash(stored_hash, password)

    @staticmethod
    def update_profile(user_id, full_name, agency_name):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET full_name = ?, agency_name = ? WHERE id = ?
        """, (full_name, agency_name, user_id))
        conn.commit()
        conn.close()
        return UserModel.get_by_id(user_id)

class ImageModel:
    @staticmethod
    def create(user_id, title, destination, campaign_type, visual_style, aspect_ratio,
               prompt, enhanced_prompt, image_url, file_path, width=1280, height=720,
               engine_used='Pollinations Diffusion', is_preset=0, metadata=None):
        conn = get_db()
        cursor = conn.cursor()
        metadata_json = json.dumps(metadata or {})
        cursor.execute("""
            INSERT INTO generated_images (
                user_id, title, destination, campaign_type, visual_style, aspect_ratio,
                prompt, enhanced_prompt, image_url, file_path, width, height, is_saved,
                engine_used, is_preset, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        """, (user_id, title, destination, campaign_type, visual_style, aspect_ratio,
              prompt, enhanced_prompt, image_url, str(file_path), width, height,
              engine_used, is_preset, metadata_json))
        conn.commit()
        img_id = cursor.lastrowid
        conn.close()
        return ImageModel.get_by_id(img_id)

    @staticmethod
    def get_by_id(image_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM generated_images WHERE id = ?", (image_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        try:
            d['metadata'] = json.loads(d.get('metadata_json') or '{}')
        except Exception:
            d['metadata'] = {}
        return d

    @staticmethod
    def list_user_images(user_id, destination=None, campaign_type=None, search=None, saved_only=False, limit=100):
        conn = get_db()
        cursor = conn.cursor()
        query = "SELECT * FROM generated_images WHERE user_id = ?"
        params = [user_id]

        if saved_only:
            query += " AND is_saved = 1"
        if destination and destination.strip() and destination != 'All':
            query += " AND LOWER(destination) LIKE ?"
            params.append(f"%{destination.lower().strip()}%")
        if campaign_type and campaign_type.strip() and campaign_type != 'All':
            query += " AND LOWER(campaign_type) = ?"
            params.append(campaign_type.lower().strip())
        if search and search.strip():
            query += " AND (LOWER(title) LIKE ? OR LOWER(destination) LIKE ? OR LOWER(prompt) LIKE ?)"
            s = f"%{search.lower().strip()}%"
            params.extend([s, s, s])

        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        results = []
        for r in rows:
            d = dict(r)
            try:
                d['metadata'] = json.loads(d.get('metadata_json') or '{}')
            except Exception:
                d['metadata'] = {}
            results.append(d)
        return results

    @staticmethod
    def toggle_save(image_id, user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT is_saved FROM generated_images WHERE id = ? AND user_id = ?", (image_id, user_id))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        new_val = 0 if row['is_saved'] == 1 else 1
        cursor.execute("UPDATE generated_images SET is_saved = ? WHERE id = ? AND user_id = ?", (new_val, image_id, user_id))
        conn.commit()
        conn.close()
        return new_val

    @staticmethod
    def delete(image_id, user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT file_path FROM generated_images WHERE id = ? AND user_id = ?", (image_id, user_id))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return False
        
        cursor.execute("DELETE FROM generated_images WHERE id = ? AND user_id = ?", (image_id, user_id))
        conn.commit()
        conn.close()
        return True

class CampaignModel:
    @staticmethod
    def create(user_id, title, description, destination, category, target_audience='Luxury Travelers', season='All Season', budget_tier='Premium'):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO campaigns (user_id, title, description, destination, category, target_audience, season, budget_tier)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, title.strip(), description.strip(), destination.strip(), category.strip(), target_audience, season, budget_tier))
        conn.commit()
        camp_id = cursor.lastrowid
        conn.close()
        return CampaignModel.get_by_id(camp_id)

    @staticmethod
    def get_by_id(campaign_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        camp = dict(row)
        
        # Attach images
        cursor.execute("""
            SELECT gi.*, ci.added_at as attached_at
            FROM generated_images gi
            JOIN campaign_images ci ON gi.id = ci.image_id
            WHERE ci.campaign_id = ?
            ORDER BY ci.added_at DESC
        """, (campaign_id,))
        camp['images'] = [dict(img) for img in cursor.fetchall()]
        camp['image_count'] = len(camp['images'])
        conn.close()
        return camp

    @staticmethod
    def list_user_campaigns(user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, COUNT(ci.image_id) as image_count
            FROM campaigns c
            LEFT JOIN campaign_images ci ON c.id = ci.campaign_id
            WHERE c.user_id = ?
            GROUP BY c.id
            ORDER BY c.updated_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        
        campaigns = []
        for r in rows:
            camp = dict(r)
            # get preview image thumbnail if any
            cursor.execute("""
                SELECT gi.image_url, gi.title
                FROM generated_images gi
                JOIN campaign_images ci ON gi.id = ci.image_id
                WHERE ci.campaign_id = ?
                ORDER BY ci.added_at DESC LIMIT 3
            """, (camp['id'],))
            camp['preview_thumbnails'] = [dict(img)['image_url'] for img in cursor.fetchall()]
            campaigns.append(camp)
            
        conn.close()
        return campaigns

    @staticmethod
    def update(campaign_id, user_id, title, description, destination, category, target_audience, season, budget_tier):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE campaigns
            SET title = ?, description = ?, destination = ?, category = ?,
                target_audience = ?, season = ?, budget_tier = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        """, (title.strip(), description.strip(), destination.strip(), category.strip(),
              target_audience, season, budget_tier, campaign_id, user_id))
        conn.commit()
        conn.close()
        return CampaignModel.get_by_id(campaign_id)

    @staticmethod
    def delete(campaign_id, user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM campaigns WHERE id = ? AND user_id = ?", (campaign_id, user_id))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0

    @staticmethod
    def attach_image(campaign_id, image_id, user_id):
        conn = get_db()
        cursor = conn.cursor()
        # Verify ownership
        cursor.execute("SELECT id FROM campaigns WHERE id = ? AND user_id = ?", (campaign_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False, "Campaign not found or unauthorized"
        cursor.execute("SELECT id FROM generated_images WHERE id = ? AND user_id = ?", (image_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False, "Image not found or unauthorized"

        try:
            cursor.execute("""
                INSERT INTO campaign_images (campaign_id, image_id)
                VALUES (?, ?)
            """, (campaign_id, image_id))
            cursor.execute("UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (campaign_id,))
            conn.commit()
            conn.close()
            return True, "Image attached successfully"
        except sqlite3.IntegrityError:
            conn.close()
            return True, "Image already in campaign"

    @staticmethod
    def detach_image(campaign_id, image_id, user_id):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM campaigns WHERE id = ? AND user_id = ?", (campaign_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return False
        cursor.execute("DELETE FROM campaign_images WHERE campaign_id = ? AND image_id = ?", (campaign_id, image_id))
        cursor.execute("UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (campaign_id,))
        conn.commit()
        conn.close()
        return True

class HistoryModel:
    @staticmethod
    def record(user_id, destination, prompt, enhanced_prompt, settings=None, status='completed'):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO generation_history (user_id, destination, prompt, enhanced_prompt, settings_json, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, destination, prompt, enhanced_prompt, json.dumps(settings or {}), status))
        conn.commit()
        hist_id = cursor.lastrowid
        conn.close()
        return hist_id

    @staticmethod
    def list_recent(user_id, limit=10):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM generation_history
            WHERE user_id = ?
            ORDER BY created_at DESC LIMIT ?
        """, (user_id, limit))
        rows = cursor.fetchall()
        conn.close()
        results = []
        for r in rows:
            d = dict(r)
            try:
                d['settings'] = json.loads(d.get('settings_json') or '{}')
            except Exception:
                d['settings'] = {}
            results.append(d)
        return results

class StatsModel:
    @staticmethod
    def get_user_stats(user_id):
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as total FROM generated_images WHERE user_id = ?", (user_id,))
        total_images = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as total FROM generated_images WHERE user_id = ? AND is_saved = 1", (user_id,))
        saved_images = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) as total FROM campaigns WHERE user_id = ?", (user_id,))
        total_campaigns = cursor.fetchone()['total']

        cursor.execute("""
            SELECT COUNT(DISTINCT destination) as total
            FROM generated_images WHERE user_id = ? AND destination != ''
        """, (user_id,))
        distinct_destinations = cursor.fetchone()['total']

        cursor.execute("""
            SELECT campaign_type, COUNT(*) as count
            FROM generated_images
            WHERE user_id = ?
            GROUP BY campaign_type
            ORDER BY count DESC LIMIT 5
        """, (user_id,))
        top_categories = [dict(row) for row in cursor.fetchall()]

        cursor.execute("""
            SELECT destination, COUNT(*) as count
            FROM generated_images
            WHERE user_id = ? AND destination != ''
            GROUP BY destination
            ORDER BY count DESC LIMIT 5
        """, (user_id,))
        top_destinations = [dict(row) for row in cursor.fetchall()]

        conn.close()
        return {
            "total_images": total_images,
            "saved_images": saved_images,
            "total_campaigns": total_campaigns,
            "distinct_destinations": distinct_destinations,
            "top_categories": top_categories,
            "top_destinations": top_destinations
        }

class SettingsModel:
    @staticmethod
    def get(key, default=''):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM system_settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()
        return row['value'] if row else default

    @staticmethod
    def set(key, value):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO system_settings (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        """, (key, str(value)))
        conn.commit()
        conn.close()
