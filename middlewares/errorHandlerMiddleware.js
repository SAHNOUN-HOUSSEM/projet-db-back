const errorHandlerMiddleware = (err, req, res, next) => {
  console.error("\n\nError:\n", err);
  const { message = "something went wrong", status = 500 } = err;
  res.status(status).json({ error: message });
};

module.exports = errorHandlerMiddleware;
