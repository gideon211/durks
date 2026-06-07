// src/admin/pages/Products.tsx
import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Grid3x3, List, Edit2, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/api/axios";

interface Product {
  id: string | number;
  name: string;
  category: string;
  size?: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  packs?: { pack: number; price: number; oldPrice?: number | null }[];
}

const categories = [
  { id: "all", name: "ALL PRODUCTS", slug: "all" },
  { id: "bundles", name: "BUNDLES", slug: "bundle" },
  { id: "pure-juice", name: "PURE JUICES", slug: "pure-juice" },
  { id: "cleanse", name: "CLEANSE JUICES", slug: "cleanse" },
  { id: "shots", name: "WELLNESS SHOTS", slug: "shots" },
  { id: "smoothies", name: "SMOOTHIES", slug: "smoothies" },
  { id: "flavors", name: "FLAVORS", slug: "flavor" },
  { id: "cut-fruits", name: "CUT FRUITS", slug: "cut-fruits" },
  { id: "gift-packs", name: "GIFT PACKS", slug: "gift-packs" },
  { id: "events", name: "EVENTS", slug: "events" },
];

const CATEGORY_MATCH: Record<string, string[]> = Object.fromEntries(
  categories.filter((c) => c.slug !== "all").map((c) => [
    c.slug,
    [...new Set([c.slug, c.id, c.name.toLowerCase().replace(/\s+/g, "-"), c.name.toLowerCase()])],
  ])
);

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
    packs: [{ pack: "", price: "", oldPrice: "" }] as {
      pack: string;
      price: string;
      oldPrice?: string;
    }[],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ track blob preview URL so we ONLY revoke object URLs
  const blobPreviewRef = useRef<string | null>(null);
  // ✅ keep the original product image url while editing (remote url)
  const existingImageUrlRef = useRef<string | null>(null);

  // track selected pack per product (for grid dropdown)
  const [selectedPackByProduct, setSelectedPackByProduct] = useState<Record<string, number | "">>({});

  const normalizeDrink = (p: Record<string, unknown>): Product => ({
    id: (p._id ?? p.id) as string | number,
    name: (p.name ?? "") as string,
    category: (p.category ?? "") as string,
    size: (p.size ?? "") as string,
    description: (p.description ?? "") as string,
    status: (p.status ?? "Active") as string,
    imageUrl: (p.imageUrl ?? p.image ?? "") as string,
    packs: Array.isArray(p.packs)
      ? (p.packs as Record<string, unknown>[]).map((x) => ({
          pack: x.pack as number,
          price: x.price as number,
          oldPrice: (x.oldPrice ?? null) as number | null,
        }))
      : [],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/drinks/");
      const rawItems = Array.isArray(res.data) ? res.data : (res.data?.drinks ?? []);
      const normalized: Product[] = rawItems.map((item: Record<string, unknown>) => normalizeDrink(item));
      setProducts(normalized);
    } catch (err) {
      console.error("fetchProducts error:", err);
      toast.error("Could not load products. Check backend connection or login.");
    } finally {
      setLoading(false);
    }
  };

  // revoke blob preview on unmount
  useEffect(() => {
    return () => {
      if (blobPreviewRef.current && blobPreviewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobPreviewRef.current);
      }
      blobPreviewRef.current = null;
    };
  }, []);

  // Fetch on mount only
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const revokeBlobPreviewIfAny = () => {
    if (blobPreviewRef.current && blobPreviewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(blobPreviewRef.current);
    }
    blobPreviewRef.current = null;
  };

  const clearSelectedFile = () => {
    // ✅ only revoke blob previews (not remote urls)
    revokeBlobPreviewIfAny();
    setSelectedFile(null);
    resetFileInput();

    // restore existing image preview if we’re editing a product
    if (existingImageUrlRef.current) {
      setPreviewUrl(existingImageUrlRef.current);
    } else {
      setPreviewUrl(null);
    }
  };

  const openNew = () => {
    setEditingId(null);
    existingImageUrlRef.current = null;

    setForm({
      name: "",
      category: "",
      size: "",
      description: "",
      status: "Active",
      packs: [{ pack: "", price: "", oldPrice: "" }],
    });

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
      packs:
        product.packs && product.packs.length > 0
          ? product.packs.map((p) => ({
              pack: String(p.pack),
              price: String(p.price),
              oldPrice:
                p.oldPrice != null
                  ? String(p.oldPrice)
                  : "",
            }))
          : [{ pack: "", price: "", oldPrice: "" }],
    });

    // keep original remote url for restore
    existingImageUrlRef.current = product.imageUrl ?? null;

    // clear any previous blob preview, then show remote image
    revokeBlobPreviewIfAny();
    setSelectedFile(null);
    resetFileInput();

    setPreviewUrl(product.imageUrl ?? null);
    setOpenModal(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;

    if (!f) {
      // if user cancels file picker, keep existing preview if editing
      setSelectedFile(null);
      if (existingImageUrlRef.current) setPreviewUrl(existingImageUrlRef.current);
      else setPreviewUrl(null);
      return;
    }

    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      resetFileInput();
      return;
    }

    // ✅ revoke old blob preview, create new one
    revokeBlobPreviewIfAny();

    const objUrl = URL.createObjectURL(f);
    blobPreviewRef.current = objUrl;

    setSelectedFile(f);
    setPreviewUrl(objUrl);
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim() || !form.category || form.packs.length === 0) {
      toast.error("Please fill name, category, and at least one pack.");
      return;
    }

    // basic pack validation (keeps your UI)
    const packsToSend = form.packs
      .filter((p) => String(p.pack).trim() !== "")
      .map((p) => ({
        pack: Number(p.pack),
        price: Number(p.price),
        oldPrice:
          p.oldPrice !== undefined && p.oldPrice !== null && String(p.oldPrice).trim() !== ""
            ? Number(p.oldPrice)
            : null,
      }))
      .filter((p) => Number.isFinite(p.pack) && Number.isFinite(p.price));

    if (packsToSend.length === 0) {
      toast.error("Please add at least one valid pack with a price.");
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
      fd.append("packs", JSON.stringify(packsToSend));

      let res;
      if (editingId) {
        res = await axiosInstance.put(`/drinks/${editingId}`, fd);
      } else {
        res = await axiosInstance.post("/drinks/add", fd);
      }

      const responseData = res.data;
      const savedProduct = responseData?.drink ?? responseData?.data ?? responseData;

      if (savedProduct && editingId) {
        // Update existing product in local state
        const normalized = normalizeDrink(savedProduct);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? normalized : p)));
      } else if (savedProduct && !editingId) {
        // Add new product to local state
        const normalized = normalizeDrink(savedProduct);
        setProducts((prev) => [...prev, normalized]);
      }

      toast.success("Product saved successfully");
      setOpenModal(false);

      // after successful save, cleanup blob preview
      revokeBlobPreviewIfAny();
      setSelectedFile(null);
      resetFileInput();
      existingImageUrlRef.current = null;
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
      await axiosInstance.delete(`/drinks/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error("handleDelete error:", err);
      toast.error("Failed to delete product. Check backend.");
    }
  };

  const onSelectPackForProduct = (productId: string | number, packValue: string) => {
    setSelectedPackByProduct((prev) => ({
      ...prev,
      [`${productId}`]: packValue === "" ? "" : Number(packValue),
    }));
  };

  const filteredProducts = categoryFilter === "all"
    ? products
    : products.filter((p) => {
        const matchValues = CATEGORY_MATCH[categoryFilter];
        if (!matchValues) return false;
        const pc = (p.category ?? "").toLowerCase();
        return matchValues.some((v) => v === pc);
      });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <h1 className="text-2xl sm:text-3xl font-semibold">Products</h1>
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-muted" : ""}
            >
              <Grid3x3 className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
            >
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

        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter by category</span>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card shadow-sm p-3 sm:p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse mb-2 w-3/4 mx-auto" />
                <div className="h-3 bg-muted rounded animate-pulse mb-2 w-1/2 mx-auto" />
                <div className="h-8 bg-muted rounded animate-pulse mt-3 w-full" />
              </div>
            ))}
          </div>
        )}
        {!loading && filteredProducts.length === 0 && (
          <div className="p-6 bg-muted/30 rounded text-center w-full">
            {categoryFilter !== "all"
              ? `No products in this category.`
              : "No products found. Click Add Product to seed your catalog."}
          </div>
        )}

        {viewMode === "grid" && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
            {filteredProducts.map((product) => {
              const key = `${product.id}`;
              const selectedPack = selectedPackByProduct[key] ?? "";
              const selectedPackObj = product.packs?.find((p) => p.pack === selectedPack) ?? null;

              return (
                <Card
                  key={product.id}
                  className="hover:border-primary/40 border transition-all duration-150 relative flex flex-col shadow-sm"
                >
                  <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative w-full">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name ?? "Product image"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-grow text-center">
                      <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant={product.status === "Active" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {product.status ?? "Active"}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                      {product.size && <p className="text-xs text-muted-foreground truncate">Size: {product.size}</p>}

                      {product.packs && product.packs.length > 0 && (
                        <div className="mt-2 w-full">
                          <Select value={selectedPack === "" ? "" : String(selectedPack)} onValueChange={(v) => onSelectPackForProduct(key, v)}>
                            <SelectTrigger className="w-full h-9 text-sm">
                              <SelectValue placeholder="Select pack" />
                            </SelectTrigger>
                            <SelectContent>
                              {product.packs.map((p, idx) => (
                                <SelectItem key={idx} value={String(p.pack)}>
                                  {p.pack}-pack — ₵{p.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {selectedPackObj && (
                            <p className="font-semibold mt-2 text-foreground">
                              Selected: {selectedPackObj.pack}-pack — ₵{selectedPackObj.price}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2 justify-center flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(product)}
                          className="flex-1 min-w-[100px]"
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 min-w-[100px]"
                        >
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

        {viewMode === "list" && filteredProducts.length > 0 && (
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Product</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Category</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Packs</th>
                  <th className="text-right font-semibold uppercase tracking-wider text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-4 w-4" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.size && <p className="text-xs text-muted-foreground">{product.size}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant={product.status === "Active" ? "default" : "destructive"} className="text-xs">
                        {product.status ?? "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.packs?.map((p, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs whitespace-nowrap">
                            {p.pack}-pk ₵{p.price}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog
          open={openModal}
          onOpenChange={(v) => {
            setOpenModal(v);
            if (!v) {
              clearSelectedFile();
              existingImageUrlRef.current = null;
              setEditingId(null);
            }
          }}
        >
          <DialogContent className="max-w-xl overflow-y-auto bg-white" style={{ maxHeight: "90vh" }}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {editingId ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProduct();
              }}
            >
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mango Sunrise"
                  required
                />
              </div>

              {/* Category + Size row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((c) => (
                        <SelectItem key={c.id} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="size">Size / Volume</Label>
                  <Input
                    id="size"
                    placeholder="e.g. 300ml"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                  />
                </div>
              </div>

              {/* Image upload */}
              <div className="space-y-1.5">
                <Label>Product Image</Label>
                <div
                  className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-white p-6 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="relative w-full max-w-[200px]">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); clearSelectedFile(); }}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:opacity-90"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-full bg-border/50 p-3 mb-2">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Click to upload</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 2MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    aria-label="Upload product image"
                  />
                </div>
              </div>

              {/* Packs */}
              <div className="space-y-2">
                <Label>Pricing (Packs)</Label>
                <div className="space-y-2">
                  {form.packs.map((p, idx) => (
                    <div key={idx} className="flex items-end gap-2 bg-white border rounded-lg p-3">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Pack size</Label>
                        <Input
                          type="number"
                          placeholder="e.g. 6"
                          value={p.pack}
                          onChange={(e) => {
                            const newPacks = [...form.packs];
                            newPacks[idx].pack = e.target.value;
                            setForm({ ...form, packs: newPacks });
                          }}
                          step={1}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Price (GH₵)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={p.price}
                          onChange={(e) => {
                            const newPacks = [...form.packs];
                            newPacks[idx].price = e.target.value;
                            setForm({ ...form, packs: newPacks });
                          }}
                          step={0.01}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Old price (optional)</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={p.oldPrice ?? ""}
                          onChange={(e) => {
                            const newPacks = [...form.packs];
                            newPacks[idx].oldPrice = e.target.value;
                            setForm({ ...form, packs: newPacks });
                          }}
                          step={0.01}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            packs: form.packs.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({
                      ...form,
                      packs: [...form.packs, { pack: "", price: "", oldPrice: "" }],
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Pack
                </Button>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">Make this product visible to customers</p>
                </div>
                <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.status === "Active"}
                    onChange={(e) => setForm({ ...form, status: e.target.checked ? "Active" : "Inactive" })}
                  />
                  <span className="absolute inset-0 rounded-full bg-muted-foreground/30 transition-colors peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                  <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : editingId ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
