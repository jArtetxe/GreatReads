import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./ReadingListPage.css";

interface Book {
  bookId: string;
  title: string;
  authors: string[];
  thumbnail?: string;
  progress?: number;
  status?: string;
}

const STATUS_OPTIONS = ["All", "Quiero leer", "Leyendo", "Leído"];

export default function ReadingListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get("/books/reading", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setBooks(res.data);
      } catch (err) {
        setError("Failed to fetch reading list");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks =
    filter === "All" ? books : books.filter((b) => b.status === filter);

  if (loading) return <p className="page-message">Loading...</p>;
  if (error) return <p className="page-message error">{error}</p>;
  if (books.length === 0) return <p className="page-message">No books in your list.</p>;
  

  return (
    <div className="reading-list-page">
      <h1>My Reading List</h1>

      <div className="filter-buttons">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            className={filter === status ? "active" : ""}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="book-grid">
        {filteredBooks.map((book) => (
          <div key={book.bookId} className="book-card" onClick={() => navigate(`/books/${book.bookId}`)} style={{ cursor: "pointer" }}>
            {book.thumbnail && (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="book-thumb"
              />
            )}
            <h3>{book.title}</h3>
            {book.authors && <p className="authors">{book.authors.join(", ")}</p>}

            {book.status === "Leyendo" && (
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${book.progress || 0}%` }}
                >
                  {book.progress || 0}%
                </div>
              </div>
            )}

            {book.status !== "Leyendo" && <p className="status">{book.status}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
