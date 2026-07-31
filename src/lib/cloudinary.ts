import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(buffer: Buffer, filename?: string): Promise<string> {
  const result = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: "duksjuice",
          public_id: filename || undefined,
          resource_type: "image",
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Cloudinary upload failed"));
          } else {
            resolve(uploadResult);
          }
        }
      )
      .end(buffer);
  });
  return result.secure_url;
}

export default cloudinary.v2;
