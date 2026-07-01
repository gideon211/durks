import { Metadata } from "next";
import { Suspense } from "react";
import Auth from "@/views/Auth";

export const metadata: Metadata = {
  title: "Login | Duks Juice",
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      }
    >
      <Auth />
    </Suspense>
  );
}
