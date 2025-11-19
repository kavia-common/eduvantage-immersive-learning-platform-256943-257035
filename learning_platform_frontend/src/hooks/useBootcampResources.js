import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";

// PUBLIC_INTERFACE
/**
 * useBootcampResources - List/add bootcamp resources (using Supabase if present)
 *
 * Resources: {
 *   id,
 *   owner_id,
 *   title,
 *   type: 'file' | 'link',
 *   url,              // link only
 *   storage_path,     // file only
 *   original_name,    // file only
 *   mime_type,        // file only
 *   size_bytes,       // file only
 *   created_at
 * }
 */
const BUCKET = "bootcamp-resources";
const METADATA_TABLE = "bootcamp_resources";
function supabaseConfigured() {
  return !!(supabase && process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_KEY);
}

export function useBootcampResources(currentUser) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  // PUBLIC_INTERFACE
  const listResources = useCallback(async () => {
    setLoading(true);
    try {
      if (supabaseConfigured()) {
        const { data, error } = await supabase.from(METADATA_TABLE).select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setResources(data || []);
        return data || [];
      } else {
        // Fallback: return localStorage data only
        const raw = localStorage.getItem("bootcamp_resources_fallback");
        const data = raw ? JSON.parse(raw) : [];
        setResources(data);
        return data;
      }
    } catch (e) {
      // eslint-disable-next-line
      console.error("Failed to fetch resources", e);
      setResources([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // PUBLIC_INTERFACE
  const addResource = useCallback(
    async (resourceData) => {
      // resourceData: {title, type, url?, file?}
      if (!currentUser) throw new Error("Must be logged in");
      const payload = {
        id: uuidv4(),
        owner_id: currentUser.id,
        title: resourceData.title,
        type: resourceData.type, // 'link' or 'file'
        created_at: new Date().toISOString(),
      };
      if (resourceData.type === "link") {
        payload.url = resourceData.url;
      }

      if (resourceData.type === "file" && resourceData.file) {
        // Upload file (if Supabase configured)
        if (supabaseConfigured()) {
          const ts = dayjs().format("YYYYMMDD-HHmmss");
          const path = `${currentUser.id}/${ts}-${encodeURIComponent(resourceData.file.name)}`;
          const { data, error } = await supabase.storage.from(BUCKET).upload(path, resourceData.file);
          if (error) throw error;
          payload.storage_path = data.path;
        } else {
          // Fallback: Store file in-memory (no upload). Real impl would not persist.
          // This fallback does not store file content for privacy and simplicity.
          payload.storage_path = `[LOCAL ONLY] ${resourceData.file.name}`;
        }
        payload.original_name = resourceData.file.name;
        payload.mime_type = resourceData.file.type;
        payload.size_bytes = resourceData.file.size;
      }

      // Insert metadata
      if (supabaseConfigured()) {
        const { error } = await supabase.from(METADATA_TABLE).insert([payload]);
        if (error) throw error;
        setResources((prev) => [payload, ...prev]);
      } else {
        // Fallback: save in localStorage
        const raw = localStorage.getItem("bootcamp_resources_fallback");
        const data = raw ? JSON.parse(raw) : [];
        data.unshift(payload);
        localStorage.setItem("bootcamp_resources_fallback", JSON.stringify(data));
        setResources(data);
      }
      return payload;
    },
    [currentUser]
  );

  return {
    resources,
    loading,
    listResources,
    addResource,
  };
}
export default useBootcampResources;
