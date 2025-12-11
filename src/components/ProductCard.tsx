import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

interface PackEntry {
  pack: number;
  price: number;
}

interface ProductCardProps {
  id: string | number;
  name: string;
  description?: string;
  image?: string;
  price?: number;
  category?: string;
  size?: string;
  packs?: PackEntry[];
}

interface CartProduct {
  id?: string | number;
  name?: string;
  price?: number;
  image?: string;
  category?: string;
  size?: string;
  pack?: number | string;
  packs?: PackEntry[];
  qty?: number;
}

function formatPrice(p: number | undefined) {
  const n = typeof p === "number" ? p : 0;
  return `₵${n.toFixed(2)}`;
}

function ProductCardInner({
  id,
  name,
  description,
  image,
  price = 0,
  category,
  size,
  packs = [{ pack: 12, price }],
}: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart);

  // memoize derived pack list and initial values
  const stablePacks = useMemo(() => {
    // defensive copy and normalize
    return Array.isArray(packs) && packs.length > 0
      ? packs.map((p) => ({ pack: Number(p.pack) || 1, price: Number(p.price) || 0 }))
      : [{ pack: 1, price: price || 0 }];
  }, [packs, price]);

  const initialPack = stablePacks[0].pack;
  const initialPrice = stablePacks[0].price;

  const [selectedPack, setSelectedPack] = useState<number>(initialPack);
  const [selectedPrice, setSelectedPrice] = useState<number>(initialPrice);
  const [isLoading, setIsLoading] = useState(false);
  const [addedMessage, setAddedMessage] = useState(false);

  // keep timer ref to clear on unmount and avoid leaks
  const addedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // if packs prop changes, sync state with the new initial values
    setSelectedPack(initialPack);
    setSelectedPrice(initialPrice);
  }, [initialPack, initialPrice]);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    };
  }, []);

  const handlePackChange = useCallback((pack: number) => {
    setSelectedPack(pack);
    const found = stablePacks.find((p) => p.pack === pack);
    setSelectedPrice(found ? found.price : stablePacks[0].price);
  }, [stablePacks]);

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    const productToAdd: CartProduct = {
      id,
      name,
      image,
      category,
      size,
      pack: selectedPack,
      packs: stablePacks,
      qty: 1,
    };

    try {
      await addToCart(productToAdd, selectedPack, 1);

      setAddedMessage(true);
      if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
      addedTimerRef.current = window.setTimeout(() => setAddedMessage(false), 2500);
    } catch (err) {
      console.error("Add to cart error:", err);
      try {
        toast.error("Could not add item to cart");
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, [addToCart, id, image, name, category, size, selectedPack, stablePacks, isLoading]);

  const sizeLabel = size ?? "";

  return (
    <div className="bg-card rounded-xl border-2 border-green-200 overflow-hidden hover:border-green-300 hover:shadow-xl transition-all duration-150 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-muted block">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            fetchPriority={"low" as any}
            className="w-full h-full object-cover"
            // keep layout stable
            width={600}
            height={600}
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2373747a' font-size='20'>Image not available</text></svg>";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}

        {sizeLabel && (
          <div className="absolute left-2 bottom-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-black/70 text-white backdrop-blur-sm shadow">
              {sizeLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-grow text-center">
        {category && (
          <Badge variant="outline" className="mb-0.5 mx-auto text-xs">
            {category}
          </Badge>
        )}

        <h3 className="font-heading font-semibold text-sm text-foreground truncate">
          {name}
        </h3>

        <p className="font-heading font-semibold text-sm text-foreground">
          {formatPrice(selectedPrice)}
        </p>

        <div className="flex flex-col gap-2 mt-1">
          <select
            value={String(selectedPack)}
            onChange={(e) => handlePackChange(Number(e.target.value))}
            className="w-full border rounded px-2 py-1 text-center focus:outline-none focus:ring-1 focus:ring-primary font-bold"
            aria-label={`Select pack for ${name}`}
          >
            {stablePacks.map((p) => (
              <option key={p.pack} value={p.pack}>
                {p.pack}
              </option>
            ))}
          </select>

          <Button
            type="button"
            size="sm"
            onClick={handleAddToCart}
            className={`w-full flex justify-center items-center gap-1 font-bold transition-colors ${addedMessage ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
            disabled={isLoading}
            aria-live="polite"
            aria-pressed={addedMessage}
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
}

export const ProductCard = React.memo(ProductCardInner);
export default ProductCard;
