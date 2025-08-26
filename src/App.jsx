import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Navbar from "./components/NavBar";
import Home from "./pages/main/Home";
import Explore from "./pages/main/Explore";
import Profile from "./pages/main/Profile";
import Cart from "./pages/main/Cart";
import LoadingScreen from "./components/LoadingScreen";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, show auth routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<SignIn />} />
      </Routes>
    );
  }

  // If authenticated, show main app with navbar
  return (
    <CartProvider>
      <Navbar />
      <div className="pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          {/* Redirect auth routes to home if already authenticated */}
          <Route path="/signin" element={<Home />} />
          <Route path="/signup" element={<Home />} />
          {/* Catch all other routes */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}