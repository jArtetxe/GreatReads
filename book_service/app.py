from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from src.routes.book_routes import book_routes

from flask_swagger_ui import get_swaggerui_blueprint
import yaml

load_dotenv()

app = Flask(__name__)
CORS(app)

SWAGGER_URL = "/docs"
API_URL = "/swagger.yaml"

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={"app_name": "GreatReads Book Service"}
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

@app.route("/swagger.yaml")
def swagger_yaml():
    with open("api-doc.yaml", "r") as f:
        return f.read(), 200, {"Content-Type": "text/yaml"}

app.register_blueprint(book_routes, url_prefix="/api/books")

if __name__ == "__main__":
    app.run(port=3002, debug=True)
