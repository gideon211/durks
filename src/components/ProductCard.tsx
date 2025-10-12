// src/components/ProductCard.tsx
import { ShoppingCart, Plus, Minus, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/Authcontext";

interface ProductCardProps {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  category?: string;
  size?: string; // <--- new optional prop for drink size (e.g. "500ml", "Large")
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  price,
  category,
  size,
}: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const { user } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity < 1) return;

    try {
      setIsLoading(true);
      await addToCart({ id, name, price, image, category, size }, quantity);

      // Persist pending cart if user isn't logged in
      if (!user) {
        try {
          localStorage.setItem("pendingCart", JSON.stringify(cart));
        } catch (err) {
          console.warn("Could not persist pendingCart to localStorage", err);
        }
      }

      // Show success message for 4 seconds
      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 4000);
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Could not add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setQuantity(Number.isNaN(val) ? 1 : Math.max(1, val));
  };

  // helper: fallback label when size missing
  const sizeLabel = size ? size : "—";

  return (
    <div className="bg-card rounded-xl border-2 border-border overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-150 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted block">
        {/* Image */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          // loading="lazy" // optionally enable lazy loading
        />

        {/* Bottom-left size banner */}
        <div className="absolute left-2 bottom-2 flex items-center gap-2">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold
                       bg-black/70 text-white backdrop-blur-sm shadow"
            aria-hidden="true"
          >
            {size}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow text-center">
        {category && (
          <Badge variant="outline" className="mb-0.5 mx-auto text-xs">
            {category}
          </Badge>
        )}

        <h3 className="font-heading font-semibold text-sm text-foreground">{name}</h3>

        {/* show description if available */}
        {/* {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>} */}

        <p className="font-heading font-semibold text-sm text-foreground mt-2">
          ₵{(price * quantity).toFixed(2)}
        </p>

        <div className="flex flex-col gap-2 mt-1.5">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={decrement}
              className="p-1 border rounded hover:bg-gray-100"
              aria-label={`Decrease ${name} quantity`}
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={handleInputChange}
              className="w-16 text-center border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              aria-label={`${name} quantity`}
            />

            <button
              type="button"
              onClick={increment}
              className="p-1 border rounded hover:bg-gray-100"
              aria-label={`Increase ${name} quantity`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            className={`w-full flex justify-center items-center gap-2 font-bold transition-colors ${
              addedMessage ? "bg-green-500 hover:bg-green-600 text-white" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : addedMessage ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Item added!
              </>
            ) : (
              <>
                Add to cart <ShoppingCart className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
