import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { BlogPostListItem } from "@/lib/services/blog";

export function BlogPostCard({ post }: { post: BlogPostListItem }) {
  const date = post.publishedAt ?? post.createdAt;

  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary/60">
            <span className="font-serif text-4xl text-muted-foreground/30">V</span>
          </div>
        )}
        {post.category && (
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              {post.category.name}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {post.views.toLocaleString()}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-snug transition-colors group-hover:text-gold-600">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name ?? "Author"}
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
              {(post.author.name ?? "A").charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium">{post.author.name ?? "Vailmora Team"}</span>
        </div>
      </div>
    </Link>
  );
}
