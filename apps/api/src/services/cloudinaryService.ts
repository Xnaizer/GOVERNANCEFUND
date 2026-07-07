import { cloudinary } from "../config/cloudinary";

export interface UploadImageResult {
    url: string;
    publicId: string;
}

export function uploadImage(
    buffer: Buffer,
    opts: { folder: string; publicId?: string },
): Promise<UploadImageResult> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: opts.folder,
                public_id: opts.publicId,
                resource_type: "image",
            },
            (err, result) => {
                if(err || !result) {
                    return reject(err ?? new Error("Cloudinary upload failed"));
                }

                resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        stream.end(buffer);
    });
}