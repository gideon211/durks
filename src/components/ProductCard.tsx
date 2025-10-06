import { Link } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number; // unit price
  category?: string;
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  price,
  category,
}: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < 1) return;
    // pass unit price, quantity handled in store
    addToCart(
      { id, name, price, image, category },
      quantity
    );
  };

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Math.max(1, Number(e.target.value)));
  };

  return (
    <Link to={`/product/${id}`}>
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-150 flex flex-col h-[25rem]">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow text-center">
          {category && (
            <Badge variant="outline" className="mb-2 mx-auto text-xs">
              {category}
            </Badge>
          )}

          <h3 className="font-heading font-semibold text-base mb-2 text-foreground">
            {name}
          </h3>

          <p className="font-heading font-bold text-lg text-foreground mb-1">
            ₵{(price * quantity).toFixed(2)}
          </p>

          {/* Quantity Selector + Add to Cart */}
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={decrement}
                className="p-1 border rounded hover:bg-gray-100"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                type="number"
                min={1}
                value={quantity}
                onChange={handleInputChange}
                onClick={(e) => e.stopPropagation()}
                className="w-16 text-center border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <button
                type="button"
                onClick={increment}
                className="p-1 border rounded hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="sm"
              onClick={handleAddToCart}
              className="w-full flex justify-center items-center gap-2 font-bold"
            >
              Add to cart
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

