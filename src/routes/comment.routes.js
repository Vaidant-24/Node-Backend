import { Router } from "express";
import {
  postComment,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/post-comment/:videoId").post(verifyJWT, postComment);
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);

export default router;
