const express = require("express");
const router = express.Router();
const authRouter = require("./auth");
const profileRouter = require("./profile")
const allRouter = require('./allUsers')

router.use("/auth", authRouter);
router.use("/profile", profileRouter)
router.use("/all", allRouter)

module.exports = router;
