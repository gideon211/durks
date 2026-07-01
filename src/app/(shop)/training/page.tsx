import { Metadata } from "next";
import Training from "@/views/Training";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Juice Training | Duks Juice",
  description:
    "Learn the art of cold-pressed juicing with Duks Juice. Professional training for aspiring juice entrepreneurs.",
  openGraph: {
    title: "Juice Training | Duks Juice",
    description:
      "Professional training for aspiring juice entrepreneurs.",
    url: "https://duksjuice.com/training",
  },
};

export default function TrainingPage() {
  return <Training />;
}
