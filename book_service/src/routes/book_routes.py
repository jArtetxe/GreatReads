from flask import Blueprint, request, jsonify
from src.db.mongo import reading_collection
from src.models.Book import reading_schema

book_routes = Blueprint("book_routes", __name__)

@book_routes.route("/reading", methods=["POST"])
def add_book_to_list():
    data = request.json
    reading = reading_schema(data)
    reading_collection.insert_one(reading)
    return jsonify({"message": "Book added to reading list"}), 201


@book_routes.route("/reading/<user_id>", methods=["GET"])
def get_user_reading_list(user_id):
    books = reading_collection.find({"userId": user_id})
    result = []
    for book in books:
        book["_id"] = str(book["_id"])
        result.append(book)
    return jsonify(result)
