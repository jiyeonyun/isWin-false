import "dotenv/config";

export default {
    expo: {
        name: "is-win",
        slug: "is-win",
        scheme: "iswin",
        extra: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
        },
    },
};
