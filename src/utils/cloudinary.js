import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return `File not found!`;
    // else upload the file
    const respose = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file uploaded!
    console.log("File Uploaded Successfully!");
    console.log(respose.url);
    return respose;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved file
  }
};
