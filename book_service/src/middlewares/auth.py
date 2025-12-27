import jwt
import os
from flask import request, jsonify
from functools import wraps
from jwt import ExpiredSignatureError, InvalidTokenError

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            try:
                token = request.headers["Authorization"].split(" ")[1]
            except IndexError:
                return jsonify({"message": "Token format invalid"}), 401

        if not token:
            return jsonify({"message": "Token missing"}), 401

        try:
            data = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        except ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(user_data=data, *args, **kwargs)

    return decorated
