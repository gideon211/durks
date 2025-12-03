import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart immediately on success page load
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <CheckCircle className="h-20 w-20 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold">Payment Successful</h1>
      <p className="text-gray-600 mt-2">Thank you for your purchase!</p>

      <button
        onClick={() => navigate("/products")}
        className="mt-6 px-6 py-3 bg-black text-white rounded-lg"
      >
        Continue Shopping
      </button>
    </div>
  );
}
