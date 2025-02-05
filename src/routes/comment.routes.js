import { Router } from "express";
import {
  postComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/post-comment/:videoId").post(verifyJWT, postComment);
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);
router.route("/delete-comment/:commentId").post(verifyJWT, deleteComment);

export default router;
