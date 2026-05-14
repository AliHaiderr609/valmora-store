import type { Metadata } from "next";
import { GenderListingPage } from "@/components/products/gender-listing";

export const metadata: Metadata = {
  title: "Men's Clothing",
  description: "Premium men's clothing — shirts, suits, and everyday essentials by Valmora.",
};

export default function MenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <GenderListingPage
      gender="MEN"
      title="Men's Collection"
      description="Tailored fits, premium fabrics, and modern essentials for every occasion."
      searchParams={searchParams}
    />
  );
}
