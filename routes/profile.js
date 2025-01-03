const express = require("express");
const profileRouter = express.Router();
const authMiddleware = require("../middleware");
const {
  friendList,
  sendRequest,
  removeFriend,
  acceptRequest,
  rejectRequest,
} = require("../controller/profileController");

profileRouter.get("/friends", authMiddleware, friendList);

profileRouter.post("/send/:username", authMiddleware, sendRequest);
profileRouter.post("/remove", authMiddleware, removeFriend);

profileRouter.post("/accept", authMiddleware, acceptRequest);
profileRouter.post("/reject", authMiddleware, rejectRequest);

module.exports = profileRouter;
