import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet);
router.route("/getuser-tweet/:userId").get(verifyJWT, getUserTweets);
router.route("/update-tweet/:tweetId").patch(verifyJWT, updateTweet);

export default router;
