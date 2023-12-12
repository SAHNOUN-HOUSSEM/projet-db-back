const AppError = require("../utilities/AppError");

const notFoundMiddleware = (req, res) => {
  throw new AppError("page not found", 404);
};

module.exports = notFoundMiddleware;
