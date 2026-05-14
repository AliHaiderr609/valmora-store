import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bannerSchema } from "@/lib/validators";
import { err, handleError, ok } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const position = url.searchParams.get("position") ?? undefined;
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: { order: "asc" },
    });
    return ok(banners);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }
    const data = bannerSchema.parse(await req.json());
    const banner = await prisma.banner.create({ data });
    return ok(banner);
  } catch (e) {
    return handleError(e);
  }
}
