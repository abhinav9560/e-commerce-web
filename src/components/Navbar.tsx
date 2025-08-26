import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHome, FaSearch, FaUser } from "react-icons/fa";

export default function Navbar() {
  const { pathname } = useLocation();
  const { signout } = useAuth();

  const tabs = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Explore", path: "/explore", icon: <FaSearch /> },
    { name: "Profile", path: "/profile", icon: <FaUser /> },
  ];

  return (
    <>
      {/* 🔹 Desktop (≥1024px) → Top Navbar with text + icons */}
      <nav className="hidden lg:flex justify-between items-center px-8 py-3 bg-white shadow sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">MyApp</h1>
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex items-center gap-2 pb-1 ${
                pathname === tab.path
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </Link>
          ))}
        </div>
        <button
          onClick={signout}
          className="text-red-500 font-medium hover:underline"
        >
          Sign Out
        </button>
      </nav>

      {/* 🔹 Tablet (≥768px & <1024px) → Top Navbar with icons only */}
      <nav className="hidden md:flex lg:hidden justify-center gap-12 px-6 py-3 bg-white shadow sticky top-0 z-50">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`text-2xl ${
              pathname === tab.path ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {tab.icon}
          </Link>
        ))}
      </nav>

      {/* 🔹 Mobile (<768px) → Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t flex justify-around items-center py-2 z-50">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`flex flex-col items-center text-sm ${
              pathname === tab.path ? "text-blue-600 font-semibold" : "text-gray-600"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
