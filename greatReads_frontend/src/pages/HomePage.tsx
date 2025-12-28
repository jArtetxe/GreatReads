import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function HomePage() {
  const { token, logout } = useAuth();

  return (
    <div>
      <h1>GreatReads</h1>

      {token ? (
        <>
          <p>You are logged in</p>
          <Link to="/reading-list">My Reading List</Link>
          <br />
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <br />
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  );
}
