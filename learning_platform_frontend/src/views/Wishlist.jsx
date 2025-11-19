import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../auth/AuthProvider";
import { addToCart, getWishlistItems, removeFromWishlist } from "../services/supabaseDataService";

/**
 * PUBLIC_INTERFACE
 * Wishlist
 * - Lists user's wishlist items
 * - Allows removing an item
 * - Allows adding to cart
 */
export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [schemaIssue, setSchemaIssue] = useState(false);

  async function load() {
    if (!user) return;
    setError("");
    try {
      const rows = await getWishlistItems(user.id);
      setItems(rows);
    } catch (e) {
      if (e?.setupRequired) setSchemaIssue(true);
      setError(e.message || String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onRemove = async (courseId) => {
    try {
      await removeFromWishlist(user.id, courseId);
      await load();
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  const onAddToCart = async (courseId) => {
    try {
      await addToCart(user.id, courseId, 1);
      await load();
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  if (!user) {
    return (
      <div className="container">
        <Card>
          <h2>Please login</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: "grid", gap: "1rem" }}>
      <Card>
        <h2 style={{ margin: 0 }}>Wishlist</h2>
        {schemaIssue && (
          <div className="mt-2" style={{ color: "var(--color-error)" }}>
            Supabase tables missing or RLS permissions not configured.
          </div>
        )}
        {error && <div className="mt-2" style={{ color: "var(--color-error)" }}>{error}</div>}
      </Card>
      <Card>
        <div style={{ display: "grid", gap: ".75rem" }}>
          {(items || []).map((it) => {
            const c = it.courses || {};
            return (
              <div key={it.id} className="glass" style={{ padding: ".75rem", borderRadius: 10 }}>
                <div style={{ display: "grid", gap: ".5rem" }}>
                  <strong>{c.title}</strong>
                  <div style={{ color: "var(--color-muted)" }}>{c.description}</div>
                  <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                    <Button variant="primary" size="sm" onClick={() => onAddToCart(c.id)}>Add to Cart</Button>
                    <Button variant="secondary" size="sm" onClick={() => onRemove(c.id)}>Remove</Button>
                  </div>
                </div>
              </div>
            );
          })}
          {!items?.length && <div style={{ color: "var(--color-muted)" }}>Your wishlist is empty.</div>}
        </div>
      </Card>
    </div>
  );
}
