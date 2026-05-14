import type { Metadata } from "next";
import { GenderListingPage } from "@/components/products/gender-listing";

export const metadata: Metadata = {
  title: "Boys' Clothing",
  description: "Playful, durable, premium clothing for boys — designed to keep up.",
};

export default function BoysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <GenderListingPage
      gender="BOYS"
      title="Boys' Collection"
      description="Adventures call for comfort and style. Made for kids who never sit still."
      searchParams={searchParams}
    />
  );
}
