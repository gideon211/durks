"use client";

import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Grid3x3, List, Edit2, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { ShimmerBar } from "@/components/ui/shimmer-bar";
import { cn } from "@/lib/utils";
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

  const blobPreviewRef = useRef<string | null>(null);
  const existingImageUrlRef = useRef<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (blobPreviewRef.current && blobPreviewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(blobPreviewRef.current);
      }
      blobPreviewRef.current = null;
    };
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const revokeBlobPreviewIfAny = () => {
    if (blobPreviewRef.current && blobPreviewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(blobPreviewRef.current);
    }
    blobPreviewRef.current = null;
  };

  const clearSelectedFile = () => {
    revokeBlobPreviewIfAny();
    setSelectedFile(null);
    resetFileInput();
    if (existingImageUrlRef.current) setPreviewUrl(existingImageUrlRef.current);
    else setPreviewUrl(null);
  };

  const openNew = () => {
    setEditingId(null);
    existingImageUrlRef.current = null;
    setForm({ name: "", category: "", size: "", description: "", status: "Active", packs: [{ pack: "", price: "", oldPrice: "" }] });
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
      packs: product.packs && product.packs.length > 0
        ? product.packs.map((p) => ({ pack: String(p.pack), price: String(p.price), oldPrice: p.oldPrice != null ? String(p.oldPrice) : "" }))
        : [{ pack: "", price: "", oldPrice: "" }],
    });
    existingImageUrlRef.current = product.imageUrl ?? null;
    revokeBlobPreviewIfAny();
    setSelectedFile(null);
    resetFileInput();
    setPreviewUrl(product.imageUrl ?? null);
    setOpenModal(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
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
    const packsToSend = form.packs
      .filter((p) => String(p.pack).trim() !== "")
      .map((p) => ({
        pack: Number(p.pack),
        price: Number(p.price),
        oldPrice: p.oldPrice !== undefined && p.oldPrice !== null && String(p.oldPrice).trim() !== "" ? Number(p.oldPrice) : null,
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
        setProducts((prev) => prev.map((p) => (p.id === editingId ? normalizeDrink(savedProduct) : p)));
      } else if (savedProduct && !editingId) {
        setProducts((prev) => [...prev, normalizeDrink(savedProduct)]);
      }
      toast.success("Product saved successfully");
      setOpenModal(false);
      revokeBlobPreviewIfAny();
      setSelectedFile(null);
      resetFileInput();
      existingImageUrlRef.current = null;
    } catch (err) {
      console.error("handleSaveProduct error:", err);
      toast.error((err as Error).message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/drinks/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch (err) {
      console.error("handleDelete error:", err);
      toast.error("Failed to delete product.");
    }
  };

  const onSelectPackForProduct = (productId: string | number, packValue: string) => {
    setSelectedPackByProduct((prev) => ({ ...prev, [`${productId}`]: packValue === "" ? "" : Number(packValue) }));
  };

  const filteredProducts = categoryFilter === "all"
    ? products
    : products.filter((p) => {
        const matchValues = CATEGORY_MATCH[categoryFilter];
        if (!matchValues) return false;
        return matchValues.some((v) => v === (p.category ?? "").toLowerCase());
      });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-border/50 rounded-xl p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-muted-foreground hover:text-foreground"}`} aria-label="Grid view">
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-muted-foreground hover:text-foreground"}`} aria-label="List view">
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={openNew} className="rounded-xl h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all duration-300">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-10 rounded-xl border-border/60 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-muted/10 rounded-xl p-4">
                <ShimmerBar className="aspect-square rounded-xl mb-4" />
                <ShimmerBar className="h-4 rounded-lg mb-2 w-3/4" />
                <ShimmerBar className="h-3 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-2xl bg-white border border-border/50 p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {categoryFilter !== "all" ? "No products in this category" : "No products yet"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {categoryFilter !== "all" ? "Try a different category filter" : "Add your first product to get started"}
            </p>
            {categoryFilter === "all" && (
              <Button onClick={openNew} variant="outline" className="rounded-xl">
                <Plus className="h-4 w-4 mr-1.5" /> Add Product
              </Button>
            )}
          </div>
        )}

        {/* Grid view */}
        {viewMode === "grid" && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const key = `${product.id}`;
              const selectedPack = selectedPackByProduct[key] ?? "";
              const selectedPackObj = product.packs?.find((p) => p.pack === selectedPack) ?? null;
              return (
                <div key={product.id} className="group rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-border/80 flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name ?? "Product"} className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    {/* Status badge overlay */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md ${product.status === "Active" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                        {product.status ?? "Active"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-sm truncate mb-0.5">{product.name}</h3>
                    <p className="text-[11px] text-muted-foreground truncate mb-3">{product.category}{product.size ? ` \u2022 ${product.size}` : ""}</p>

                    {/* Pack selector */}
                    {product.packs && product.packs.length > 0 && (
                      <div className="mb-3">
                        <Select value={selectedPack === "" ? "" : String(selectedPack)} onValueChange={(v) => onSelectPackForProduct(key, v)}>
                          <SelectTrigger className="w-full h-9 rounded-xl text-xs border-border/60">
                            <SelectValue placeholder="Select pack" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.packs.map((p, idx) => (
                              <SelectItem key={idx} value={String(p.pack)}>
                                {p.pack}-pack — GH₵{p.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedPackObj && (
                          <p className="text-xs font-semibold mt-1.5 text-foreground">
                            {selectedPackObj.pack}-pack — GH₵{selectedPackObj.price}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(product)} className="flex-1 h-9 rounded-xl text-xs font-medium border-border/60">
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-9 w-9 p-0 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && filteredProducts.length > 0 && (
          <div className="rounded-2xl bg-white border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px] md:min-w-0">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3">Product</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3">Category</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3">Packs</th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-4 w-4" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.size && <p className="text-[11px] text-muted-foreground">{product.size}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{product.category}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${product.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {product.status ?? "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.packs?.slice(0, 3).map((p, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
                            {p.pack}-pk GH₵{p.price}
                          </span>
                        ))}
                        {product.packs && product.packs.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{product.packs.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)} className="h-8 w-8 p-0 rounded-lg"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                </tr>
              ))}
                </tbody>
              </table>
            </div>
            </div>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={openModal} onOpenChange={(v) => { setOpenModal(v); if (!v) { clearSelectedFile(); existingImageUrlRef.current = null; setEditingId(null); } }}>
          <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl" style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/40 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{editingId ? "Update product details below" : "Fill in the details to add a new product"}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${form.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {form.status === "Active" ? "Active" : "Draft"}
                </div>
              </div>
            </div>

            <form className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 140px)" }} onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }}>
              <div className="flex flex-col lg:flex-row">
                {/* Left column — Image */}
                <div className="lg:w-2/5 p-6 bg-gray-50/50 border-b lg:border-b-0 lg:border-r border-border/40">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Product Image</Label>
                  <div
                    className="relative rounded-2xl border-2 border-dashed border-border/60 bg-white overflow-hidden cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); clearSelectedFile(); }}
                          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm text-red-500 flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg"
                        >
                          &times;
                        </button>
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 text-center text-xs font-medium text-gray-700 shadow-lg">
                            Click to change image
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                          <ImageIcon className="h-7 w-7 text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Upload product image</p>
                        <p className="text-[11px] text-gray-400 text-center">Drag & drop or click to browse<br />JPG, PNG up to 2MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={onFileChange} className="hidden" aria-label="Upload product image" />
                  </div>

                  {/* Status toggle */}
                  <div className="mt-5 flex items-center justify-between rounded-xl border border-border/50 px-4 py-3 bg-white">
                    <div>
                      <p className="text-sm font-semibold">Visibility</p>
                      <p className="text-[11px] text-muted-foreground">{form.status === "Active" ? "Visible to customers" : "Hidden from customers"}</p>
                    </div>
                    <label className="relative inline-flex h-7 w-12 cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" checked={form.status === "Active"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "Active" : "Inactive" })} />
                      <span className="absolute inset-0 rounded-full bg-gray-200 transition-colors peer-checked:bg-blue-500" />
                      <span className="absolute left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>

                {/* Right column — Details */}
                <div className="lg:w-3/5 p-6 space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Mango Sunrise"
                      className="rounded-xl h-11 border-border/60 focus:border-blue-400 focus:ring-blue-400/20"
                      required
                    />
                  </div>

                  {/* Category + Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger className="rounded-xl h-11 border-border/60 focus:border-blue-400 focus:ring-blue-400/20">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.slice(1).map((c) => (
                            <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="size" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Size / Volume</Label>
                      <Input
                        id="size"
                        placeholder="e.g. 300ml"
                        value={form.size}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                        className="rounded-xl h-11 border-border/60 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                  </div>

                  {/* Packs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing (Packs)</Label>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, packs: [...form.packs, { pack: "", price: "", oldPrice: "" }] })} className="h-7 rounded-lg text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2">
                        <Plus className="h-3 w-3 mr-1" /> Add Pack
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {form.packs.map((p, idx) => (
                        <div key={idx} className="flex items-end gap-2 bg-gray-50 border border-border/40 rounded-xl p-3 group">
                          <div className="flex-1 space-y-1">
                            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Size</Label>
                            <Input type="number" placeholder="6" value={p.pack} onChange={(e) => { const np = [...form.packs]; np[idx].pack = e.target.value; setForm({ ...form, packs: np }); }} step={1} className="rounded-lg h-9 text-sm border-border/50" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Price (GH₵)</Label>
                            <Input type="number" placeholder="0.00" value={p.price} onChange={(e) => { const np = [...form.packs]; np[idx].price = e.target.value; setForm({ ...form, packs: np }); }} step={0.01} className="rounded-lg h-9 text-sm border-border/50" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Was</Label>
                            <Input type="number" placeholder="0.00" value={p.oldPrice ?? ""} onChange={(e) => { const np = [...form.packs]; np[idx].oldPrice = e.target.value; setForm({ ...form, packs: np }); }} step={0.01} className="rounded-lg h-9 text-sm border-border/50" />
                          </div>
                          <Button variant="ghost" size="icon" type="button" onClick={() => setForm({ ...form, packs: form.packs.filter((_, i) => i !== idx) })} className="h-9 w-9 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-gray-50/50">
                <p className="text-[11px] text-muted-foreground">{form.packs.length} pack{form.packs.length !== 1 ? "s" : ""} configured</p>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" onClick={() => setOpenModal(false)} className="rounded-xl h-10 px-5 text-gray-600 hover:text-gray-800">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="rounded-xl h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all duration-300">
                    {saving ? (
                      <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                    ) : editingId ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
