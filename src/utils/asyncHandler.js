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

const asycnHandlerFun = (func) => {
  return async (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => {
      res.status(400).json({
        status: "failed",
        msg: err,
      });
    });
  };
};

export { asycnHandler };
