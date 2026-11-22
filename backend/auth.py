import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, g
from config import Config
from models import UserModel

def generate_token(user_id, email):
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
        'iat': datetime.now(timezone.utc)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

def decode_token(token):
    try:
        return jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({'success': False, 'message': 'Missing Authorization header'}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'success': False, 'message': 'Invalid Authorization header format. Expected Bearer <token>'}), 401
        
        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Token has expired or is invalid. Please sign in again.'}), 401
        
        user = UserModel.get_by_id(payload['user_id'])
        if not user:
            return jsonify({'success': False, 'message': 'User associated with token no longer exists.'}), 401
        
        g.current_user = user
        return f(*args, **kwargs)
    return decorated
