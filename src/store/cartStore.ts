// src/store/cartStore.ts
import { create } from "zustand";
import axiosInstance from "@/api/axios"; // <-- use your shared axios instance

export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  size?: string;
  packs?: { pack: number; price: number }[];
  pack?: number | string;
  qty?: number;
}

export interface CartItem extends Product {
  id: string | number; // cart item id (server)
  drinkId: string | number; // product id
  pack: number | string;
  qty: number;
  packs?: { pack: number; price: number }[];
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
  switchToGuestCart: () => void;
}

function mapServerCartItem(item: any): CartItem {
  const drink = item?.Drink ?? {};
  const packsFromServer: { pack: number; price: number }[] =
    Array.isArray(drink?.packs) && drink.packs.length > 0
      ? drink.packs
      : Array.isArray(item?.packs) && item.packs.length > 0
      ? item.packs
      : [];

  const selectedPack =
    item.pack ?? drink.pack ?? (packsFromServer[0] && packsFromServer[0].pack) ?? 12;

  const price =
    (packsFromServer.length
      ? packsFromServer.find((p) => String(p.pack) === String(selectedPack))?.price
      : undefined) ?? item.price ?? drink.price ?? 0;

  return {
    id: item._id ?? item.id,
    drinkId: item.drinkId ?? drink._id ?? item.productId ?? null,
    name: drink.name ?? item.name ?? "Item",
    price: Number(price),
    image: drink.imageUrl ?? drink.image ?? item.image ?? "",
    qty: item.quantity ?? item.qty ?? 1,
    pack: selectedPack,
    packs: packsFromServer.length ? packsFromServer : undefined,
  } as CartItem;
}

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
    }
  },

  addToCart: async (productOrId, pack = 12, qty = 1) => {
    try {
      let drinkId: string | number | null = null;
      let quantity = qty;
      // prefer explicit pack argument, fall back to product.pack
      let packToSend = pack;

      let packsArray: { pack: number; price: number }[] | undefined;
      let name = "";
      let image = "";
      let providedPrice: number | undefined;

      if (typeof productOrId === "object" && productOrId !== null) {
        drinkId = productOrId.id ?? productOrId.drinkId ?? null;
        quantity = productOrId.qty ?? productOrId.quantity ?? quantity;
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
      const computedPrice = providedPrice ?? packObj?.price ?? 0;

      // ===== Check existing cart item for this drinkId =====
      const currentCart = get().cart;
      const existing = currentCart.find((it) => String(it.drinkId) === String(drinkId));

      // If there's an existing server-backed item (not local optimistic), prefer to update it:
      if (existing && !String(existing.id).startsWith("local-")) {
        // If pack differs, update pack on server (and locally via updatePack)
        if (String(existing.pack) !== String(packToSend)) {
          // this will optimistically update local store and call backend
          await get().updatePack(existing.id, packToSend);
        }

        // Merge quantities (add the quantity requested)
        const newQty = Number(existing.qty ?? 1) + Number(quantity);
        await get().updateQty(existing.id, Math.max(1, Math.floor(newQty)));

        // Re-fetch authoritative cart
        await get().fetchCart();
        return;
      }

      // If existing is a local-only/guest item (optimistic) update that local item instead of creating another
      if (existing && String(existing.id).startsWith("local-")) {
        try {
          // update local state
          set({
            cart: currentCart.map((it) =>
              String(it.id) === String(existing.id)
                ? { ...it, pack: packToSend, price: Number(computedPrice), qty: Number(existing.qty ?? 1) + Number(quantity) }
                : it
            ),
          });

          // persist to pendingCart
          const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
          const existingPending = raw ? (JSON.parse(raw) as any[]) : [];
          let updated = false;
          const updatedList = (Array.isArray(existingPending) ? existingPending : []).map((pi) => {
            if (String(pi.id ?? pi._id ?? pi.drinkId) === String(existing.id) || String(pi.drinkId) === String(drinkId)) {
              updated = true;
              return {
                ...pi,
                pack: packToSend,
                price: Number(computedPrice),
                qty: (pi.qty ?? 0) + Number(quantity),
              };
            }
            return pi;
          });
          if (!updated) {
            updatedList.unshift({
              id: existing.id,
              drinkId,
              name,
              image,
              pack: packToSend,
              price: Number(computedPrice),
              qty: quantity,
              packs: packsArray,
            });
          }
          localStorage.setItem("pendingCart", JSON.stringify(updatedList));
        } catch (e) {
          console.warn("Failed to update pendingCart for local item:", e);
        }
        return;
      }

      // ===== No existing item found -> create new cart entry =====

      // optimistic local add (gives immediate UI feedback)
      const optimisticId = `local-${Math.random().toString(36).slice(2, 9)}`;
      set({
        cart: [
          ...get().cart,
          {
            id: optimisticId,
            drinkId,
            name,
            image,
            price: Number(computedPrice),
            qty: quantity,
            pack: packToSend,
            packs: packsArray,
          },
        ],
      });

      // include price when calling backend so server can persist chosen pack/price
      await axiosInstance.post("/cart", {
        drinkId,
        quantity,
        pack: packToSend,
        price: Number(computedPrice),
      });

      // reconcile with server (fetch authoritative cart)
      await get().fetchCart();
    } catch (err) {
      console.error("addToCart failed:", err);
      // on error re-fetch server-side cart to stay consistent
      try {
        await get().fetchCart();
      } catch (_) {}
      throw err;
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await axiosInstance.delete(`/cart/${cartItemId}`);
    } catch (err) {
      console.warn("removeFromCart backend delete failed:", err);
    } finally {
      set({ cart: get().cart.filter((i) => String(i.id) !== String(cartItemId)) });
    }
  },

  updateQty: async (cartItemId, qty) => {
    if (qty <= 0) return;
    try {
      set({
        cart: get().cart.map((item) =>
          String(item.id) === String(cartItemId) ? { ...item, qty } : item
        ),
      });
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/quantity`, { quantity: qty });
      } catch {
        await axiosInstance.put(`/cart/${cartItemId}`, { quantity: qty });
      }
    } catch (err) {
      console.error("updateQty failed:", err);
      await get().fetchCart();
    }
  },

  updatePack: async (cartItemId, pack) => {
    try {
      // find current cart & item
      const cart = get().cart;
      const idx = cart.findIndex((it) => String(it.id) === String(cartItemId));
      const item = idx > -1 ? cart[idx] : undefined;

      // compute new price from packs[] if available
      const packObj = item?.packs?.find((p) => String(p.pack) === String(pack));
      const newPrice = packObj ? packObj.price : item?.price ?? 0;

      // optimistic UI update
      set({
        cart: cart.map((it) =>
          String(it.id) === String(cartItemId) ? { ...it, pack, price: newPrice } : it
        ),
      });

      // If this is a local/guest item (no server id) persist to pendingCart and return
      if (String(cartItemId).startsWith("local-") || !item) {
        try {
          const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
          const existing = raw ? (JSON.parse(raw) as any[]) : [];

          let updated = false;
          const updatedList = (Array.isArray(existing) ? existing : []).map((pi) => {
            // try matching by id or drinkId
            if (String(pi.id ?? pi._id ?? pi.drinkId) === String(cartItemId) || (item && String(pi.drinkId) === String(item.drinkId))) {
              updated = true;
              return { ...pi, pack, price: newPrice };
            }
            return pi;
          });

          // if not found in existing pending list, add it (use item props if available)
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

          localStorage.setItem("pendingCart", JSON.stringify(updatedList));
        } catch (e) {
          console.warn("Failed to persist pendingCart:", e);
        }
        return;
      }

      // Persist change to backend — include price so backend can validate/recalculate if needed
      try {
        await axiosInstance.patch(`/cart/${cartItemId}/pack`, { pack, price: newPrice });
      } catch (err) {
        // fallback to PUT if PATCH unsupported
        try {
          await axiosInstance.put(`/cart/${cartItemId}`, { pack, price: newPrice });
        } catch (err2) {
          console.warn("updatePack backend failed:", err2);
          // reconcile by re-fetching cart from server
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
    }
  },

  totalQty: () => get().cart.reduce((sum, item) => sum + (item.qty || 0), 0),

  totalPrice: () =>
    get().cart.reduce((sum, item) => sum + ((item.price ?? 0) * (item.qty ?? 0)), 0),

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
      const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
      if (!raw) return;
      const guestCart = JSON.parse(raw) as any[];
      if (!Array.isArray(guestCart) || guestCart.length === 0) {
        localStorage.removeItem("pendingCart");
        return;
      }

      await Promise.all(
        guestCart.map((item) => {
          const drinkId = item.drinkId ?? item.id ?? item.productId ?? null;
          const quantity = item.qty ?? item.quantity ?? 1;
          const pack = item.pack ?? (Array.isArray(item.packs) && item.packs[0]?.pack) ?? 12;
          if (!drinkId) return Promise.resolve(null);
          return axiosInstance.post("/cart", { drinkId, quantity, pack }).catch((e) => {
            console.warn("merge guest item failed for", drinkId, e);
          });
        })
      );

      localStorage.removeItem("pendingCart");
      await get().fetchCart();
    } catch (err) {
      console.error("mergeGuestIntoUser failed:", err);
    }
  },

  switchToGuestCart: () => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("pendingCart") : null;
      if (!raw) return set({ cart: [] });

      const guestCart = JSON.parse(raw) as any[];
      const items: CartItem[] = (Array.isArray(guestCart) ? guestCart : []).map((i) => ({
        id: i.id ?? i._id ?? `${i.drinkId ?? i.id ?? Math.random()}`,
        drinkId: i.drinkId ?? i.id ?? null,
        name: i.name ?? i.productName ?? "Item",
        price: Number(i.price ?? (i.packs && i.packs[0]?.price) ?? 0),
        image: i.image ?? "",
        qty: i.qty ?? i.quantity ?? 1,
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
