import { asycnHandler } from "../utils/asyncHandler.js";

const registerUser = asycnHandler(async (req, res) => {
  console.log("registerUser Called");
  res.status(200).json({
    message: "OK",
  });
});

export { registerUser };
