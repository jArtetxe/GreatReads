from flask import jsonify
from src.models.Book import mongo
import requests

def get_best_image(image_links: dict):
    for key in ["extraLarge", "large", "medium", "small", "thumbnail", "smallThumbnail"]:
        url = image_links.get(key)
        if url:
            if url.startswith("http:"):
                url = "https:" + url[5:]
            return url
    return None


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
        existing = mongo.db.reading_list.find_one({
            "userId": user_data["id"],
            "bookId": data["bookId"]
        })

        if existing:
            mongo.db.reading_list.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": book["status"], "progress": book["progress"]}}
            )
            return jsonify({"message": "Book updated"}), 200

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

                thumbnail = get_best_image(data.get("imageLinks", {}))

                enhanced_books.append({
                    "bookId": book["bookId"],
                    "title": data.get("title", ""),
                    "authors": data.get("authors", []),
                    "description": data.get("description", ""),
                    "publisher": data.get("publisher", ""),
                    "publishedDate": data.get("publishedDate", ""),
                    "pageCount": data.get("pageCount", 0),
                    "thumbnail": thumbnail,
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
    params = {"q": query, "maxResults": 20}
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        books = []

        for item in data.get("items", []):
            volume = item.get("volumeInfo", {})
            thumbnail = get_best_image(volume.get("imageLinks", {}))

            books.append({
                "bookId": item["id"],
                "title": volume.get("title", "N/A"),
                "authors": volume.get("authors", []),
                "publisher": volume.get("publisher", "N/A"),
                "publishedDate": volume.get("publishedDate", "N/A"),
                "description": volume.get("description", ""),
                "pageCount": volume.get("pageCount", 0),
                "thumbnail": thumbnail
            })
        return books
    except Exception as e:
        return {"message": f"Error fetching books: {str(e)}"}

def get_book_by_id(book_id):
    GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"
    try:
        response = requests.get(f"{GOOGLE_BOOKS_API_URL}/{book_id}")
        response.raise_for_status()

        data = response.json()
        volume = data.get("volumeInfo", {})

        thumbnail = get_best_image(volume.get("imageLinks", {}))

        return {
            "id": data.get("id"),
            "title": volume.get("title"),
            "authors": volume.get("authors", []),
            "description": volume.get("description", ""),
            "thumbnail": thumbnail,
            "publishedDate": volume.get("publishedDate"),
            "pageCount": volume.get("pageCount"),
            "categories": volume.get("categories", []),
            "language": volume.get("language"),
            "publisher": volume.get("publisher")
        }
    except Exception as e:
        return {"error": str(e)}

def get_book_status(user_data, book_id):
    try:
        book = mongo.db.reading_list.find_one(
            {"userId": user_data["id"], "bookId": book_id},
            {"_id": 0, "status": 1, "progress": 1}
        )
        if not book:
            return {"status": "", "progress": 0}
        return {
            "status": book.get("status", ""),
            "progress": book.get("progress", 0)
        }
    except Exception as e:
        return {"status": "", "progress": 0, "error": str(e)}
