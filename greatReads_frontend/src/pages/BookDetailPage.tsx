import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import "./BookDetailPage.css";


interface BookDetail {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  status?: string; 
  progress?: number; 
}

function cleanDescription(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let text = doc.body.textContent || "";


  text = text.replace(/_{3,}/g, "\n\n"); 
  text = text.replace(/\n\s*\n/g, "\n\n");

  return text.trim();
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<string>(""); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProgressPopup, setShowProgressPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const STATUS_OPTIONS = ["Quiero leer", "Leyendo", "Leído"];

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        const bookData = res.data;

        let statusData = { status: "", progress: 0 };
        try {
          const statusRes = await api.get(`/books/${id}/status`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          statusData = statusRes.data;
        } catch (err) {

        }

        setBook({ ...bookData, progress: statusData.progress });
        setStatus(statusData.status || "");
        setCurrentPage(statusData.progress
          ? Math.round((statusData.progress / (bookData.pageCount || 1)) * (bookData.pageCount || 0))
          : 0
        );
      } catch (err) {
        setError("Error loading book details");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStatus = async (newStatus: string) => {
    if (!book) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para añadir libros a tu lista");
      navigate("/login");
      return;
    }
    
    try {
      await api.post("/books/reading", {
        bookId: book.id,
        status: newStatus,
        progress: book.progress || 0
      });
      setStatus(newStatus);
      setDropdownOpen(false);
      alert("Estado actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el estado");
    }
  };

  const handleUpdateProgress = async () => {
    if (!book || currentPage < 0 || currentPage > (book.pageCount || 0)) {
      alert("Número de página inválido");
      return;
    }

    const newProgress = Math.round((currentPage / (book.pageCount || 1)) * 100);

    try {
      await api.post("/books/reading", {
        bookId: book.id,
        status: status,
        progress: newProgress
      });
      setBook({ ...book, progress: newProgress });
      setShowProgressPopup(false);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar el progreso");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>Book not found</p>;

  const handleDeleteBook = async () => {
    if (!book) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para gestionar tu lista");
      navigate("/login");
      return;
    }

    try {
      await api.delete(`/books/reading/${book.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Libro eliminado de tu lista");
      setStatus("");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el libro");
    }
  };

  return (
    <div className="book-detail-page">
      <div className="book-detail-container">
        {book.thumbnail && (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="book-detail-image"
          />
        )}

        <div className="book-detail-info">
          <h1>{book.title}</h1>

          {book.authors.length > 0 && (
            <p className="authors">{book.authors.join(", ")}</p>
          )}

          {book.publishedDate && (
            <p><strong>Published:</strong> {book.publishedDate}</p>
          )}

          {book.pageCount && (
            <p><strong>Pages:</strong> {book.pageCount}</p>
          )}

          {book.categories && (
            <p><strong>Categories:</strong> {book.categories.join(", ")}</p>
          )}

          {book.description ? (
            <div className="description">
              {cleanDescription(book.description)
                .split("\n\n")
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          ) : (
            <p>No description available</p>
          )}

          <div className={`dropdown ${dropdownOpen ? "open" : ""}`} ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              {status || "Add to my reading list"} ▼
            </button>
            <div className="dropdown-menu">
              {STATUS_OPTIONS.map((s) => (
                <div
                  key={s}
                  className="dropdown-item"
                  onClick={() => handleSelectStatus(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {status === "Leyendo" && (
            <button
              className="update-progress-btn"
              onClick={() => setShowProgressPopup(true)}
            >
              Actualizar progreso ({book.progress || 0}%)
            </button>
          )}

          {status !== "" && (
            <button className="delete-book-btn" onClick={handleDeleteBook}>
              Eliminar de mi lista
            </button>
        )}

          {showProgressPopup && (
            <div className={`popup ${showProgressPopup ? "show" : ""}`}>
              <h3>Actualizar progreso</h3>
              <input
                type="number"
                value={currentPage}
                min={0}
                max={book.pageCount || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= (book.pageCount || 0)) {
                    setCurrentPage(val);
                  }
                }}
              />
              <button onClick={handleUpdateProgress}>Guardar progreso</button>
              <button onClick={() => setShowProgressPopup(false)}>Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}