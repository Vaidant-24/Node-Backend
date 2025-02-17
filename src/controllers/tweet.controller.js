import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const { content } = req.body;

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(405, "Error while creating tweet..!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { tweet }, "Tweet created successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!tweets) {
    throw new ApiError(405, "Error while fetching tweets..!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { tweets }, "Tweet fetched successfully!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }

  const { tweetId } = req.params;
  const { content } = req.body;

  const tweet = await Tweet.findById(tweetId);
  //   console.log(`${req.user._id} | ${tweet.owner}`);
  if (req.user._id.toString() !== tweet.owner.toString()) {
    throw new ApiError(405, "User don't have access to update this tweet!");
  }
  const updateTweet = await Tweet.findByIdAndUpdate(tweetId, {
    $set: {
      content,
    },
  });

  if (!updateTweet) {
    throw new ApiError(405, "Error while updating..!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { updateTweet }, "Tweet updated successfully!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }

  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  //   console.log(`${req.user._id} | ${tweet.owner}`);
  if (req.user._id.toString() !== tweet.owner.toString()) {
    throw new ApiError(405, "User don't have access to delete this tweet!");
  }
  const delTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!delTweet) {
    throw new ApiError(405, "Error while deleting tweet..!");
  }

  return res
    .status(200)
    .json(
      new ApiError(
        200,
        { deletedTweet: delTweet },
        "Tweet deleted successfully!"
      )
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
