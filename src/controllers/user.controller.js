import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Generate Access and Refresh Token-
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(400, "Something went wrong while generating tokens!");
  }
};

// Register User-
const registerUser = asyncHandler(async (req, res) => {
  // get user detail from front end
  // validation
  // check if already exist : using username and email
  // check for image and check for avatar
  // upload them to cloudinary
  // create user in db : db.create
  // remove password and refresh token field from response
  // check for user creation
  // return res
  const { fullname, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImgLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImg) &&
    req.files.coverImg.length > 0
  ) {
    coverImgLocalPath = req.files?.coverImg[0]?.path;
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required!");
  }

  const coverImg = await uploadOnCloudinary(coverImgLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file not uploaded!");
  }
  const user = await User.create({
    avatarPublicId: avatar.public_id,
    coverImgPublicId: coverImg.public_id,
    fullname,
    avatar: avatar.url,
    coverImg: coverImg?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// Login User-
const loginUser = asyncHandler(async (req, res) => {
  // get req.body from client
  // check validation
  // check if user exist in database
  // check for credentials match
  // access and refresh token
  // send cookie
  // response

  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "Username and Email is Required!");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User Not Found!");
  }

  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "Logged-in successfully"
      )
    );
});

// Logout User-
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfull!"));
});

// Generate Refresh Token-
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (incomingRefreshToken) {
    throw new ApiError(401, "UnAuthorized Request!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired!");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiError(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "Access Token Refreshed!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

// Change User Password-
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect Password!");
  }

  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully!"));
});

// Get Current User-
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { currUser: req.user },
        "User retrieved successfully!"
      )
    );
});

// Update User Detail-
const updateUserDetail = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { currUser: user }, "User updated successfully!")
    );
});

// Update User File Avatar-
const updateAvatarFile = asyncHandler(async (req, res) => {
  const localFilePath = req.files?.avatar[0].path;
  if (!localFilePath) {
    throw new ApiError(401, "Local path not found!");
  }
  const avatar = await uploadOnCloudinary(localFilePath);
  if (!avatar) {
    throw new ApiError(401, "File not uploaded!");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { currUser: user }, "File updated successfully!")
    );
});

// Update User File CoverImg-
const updateCoverImgFile = asyncHandler(async (req, res) => {
  const localFilePath = req.files?.coverImg[0].path;
  if (!localFilePath) {
    throw new ApiError(401, "Local path not found!");
  }
  const coverImg = await uploadOnCloudinary(localFilePath);
  if (!coverImg) {
    throw new ApiError(401, "File not uploaded!");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImg: coverImg.url },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(
      new ApiResponse(200, { currUser: user }, "File updated successfully!")
    );
});

// Get User Channel Profile-
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(400, "User not found!");
  }
  const channel = await User.aggregate([
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subcriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subcriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImg: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(400, "Channel not found!");
  }

  return res.json(
    new ApiResponse(200, { user: channel[0] }, "Profile fetched successfully!")
  );
});

// Get User Watch History-
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: req.user._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Watch history fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(400, "User not authenticated!");
  }
  const user = await User.findById(userId);

  const avatarPublicId = user.avatarPublicId;
  const coverImgPublicId = user.coverImgPublicId;

  // Deletion from cloudinary
  const result = await cloudinary.api.delete_resources(
    [avatarPublicId, coverImgPublicId],
    {
      resource_type: "image",
    }
  );
  console.log(result);
  if (!result) {
    throw new ApiError(500, "Cloudinary deletion Error!");
  }

  // Deletion from MongoDB Database-

  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, { id: userId }, "User deleted successfully!"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserDetail,
  updateAvatarFile,
  updateCoverImgFile,
  getUserChannelProfile,
  getWatchHistory,
  deleteUser,
};
