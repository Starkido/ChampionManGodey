import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  pricing_tier_id: string;
  beneficiary_phone: string;
  quantity: number;
  tier?: {
    id: string;
    network: string;
    package_name: string;
    data_amount: string;
    price: number;
  };
}

interface UseCartResult {
  cartItems: CartItem[];
  loading: boolean;
  cartTotal: number;
  addToCart: (pricingTierId: string, beneficiaryPhone: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useCart = (userId: string | undefined): UseCartResult => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get or create cart
      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cartError && cartError.code === "PGRST116") {
        // Cart doesn't exist, create one
        const { data: newCart, error: createError } = await supabase
          .from("carts")
          .insert({ user_id: userId })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating cart:", createError);
          setLoading(false);
          return;
        }
        cart = newCart;
      } else if (cartError) {
        console.error("Error fetching cart:", cartError);
        setLoading(false);
        return;
      }

      if (!cart) {
        setLoading(false);
        return;
      }

      // Fetch cart items with pricing tier details
      const { data: items, error: itemsError } = await supabase
        .from("cart_items")
        .select(`
          id,
          pricing_tier_id,
          beneficiary_phone,
          quantity,
          pricing_tiers (
            id,
            network,
            package_name,
            data_amount,
            price
          )
        `)
        .eq("cart_id", cart.id);

      if (itemsError) {
        console.error("Error fetching cart items:", itemsError);
        setLoading(false);
        return;
      }

      const mappedItems: CartItem[] = (items || []).map((item) => ({
        id: item.id,
        pricing_tier_id: item.pricing_tier_id,
        beneficiary_phone: item.beneficiary_phone,
        quantity: item.quantity,
        tier: item.pricing_tiers as CartItem["tier"],
      }));

      setCartItems(mappedItems);
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.tier?.price || 0) * item.quantity,
    0
  );

  const addToCart = async (
    pricingTierId: string,
    beneficiaryPhone: string,
    quantity = 1
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      // Get cart ID
      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cartError || !cart) {
        toast.error("Failed to find cart");
        return false;
      }

      // Check if item already exists with same tier and phone
      const existing = cartItems.find(
        (item) =>
          item.pricing_tier_id === pricingTierId &&
          item.beneficiary_phone === beneficiaryPhone
      );

      if (existing) {
        // Update quantity
        const newQty = existing.quantity + quantity;
        return await updateQuantity(existing.id, newQty);
      }

      // Add new item
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart.id,
          pricing_tier_id: pricingTierId,
          beneficiary_phone: beneficiaryPhone,
          quantity,
        });

      if (insertError) {
        console.error("Add to cart error:", insertError);
        toast.error("Failed to add to cart");
        return false;
      }

      await fetchCart();
      return true;
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart");
      return false;
    }
  };

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        console.error("Remove from cart error:", error);
        toast.error("Failed to remove item");
        return false;
      }

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      return true;
    } catch (err) {
      console.error("Remove from cart error:", err);
      toast.error("Failed to remove item");
      return false;
    }
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<boolean> => {
    if (quantity < 1) {
      return await removeFromCart(itemId);
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) {
        console.error("Update quantity error:", error);
        toast.error("Failed to update quantity");
        return false;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
      return true;
    } catch (err) {
      console.error("Update quantity error:", err);
      toast.error("Failed to update quantity");
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cart) return true;

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id);

      if (error) {
        console.error("Clear cart error:", error);
        toast.error("Failed to clear cart");
        return false;
      }

      setCartItems([]);
      return true;
    } catch (err) {
      console.error("Clear cart error:", err);
      toast.error("Failed to clear cart");
      return false;
    }
  };

  return {
    cartItems,
    loading,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refetch: fetchCart,
  };
};
