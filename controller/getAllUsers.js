const { User } = require("../models/userModel");
const connectToDB = require("../utils/db");

const getAllUsers = async (req, res) => {
  const filter = req.query.filter || "";
  const userId = req.userId;

  try {
    await connectToDB();
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: filter, $options: "i" } },
        { username: { $regex: filter, $options: "i" } },
      ],
    });

    return res.status(200).json({
      user: users.map((user) => ({
        name: user.name,
        username: user.username,
        _id: user._id,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllUsers,
};
