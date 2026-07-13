import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder = "profile_pictures",
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (result) {
          resolve(result);
        }
      }
    );
    stream.end(buffer);
  });
};
