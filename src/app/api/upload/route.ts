import { auth } from "@/lib/auth";
import { err, handleError, ok } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return err("Unauthorized", 401);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) return err("file is required", 400);
    if (file.size > 10 * 1024 * 1024) return err("File too large (max 10MB)", 413);

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "valmora/products");
    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
