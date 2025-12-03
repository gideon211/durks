// src/admin/pages/Products.tsx
import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/Authcontext";
import {
  Plus,
  Grid3x3,
  List,
  Edit2,
  Trash2,
  ImageIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string | number;
  name: string;
  category: string;
  size?: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  packs?: { pack: number; price: number }[];
}

const categories = [
  { id: "all", name: "ALL PRODUCTS", slug: "all" },
  {id: "bundles", name:"BUNDLES", slug: "bundle"},
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice" },
  { id: "cleanse", name: "CLEANSE JUICES", slug: "cleanse" },
  { id: "shots", name: "WELLNESS SHOTS", slug: "shots" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies" },
  { id: "flavors", name: "FLAVORS", slug: "flavor" },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits" },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs" },
  { id: "events", name: "EVENTS", slug: "events" },
  
];

const API_BASE = "https://updated-duks-backend-1-0.onrender.com/api";
const DRINKS_BASE = `${API_BASE}/drinks`;

export default function Products() {
  // include logout + login to persist refreshed token
  const { user, login, tryRefreshToken, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // form.packs uses strings so inputs can be empty/deleted
  const [form, setForm] = useState({
    name: "",
    category: "",
    size: "",
    description: "",
    status: "Active",
    packs: [{ pack: "", price: "" }] as { pack: string; price: string }[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // track selected pack per product (for grid dropdown)
  const [selectedPackByProduct, setSelectedPackByProduct] = useState<Record<string, number | "">>({});

  // Helper: safe read of stored user object (local copy)
  const getStoredUser = () =>
    user ??
    (() => {
      try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

  // Get token; if expired try tryRefreshToken (keeps backwards compatibility)
  const getToken = async (): Promise<string | null> => {
    const u = getStoredUser();
    if (!u) return null;
    if (!u.token) {
      // try context refresh if available
      try {
        const refreshed = await tryRefreshToken();
        return refreshed?.token ?? null;
      } catch {
        return null;
      }
    }

    // try decode exp
    try {
      const parts = u.token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload?.exp;
        const now = Math.floor(Date.now() / 1000);
        if (exp && exp < now) {
          // expired -> try context refresh
          try {
            const refreshed = await tryRefreshToken();
            return refreshed?.token ?? null;
          } catch {
            return null;
          }
        }
      }
    } catch {
      // decode failed -> attempt refresh
      try {
        const refreshed = await tryRefreshToken();
        return refreshed?.token ?? null;
      } catch {
        return null;
      }
    }

    return u.token;
  };

  // Build headers merging simple shapes
  const mergeHeaders = (base?: RequestInit["headers"]) => {
    const headers: Record<string, string> = {};
    if (!base) return headers;
    if (base instanceof Headers) {
      base.forEach((v, k) => (headers[k] = v));
      return headers;
    }
    if (Array.isArray(base)) {
      (base as Array<[string, string]>).forEach(([k, v]) => (headers[k] = v));
      return headers;
    }
    Object.assign(headers, base as Record<string, string>);
    return headers;
  };

  // IMPORTANT: direct refresh call used here so we control request shape and persist token immediately
  const callRefreshEndpoint = async () => {
    const u = getStoredUser();
    if (!u?.refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // many backends expect { refreshToken } in body — change if your backend expects something else
        body: JSON.stringify({ refreshToken: u.refreshToken }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      console.log("callRefreshEndpoint response:", res.status, data);

      if (!res.ok) {
        return null;
      }

      // Determine where token lives in response
      // Common shapes: { token }, { accessToken }, { data: { token } }
      let newToken: string | undefined;
      if (data?.token) newToken = data.token;
      else if (data?.accessToken) newToken = data.accessToken;
      else if (data?.data?.token) newToken = data.data.token;
      else if (typeof data === "string") {
        // backend might return plain token string (rare)
        newToken = data;
      }

      if (!newToken) {
        console.warn("callRefreshEndpoint: refresh returned 200 but no token found", data);
        return null;
      }

      // persist new token in context (and localStorage) using login()
      try {
        // Preserve other user fields and update token
        const updatedUser = { ...(u as any), token: newToken };
        login(updatedUser);
        return updatedUser;
      } catch (e) {
        console.error("callRefreshEndpoint: failed to persist refreshed token", e);
        return null;
      }
    } catch (err) {
      console.error("callRefreshEndpoint error:", err);
      return null;
    }
  };

  // fetch wrapper that injects Authorization header and retries once on 401/403
  const fetchWithAuth = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    // Get token (may trigger tryRefreshToken)
    let token = await getToken();
    if (!token) throw new Error("No active token. Please login.");

    // Build headers for initial request
    const headers = mergeHeaders(init.headers);
    headers["Authorization"] = `Bearer ${token}`;

    const initToSend: RequestInit = { ...init, headers };

    let res = await fetch(input, initToSend);

    // If initial unauthorized, attempt refresh via dedicated call then retry once
    if (res.status === 401 || res.status === 403) {
      // attempt to read server message for debugging
      try {
        const t = await res.text();
        console.warn("fetchWithAuth: initial request unauthorized. response body:", t);
      } catch (e) {
        console.warn("fetchWithAuth: couldn't read initial 401 body", e);
      }

      // Call our refresh endpoint directly and persist token
      const refreshedUser = await callRefreshEndpoint();
      if (!refreshedUser || !refreshedUser.token) {
        // refresh failed -> force logout and throw
        try { logout(); } catch {}
        throw new Error("Session expired. Please login again.");
      }

      // Retry original request with refreshed token
      const retryHeaders = mergeHeaders(init.headers);
      retryHeaders["Authorization"] = `Bearer ${refreshedUser.token}`;
      const retryInit: RequestInit = { ...init, headers: retryHeaders };

      const retryRes = await fetch(input, retryInit);

      if (retryRes.status === 401 || retryRes.status === 403) {
        // read body to show server message
        let body = "Unauthorized";
        try {
          const t = await retryRes.text();
          try { body = JSON.parse(t).message ?? t; } catch { body = t; }
        } catch {}
        try { logout(); } catch {}
        throw new Error(body || "Session expired. Please login again.");
      }

      return retryRes;
    }

    return res;
  };

  // helper to normalize backend drink -> Product
  const normalizeDrink = (p: any): Product => ({
    id: p._id ?? p.id,
    name: p.name ?? "",
    category: p.category ?? "",
    size: p.size ?? "",
    description: p.description ?? "",
    status: p.status ?? "Active",
    imageUrl: p.imageUrl ?? p.image ?? "",
    packs: Array.isArray(p.packs) ? p.packs.map((x: any) => ({ pack: x.pack, price: x.price })) : [],
  });

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    const fetchInitial = async () => {
      try {
        setLoading(true);

        const res = await fetchWithAuth(`${DRINKS_BASE}/`);
        if (!mounted) return;
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const payload = await res.json();

        // payload might be: { success, count, drinks: [...] }
        const rawItems = Array.isArray(payload) ? payload : payload?.drinks ?? [];

        const normalized: Product[] = rawItems.map((item: any) => normalizeDrink(item));
        setProducts(normalized);
      } catch (err) {
        console.error("fetchInitial error:", err);
        toast.error("Could not load products. Check backend connection or login.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    (async () => {
      try {
        await fetchInitial();
      } catch (e) {
        // handled above
      }
    })();

    return () => {
      mounted = false;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${DRINKS_BASE}/`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const payload = await res.json();
      const rawItems = Array.isArray(payload) ? payload : payload?.drinks ?? [];
      const normalized: Product[] = rawItems.map((item: any) => normalizeDrink(item));
      setProducts(normalized);
    } catch (err) {
      console.error("fetchProducts error:", err);
      toast.error("Could not load products. Check backend connection or login.");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", category: "", size: "", description: "", status: "Active", packs: [{ pack: "", price: "" }] });
    clearSelectedFile();
    setOpenModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      size: product.size ?? "",
      description: product.description ?? "",
      status: product.status ?? "Active",
      // store as strings so inputs can be empty/edited
      packs: product.packs && product.packs.length > 0 ? product.packs.map(p => ({ pack: String(p.pack), price: String(p.price) })) : [{ pack: "", price: "" }],
    });
    setPreviewUrl(product.imageUrl ?? null);
    clearSelectedFile();
    setOpenModal(true);
  };

  const clearSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim() || !form.category || form.packs.length === 0) {
      toast.error("Please fill name, category, and at least one pack.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("category", form.category);
      fd.append("description", form.description || "");
      fd.append("status", form.status);
      fd.append("size", form.size || ""); 
      if (selectedFile) fd.append("image", selectedFile);

      // Filter out packs where pack (size) is empty
      const packsToSend = form.packs
        .filter(p => p.pack !== "")
        .map(p => ({ pack: Number(p.pack), price: parseFloat(p.price) }));

      fd.append("packs", JSON.stringify(packsToSend));

      let res: Response;
      if (editingId) {
        res = await fetchWithAuth(`${DRINKS_BASE}/${editingId}`, {
          method: "PUT",
          body: fd,
        });
      } else {
        res = await fetchWithAuth(`${DRINKS_BASE}/add`, {
          method: "POST",
          body: fd,
        });
      }

      if (!res.ok) {
        let text = await res.text();
        try {
          const parsed = JSON.parse(text);
          text = parsed?.message ?? text;
        } catch {}
        throw new Error(text || `Save failed: ${res.status}`);
      }

      toast.success("Product saved successfully");
      setOpenModal(false);
      await fetchProducts();
    } catch (err) {
      console.error("handleSaveProduct error:", err);
      toast.error((err as Error).message || "Failed to save product. Check backend and token.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const ok = window.confirm("Delete this product? This action cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetchWithAuth(`${DRINKS_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error("handleDelete error:", err);
      toast.error("Failed to delete product. Check backend.");
    }
  };

  // Handler to update selected pack for a product in the grid
  const onSelectPackForProduct = (productId: string | number, packValue: string) => {
    setSelectedPackByProduct(prev => ({ ...prev, [`${productId}`]: packValue === "" ? "" : Number(packValue) }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <h1 className="text-2xl sm:text-3xl font-semibold">Products</h1>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            <Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-muted" : ""}>
              <Grid3x3 className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-muted" : ""}>
              <List className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button onClick={openNew} className="hidden sm:flex items-center p-6">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
            <Button onClick={openNew} size="icon" className="sm:hidden" aria-label="Add product">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && <div className="p-6 bg-muted/30 rounded text-center w-full">Loading products...</div>}
        {!loading && products.length === 0 && <div className="p-6 bg-muted/30 rounded text-center w-full">No products found. Click Add Product to seed your catalog.</div>}

        {viewMode === "grid" && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
            {products.map(product => {
              const key = `${product.id}`;
              const selectedPack = selectedPackByProduct[key] ?? "";
              const selectedPackObj = product.packs?.find(p => p.pack === selectedPack) ?? null;

              return (
                <Card key={product.id} className="hover:border-primary/40 border-2 transition-all duration-150 relative flex flex-col">
                  <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative w-full">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name ?? "Product image"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-grow text-center">
                      <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                        <Badge variant={product.status === "Active" ? "default" : "destructive"} className="text-xs">
                          {product.status ?? "Active"}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                      {product.size && <p className="text-xs text-muted-foreground truncate">Size: {product.size}</p>}

                      {/* PACKS DROPDOWN (no default price shown) */}
                      {product.packs && product.packs.length > 0 && (
                        <div className="mt-2 w-full">
                          <label htmlFor={`pack-select-${key}`} className="sr-only">Select pack</label>
                          <select
                            id={`pack-select-${key}`}
                            value={selectedPack === "" ? "" : String(selectedPack)}
                            onChange={(e) => onSelectPackForProduct(key, e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                          >
                            <option value="">Select pack</option>
                            {product.packs.map((p, idx) => (
                              <option key={idx} value={String(p.pack)}>
                                {p.pack}-pack — ₵{p.price}
                              </option>
                            ))}
                          </select>

                          {/* show selected pack price only when a pack is chosen */}
                          {selectedPackObj && (
                            <p className="font-semibold mt-2 text-foreground">
                              Selected: {selectedPackObj.pack}-pack — ₵{selectedPackObj.price}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2 justify-center flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)} className="flex-1 min-w-[100px]">
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)} className="flex-1 min-w-[100px]">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="w-full rounded-md px-6 max-w-lg overflow-y-auto" style={{ maxHeight: "90vh" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-base sm:text-lg font-semibold">
                {editingId ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleSaveProduct(); }}>
              {/* NAME */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Drink name" className="mt-1 w-full" required />
              </div>

              {/* SIZE + CATEGORY */}
              <div className="flex sm:gap-3 flex-col sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="size" className="text-sm font-medium">Size</Label>
                  <Input id="size" placeholder="e.g. 300ml / Small" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="mt-1 w-full" />
                </div>

                <div className="flex-1">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <select id="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* IMAGE */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-28 h-28 object-cover rounded-md border" />
                  ) : (
                    <div className="w-28 h-28 rounded-md border bg-muted flex items-center justify-center text-muted-foreground">No image</div>
                  )}
                </div>

                <div className="flex-1">
                  <Label className="text-sm font-medium">Image</Label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="mt-1 w-full text-sm" aria-label="Upload product image" />
                  <p className="text-xs text-muted-foreground mt-2">Recommended: JPG/PNG. Max 2MB.</p>
                </div>
              </div>

              {/* PACKS */}
              <div>
                <Label className="text-sm font-medium">Available Packs</Label>
                {form.packs.map((p, idx) => (
                  <div key={idx} className="flex gap-2 mt-1">
                    {/* pack stored as string so it can be empty and deletable */}
                    <Input
                      type="number"
                      placeholder="Pack size"
                      value={p.pack}
                      onChange={e => {
                        const newPacks = [...form.packs];
                        newPacks[idx].pack = e.target.value; // store as string
                        setForm({ ...form, packs: newPacks });
                      }}
                      className="w-1/2"
                      step={1}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={p.price}
                      onChange={e => {
                        const newPacks = [...form.packs];
                        newPacks[idx].price = e.target.value;
                        setForm({ ...form, packs: newPacks });
                      }}
                      className="w-1/2"
                      step={0.01}
                    />
                    <Button variant="destructive" onClick={() => setForm({ ...form, packs: form.packs.filter((_, i) => i !== idx) })} size="icon">&times;</Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, packs: [...form.packs, { pack: "", price: "" }] })}
                  className="mt-2"
                >
                  + Add Pack
                </Button>
              </div>

              {/* ACTIONS */}
              <div className="mt-4 mb-4 flex sm:flex sm:justify-end gap-2 sticky bottom-0 bg-background p-2 z-10">
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)} className="w-full sm:w-auto">Cancel</Button>
                <Button type="submit" className="w-full sm:w-auto" aria-busy={saving} disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </form>

          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
