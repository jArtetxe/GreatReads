import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="home-hero">
      <div className="hero-content">
        <h1>Find your next great read</h1>
        <p>Search millions of books and discover new stories</p>

        <form className="hero-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search books by title, author or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
