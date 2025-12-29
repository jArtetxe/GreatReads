from flask import jsonify
from src.models.book import mongo
import requests

def add_book(user_data, data):
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

def get_books(user_data):
    try:
        books = list(mongo.db.reading_list.find(
            {"userId": user_data["id"]},
            {"_id": 0}
        ))

        enhanced_books = []
        for book in books:
            try:
                response = requests.get(f"https://www.googleapis.com/books/v1/volumes/{book['bookId']}")
                response.raise_for_status()
                data = response.json().get("volumeInfo", {})
                enhanced_books.append({
                    "bookId": book["bookId"],
                    "title": data.get("title", ""),
                    "authors": data.get("authors", []),
                    "description": data.get("description", ""),
                    "publisher": data.get("publisher", ""),
                    "publishedDate": data.get("publishedDate", ""),
                    "pageCount": data.get("pageCount", 0),
                    "thumbnail": data.get("imageLinks", {}).get("thumbnail", ""),
                    "progress": book.get("progress", 0),
                    "status": book.get("status", "reading")
                })
            except:
                enhanced_books.append(book)

    except Exception as e:
        return jsonify({"message": f"Error fetching books: {str(e)}"}), 500

    return jsonify(enhanced_books), 200

def search_books(query):
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {"q": query, "maxResults": 5}
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        books = []
        for item in data.get("items", []):
            books.append({
                "bookId": item["id"],
                "title": item["volumeInfo"].get("title", "N/A"),
                "authors": item["volumeInfo"].get("authors", []),
                "publisher": item["volumeInfo"].get("publisher", "N/A"),
                "publishedDate": item["volumeInfo"].get("publishedDate", "N/A"),
                "description": item["volumeInfo"].get("description", ""),
                "pageCount": item["volumeInfo"].get("pageCount", 0),
                "thumbnail": item["volumeInfo"].get("imageLinks", {}).get("thumbnail", "")
            })
        return books
    except Exception as e:
        return {"message": f"Error fetching books: {str(e)}"}
