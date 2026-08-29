import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import stream from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// To upload a image or 4 images to a cloudinary
export const upload = multer({ storage: multer.memoryStorage() });

// Upload an image to Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "Polling-app") => {
  return new Promise((resolve, reject) => {
    const uploadSream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        resolve(result);
      },
    );
    const readableStream = new stream.Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);

    readableStream.pipe(uploadSream);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );

    return result;
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error
    );

    throw new Error("Failed to delete image");
  }
};
