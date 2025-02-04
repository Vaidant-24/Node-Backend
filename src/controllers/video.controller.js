import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const postVideo = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User is not authenticated!");
  }
  const { videoFile, thumbnailFile, title, description } = req.body;
  console.log(videoFile, thumbnailFile, title, description);
  if (
    [videoFile, thumbnailFile, title, description].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;

  const thumbnailLocalPath = req.files?.thumbnailFile[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file required!");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file required!");
  }

  const video = await uploadOnCloudinary(videoLocalPath);

  if (!video) {
    throw new ApiError(400, "Video file not uploaded!");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail file not uploaded!");
  }
  const postVideo = await Video.create({
    videoFile: video.url,
    thumbnailFile: thumbnail.url,
    title,
    description,
    owner: req.user,
    duration: video.duration,
    videoPublicId: video.public_id,
    thumbnailPublicId: thumbnail.public_id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { postVideo }, "Video post successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(400, "User not authenticated!");
  }

  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video Id is invalid!");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  if (video.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // 1. Get the Cloudinary public ID directly from the video document:
  const videoPublicId = video.videoPublicId; // Assuming you store it in the video document

  const thumbnailPublicId = video.thumbnailPublicId;

  if (!videoPublicId) {
    throw new ApiError(500, "Cloudinary Video public ID not found in database");
  }
  if (!thumbnailPublicId) {
    throw new ApiError(
      500,
      "Cloudinary Thumbnail public ID not found in database"
    );
  }

  // 2. Delete from Cloudinary:
  const res1 = await cloudinary.api.delete_resources([thumbnailPublicId], {
    resource_type: "image",
  });
  const res2 = await cloudinary.api.delete_resources([videoPublicId], {
    resource_type: "video",
  });

  if (!res1 || !res2) {
    throw new ApiError(500, "Cloudinary deletion Error");
  }

  // 3. Delete the video record from your database:
  const deleteVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(400, "Video not deleted from MongoDB");
  }
  res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video deleted successfully!"));
});

export { postVideo, deleteVideo };
