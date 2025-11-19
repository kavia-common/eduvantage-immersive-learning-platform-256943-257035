import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../auth/AuthProvider";
import { checkoutAndEnroll, getCartItems, removeFromCart } from "../services/supabaseDataService";

/**
 * PUBLIC_INTERFACE
 * Cart
 * - Lists cart items with price summary
 * - Remove items
 * - Checkout to create enrollments and show success modal
 */
export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [schemaIssue, setSchemaIssue] = useState(false);

  const total = (items || []).reduce((sum, it) => sum + Number(it?.courses?.price || 0) * (it.quantity || 1), 0);

  async function load() {
    if (!user) return;
    setError("");
    try {
      const rows = await getCartItems(user.id);
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
      await removeFromCart(user.id, courseId);
      await load();
    } catch (e) {
      setError(e.message || String(e));
    }
  };

  const onCheckout = async () => {
    try {
      await checkoutAndEnroll(user.id);
      setSuccessOpen(true);
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
        <h2 style={{ margin: 0 }}>Your Cart</h2>
        {schemaIssue && (
          <div className="mt-2" style={{ color: "var(--color-error)" }}>
            Supabase tables missing or RLS permissions not configured.
          </div>
        )}
        {error && <div className="mt-2" style={{ color: "var(--color-error)" }}>{error}</div>}
      </Card>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr", alignItems: "start" }}>
        <Card>
          <div style={{ display: "grid", gap: ".75rem" }}>
            {(items || []).map((it) => {
              const c = it.courses || {};
              return (
                <div key={it.id} className="glass" style={{ padding: ".75rem", borderRadius: 10 }}>
                  <div style={{ display: "grid", gap: ".5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                      <strong>{c.title}</strong>
                      <span style={{ color: "var(--color-muted)" }}>
                        ${Number(c.price || 0).toFixed(2)} {it.quantity > 1 ? `x${it.quantity}` : ""}
                      </span>
                    </div>
                    <div style={{ color: "var(--color-muted)" }}>{c.description}</div>
                    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                      <Button variant="secondary" size="sm" onClick={() => onRemove(c.id)}>Remove</Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!items?.length && <div style={{ color: "var(--color-muted)" }}>Your cart is empty.</div>}
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <strong>Total</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
          <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="primary" disabled={!items.length} onClick={onCheckout}>Checkout</Button>
          </div>
        </Card>
      </div>

      {successOpen && (
        <SuccessModal onClose={() => setSuccessOpen(false)} />
      )}
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      <div className="surface glass" style={{ padding: "1rem", borderRadius: 12, minWidth: 280 }}>
        <h3>Enrollment successful</h3>
        <p className="mt-1" style={{ color: "var(--color-muted)" }}>
          You're enrolled in your selected courses. You can find them in your Dashboard and Classroom.
        </p>
        <div className="mt-2" style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
