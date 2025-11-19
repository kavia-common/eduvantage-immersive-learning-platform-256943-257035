import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuth } from "../auth/AuthProvider";
import useProfileRole from "../auth/useProfileRole";
import {
  createCourse,
  getInstructorCourses,
  updateCourse,
  supaErrors,
} from "../services/supabaseDataService";

/**
 * PUBLIC_INTERFACE
 * InstructorDashboard
 * - Shows role guard (instructor only)
 * - Course form: title, description, price, thumbnail, source_url
 * - Validates source_url to be youtube.com or udemy.com
 * - Lists instructor's courses with inline edit for price and description
 * - Responsive layout
 */
export default function InstructorDashboard() {
  const { user } = useAuth();
  const { role, setRole, loading: roleLoading, error: roleError } = useProfileRole();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [schemaIssue, setSchemaIssue] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: "",
    source_url: "",
  });
  const priceNumber = useMemo(() => {
    const n = Number(form.price);
    return Number.isNaN(n) ? 0 : n;
  }, [form.price]);

  function isAllowedSource(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      return host.includes("youtube.com") || host.includes("youtu.be") || host.includes("udemy.com");
    } catch {
      return false;
    }
  }

  async function loadCourses() {
    if (!user) return;
    try {
      const list = await getInstructorCourses(user.id);
      setCourses(list);
    } catch (e) {
      if (e?.setupRequired) setSchemaIssue(true);
      setError(e.message || String(e));
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return;
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (!isAllowedSource(form.source_url)) {
      setError("Source URL must be from youtube.com or udemy.com.");
      return;
    }
    try {
      await createCourse({
        instructor_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        price: priceNumber,
        thumbnail: form.thumbnail.trim(),
        source_url: form.source_url.trim(),
      });
      setForm({ title: "", description: "", price: "", thumbnail: "", source_url: "" });
      await loadCourses();
    } catch (e2) {
      if (e2?.setupRequired) setSchemaIssue(true);
      setError(e2.message || String(e2));
    }
  };

  const onUpdateInline = async (id, patch) => {
    setError("");
    try {
      await updateCourse(id, patch);
      await loadCourses();
    } catch (e) {
      if (e?.setupRequired) setSchemaIssue(true);
      setError(e.message || String(e));
    }
  };

  if (!user) {
    return (
      <div className="container">
        <Card>
          <h2>Please login</h2>
          <p>You must be logged in to access the instructor dashboard.</p>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="container">
        <Card>Loading your role...</Card>
      </div>
    );
  }

  if (roleError && roleError?.setupRequired) {
    return (
      <div className="container">
        <Card>
          <h2>Supabase setup required</h2>
          <p>
            We could not find the required tables (profiles, courses, etc.). Please run the database migrations or
            ensure you have created the schema as documented.
          </p>
        </Card>
      </div>
    );
  }

  const isInstructor = role === "instructor";

  return (
    <div className="container" style={{ display: "grid", gap: "1rem" }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Instructor Dashboard</h2>
          <span className="glass" style={{ padding: "0.25rem 0.5rem", borderRadius: 8, fontSize: 12 }}>
            Your role: {role || "unset"}
          </span>
          {!isInstructor && (
            <Button variant="secondary" size="sm" onClick={() => setRole("instructor")}>
              Switch to Instructor
            </Button>
          )}
        </div>
        <p className="mt-1" style={{ color: "var(--color-muted)" }}>
          Create and manage your courses. Students will discover them in the catalog.
        </p>
        {schemaIssue && (
          <div className="mt-2" style={{ color: "var(--color-error)" }}>
            Supabase tables missing or RLS permissions are not configured. Please complete setup.
          </div>
        )}
        {error && (
          <div className="mt-2" style={{ color: "var(--color-error)" }}>
            {error}
          </div>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Add Course</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: ".75rem" }}>
          <div>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              style={{ width: "100%", padding: ".6rem", borderRadius: 10, border: "1px solid var(--color-border)" }}
            />
          </div>
          <div>
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              required
              value={form.description}
              rows={3}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              style={{ width: "100%", padding: ".6rem", borderRadius: 10, border: "1px solid var(--color-border)" }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: ".75rem" }}>
            <div>
              <label htmlFor="price">Price</label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                style={{ width: "100%", padding: ".6rem", borderRadius: 10, border: "1px solid var(--color-border)" }}
              />
            </div>
            <div>
              <label htmlFor="thumbnail">Thumbnail URL</label>
              <input
                id="thumbnail"
                type="url"
                value={form.thumbnail}
                onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                style={{ width: "100%", padding: ".6rem", borderRadius: 10, border: "1px solid var(--color-border)" }}
              />
            </div>
            <div>
              <label htmlFor="source_url">Source URL (YouTube/Udemy)</label>
              <input
                id="source_url"
                required
                type="url"
                value={form.source_url}
                onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
                style={{ width: "100%", padding: ".6rem", borderRadius: 10, border: "1px solid var(--color-border)" }}
              />
            </div>
          </div>
          <div>
            <Button type="submit" variant="primary">Add Course</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Your Courses</h3>
        <div style={{ display: "grid", gap: ".75rem" }}>
          {(courses || []).map((c) => (
            <div key={c.id} className="glass" style={{ padding: ".75rem", borderRadius: 10 }}>
              <div style={{ display: "grid", gap: ".5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                  <strong>{c.title}</strong>
                  <span style={{ color: "var(--color-muted)" }}>Price: ${Number(c.price || 0).toFixed(2)}</span>
                  {c.thumbnail && (
                    <img
                      alt={`${c.title} thumbnail`}
                      src={c.thumbnail}
                      style={{ width: 56, height: 36, objectFit: "cover", borderRadius: 6 }}
                    />
                  )}
                </div>
                <div style={{ color: "var(--color-muted)" }}>{c.description}</div>
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  <InlineEdit
                    label="Update price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="New price"
                    onSave={(val) => onUpdateInline(c.id, { price: Number(val || 0) })}
                  />
                  <InlineEdit
                    label="Update description"
                    type="text"
                    placeholder="New description"
                    onSave={(val) => onUpdateInline(c.id, { description: String(val || "") })}
                  />
                  {c.source_url && (
                    <a href={c.source_url} target="_blank" rel="noreferrer" className="btn btn-ghost">
                      Open Source
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!courses?.length && <div style={{ color: "var(--color-muted)" }}>No courses yet.</div>}
        </div>
      </Card>
    </div>
  );
}

function InlineEdit({ label, onSave, type = "text", placeholder = "", ...rest }) {
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await onSave(val);
      setVal("");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
      <input
        type={type}
        value={val}
        placeholder={placeholder}
        onChange={(e) => setVal(e.target.value)}
        style={{ padding: ".45rem .6rem", borderRadius: 8, border: "1px solid var(--color-border)" }}
        {...rest}
      />
      <Button variant="secondary" size="sm" disabled={busy || !val.trim()} onClick={submit}>
        {busy ? "Saving..." : label}
      </Button>
    </div>
  );
}
