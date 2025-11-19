import React, { useEffect, useState } from "react";
import "./topnav.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import Button from "../common/Button";
import useWishCartCounts from "../../hooks/useWishCartCounts";

/**
 * Top navigation with page title, theme toggle, and sign-out when logged in.
 */

// PUBLIC_INTERFACE
export default function TopNav({ title = "Home", onMenu }) {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");
  const { user, signOut } = useAuth();
  const { cartCount, wishlistCount } = useWishCartCounts();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const onSignOut = async () => {
    try {
      await signOut();
    } catch {
      // keep silent in UI
    }
  };

  return (
    <header className="lp-topnav topnav-blur gradient-bg">
      <button className="menu-btn" onClick={onMenu} aria-label="Toggle navigation">☰</button>
      <div className="title">{title}</div>
      <div className="actions">
        <Link to="/courses" className="nav-link" aria-label="Courses" style={{ marginRight: ".5rem" }}>
          Courses
        </Link>
        {user && (
          <>
            <Link to="/wishlist" className="nav-link" aria-label="Wishlist" style={{ marginRight: ".5rem" }}>
              ❤️ Wishlist {wishlistCount ? `(${wishlistCount})` : ""}
            </Link>
            <Link to="/cart" className="nav-link" aria-label="Cart" style={{ marginRight: ".5rem" }}>
              🛒 Cart {cartCount ? `(${cartCount})` : ""}
            </Link>
          </>
        )}
        <Button variant="purple" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </Button>
        {user && (
          <Button variant="primary" onClick={onSignOut} aria-label="Sign out" className="" style={{ marginLeft: ".5rem" }}>
            Sign out
          </Button>
        )}
      </div>
    </header>
  );
}
