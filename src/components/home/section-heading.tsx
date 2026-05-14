import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = "View all",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className
      )}
    >
      <div className={cn(align === "center" && "max-w-xl")}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-3xl md:text-4xl">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
        >
          {hrefLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
