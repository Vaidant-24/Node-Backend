import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserDetail,
  updateAvatarFile,
  updateCoverImgFile,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImg",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/get-user").get(verifyJWT, getCurrentUser);

router.route("/update-user").post(verifyJWT, updateUserDetail);

router.route("/update-user-avatar").post(
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  updateAvatarFile
);

router.route("/update-user-coverImg").post(
  verifyJWT,
  upload.fields([
    {
      name: "coverImg",
      maxCount: 1,
    },
  ]),
  updateCoverImgFile
);

router
  .route("/get-user-profile/:username")
  .get(verifyJWT, getUserChannelProfile);

router.route("/get-user-watchHistory").get(verifyJWT, getWatchHistory);

export default router;
