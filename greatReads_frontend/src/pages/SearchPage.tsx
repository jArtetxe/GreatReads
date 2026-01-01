import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import "./SearchPage.css";

interface Book {
  bookId: string;
  title: string;
  thumbnail?: string;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchBooks = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/books/search?q=${query}`);
        setBooks(res.data);
      } catch (err) {
        console.error("Error fetching books", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <input
          defaultValue={query}
          onChange={handleSearch}
          className="search-input"
          placeholder="Search books..."
        />
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <Link
              key={book.bookId}
              to={`/books/${book.bookId}`}
              className="book-card"
            >
              {book.thumbnail ? (
                <img src={book.thumbnail} alt={book.title} />
              ) : (
                <div className="no-image">No image</div>
              )}
              <p>{book.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
