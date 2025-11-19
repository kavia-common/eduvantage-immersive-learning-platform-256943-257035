import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { getCartItems, getWishlistItems } from "../services/supabaseDataService";

/**
 * PUBLIC_INTERFACE
 * useWishCartCounts
 * Returns { cartCount, wishlistCount } and refresh() using Supabase tables.
 * Falls back to 0 if unauthenticated or errors.
 */
export default function useWishCartCounts() {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  async function refresh() {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    try {
      const [cart, wish] = await Promise.all([getCartItems(user.id), getWishlistItems(user.id)]);
      setCartCount(cart?.length || 0);
      setWishlistCount(wish?.length || 0);
    } catch {
      // silent: counts not critical
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { cartCount, wishlistCount, refresh };
}
