from flask import Flask
from flask_cors import CORS
from src.models.Book import mongo
from src.routes.book_routes import book_bp
from src.middlewares.auth import token_required
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo.init_app(app)

app.register_blueprint(book_bp)

if __name__ == "__main__":
    app.run(port=3002, debug=True)
