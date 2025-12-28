import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const Header = () => {
  const { token, logout } = useAuth();

  return (
    <header style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Home</Link>

        {token ? (
          <>
            <Link to="/books">My Books</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
