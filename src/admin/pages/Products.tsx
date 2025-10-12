// src/admin/pages/Products.tsx
import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Grid3x3, List, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Product {
  id: string | number;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
  image: string;
}

const categories = [
  { id: "pure-juice", name: "Pure Juice", slug: "pure-juice" },
  { id: "cleanse", name: "Cleanse Juices", slug: "cleanse" },
  { id: "smoothies", name: "Smoothies", slug: "smoothies" },
  { id: "cut-fruits", name: "Cut Fruits", slug: "cut-fruits" },
  { id: "gift-packs", name: "Gift Packs", slug: "gift-packs" },
  { id: "events", name: "Events", slug: "events" },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    status: "Active",
    image: "",
  });

  // Initialize with mock products
  useEffect(() => {
    setProducts([
      {
        id: 1,
        name: "Mango Sunrise",
        category: "Juice",
        stock: 120,
        price: 12,
        status: "Active",
        image: "/placeholder.svg",
      },
      {
        id: 2,
        name: "Berry Blast",
        category: "Smoothies",
        stock: 80,
        price: 15,
        status: "Active",
        image: "/placeholder.svg",
      },
    ]);
  }, []);

  const handleAddProduct = () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      toast.error("All fields are required");
      return;
    }

    const newProduct: Product = {
      ...form,
      id: Date.now(),
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      image: form.image || "/placeholder.svg",
    };

    setProducts((prev) => [...prev, newProduct]);
    toast.success("Product added");
    setOpenModal(false);
    setForm({
      name: "",
      category: "",
      stock: "",
      price: "",
      status: "Active",
      image: "",
    });
  };

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
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => setOpenModal(true)} className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button
              onClick={() => setOpenModal(true)}
              size="icon"
              className="sm:hidden"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-5">
            {products.map((product) => (
              <Card
                key={product.id}
                className="hover:border-primary/40 border-2 transition-all duration-150"
              >
                <CardContent className="p-3 sm:p-4 flex flex-col">
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-grow text-center">
                    <Badge
                      variant={product.status === "Active" ? "default" : "destructive"}
                      className="mb-1 mx-auto text-xs"
                    >
                      {product.status}
                    </Badge>
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                    <p className="font-bold text-base sm:text-lg mt-1">
                      ₵{product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stock: {product.stock}
                    </p>
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
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {product.category}
                      </p>
                    </div>
                    <Badge
                      variant={product.status === "Active" ? "default" : "destructive"}
                      className="hidden sm:block"
                    >
                      {product.status}
                    </Badge>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm sm:text-base">
                        ₵{product.price.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Product Modal */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-md rounded-md">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                Add Product

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
                />
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

              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Price (₵)</Label>
                  <Input
                    name="price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    type="number"
                  />
                </div>
                <div className="flex-1">
                  <Label>Stock</Label>
                  <Input
                    name="stock"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    type="number"
                  />
                </div>
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  name="image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder=""
                />
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

              <Button onClick={handleAddProduct} className="w-full font-bold mt-2">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
