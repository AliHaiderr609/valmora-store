import type { Metadata } from "next";
import Link from "next/link";

import { HelpNav } from "@/components/help/help-nav";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Vailmora size charts for Men, Women, and Boys collections.",
  alternates: { canonical: "/help/size-guide" },
};

const MEN_SIZES = [
  { size: "XS", chest: "86–91", waist: "71–76", hips: "86–91" },
  { size: "S", chest: "91–96", waist: "76–81", hips: "91–96" },
  { size: "M", chest: "96–101", waist: "81–86", hips: "96–101" },
  { size: "L", chest: "101–106", waist: "86–91", hips: "101–106" },
  { size: "XL", chest: "106–111", waist: "91–96", hips: "106–111" },
  { size: "XXL", chest: "111–116", waist: "96–101", hips: "111–116" },
];

const WOMEN_SIZES = [
  { size: "XS", bust: "81–86", waist: "61–66", hips: "86–91" },
  { size: "S", bust: "86–91", waist: "66–71", hips: "91–96" },
  { size: "M", bust: "91–96", waist: "71–76", hips: "96–101" },
  { size: "L", bust: "96–101", waist: "76–81", hips: "101–106" },
  { size: "XL", bust: "101–106", waist: "81–86", hips: "106–111" },
];

const BOYS_SIZES = [
  { age: "4Y", height: "98–104", chest: "56–58" },
  { age: "6Y", height: "110–116", chest: "60–62" },
  { age: "8Y", height: "122–128", chest: "64–66" },
  { age: "10Y", height: "134–140", chest: "68–70" },
  { age: "12Y", height: "146–152", chest: "72–74" },
];

export default function SizeGuidePage() {
  return (
    <div className="container-x py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Help centre
        </p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">Size guide</h1>
        <p className="mt-4 text-muted-foreground">
          All measurements are in centimetres. If you are between sizes, size up for a relaxed fit or
          down for a more tailored look.
        </p>
      </header>

      <HelpNav current="/help/size-guide" />

      <div className="mx-auto mt-14 max-w-3xl space-y-12">
        <SizeTable
          title="Men"
          headers={["Size", "Chest", "Waist", "Hips"]}
          rows={MEN_SIZES.map((r) => [r.size, r.chest, r.waist, r.hips])}
        />

        <SizeTable
          title="Women"
          headers={["Size", "Bust", "Waist", "Hips"]}
          rows={WOMEN_SIZES.map((r) => [r.size, r.bust, r.waist, r.hips])}
        />

        <SizeTable
          title="Boys"
          headers={["Age", "Height (cm)", "Chest (cm)"]}
          rows={BOYS_SIZES.map((r) => [r.age, r.height, r.chest])}
        />

        <section className="rounded-xl border bg-secondary/30 p-6 text-sm text-muted-foreground">
          <h2 className="font-serif text-xl text-foreground">Still unsure?</h2>
          <p className="mt-3 leading-relaxed">
            Each product page includes fit notes and customer reviews. For personalised advice,{" "}
            <Link href="/contact" className="font-medium text-foreground underline underline-offset-2">
              contact our team
            </Link>{" "}
            with your measurements and the item you are considering.
          </p>
        </section>
      </div>
    </div>
  );
}

function SizeTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-2xl">{title}</h2>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j} className={j === 0 ? "font-medium" : ""}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
