def reading_schema(data):
    return {
        "userId": data["userId"],
        "bookId": data["bookId"],
        "progress": data.get("progress", 0),
        "status": data.get("status", "pending")
    }
