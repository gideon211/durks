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
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice" },
  { id: "cleanse", name: "CLEANSE JUICES ", slug: "cleanse" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies" },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits" },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs" },
  { id: "events", name: "EVENTS", slug: "events" },
  { id: "WELLNESS", name: "WELLNESS SHOTS", slug: "shots" },
];

const API_BASE = "https://duksshopbackend1-0.onrender.com/api/drinks";

export default function Products() {
  const { user } = useAuth();
  const token = user?.token;
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    size: "",
    description: "",
    status: "Active",
    packs: [{ pack: 12, price: "" }],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!token) toast.error("No token found. Please login again.");

  useEffect(() => {
    fetchProducts();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load products. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", category: "", size: "", description: "", status: "Active", packs: [{ pack: 12, price: "" }] });
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
      packs: product.packs && product.packs.length > 0 ? product.packs.map(p => ({ pack: p.pack, price: p.price.toString() })) : [{ pack: 12, price: "" }],
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
    if (!token) return;
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
      if (selectedFile) fd.append("image", selectedFile);

      // Convert prices to numbers before sending
      const packsToSend = form.packs.map(p => ({ pack: p.pack, price: parseFloat(p.price) }));
      fd.append("packs", JSON.stringify(packsToSend));

      let res;
      if (editingId) {
        res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await fetch(`${API_BASE}/add`, {
          method: "POST",
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!res.ok) throw new Error(await res.text());
      toast.success("Product saved successfully");
      setOpenModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Check backend and token.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!token) return;
    const ok = window.confirm("Delete this product? This action cannot be undone.");
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product. Check backend.");
    }
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
            <Button onClick={openNew} className="hidden sm:flex items-center">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
            <Button onClick={openNew} size="icon" className="sm:hidden" aria-label="Add product">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && <div className="p-6 bg-muted/30 rounded text-center w-full">Loading products...</div>}
        {!loading && products.length === 0 && <div className="p-6 bg-muted/30 rounded text-center w-full">No products found. Click Add Product to seed your catalog.</div>}

        {/* Grid view */}
        {viewMode === "grid" && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
            {products.map((product) => (
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
                    {product.packs && product.packs.length > 0 && (
                      <p className="font-bold text-base sm:text-lg mt-1">
                        {product.packs.map(p => `₵${p.price} (${p.pack}-pack)`).join(" · ")}
                      </p>
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
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={openModal} onOpenChange={(v) => setOpenModal(v)}>
          <DialogContent 
          className="w-full rounded-md px-6 max-w-lg overflow-y-auto"
          style={{ maxHeight: '90vh' }}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-base sm:text-lg font-semibold">
                {editingId ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>

<form className="space-y-2" onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }}>
  {/* NAME */}
  <div>
    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
    <Input
      id="name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      placeholder="Drink name"
      className="mt-1 w-full"
      required
    />
  </div>

  {/* SIZE + CATEGORY */}
  <div className="flex sm:gap-3 flex-col sm:flex-row">
    <div className="flex-1">
      <Label htmlFor="size" className="text-sm font-medium">Size</Label>
      <Input
        id="size"
        placeholder="e.g. 300ml / Small"
        value={form.size}
        onChange={(e) => setForm({ ...form, size: e.target.value })}
        className="mt-1 w-full"
      />
    </div>

    <div className="flex-1">
      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
      <select
        id="category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="mt-1 w-full rounded-md border px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        required
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>{c.name}</option>
        ))}
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
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
        className="mt-1 w-full text-sm"
        aria-label="Upload product image"
      />
      <p className="text-xs text-muted-foreground mt-2">Recommended: JPG/PNG. Max 2MB.</p>
    </div>
  </div>

  {/* PACKS */}
  <div>
    <Label className="text-sm font-medium">Available Packs</Label>
    {form.packs.map((p, idx) => (
      <div key={idx} className="flex gap-2 mt-1">
        <Input
          type="number"
          placeholder="Pack size"
          value={p.pack}
          onChange={(e) => {
            const newPacks = [...form.packs];
            newPacks[idx].pack = Number(e.target.value);
            setForm({ ...form, packs: newPacks });
          }}
          className="w-1/2"
          min={1}
          required
        />
        <Input
          type="number"
          placeholder="Price"
          value={p.price}
          onChange={(e) => {
            const newPacks = [...form.packs];
            newPacks[idx].price = e.target.value;
            setForm({ ...form, packs: newPacks });
          }}
          className="w-1/2"
          min={0}
          step={0.01}
          required
        />
        <Button
          variant="destructive"
          onClick={() => {
            const newPacks = form.packs.filter((_, i) => i !== idx);
            setForm({ ...form, packs: newPacks });
          }}
          size="icon"
        >
          &times;
        </Button>
      </div>
    ))}
    <Button
      type="button"
      variant="outline"
      onClick={() => setForm({ ...form, packs: [...form.packs, { pack: 12, price: "" }] })}
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
