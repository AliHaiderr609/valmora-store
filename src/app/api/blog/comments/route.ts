import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, handleError } from "@/lib/api";

const commentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().min(3).max(2000),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return err("You must be signed in to comment.", 401);

    const data = commentSchema.parse(await req.json());

    const post = await prisma.blogPost.findUnique({
      where: { id: data.postId, isPublished: true },
      select: { id: true },
    });
    if (!post) return err("Post not found.", 404);

    const comment = await prisma.blogComment.create({
      data: {
        postId: data.postId,
        userId: session.user.id,
        content: data.content,
        isApproved: true,
      },
    });

    return ok(comment);
  } catch (e) {
    return handleError(e);
  }
}
