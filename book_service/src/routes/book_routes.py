from flask import Blueprint, request, jsonify
from src.models.book import mongo
from src.middlewares.auth import token_required

book_bp = Blueprint("books", __name__)

@book_bp.route("/api/books/reading", methods=["POST"])
@token_required
def add_book(user_data):
    data = request.json

    if not data.get("bookId"):
        return jsonify({"message": "bookId is required"}), 400

    book = {
        "userId": user_data["id"], 
        "bookId": data["bookId"],
        "progress": data.get("progress", 0),
        "status": data.get("status", "reading"),
    }

    try:
        mongo.db.reading_list.insert_one(book)
    except Exception as e:
        return jsonify({"message": f"Error inserting book: {str(e)}"}), 500

    return jsonify({"message": "Book added"}), 201

@book_bp.route("/api/books/reading", methods=["GET"])
@token_required
def get_books(user_data):
    try:
        books = list(mongo.db.reading_list.find(
            {"userId": user_data["id"]},
            {"_id": 0}
        ))
    except Exception as e:
        return jsonify({"message": f"Error fetching books: {str(e)}"}), 500

    return jsonify(books), 200
