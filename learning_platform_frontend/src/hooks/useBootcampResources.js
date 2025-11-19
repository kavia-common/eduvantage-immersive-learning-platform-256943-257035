import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * PUBLIC_INTERFACE
 * useBootcampResources hook provides resource creation and listing via Supabase 'bootcamp_resources' table.
 */
const RESOURCE_FIELDS = [
  'id',
  'title',
  'type',
  'url',
  'storage_path',
  'original_name',
  'mime_type',
  'size_bytes',
  'owner_id',
  'created_at'
];

/**
 * Validates that a given string value is a HTTPS URL.
 * @param {string} url
 * @returns {boolean}
 */
function isValidHttpsUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

/**
 * Returns a normalized resource object from Supabase row.
 */
function mapResource(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    url: row.url,
    storage_path: row.storage_path,
    original_name: row.original_name,
    mime_type: row.mime_type,
    size_bytes: row.size_bytes,
    created_at: row.created_at,
    owner_id: row.owner_id,
  };
}

/**
 * Main custom hook for bootcamp resource management.
 * @returns {object} { resources, loading, error, addLink, addFile, listResources }
 */
export default function useBootcampResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new link resource
  const addLink = useCallback(
    async ({ url, title, metadata }) => {
      setLoading(true);
      setError(null);

      // Input validation
      if (!url || !isValidHttpsUrl(url)) {
        setError('Please enter a valid HTTPS URL.');
        setLoading(false);
        return null;
      }
      if (!title || typeof title !== 'string' || !title.trim()) {
        setError('Title is required.');
        setLoading(false);
        return null;
      }

      // Get current user
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.id) {
        setError('Unable to determine current user. Please login.');
        setLoading(false);
        return null;
      }

      const owner_id = userData.user.id;
      let insertObj = {
        type: 'link',
        url,
        title: title.trim(),
        owner_id,
      };

      // Optionally include metadata if allowed schema-wise
      if (metadata && typeof metadata === 'object') {
        insertObj = { ...insertObj, ...metadata };
      }

      const { data, error: insertErr } = await supabase
        .from('bootcamp_resources')
        .insert([insertObj])
        .select(RESOURCE_FIELDS.join(','));

      if (insertErr || !data || !Array.isArray(data) || !data[0]) {
        setError('Failed to add link resource. ' + (insertErr?.message || ''));
        setLoading(false);
        return null;
      }

      setResources(prev => [mapResource(data[0]), ...prev]);
      setLoading(false);
      return mapResource(data[0]);
    },
    []
  );

  // Add a new file resource - expects upload to have completed to storage
  const addFile = useCallback(
    async ({
      storagePath,
      originalName,
      mimeType,
      sizeBytes,
      title,
    }) => {
      setLoading(true);
      setError(null);

      // Input validation
      if (
        !storagePath ||
        typeof storagePath !== 'string' ||
        !originalName ||
        !mimeType ||
        !sizeBytes ||
        !title
      ) {
        setError('Missing required file fields.');
        setLoading(false);
        return null;
      }

      // Get current user
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.id) {
        setError('Unable to determine current user. Please login.');
        setLoading(false);
        return null;
      }

      const owner_id = userData.user.id;
      const insertObj = {
        type: 'file',
        storage_path: storagePath,
        original_name: originalName,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        title: title.trim(),
        owner_id,
      };

      const { data, error: insertErr } = await supabase
        .from('bootcamp_resources')
        .insert([insertObj])
        .select(RESOURCE_FIELDS.join(','));

      if (insertErr || !data || !Array.isArray(data) || !data[0]) {
        setError(
          'Failed to add file resource. ' + (insertErr?.message || '')
        );
        setLoading(false);
        return null;
      }

      setResources(prev => [mapResource(data[0]), ...prev]);
      setLoading(false);
      return mapResource(data[0]);
    },
    []
  );

  /**
   * List resources filtered by ownerScope ('me' or 'allPublic'). Supports optional search and pagination.
   * @param {string} ownerScope 'me' | 'allPublic'
   * @param {object} options { search, limit, offset }
   * @returns {Promise<{resources, count}>}
   */
  const listResources = useCallback(
    async (
      ownerScope = 'me',
      options = { search: '', limit: 25, offset: 0 }
    ) => {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.id) {
        setError('Unable to determine current user. Please login.');
        setLoading(false);
        return { resources: [], count: 0 };
      }
      const currentUserId = userData.user.id;

      let query = supabase
        .from('bootcamp_resources')
        .select(RESOURCE_FIELDS.join(','), { count: 'exact' })
        .order('created_at', { ascending: false });

      if (ownerScope === 'me') {
        query = query.eq('owner_id', currentUserId);
      } else if (ownerScope === 'allPublic') {
        // placeholder for public listing, real filtering based on e.g. is_public=true can be added
        // query = query.eq('is_public', true);
      }
      if (options?.search) {
        const term = options.search.trim();
        if (term.length > 1) {
          // Search by title & original_name & url only for security/clarity
          query = query.or(
            `title.ilike.%${term}%,original_name.ilike.%${term}%,url.ilike.%${term}%`
          );
        }
      }

      if (Number.isInteger(options?.limit) && Number.isInteger(options?.offset)) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      }

      const { data, error: qErr, count } = await query;
      if (qErr) {
        setError(
          'Failed to load resources. Please try again later. ' +
            (qErr.message || '')
        );
        setLoading(false);
        return { resources: [], count: 0 };
      }
      setResources(Array.isArray(data) ? data.map(mapResource) : []);
      setLoading(false);
      return { resources: Array.isArray(data) ? data.map(mapResource) : [], count };
    },
    []
  );

  return {
    resources,
    loading,
    error,
    addLink,
    addFile,
    listResources,
    setResources,
    setLoading,
    setError,
  };
}
