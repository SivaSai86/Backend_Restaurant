const db = require("../models/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ error: "Token is Required" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.vendorId = decoded.userId;  // Token contains userId, not vendorId
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};

module.exports = verifyToken;
