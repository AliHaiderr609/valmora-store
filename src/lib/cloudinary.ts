import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadToCloudinary(
  file: Buffer,
  folder = "valmora"
): Promise<{ url: string; publicId: string }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary not configured. Set CLOUDINARY_* env vars.");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(file);
  });
}

export async function deleteFromCloudinary(publicId: string) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return;
  await cloudinary.uploader.destroy(publicId);
}
