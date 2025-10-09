import AdminLayout from "@/admin/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Grid3x3, List } from "lucide-react";
import { useState } from "react";

const products = [
  {
    id: "PROD-001",
    name: "Mango Sunrise",
    category: "Pure Juice",
    stock: 450,
    price: "GH₵ 12",
    status: "Active",
    image: "/placeholder.svg",
  },
  {
    id: "PROD-002",
    name: "Green Detox",
    category: "Cleanse Juice",
    stock: 230,
    price: "GH₵ 15",
    status: "Active",
    image: "/placeholder.svg",
  },
  {
    id: "PROD-003",
    name: "Berry Blast",
    category: "Smoothies",
    stock: 180,
    price: "GH₵ 18",
    status: "Active",
    image: "/placeholder.svg",
  },
  {
    id: "PROD-004",
    name: "Tropical Mix",
    category: "Cut Fruits",
    stock: 85,
    price: "GH₵ 10",
    status: "Low Stock",
    image: "/placeholder.svg",
  },
];

export default function Products() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog and pricing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setViewMode("grid")}>
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="bulk">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover-lift">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <Badge
                        variant={
                          product.status === "Active" ? "default" : "destructive"
                        }
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{product.price}</span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 flex items-center gap-4 hover:bg-muted/50"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <Badge
                      variant={
                        product.status === "Active" ? "default" : "destructive"
                      }
                    >
                      {product.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-bold">{product.price}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
