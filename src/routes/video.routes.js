import { Router } from "express";
import {
  postVideo,
  deleteVideo,
  getVideoById,
  updateVideoById,
  getAllVideos,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/post-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnailFile",
      maxCount: 1,
    },
  ]),
  postVideo
);

router.route("/delete-video/:videoId").post(verifyJWT, deleteVideo);
router.route("/get-video/:videoId").get(verifyJWT, getVideoById);
router.route("/update-video/:videoId").patch(verifyJWT, updateVideoById);
router.route("/getAll-video/").get(verifyJWT, getAllVideos);

export default router;
