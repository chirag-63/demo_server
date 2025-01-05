const express = require("express");
const allRouter = express.Router();
const authMiddleware = require("../middleware");
const {
  getAllUsers,
  getPendingRequests,
} = require("../controller/getAllUsers");

allRouter.get("/", authMiddleware, getAllUsers);
allRouter.get("/pending", authMiddleware, getPendingRequests);

module.exports = allRouter;
