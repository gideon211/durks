import { Metadata } from "next";
import NotFound from "@/views/NotFound";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Duks Juice",
  robots: { index: false },
};

export default function NotFoundPage() {
  return <NotFound />;
}
