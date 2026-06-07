// src/store/cartStore.ts
import { create } from "zustand";
import axiosInstance from "@/api/axios"; // shared axios instance (may include auth interceptor)
import { toast } from "sonner";

export interface Pack { pack: number; price: number }

export interface Product {
  id?: string | number;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  size?: string;
  packs?: Pack[];
  pack?: number | string;
  qty?: number;
}

export interface CartItem extends Product {
  id: string | number; // cart item id (server id or local-...)
  drinkId: string | number | null; // product id
  pack: number | string;
  qty: number;
}

interface CartState {
  cart: CartItem[];
  fetchCart: () => Promise<void>;
  addToCart: (
    productOrId: string | number | Product | any,
    pack?: number | string,
    qty?: number
  ) => Promise<void>;
  removeFromCart: (cartItemId: string | number) => Promise<void>;
  updateQty: (cartItemId: string | number, qty: number) => Promise<void>;
  updatePack: (cartItemId: string | number, pack: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalQty: () => number;
  totalPrice: () => number;
  setCart: (items: CartItem[]) => void;
  loadCartForUser: (userId: string) => Promise<void>;
  mergeGuestIntoUser: (userId: string) => Promise<void>;
  distinctItems: () => number;
  switchToGuestCart: () => void;
}

/* ---------------------- Helpers ---------------------- */

function mapServerCartItem(item: Record<string, unknown>): CartItem {
  // item may be shaped in multiple ways depending on backend
  const product = item?.drinkId && typeof item.drinkId === "object" ? item.drinkId : item?.Drink || {};

  const packsFromServer: Pack[] = Array.isArray(product?.packs) && product.packs.length > 0
    ? product.packs
    : Array.isArray(item?.packs) && item.packs.length > 0
    ? item.packs
    : [];

  const selectedPack = item.pack ?? product?.selectedPack ?? product?.pack ?? (packsFromServer[0] && packsFromServer[0].pack) ?? 12;

  const price = Number(
    (packsFromServer.length
      ? packsFromServer.find((p) => String(p.pack) === String(selectedPack))?.price
      : undefined) ?? item.price ?? product?.price ?? 0
  );

  return {
    id: item._id ?? item.id ?? `local-${Math.random().toString(36).slice(2, 9)}`,
    drinkId: item.drinkId?._id ?? item.drinkId ?? product?._id ?? item.productId ?? null,
    name: (product?.name ?? item.name ?? "Item") as string,
    price,
    image: product?.imageUrl ?? product?.image ?? item.image ?? "",
    qty: Number(item.quantity ?? item.qty ?? 1),
    pack: selectedPack,
    packs: packsFromServer.length ? packsFromServer : undefined,
  } as CartItem;
}

function readPendingCart(): Record<string, unknown>[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("pendingCart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("readPendingCart failed:", e);
    return [];
  }
}


function writePendingCart(list: Record<string, unknown>[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("pendingCart", JSON.stringify(list));
  } catch (e) {
    console.warn("writePendingCart failed:", e);
  }
}

function addOrMergePendingItem(item: Record<string, unknown>) {
  try {
    const existing = readPendingCart();
    let updated = false;
    
    const out = (existing || []).map((pi) => {
      // merge by drinkId + pack
      if (String(pi.drinkId ?? pi.id) === String(item.drinkId ?? item.id) && String(pi.pack) === String(item.pack)) {
        updated = true;
        return {
          ...pi,
          qty: Number(pi.qty ?? pi.quantity ?? 0) + Number(item.qty ?? item.quantity ?? 1),
          price: item.price ?? pi.price,
        };
      }
      return pi;
    });
    if (!updated) out.unshift(item);
    writePendingCart(out);
  } catch (e) {
    console.warn("addOrMergePendingItem failed:", e);
  }
}

/* ---------------------- Store ---------------------- */
export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  setCart: (items) => set({ cart: items }),

  fetchCart: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      const serverItems = res.data?.cartItems ?? res.data?.cart ?? res.data?.items ?? [];
      const items: CartItem[] = (Array.isArray(serverItems) ? serverItems : []).map(mapServerCartItem);
      set({ cart: items });
    } catch (err) {
      console.error("fetchCart failed:", err);
      // keep local cart as-is (guest mode)
    }
  },

  addToCart: async (productOrId, pack = 12, qty = 1) => {
    try {
      let drinkId: string | number | null = null;
      let quantity = Number(qty || 1);
      let packToSend: number | string = pack;

      let packsArray: Pack[] | undefined;
      let name = "";
      let image = "";
      let providedPrice: number | undefined;

      if (typeof productOrId === "object" && productOrId !== null) {
        drinkId = productOrId.id ?? productOrId.drinkId ?? null;
        quantity = Number(productOrId.qty ?? productOrId.quantity ?? quantity);
        packToSend = productOrId.pack ?? packToSend;
        packsArray = productOrId.packs;
        name = productOrId.name ?? "";
        image = productOrId.image ?? "";
        providedPrice = typeof productOrId.price === "number" ? productOrId.price : undefined;
      } else {
        drinkId = productOrId;
      }

      if (!drinkId) throw new Error("Invalid product id");

      // compute price from packs array if possible, else use providedPrice or 0
      const packObj = packsArray?.find((p) => String(p.pack) === String(packToSend));
      const computedPrice = Number(providedPrice ?? packObj?.price ?? 0);

      // ===== Look for existing item by drinkId+pack =====
      const currentCart = get().cart;
      const existing = currentCart.find(
        (it) => String(it.drinkId) === String(drinkId) && String(it.pack) === String(packToSend)
      );

      // If there's an existing server-backed item (server id, not local), update it
      if (existing && !String(existing.id).startsWith("local-")) {
        // merge quantities by updating qty on server
        const newQty = Number(existing.qty ?? 1) + Number(quantity);
        await get().updateQty(existing.id, Math.max(1, Math.floor(newQty)));
        // ensure packs/prices are correct on server (no-op if same pack)
        if (String(existing.pack) !== String(packToSend)) {
          await get().updatePack(existing.id, packToSend);
        }
        // reconcile locally instead of full refetch to avoid race conditions
        set({
          cart: get().cart.map((it) =>
            String(it.id) === String(existing.id)
              ? { ...it, qty: Math.max(1, Math.floor(newQty)), pack: packToSend, price: Number(computedPrice) }
              : it
          ),
        });
        return;
      }

      // If existing is a local-only item, update it locally and persist to pendingCart
      if (existing && String(existing.id).startsWith("local-")) {
        set({
          cart: currentCart.map((it) =>
            String(it.id) === String(existing.id)
              ? { ...it, pack: packToSend, price: Number(computedPrice), qty: (it.qty ?? 0) + Number(quantity) }
              : it
          ),
        });

        addOrMergePendingItem({
          id: existing.id,
          drinkId,
          name,
          image,
          pack: packToSend,
          price: Number(computedPrice),
          qty: Number(quantity) + (existing.qty ?? 0),
          packs: packsArray,
        });

        return;
      }

      // ===== No matching item found -> create new entry =====

      // optimistic local add (gives immediate UI feedback)
      const optimisticId = `local-${Math.random().toString(36).slice(2, 9)}`;
      const newLocalItem: CartItem = {
        id: optimisticId,
        drinkId,
        name,
        image,
        price: Number(computedPrice),
        qty: quantity,
        pack: packToSend,
        packs: packsArray,
      };

      set({ cart: [...get().cart, newLocalItem] });

      // Try hitting backend — if it fails (unauthenticated or network) fall back to pendingCart
      try {
        const res = await axiosInstance.post("/cart", {
          drinkId,
          quantity,
          pack: packToSend,
          price: Number(computedPrice),
        });

        // Replace optimistic local item with server-backed item (avoid full refetch race)
        const serverItem = res.data?.cartItem;
        const mapped = serverItem ? mapServerCartItem(serverItem as Record<string, unknown>) : null;
        if (mapped) {
          set({
            cart: get().cart.map((it) =>
              String(it.id) === optimisticId ? mapped : it
            ),
          });
        } else {
          await get().fetchCart();
        }
      } catch (err: unknown) {
        console.warn("Backend addToCart failed, storing to pendingCart:", err instanceof Error ? err.message : err);
        // persist to pending list so we can merge when user logs in
        addOrMergePendingItem({
          id: optimisticId,
          drinkId,
          name,
          image,
          pack: packToSend,
          price: Number(computedPrice),
          qty: quantity,
          packs: packsArray,
        });
      }
        } catch (err: unknown) {
        console.error("addToCart failed:", err);
        throw err;
        }

  },

  removeFromCart: async (cartItemId) => {
    try {
      // attempt backend delete (if server id)
      if (!String(cartItemId).startsWith("local-")) {
        await axiosInstance.delete(`/cart/${cartItemId}`);
      } else {
        // remove from pending cart if local
        const pending = readPendingCart().filter((pi) => String(pi.id ?? pi._id ?? pi.drinkId) !== String(cartItemId));
        writePendingCart(pending);
      }
    } catch (err) {
      console.warn("removeFromCart backend delete failed:", err);
    } finally {
      set({ cart: get().cart.filter((i) => String(i.id) !== String(cartItemId)) });
    }
  },

  updateQty: async (cartItemId, qty) => {
    if (qty <= 0) return;
    try {
      // optimistic update
      set({ cart: get().cart.map((item) => (String(item.id) === String(cartItemId) ? { ...item, qty } : item)) });

      // if local -> persist to pending
      if (String(cartItemId).startsWith("local-")) {
        const raw = readPendingCart();
        const updated = (raw || []).map((pi) =>
          (String(pi.id ?? pi._id ?? pi.drinkId) === String(cartItemId) || String(pi.drinkId) === String(cartItemId))
            ? { ...pi, qty }
            : pi
        );
        writePendingCart(updated);
        return;
      }

      // server update
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/quantity`, { quantity: qty });
      } catch {
        const item = get().cart.find((i) => String(i.id) === String(cartItemId));
        await axiosInstance.put(`/cart/${cartItemId}`, {
          quantity: qty,
          pack: item?.pack,
          price: item?.price,
        });
      }
    } catch (err) {
      console.error("updateQty failed:", err);
      await get().fetchCart();
    }
  },

  updatePack: async (cartItemId, pack) => {
    try {
      // find current item
      const cart = get().cart;
      const idx = cart.findIndex((it) => String(it.id) === String(cartItemId));
      const item = idx > -1 ? cart[idx] : undefined;

      // compute new price from packs[] if available
      const packObj = item?.packs?.find((p) => String(p.pack) === String(pack));
      const newPrice = packObj ? Number(packObj.price) : Number(item?.price ?? 0);

      // optimistic UI update
      set({ cart: cart.map((it) => (String(it.id) === String(cartItemId) ? { ...it, pack, price: newPrice } : it)) });

      // local-only -> persist to pending
      if (String(cartItemId).startsWith("local-") || !item) {
        try {
          const existing = readPendingCart();
          let updated = false;
          const updatedList = (existing || []).map((pi) => {
            if (String(pi.id ?? pi._id ?? pi.drinkId) === String(cartItemId) || (item && String(pi.drinkId) === String(item.drinkId))) {
              updated = true;
              return { ...pi, pack, price: newPrice };
            }
            return pi;
          });
          if (!updated && item) {
            updatedList.unshift({
              id: item.id,
              drinkId: item.drinkId,
              name: item.name,
              image: item.image,
              pack,
              price: newPrice,
              qty: item.qty,
              packs: item.packs,
            });
          }
          writePendingCart(updatedList);
        } catch (e) {
          console.warn("Failed to persist pendingCart:", e);
        }
        return;
      }

      // Persist change to backend — include price so backend can validate/recalculate if needed
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/pack`, { pack, price: newPrice });
      } catch (err) {
        try {
          await axiosInstance.put(`/cart/${cartItemId}`, { pack, price: newPrice });
        } catch (err2) {
          console.warn("updatePack backend failed:", err2);
          await get().fetchCart();
        }
      }
    } catch (err) {
      console.error("updatePack failed (store):", err);
      await get().fetchCart();
    }
  },

  clearCart: async () => {
    try {
      await axiosInstance.delete("/cart");
    } catch (err) {
      console.warn("clearCart backend call failed:", err);
    } finally {
      set({ cart: [] });
      writePendingCart([]);
    }
  },

  totalQty: () => get().cart.reduce((sum, item) => sum + (item.qty || 0), 0),
  distinctItems: () => get().cart.length,

  totalPrice: () => get().cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.qty ?? 0)), 0),

  loadCartForUser: async (userId: string) => {
    try {
      const res = await axiosInstance.get(`/cart?userId=${userId}`);
      const serverItems = res.data?.cartItems ?? res.data?.cart ?? res.data?.items ?? [];
      const items: CartItem[] = (Array.isArray(serverItems) ? serverItems : []).map(mapServerCartItem);
      set({ cart: items });
    } catch (err) {
      console.error("loadCartForUser failed:", err);
      await get().fetchCart();
    }
  },

  mergeGuestIntoUser: async (userId: string) => {
    try {
      const guestCart = readPendingCart();
      if (!Array.isArray(guestCart) || guestCart.length === 0) {
        writePendingCart([]);
        return;
      }

      const results = await Promise.allSettled(
        guestCart.map((item) => {
          const drinkId = item.drinkId ?? item.id ?? item.productId ?? null;
          const quantity = Number(item.qty ?? item.quantity ?? 1);
          const pack = item.pack ?? (Array.isArray(item.packs) && item.packs[0]?.pack) ?? 12;
          if (!drinkId) return Promise.resolve(null);
          return axiosInstance.post("/cart", { drinkId, quantity, pack });
        })
      );

      const failedCount = results.filter((r) => r.status === "rejected").length;
      const succeededCount = results.filter((r) => r.status === "fulfilled" && r.value !== null).length;

      if (failedCount > 0) {
        toast.warning(`${succeededCount} item(s) merged, ${failedCount} failed — they may be unavailable`);
      }

      writePendingCart([]);
      await get().fetchCart();
    } catch (err) {
      console.error("mergeGuestIntoUser failed:", err);
    }
  },

  switchToGuestCart: async () => {
    try {
      // Clear server cart for the logged-out user to avoid duplicates on re-login
      try {
        await axiosInstance.delete("/cart");
      } catch {
        // not authenticated or no server cart — fine
      }

      const guestCart = readPendingCart();
      if (!guestCart || guestCart.length === 0) {
        set({ cart: [] });
        return;
      }

      const items: CartItem[] = (Array.isArray(guestCart) ? guestCart : []).map((i) => ({
        id: i.id ?? i._id ?? `${i.drinkId ?? i.id ?? Math.random()}`,
        drinkId: i.drinkId ?? i.id ?? null,
        name: i.name ?? i.productName ?? "Item",
        price: Number(i.price ?? (i.packs && i.packs[0]?.price) ?? 0),
        image: i.image ?? "",
        qty: Number(i.qty ?? i.quantity ?? 1),
        pack: i.pack ?? (i.packs && i.packs[0]?.pack) ?? 12,
        packs: i.packs ?? undefined,
      }));
      set({ cart: items });
    } catch (err) {
      console.error("switchToGuestCart failed:", err);
      set({ cart: [] });
    }
  },
}));
