import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./Header.css";

export default function Header() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <span className="logo" onClick={() => navigate("/")}>
            GreatReads
          </span>
        </div>

        <nav className="header-right">
          {token ? (
            <>
              <Link to="/reading-list" className="nav-link">
                My Books
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
