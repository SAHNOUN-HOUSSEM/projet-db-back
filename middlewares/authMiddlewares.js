require("dotenv").config();

const AppError = require("../utilities/AppError");
const asyncHandler = require("../utilities/asyncHandler");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports.isAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader ? authHeader.split(" ")[1] : null;
  if (!token) {
    throw new AppError("Unauthorized", 401);
  }
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      //forbidden
      //invalid token
      throw new AppError("Unauthorized", 403);
    }
    req.clientId = payload.clientId;
    next();
  });
};
