const asycnHandler = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      msg: error,
    });
  }
};

// OR

const asycnHandlerFun = (func) => async (req, res, next) => {
  Promise.then(func(req, res, next)).catch((err) => {
    res.status(400).json({
      status: "failed",
      msg: err,
    });
  });
};
