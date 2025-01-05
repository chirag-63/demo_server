const { User } = require("../models/userModel");
const { Profile } = require("../models/profileModel");
const jwt = require("jsonwebtoken");
const { signupSchema, loginSchema } = require("../models/zodSchema");
const bcrypt = require("bcryptjs");
const connectToDB = require("../utils/db");
require("dotenv").config();

const signup = async (req, res) => {
  const body = req.body;
  const parsedData = signupSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }
  try {
    await connectToDB();
    const existingUser = await User.findOne({
      username: parsedData.data.username,
    });

    if (existingUser) {
      return res.status(411).json({
        message: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

    const user = await User.create({
      name: parsedData.data.name,
      username: parsedData.data.username,
      password: hashedPassword,
    });

    await Profile.create({
      user: user._id,
      friendList: [],
      pendingRequests: [],
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while signup" });
  }
};

const login = async (req, res) => {
  const body = req.body;
  const parsedData = loginSchema.safeParse(body);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  try {
    await connectToDB();
    const existingUser = await User.findOne({
      username: parsedData.data.username,
    });

    if (!existingUser) {
      return res.status(403).json({
        message: "No user exists with this username",
      });
    }

    const isValidPassword = await bcrypt.compare(
      parsedData.data.password,
      existingUser.password
    );

    if (!isValidPassword) {
      return res.status(403).json({
        message: "Incorrect password!",
      });
    }

    const token = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        username: existingUser.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while signup" });
  }
};

module.exports = {
  signup,
  login,
};
