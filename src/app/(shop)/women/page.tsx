import type { Metadata } from "next";
import { GenderListingPage } from "@/components/products/gender-listing";

export const metadata: Metadata = {
  title: "Women's Clothing",
  description: "Effortless luxury for women — dresses, knitwear, and timeless silhouettes.",
};

export default function WomenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <GenderListingPage
      gender="WOMEN"
      title="Women's Collection"
      description="Sophisticated silhouettes and refined fabrics, designed to last."
      searchParams={searchParams}
    />
  );
}
