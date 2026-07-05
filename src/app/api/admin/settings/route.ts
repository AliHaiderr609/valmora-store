import type { Prisma } from "@prisma/client";
import { revalidateTag } from "next/cache";

import { err, handleError, ok } from "@/lib/api";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS, type AppSettings } from "@/lib/settings";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }

    const rows = await prisma.siteSetting.findMany();
    const result = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
    for (const row of rows) {
      if (row.key in DEFAULT_SETTINGS) result[row.key] = row.value;
    }
    return ok(result as AppSettings);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return err("Unauthorized", 401);
    }

    const body = (await req.json()) as Partial<AppSettings>;

    await Promise.all(
      Object.entries(body)
        .filter(([key]) => key in DEFAULT_SETTINGS)
        .map(([key, value]) =>
          prisma.siteSetting.upsert({
            where: { key },
            update: { value: value as Prisma.InputJsonValue },
            create: { key, value: value as Prisma.InputJsonValue },
          }),
        ),
    );

    revalidateTag("settings");
    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
