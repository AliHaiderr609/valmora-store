import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-7xl text-muted-foreground">404</p>
      <h1 className="mt-4 font-serif text-3xl md:text-4xl">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you're looking for has moved or doesn't exist. Let's get you back to
        what's in season.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    </div>
  );
}
