// src/admin/pages/Products.tsx
import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Grid3x3,
  List,
  X,
  Edit2,
  Trash2,
  ImageIcon,
  Upload,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string | number;
  name: string;
  category: string;
  size?: string;
  description?: string;
  stock?: number;
  price: number;
  status?: string;
  image?: string; // expected to be a URL returned by backend
}

const categories = [
  { id: "pure-juice", name: "Pure Juice", slug: "pure-juice" },
  { id: "cleanse", name: "Cleanse Juices", slug: "cleanse" },
  { id: "smoothies", name: "Smoothies", slug: "smoothies" },
  { id: "cut-fruits", name: "Cut Fruits", slug: "cut-fruits" },
  { id: "gift-packs", name: "Gift Packs", slug: "gift-packs" },
  { id: "events", name: "Events", slug: "events" },
];

const API_BASE = "/api/products"; // change to your backend base URL if needed

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // form fields (strings because inputs)
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    size: "",
    description: "",
    status: "Active",
  });

  // file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
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

  useEffect(() => {
    fetchProducts();
    // cleanup preview urls if component unmounts
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // open modal for new
  const openNew = () => {
    setEditingId(null);
    setForm({
      name: "",
      price: "",
      category: "",
      size: "",
      description: "",
      status: "Active",
    });
    clearSelectedFile();
    setOpenModal(true);
  };

  // open modal for edit
  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name ?? "",
      price: (product.price ?? 0).toString(),
      category: product.category ?? "",
      size: product.size ?? "",
      description: product.description ?? "",
      status: product.status ?? "Active",
    });
    // show existing image as preview (but it's a URL coming from backend)
    clearSelectedFile();
    setPreviewUrl(product.image ?? null);
    setOpenModal(true);
  };

  const clearSelectedFile = () => {
    if (previewUrl && selectedFile) {
      // if we created an object URL for the selectedFile, revoke
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {}
    }
    setSelectedFile(null);
    // if previewUrl is backend-provided URL, we keep it; caller will decide.
    if (previewUrl && !selectedFile) {
      // do nothing
    }
  };

  // handle file selection
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    // basic validation (image types)
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    // revoke old preview if it was an object URL
    if (previewUrl && selectedFile) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch {}
    }
    const obj = URL.createObjectURL(f);
    setSelectedFile(f);
    setPreviewUrl(obj);
  };

  // Create or Update with multipart/form-data
  const handleSaveProduct = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Please fill name, price, and category.");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("price", String(parseFloat(form.price)));
      fd.append("category", form.category);
      if (form.size) fd.append("size", form.size);
      if (form.description) fd.append("description", form.description);
      fd.append("status", form.status);
      // if a new file was chosen, append it; backend should accept field 'image'
      if (selectedFile) {
        fd.append("image", selectedFile);
      }

      if (editingId) {
        // PUT to update (send multipart for file + fields)
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          body: fd,
          // DO NOT set Content-Type; browser will set multipart boundary
        });
        if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...updated } : p)));
        toast.success("Product updated");
      } else {
        // Create
        const res = await fetch(API_BASE, {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error(`Create failed: ${res.status}`);
        const created = await res.json();
        // assume backend returns created product including image URL
        setProducts((prev) => [...prev, created ?? { ...(fd as any), id: Date.now() }]);
        toast.success("Product added");
      }

      // cleanup and close
      setOpenModal(false);
      setEditingId(null);

      // revoke preview object URL if one was created from selectedFile
      if (previewUrl && selectedFile) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {}
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setForm({
        name: "",
        price: "",
        category: "",
        size: "",
        description: "",
        status: "Active",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Check backend.");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: string | number) => {
    const ok = window.confirm("Delete this product? This action cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product. Check backend.");
    }
  };

  // Quick patch helper (PATCH)
  const patchProduct = async (id: string | number, patch: Partial<Product>) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Patch failed");
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      toast.success("Product updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not update product.");
    }
  };

  // columns for table (if you need them elsewhere)
  const columns = [
    { key: "id", label: "Order ID" },
    { key: "customer", label: "Customer" },
    { key: "total", label: "Total" },
    // not used in this file but kept from prior implementation
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-5">
        {/* Header */}
        <div className="flex sm:flex-row sm:items-center sm:justify-between justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold">Products</h1>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button onClick={openNew} className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button onClick={openNew} size="icon" className="sm:hidden" aria-label="Add product">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading / Empty */}
        {loading ? (
          <div className="p-6 bg-muted/30 rounded text-center">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-6 bg-muted/30 rounded text-center">
            No products found. Click Add Product to seed your catalog.
          </div>
        ) : null}

        {/* Products View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <Card
                key={product.id}
                className="hover:border-primary/40 border-2 transition-all duration-150 relative"
              >
                <CardContent className="p-3 sm:p-4 flex flex-col">
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Badge
                        variant={product.status === "Active" ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {product.status ?? "Active"}
                      </Badge>
                      <button
                        className="text-xs underline ml-2"
                        onClick={() =>
                          patchProduct(product.id, {
                            status: product.status === "Low Stock" ? "Active" : "Low Stock",
                          })
                        }
                        aria-label={`Toggle stock for ${product.name}`}
                      >
                        toggle stock
                      </button>
                    </div>

                    <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                    {product.size && (
                      <p className="text-xs text-muted-foreground truncate">Size: {product.size}</p>
                    )}
                    <p className="font-bold text-base sm:text-lg mt-1">
                      ₵{Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock ?? "-"}</p>

                    <div className="mt-3 flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-muted/50 w-full"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {product.category} • {product.size ?? "—"}
                      </p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 sm:gap-3">
                      <Badge
                        variant={product.status === "Active" ? "default" : "destructive"}
                        className="hidden sm:block"
                      >
                        {product.status ?? "Active"}
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold text-sm sm:text-base">
                          ₵{Number(product.price).toFixed(2)}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Stock: {product.stock ?? "-"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add / Edit Product Modal */}
        <Dialog
          open={openModal}
          onOpenChange={(v) => {
            setOpenModal(v);
            if (!v) {
              setEditingId(null);
              // revoke preview url if it is an object URL
              if (selectedFile && previewUrl) {
                try {
                  URL.revokeObjectURL(previewUrl);
                } catch {}
              }
              setSelectedFile(null);
              setPreviewUrl(null);
            }
          }}
        >
          <DialogContent className="max-w-md rounded-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{editingId ? "Edit Product" : "Add Product"}</span>
                <button
                  className="p-1 rounded hover:bg-muted"
                  onClick={() => {
                    setOpenModal(false);
                    setEditingId(null);
                  }}
                  aria-label="Close"
                >
                 
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <div>
                <Label>Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Product name"
                  className="placeholder:text-xm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (₵)</Label>
                  <Input
                    name="price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <Label>Size</Label>
                  <Input
                    name="size"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="e.g. 300ml / Small"
                    className="placeholder:text-sm"
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <select
                  name="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded px-2 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short product description"
                  className="placeholder:text-sm"
                />
              </div>

              {/* Image upload */}
              <div>
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload image"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>

                  {/* preview */}
                  <div className="w-20 h-20 bg-muted rounded overflow-hidden flex items-center justify-center">
                    {previewUrl ? (
                      // previewUrl could be backend URL or object URL
                      <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* if editing and backend image exists but user hasn't selected a new file, show small hint */}
                {editingId && !selectedFile && previewUrl && previewUrl.startsWith("http") && (
                  <p className="text-xs text-muted-foreground mt-1">Current image will remain unless you upload a new one.</p>
                )}
              </div>

              <div>
                <Label>Status</Label>
                <select
                  name="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded px-2 py-2 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProduct}
                  className="w-full font-bold mt-2"
                  disabled={saving}
                >
                  {saving ? (editingId ? "Saving..." : "Adding...") : editingId ? "Save Changes" : "Add Product"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenModal(false);
                    setEditingId(null);
                    // revoke preview if necessary
                    if (selectedFile && previewUrl) {
                      try {
                        URL.revokeObjectURL(previewUrl);
                      } catch {}
                    }
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="mt-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
