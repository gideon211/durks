// src/components/ProductCard.tsx
import { ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
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
  price?: number; 
  category?: string;
  size?: string;
  // Dynamic packs from backend: array of pack sizes and their prices
  packs?: { pack: number; price: number }[];
}

// Extend Product type in cart store if necessary
interface CartProduct {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  category?: string;
  size?: string;
  pack?: number;
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  price = 0,
  category,
  size,
  packs = [{ pack: 12, price: price }], // default pack
}: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const [selectedPack, setSelectedPack] = useState<number>(packs[0].pack);
  const [selectedPrice, setSelectedPrice] = useState<number>(packs[0].price);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  const { user } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Create a product object compatible with cart store
      const productToAdd: CartProduct = {
        id,
        name,
        price: selectedPrice,
        image,
        category,
        size,
        pack: selectedPack,
      };

      await addToCart(productToAdd, selectedPack);

      // Persist pending cart if user isn't logged in
      if (!user) {
        try {
          localStorage.setItem("pendingCart", JSON.stringify(cart));
        } catch (err) {
          console.warn("Could not persist pendingCart to localStorage", err);
        }
      }

      setAddedMessage(true);
      setTimeout(() => setAddedMessage(false), 4000);
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error("Could not add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackChange = (pack: number) => {
    setSelectedPack(pack);
    const packObj = packs.find((p) => p.pack === pack);
    if (packObj) setSelectedPrice(packObj.price);
  };

  const sizeLabel = size ? size : "";

  return (
    <div className="bg-card rounded-xl border-2 border-green-200 overflow-hidden hover:border-green-300 hover:shadow-xl transition-all duration-150 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted block">
        {/* Image */}
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {/* Size badge */}
        {sizeLabel && (
          <div className="absolute left-2 bottom-2 flex items-center gap-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold
                         bg-black/70 text-white backdrop-blur-sm shadow"
              aria-hidden="true"
            >
              {sizeLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow text-center">
        {category && (
          <Badge variant="outline" className="mb-0.5 mx-auto text-xs">
            {category}
          </Badge>
        )}

        <h3 className="font-heading font-semibold text-sm text-foreground">{name}</h3>

        {/* Price */}
        <p className="font-heading font-semibold text-sm text-foreground mt-2">
          ₵{selectedPrice.toFixed(2)}
        </p>

        <div className="flex flex-col gap-2 mt-1.5">
          {/* Pack dropdown */}
          <select
            value={selectedPack}
            onChange={(e) => handlePackChange(Number(e.target.value))}
            className="w-full border rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary font-bold"
          >
            {packs.map((p) => (
              <option key={p.pack} value={p.pack}>
                {p.pack}
              </option>
            ))}
          </select>

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
