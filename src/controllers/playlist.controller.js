import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const { name, description } = req.body;

  //TODO: create playlist

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(405, "Error while creating playlist..!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { playlist }, "Playlist created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authemticated!");
  }
  const { userId } = req.params;
  //TODO: get user playlists
  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);
  if (!userPlaylist) {
    throw new ApiError(405, "Error while fetching playlist..!");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { userPlaylist }, "Playlist fetched successfully!")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(405, "Error while fetching playlist..!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist fetched successfully!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(405, "User is not authenticated!");
  }
  const playlistId = req.query.playlistId;
  const videoId = req.query.videoId;

  const playlist = await Playlist.findById(playlistId);
  //   console.log(`${playlist.owner} | ${req.user._id}`);
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(405, "Access denied!");
  }

  const updatedPlaylist = await Playlist.updateOne(
    { _id: playlistId },
    { $addToSet: { videos: videoId } }
  );

  if (updatedPlaylist.modifiedCount === 0) {
    return res.status(400).json({
      message: "Video already exists in playlist or playlist not found.",
    });
  }

  const finalPlaylist = await Playlist.findById(playlistId);

  if (!finalPlaylist) {
    return res.status(404).json({ message: "Playlist not found." });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { finalPlaylist }, "Video added to playlist!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
