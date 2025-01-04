const express = require("express");
const allRouter = express.Router();
const authMiddleware = require("../middleware");
const { getAllUsers } = require("../controller/getAllUsers");

allRouter.get("/", authMiddleware, getAllUsers);

module.exports = allRouter;
