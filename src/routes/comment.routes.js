import { Router } from "express";
import { postComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/post-comment/:videoId").post(verifyJWT, postComment);

export default router;
