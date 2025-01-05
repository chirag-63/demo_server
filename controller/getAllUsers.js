const { User } = require("../models/userModel");
const { Profile } = require("../models/profileModel");
const connectToDB = require("../utils/db");

const getAllUsers = async (req, res) => {
  const filter = req.query.filter || "";
  const userId = req.userId;

  try {
    await connectToDB();

    const userProfile = await Profile.findOne({
      user: userId,
    }).populate("pendingRequests.user");

    if (!userProfile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: filter, $options: "i" } },
        { username: { $regex: filter, $options: "i" } },
      ],
    });

    const filteredUsers = users.filter((user) => {

      const isAlreadyFriend = userProfile.friendList.some(
        (friendId) => friendId.toString() === user._id.toString()
      );

      const isRequestSent = userProfile.pendingRequests.some(
        (req) =>
          req.user._id.toString() === user._id.toString() &&
          req.status === "sent"
      );

      return (
        !isAlreadyFriend && (
          isRequestSent ||
        !userProfile.pendingRequests.some(
          (req) => req.user._id.toString() === user._id.toString()
        ))
      );
    });

    const usersWithStatus = filteredUsers.map((user) => {
      const isRequestSent = userProfile.pendingRequests.some(
        (req) =>
          req.user._id.toString() === user._id.toString() &&
          req.status === "sent"
      );

      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        requestStatus: isRequestSent ? "sent" : "none",
      };
    });

    return res.status(200).json({
      user: usersWithStatus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


const getPendingRequests = async (req, res) => {
  const userId = req.userId;

  try {
    await connectToDB()
    const userProfile = await Profile.findOne({ user: userId })
    .populate(
      "pendingRequests.user",
      "name username"
    );

    if (!userProfile) {
      return res.status(404).json({ 
        message: "User profile not found" 
      });
    }

    const receivedRequests = userProfile.pendingRequests
      .filter((request) => request.status === "received")
      .map((request) => request.user);

    return res.status(200).json({ receivedRequests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  getAllUsers,
  getPendingRequests
};
