import { supabase } from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * supabaseDataService
 *
 * This service encapsulates all Supabase interactions for:
 * - profiles (role: 'student' | 'instructor')
 * - courses
 * - wishlists/wishlist_items
 * - carts/cart_items
 * - enrollments
 *
 * It gracefully handles missing tables and returns structured errors with a "setupRequired" flag.
 * UI can use this to show a guided setup message when the schema is unavailable.
 *
 * ENV: requires REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY set at runtime.
 */
export const supaErrors = {
  setupRequired(message = "Supabase tables are missing or access is denied.") {
    const err = new Error(message);
    err.code = "SETUP_REQUIRED";
    err.setupRequired = true;
    return err;
  },
};

function isTableMissing(error) {
  if (!error) return false;
  const msg = String(error.message || error).toLowerCase();
  return (
    msg.includes("does not exist") ||
    msg.includes("relation") && msg.includes("does not exist") ||
    msg.includes("permission denied for table") ||
    msg.includes("violates row-level security policy") ||
    msg.includes("no function matches") ||
    msg.includes("schema") && msg.includes("does not exist")
  );
}

// PUBLIC_INTERFACE
export async function getOrCreateProfileRole(userId, role) {
  /**
   * Ensure a profile row exists for the userId; if role provided, upsert it.
   * Returns { id, role } on success.
   */
  if (!userId) throw new Error("userId required");
  try {
    if (role) {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({ id: userId, role }, { onConflict: "id" })
        .select("id, role")
        .single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function setProfileRole(userId, role) {
  /** Explicitly update role for profile */
  if (!userId) throw new Error("userId required");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, role }, { onConflict: "id" })
      .select("id, role")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function getProfile(userId) {
  if (!userId) throw new Error("userId required");
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

/* Courses */

// PUBLIC_INTERFACE
export async function createCourse(course) {
  /**
   * course: { instructor_id, title, description, price, thumbnail, source_url }
   * URL validation should be done at UI; service performs basic checks.
   */
  try {
    const payload = {
      instructor_id: course.instructor_id,
      title: String(course.title || "").trim(),
      description: String(course.description || "").trim(),
      price: Number(course.price ?? 0),
      thumbnail: course.thumbnail || "",
      source_url: course.source_url || "",
    };
    const { data, error } = await supabase
      .from("courses")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function updateCourse(courseId, patch) {
  try {
    const payload = { ...patch };
    if (payload.price != null) payload.price = Number(payload.price);
    const { data, error } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", courseId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function getInstructorCourses(instructorId) {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", instructorId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function getAllCourses() {
  try {
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

/* Wishlist */

// PUBLIC_INTERFACE
export async function getOrCreateWishlist(userId) {
  try {
    const { data: existing, error: err1 } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (err1) throw err1;
    if (existing) return existing;

    const { data, error } = await supabase
      .from("wishlists")
      .insert({ user_id: userId })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function addToWishlist(userId, courseId) {
  try {
    const wishlist = await getOrCreateWishlist(userId);
    const { data, error } = await supabase
      .from("wishlist_items")
      .upsert({ wishlist_id: wishlist.id, course_id: courseId }, { onConflict: "wishlist_id,course_id" })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function removeFromWishlist(userId, courseId) {
  try {
    const wishlist = await getOrCreateWishlist(userId);
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("wishlist_id", wishlist.id)
      .eq("course_id", courseId);
    if (error) throw error;
    return true;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function getWishlistItems(userId) {
  try {
    const wishlist = await getOrCreateWishlist(userId);
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("id, course_id, courses(*)")
      .eq("wishlist_id", wishlist.id);
    if (error) throw error;
    return data || [];
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

/* Cart */

// PUBLIC_INTERFACE
export async function getOrCreateCart(userId) {
  try {
    const { data: existing, error: err1 } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (err1) throw err1;
    if (existing) return existing;

    const { data, error } = await supabase.from("carts").insert({ user_id: userId }).select("*").single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function addToCart(userId, courseId, quantity = 1) {
  try {
    const cart = await getOrCreateCart(userId);
    // either insert or update quantity
    const { data: existing, error: err1 } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (err1) throw err1;

    if (existing) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: (existing.quantity || 1) + quantity })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cart.id, course_id: courseId, quantity: Math.max(1, Number(quantity || 1)) })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function removeFromCart(userId, courseId) {
  try {
    const cart = await getOrCreateCart(userId);
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)
      .eq("course_id", courseId);
    if (error) throw error;
    return true;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function getCartItems(userId) {
  try {
    const cart = await getOrCreateCart(userId);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, course_id, quantity, courses(*)")
      .eq("cart_id", cart.id);
    if (error) throw error;
    return data || [];
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function clearCart(userId) {
  try {
    const cart = await getOrCreateCart(userId);
    const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    if (error) throw error;
    return true;
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}

/* Checkout / Enrollments */

// PUBLIC_INTERFACE
export async function checkoutAndEnroll(userId) {
  /**
   * Creates enrollments for all cart items and clears the cart.
   * Returns list of enrollments.
   */
  try {
    const items = await getCartItems(userId);
    if (!items.length) return [];

    const rows = items.map((it) => ({ user_id: userId, course_id: it.course_id }));
    const { data, error } = await supabase.from("enrollments").insert(rows).select("*");
    if (error) throw error;

    await clearCart(userId);
    return data || [];
  } catch (error) {
    if (isTableMissing(error)) throw supaErrors.setupRequired();
    throw error;
  }
}
