// src/components/ProductCard.tsx
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "@/context/Authcontext";


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
  const [isModalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth(); // <-- uses your AuthContext

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity < 1) return;

    // If not logged in, show modal and do NOT add to cart
    if (!user) {
      setModalOpen(true);
      return;
    }

    // logged in: proceed
    addToCart({ id, name, price, image, category }, quantity);
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setQuantity(Number.isNaN(val) ? 1 : Math.max(1, val));
  };

  return (
    <>
      <div className="bg-card rounded-xl border-2 border-border overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-150 flex flex-col h-[25rem]">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted block">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow text-center">
          {category && (
            <Badge variant="outline" className="mb-0.5 mx-auto text-xs">
              {category}
            </Badge>
          )}

          <div>
            <h3 className="font-heading font-semibold text-base text-foreground">
              {name}
            </h3>
          </div>

          <p className="font-heading font-semibold text-lg text-foreground ">
            ₵{(price * quantity).toFixed(2)}
          </p>

          <div className="flex flex-col gap-2 mt-auto">
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
                className="w-16 text-center border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="w-full flex justify-center items-center gap-2 font-bold"
            >
              Add to cart
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal when not logged in */}
      <Modal
        isOpen={isModalOpen}
        title="Please sign in to continue"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
            onClick={() => {
                // Save pending add-to-cart details so we can resume after login
                const pending = {
                product: { id, name, price, image, category },
                quantity,
                from: `/products/${id}`, // optional: where user came from
                };
                try {
                localStorage.setItem("pendingAdd", JSON.stringify(pending));
                } catch (err) {
                console.warn("Could not save pending add", err);
                }

                setModalOpen(false);
                navigate("/auth", { state: { from: `/products/${id}` } });
            }}
            >
            Sign In
            </Button>
          </>
        }
      >
        <p className="text-sm">
          You need to be signed in to purchase and manage items. Signing in lets you save your cart and view orders.
        </p>
      </Modal>
    </>
  );
};
