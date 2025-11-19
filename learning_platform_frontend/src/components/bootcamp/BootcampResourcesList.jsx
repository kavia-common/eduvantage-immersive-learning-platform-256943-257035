import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FiRefreshCw, FiExternalLink, FiTrash2, FiLink, FiFile } from "react-icons/fi";
import Loader from "../common/Loader";
import Button from "../common/Button";
import useBootcampResources from "../../hooks/useBootcampResources";
import { createClient } from "@supabase/supabase-js";

// SUPABASE init for getting file URLs
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * PUBLIC_INTERFACE
 * BootcampResourcesList displays the current user's bootcamp resources.
 * Features: type icon, title, created_at, file size, and actions: open, refresh, optional delete.
 * Handles loading/empty/error states and conforms to "Ocean Professional" theme.
 *
 * Props:
 *   onResourceOpened (function): Optional callback after a resource is opened.
 *   afterResourceChange (function): Optional: called after change (delete/refresh).
 */
function BootcampResourcesList({ onResourceOpened, afterResourceChange }) {
  const {
    resources,
    loading,
    error,
    listResources,
    deleteResource, // May be null if not implemented in the hook/RLS
  } = useBootcampResources();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ensures the resource list is current after add or modal closes elsewhere
  useEffect(() => {
    // Listen for localStorage event when BootcampResourceModal triggers a change
    function handleStorage(e) {
      if (e.key === "bootcamp_resource_added" && e.newValue === "1") {
        listResources();
        window.localStorage.removeItem("bootcamp_resource_added");
        if (afterResourceChange) afterResourceChange();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // eslint-disable-next-line
  }, []);

  // Manually refresh resources
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await listResources();
      if (afterResourceChange) afterResourceChange();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Open link or get signed URL for files in Supabase Storage and open
  const handleOpen = async (resource) => {
    if (resource.type === "link") {
      window.open(resource.url, "_blank", "noopener noreferrer");
      if (onResourceOpened) onResourceOpened(resource);
    } else if (resource.type === "file" && resource.storage_bucket && resource.storage_path) {
      // Use Supabase storage to get signed URL for download
      try {
        const { data, error } = await supabase.storage
          .from(resource.storage_bucket)
          .createSignedUrl(resource.storage_path, 60); // 60 sec expiry
        if (error || !data?.signedUrl) throw error || new Error("No signed URL");
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
        if (onResourceOpened) onResourceOpened(resource);
      } catch (e) {
        // eslint-disable-next-line
        alert("Failed to retrieve file: " + (e?.message || e));
      }
    }
  };

  // Delete resource handler
  const handleDelete = async (resourceId) => {
    if (!deleteResource) return;
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    await deleteResource(resourceId);
    await listResources();
    if (afterResourceChange) afterResourceChange();
  };

  return (
    <section aria-labelledby="bootcamp-resources-heading" className="bootcamp-resources-container oceanpro-surface">
      <div className="bootcamp-resources-header">
        <h2 id="bootcamp-resources-heading" className="oceanpro-title">
          Bootcamp Resources
        </h2>
        <Button
          aria-label="Refresh resources list"
          onClick={handleRefresh}
          tight
          loading={isRefreshing}
          iconLeft={<FiRefreshCw />}
          className="oceanpro-actionbtn"
        >
          Refresh
        </Button>
      </div>
      <div className="bootcamp-resources-body" role="region" aria-live="polite">
        {loading && (
          <div className="bootcamp-resources-state"><Loader text="Loading resources..." /></div>
        )}
        {error && (
          <div className="bootcamp-resources-state error" role="alert">
            <span>Could not load resources.</span>
            <Button onClick={handleRefresh} tight>
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && (!resources || resources.length === 0) && (
          <div className="bootcamp-resources-state empty">
            <div className="oceanpro-empty-icon" aria-hidden="true">
              <FiFile size={28} color="#a5b4fc" />
            </div>
            <span>No resources yet.<br />Add files or links using the "Add Resource" button.</span>
          </div>
        )}
        {!loading && !error && resources && resources.length > 0 && (
          <ul className="bootcamp-resources-list" tabIndex="0">
            {resources.map((res) => (
              <li key={res.id}
                  className={`oceanpro-resourceitm${res.type === "link" ? " resource-link" : " resource-file"}`}
                  tabIndex="0"
                  aria-label={`Resource: ${res.title}`}>
                <span className="bootcamp-resources-typeicon" aria-label={res.type === "link" ? "Link" : "File"}>
                  {res.type === "link" ? (
                    <FiLink color="#2563EB" size={20} />
                  ) : (
                    <FiFile color="#2563EB" size={20} />
                  )}
                </span>
                <span className="bootcamp-resources-title" title={res.title}>{res.title}</span>
                <span className="bootcamp-resources-meta">
                  <span className="created-at">
                    {res.created_at ? new Date(res.created_at).toLocaleDateString() : null}
                  </span>
                  {res.type === "file" && res.size != null && (
                    <span className="size">{formatBytes(res.size)}</span>
                  )}
                </span>
                <span className="bootcamp-resources-actions">
                  <Button
                    tight
                    iconOnly
                    aria-label={`Open ${res.title}`}
                    title="Open"
                    onClick={() => handleOpen(res)}
                    variant="ghost"
                    className="oceanpro-actionbtn"
                  >
                    <FiExternalLink />
                  </Button>
                  {!!deleteResource && (
                    <Button
                      tight
                      iconOnly
                      aria-label={`Delete ${res.title}`}
                      title="Delete"
                      onClick={() => handleDelete(res.id)}
                      variant="ghost"
                      className="oceanpro-actionbtn delete"
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Inline styles for Ocean Professional look - adjust/tighten with global .css as well */}
      <style jsx>{`
        .bootcamp-resources-container {
          margin-top: 2rem;
          border-radius: 1rem;
          background: #fff;
          box-shadow: 0 2px 24px #2563EB10, 0 1.5px 2px #F59E0B20;
          padding: 0 0 1rem 0;
        }
        .bootcamp-resources-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 1.6rem 0.2rem 1.6rem;
        }
        .oceanpro-title {
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #2563EB;
          margin-bottom: 0;
        }
        .bootcamp-resources-list {
          list-style: none;
          margin: 0;
          padding: 0.5rem 0.5rem 0.5rem 0;
        }
        .oceanpro-resourceitm {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f9fafb;
          border-bottom: 1px solid #f1f5f9;
          border-left: 4px solid #F59E0B10;
          padding: 0.8rem 1.4rem 0.8rem 1.4rem;
          border-radius: 0.7rem;
          transition: box-shadow 0.18s;
          margin-bottom: 0.6rem;
        }
        .oceanpro-resourceitm:focus {
          outline: 2px solid #2563EB44;
          box-shadow: 0 0 0 3px #2563EB22;
        }
        .bootcamp-resources-typeicon {
          flex-shrink: 0;
          margin-right: 2px;
          margin-left: -6px;
        }
        .bootcamp-resources-title {
          flex: 2 1 220px;
          font-size: 1rem;
          color: #174883;
          max-width: 16em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bootcamp-resources-meta {
          flex: 1 1 120px;
          display: flex;
          gap: 0.8em;
          color: #64748b;
          font-size: 0.95em;
        }
        .bootcamp-resources-actions {
          display: inline-flex;
          gap: 0.4rem;
          margin-left: auto;
        }
        .oceanpro-actionbtn {
          color: #2563EB;
          background: transparent;
          border: none;
          min-width: 32px;
          min-height: 32px;
        }
        .oceanpro-actionbtn.delete {
          color: #EF4444 !important;
        }
        .bootcamp-resources-state {
          text-align: center;
          padding: 2.2rem 2rem;
          color: #64748b;
        }
        .bootcamp-resources-state .oceanpro-empty-icon {
          margin-bottom: 0.7rem;
        }
        .bootcamp-resources-state.error {
          color: #EF4444;
        }
        .bootcamp-resources-state.empty {
          color: #64748b;
        }
      `}</style>
    </section>
  );
}

BootcampResourcesList.propTypes = {
  onResourceOpened: PropTypes.func,
  afterResourceChange: PropTypes.func,
};

// Format file sizes in human-readable form
function formatBytes(bytes) {
  if (typeof bytes !== "number" || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024, unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
}

export default BootcampResourcesList;
