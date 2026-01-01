import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReadingListPage from "./pages/ReadingListPage";
import PrivateRoute from "./routes/PrivateRoute";
import Header from "./components/Header";
import SearchPage from "./pages/SearchPage";
import BookDetailPage from "./pages/BookDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
      <Route path="/books/:id" element={<BookDetailPage />} />

        <Route
          path="/reading-list"
          element={
            <PrivateRoute>
              <ReadingListPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
