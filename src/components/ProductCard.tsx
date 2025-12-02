// src/components/ProductCard.tsx
import React, { useState } from "react";
import { ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCartStore } from "@/store/cartStore";
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
  // packs from backend
  packs?: { pack: number; price: number }[];
}

interface CartProduct {
  id?: string | number;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  size?: string;
  pack?: number | string;
  packs?: { pack: number; price: number }[];
  qty?: number;
}

export const ProductCard = ({
  id,
  name,
  description,
  image,
  price = 0,
  category,
  size,
  packs = [{ pack: 12, price }],
}: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { user } = useAuth();

  const initialPack = packs && packs.length ? packs[0].pack : 1;
  const initialPrice = packs && packs.length ? packs[0].price : price;

  const [selectedPack, setSelectedPack] = useState<number>(initialPack);
  const [selectedPrice, setSelectedPrice] = useState<number>(initialPrice);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

 const handlePackChange = (pack: number) => {
  setSelectedPack(pack);
  const packObj = packs.find((p) => p.pack === pack);
  if (packObj) setSelectedPrice(packObj.price);
};


const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const productToAdd: CartProduct = {
    id,
    name,
    image,
    category,
    size,
    pack: selectedPack, // the selected pack number
    packs,             // array of all packs for this product
    qty: 1,
  };

  try {
    // Now addToCart computes price based on selectedPack automatically
    await addToCart(productToAdd, selectedPack, 1);

    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  } catch (err) {
    console.error("Add to cart error:", err);
    toast.error("Could not add to cart");
  } finally {
    setIsLoading(false);
  }
};





  const sizeLabel = size ?? "";

  return (
    <div className="bg-card rounded-xl border-2 border-green-200 overflow-hidden hover:border-green-300 hover:shadow-xl transition-all duration-150 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted block">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

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

        <p className="font-heading font-semibold text-sm text-foreground mt-2">
          ₵{Number(selectedPrice ?? 0).toFixed(2)}
        </p>

        <div className="flex flex-col gap-2 mt-1.5">
          <select
            value={String(selectedPack)}
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

export default ProductCard;
