import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";

const postComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const ownerId = req.user._id;
  const { content } = req.body;
  const { videoId } = req.params;

  const createComment = await Comment.create({
    content,
    owner: ownerId,
    video: videoId,
  });

  if (!createComment) {
    throw new ApiError(405, "Error while posting comment..!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { createComment }, "Comment posted successfully!")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User not authenticated!");
  }

  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(commentId);

  // console.log(` userId: ${req.user._id}\n ownerId: ${comment.owner}`);
  if (req.user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(405, "User don't have access to update this comment!");
  }

  const updateComment = await Comment.findByIdAndUpdate(commentId, {
    $set: {
      content: content,
    },
  });

  if (!updateComment) {
    throw new ApiError(405, "Error while updating comment..!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { prevComment: updateComment },
        "Comment updated successfully!"
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  // console.log(` userId: ${req.user._id}\n ownerId: ${comment.owner}`);

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(405, "User don't have access to delete this comment!");
  }
  const delComment = await Comment.findByIdAndDelete(commentId);
  if (!delComment) {
    throw new ApiError(405, "Error while deleting comment..!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedComment: delComment },
        "Comment deleted successfully!"
      )
    );
});

const getAllCommentsForVideo = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const { videoId } = req.params;
  // console.log(videoId);
  const comments = await Comment.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        videos: {
          $first: "$videos",
        },
      },
    },
    {
      $match: {
        "videos._id": new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $project: {
        content: 1,
        owner: 1,
        video: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!comments) {
    throw new ApiError(405, "Error while fetching videos..!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { comments }, "Video fetched successfully!"));
});

export { postComment, updateComment, deleteComment, getAllCommentsForVideo };
