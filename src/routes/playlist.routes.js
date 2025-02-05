import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/getuser-playlist/:userId").get(verifyJWT, getUserPlaylists);
router.route("/get-playlist/:playlistId").get(verifyJWT, getPlaylistById);
router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist);
router.route("/addVideo-playlist").patch(verifyJWT, addVideoToPlaylist);
router.route("/delete-playlist/:playlistId").post(verifyJWT, deletePlaylist);

export default router;
