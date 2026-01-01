from flask import Blueprint, request, jsonify
from src.controllers.bookController import add_book, get_books, search_books, get_book_by_id, get_book_status
from src.middlewares.auth import token_required

book_bp = Blueprint("books", __name__)

@book_bp.route("/api/books/reading", methods=["POST"])
@token_required
def add_book_route(user_data):
    return add_book(user_data, request.json)

@book_bp.route("/api/books/reading", methods=["GET"])
@token_required
def get_books_route(user_data):
    return get_books(user_data)

@book_bp.route("/api/books/search", methods=["GET"])
def search_books_route():
    query = request.args.get("q")
    if not query:
        return jsonify({"message": "Query parameter 'q' is required"}), 400
    books = search_books(query)
    return jsonify(books), 200

@book_bp.route("/api/books/<book_id>", methods=["GET"])
def get_book_detail(book_id):
    try:
        book = get_book_by_id(book_id)
        return jsonify(book), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@book_bp.route("/api/books/<book_id>/status", methods=["GET"])
@token_required
def get_book_status_route(user_data, book_id):
    status = get_book_status(user_data, book_id)
    return jsonify(status), 200
