import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";

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

export { postComment };
