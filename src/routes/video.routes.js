import { Router } from "express";
import { postVideo, deleteVideo } from "../controllers/video.controller.js";
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
export default router;
