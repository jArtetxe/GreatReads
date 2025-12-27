# book_routes.py
from flask import Blueprint, request
from src.controllers.bookController import add_book, get_books 
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
