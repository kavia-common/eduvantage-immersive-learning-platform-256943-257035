import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useBootcampResources } from "../../hooks/useBootcampResources";
import Loader from "../common/Loader";
import Button from "../common/Button";

// Allow both students and instructors to add resources
function canAddResource(role) {
  return role === "student" || role === "instructor";
}

const allowedGenericTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const allowedExcelTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv"
];

export default function BootcampResourceModal({ open, onClose, currentUser, userRole }) {
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState("link");
  const [url, setUrl] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [genericFile, setGenericFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { resources, loading, listResources, addResource } = useBootcampResources(currentUser);

  const fileInputExcel = useRef(null);
  const fileInputGeneric = useRef(null);

  React.useEffect(() => {
    if (open) listResources();
  }, [open, listResources]);

  function toast(msg, type = "info") {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), msg, type }
    ]);
  }

  function handleResourceTypeChange(e) {
    setResourceType(e.target.value);
    setExcelFile(null);
    setGenericFile(null);
    setUrl("");
    setTitle("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      if (!canAddResource(userRole)) {
        toast("You do not have permission to add resources.", "error");
        return;
      }
      if (title.trim().length < 3) {
        toast("Title must be at least 3 characters.", "error");
        return;
      }
      if (resourceType === "link") {
        // Link validation (https folder URL)
        if (!/^https:\/\/\S+$/.test(url)) {
          toast("URL must start with https:// and not be empty.", "error");
          return;
        }
        await addResource({title, type: "link", url});
        toast("Link added!", "success");
      } else if (resourceType === "excel") {
        if (!excelFile) {
          toast("Please select an Excel or CSV file.", "error");
          return;
        }
        if (!allowedExcelTypes.includes(excelFile.type) && !excelFile.name.endsWith(".csv") && !excelFile.name.endsWith(".xlsx")) {
          toast("Invalid file type for Excel/CSV.", "error");
          return;
        }
        if (excelFile.size > 15 * 1024 * 1024) {
          toast("Excel/CSV file must be under 15MB.", "error");
          return;
        }
        await addResource({title, type: "file", file: excelFile});
        toast("Excel/CSV uploaded!", "success");
      } else if (resourceType === "file") {
        if (!genericFile) {
          toast("Please select a file to upload.", "error");
          return;
        }
        if (!allowedGenericTypes.includes(genericFile.type)) {
          toast("Invalid file type.", "error");
          return;
        }
        if (genericFile.size > 25 * 1024 * 1024) {
          toast("File must be under 25MB.", "error");
          return;
        }
        await addResource({title, type: "file", file: genericFile});
        toast("File uploaded!", "success");
      }
      setTimeout(() => {
        // refresh list after success and reset form
        listResources();
        setTitle("");
        setUrl("");
        setExcelFile(null);
        setGenericFile(null);
      }, 1000);
    } catch (err) {
      toast(`Error: ${err.message || "Failed."}`, "error");
    } finally {
      setUploading(false);
    }
  }

  function handleExcelSelect(e) {
    if (e.target.files[0]) setExcelFile(e.target.files[0]);
  }
  function handleGenericSelect(e) {
    if (e.target.files[0]) setGenericFile(e.target.files[0]);
  }

  return open ? (
    <div
      className="bootcamp-modal"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 99,
        background: "rgba(16,23,48,0.26)", display: "flex", justifyContent: "center", alignItems: "center"
      }}
      onKeyDown={e => e.key === "Escape" && onClose()}
    >
      <div role="document" style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 36px 0 #11182722",
        minWidth: 340, maxWidth: 440, width: "92vw", padding: "2rem 1.5rem",
        position: "relative"
      }}>
        <button
          aria-label="Close modal"
          onClick={onClose}
          style={{position: "absolute", right: 12, top: 12, background: "none", border: "none", fontSize: 24, cursor: "pointer"}}
        >&times;</button>
        <h3 className="bootcamp-modal-title" style={{color: "#2563EB", marginBottom: 4, fontWeight: "700", fontSize: "1.3rem"}}>Add Bootcamp Resource</h3>
        <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "1rem"}} aria-label="add resource form">
          <label>
            <span className="label">Resource title</span>
            <input
              required
              minLength={3}
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{width: "100%", padding: "0.33rem", borderRadius: 5, border: "1px solid #ddd", fontSize: "1em", marginTop: 2}}
              aria-label="Resource title"
            />
          </label>
          <fieldset style={{border: "none", padding: 0}}>
            <legend className="label" style={{marginBottom: "0.3rem"}}>Resource Type</legend>
            <div style={{display: "flex", gap: 12}}>
              <label><input type="radio" name="type" value="link" checked={resourceType==="link"} onChange={handleResourceTypeChange} /> Folder Link</label>
              <label><input type="radio" name="type" value="excel" checked={resourceType==="excel"} onChange={handleResourceTypeChange}/> Excel/CSV</label>
              <label><input type="radio" name="type" value="file" checked={resourceType==="file"} onChange={handleResourceTypeChange}/> Document/Image</label>
            </div>
          </fieldset>
          {resourceType === "link" &&
          <label>
            <span className="label">Folder URL (https)</span>
            <input
              required
              type="url"
              inputMode="url"
              pattern="https://.*"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              aria-label="Folder URL"
              style={{width: "100%", padding: "0.33rem", borderRadius: 5, border: "1px solid #ddd", marginTop: 2}}
            />
          </label>}
          {resourceType === "excel" &&
          <label>
            <span className="label">Excel or CSV file (Max 15MB)</span>
            <input
              type="file"
              accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              ref={fileInputExcel}
              onChange={handleExcelSelect}
              aria-label="Excel/CSV upload"
              style={{width: "100%", marginTop: 6}}
            />
            {excelFile ? <div style={{fontSize: 13}}>Selected: {excelFile.name}</div> : null}
          </label>}
          {resourceType === "file" &&
          <label>
            <span className="label">Document/Image (.pdf, .docx, .jpg/png/webp/gif, Max 25MB)</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,image/png,image/jpeg,image/webp,image/gif"
              ref={fileInputGeneric}
              onChange={handleGenericSelect}
              aria-label="File upload"
              style={{width: "100%", marginTop: 6}}
            />
            {genericFile ? <div style={{fontSize: 13}}>Selected: {genericFile.name}</div> : null}
          </label>}
          <Button type="submit" style={{background: "#2563EB", color: "#fff"}} disabled={uploading}>{uploading ? <Loader size={18}/> : "Add Resource"}</Button>
        </form>
        {messages.slice(-3).map(({id, msg, type}) =>
          <div
            key={id}
            className={`bootcamp-toast bootcamp-toast--${type}`}
            aria-live="assertive"
            style={{
              marginTop: "1rem",
              fontSize: 14,
              color: type==="error" ? "#EF4444" : (type==="success" ? "#198754" : "#555"),
              background: type==="error" ? "#fee2e2" : (type==="success" ? "#fef9c3" : "#f1f5f9"),
              border: type==="error" ? "1px solid #EF4444" : "none",
              padding: "8px 12px",
              borderRadius: 6
            }}
          >{msg}</div>
        )}
        <div>
          <h4 style={{marginTop:24, marginBottom:10, color:"#2563EB", fontWeight:"500", fontSize:15}}>Your Bootcamp Resources</h4>
          {loading ? <Loader size={18}/> :
            <ul aria-label="bootcamp-resources-list" style={{fontSize: 15, padding:0, listStyle:"none", margin: 0, maxHeight: 210, overflow: "auto"}}>
            {resources.length === 0 && <li>No resources yet.</li>}
            {resources.map(r =>
              <li key={r.id} style={{
                marginBottom:8, background:"#f9fafb", borderRadius:6,padding:"10px 12px", boxShadow:"0 1px 4px #2028400a"
              }}>
                <span style={{color: "#2563EB", fontWeight: 600}}>{r.title}</span>{" "}
                <span style={{fontSize: 13, color: "#7b7b7b", marginLeft: 6}}>({r.type})</span>
                <br/>
                {r.type === "link" ?
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{color: "#F59E0B"}}>{r.url}</a>
                : (
                  r.storage_path ?
                    <span style={{fontSize: 13}}>{r.original_name} ({r.mime_type}, {(r.size_bytes/1024).toFixed(1)} KB)</span>
                  : null
                )}
              </li>
            )}
            </ul>}
        </div>
      </div>
    </div>
  ) : null;
}
BootcampResourceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  userRole: PropTypes.string
};
