const { Profile } = require("../models/profileModel");
const { User } = require("../models/userModel");
const connectToDB = require("../utils/db");

const myProfile = async (req, res) => {
  const userId = req.userId;
  try {
    await connectToDB();
    const userProfile = await Profile.findOne({
      user: userId,
    }).populate("user");

    if (!userProfile) {
      return res.status(404).json({
        message: "My Profile not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const friendCount = userProfile.friendList.length;

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        username: user.username
      },
      friendCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching My Profie",
    });
  }
};

//see frienlist
const friendList = async (req, res) => {
  try {
    await connectToDB();
    const userProfile = await Profile.findOne({ user: req.userId }).populate({
      path: "friendList",
      select: "name username",
    });
    res.status(200).json(userProfile.friendList);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching friends list",
    });
  }
};

//send friend req to someone
const sendRequest = async (req, res) => {
  const { username } = req.params;
  const userId = req.userId;
  try {
    await connectToDB();
    const sender = await User.findById(userId);
    const receiver = await User.findOne({ username });
    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const senderProfile = await Profile.findOne({
      user: sender._id,
    });

    if (senderProfile.friendList.includes(receiver._id)) {
      return res.status(400).json({
        message: "Already friends",
      });
    }

    const pendingRequest = senderProfile.pendingRequests.findIndex(
      (req) =>
        req.user.toString() === receiver._id.toString() && req.status === "sent"
    );
    if (pendingRequest !== -1) {
      return res.status(400).json({
        message: "Request already sent",
      });
    }

    senderProfile.pendingRequests.push({
      user: receiver._id,
      status: "sent",
    });
    await senderProfile.save();

    const receiverProfile = await Profile.findOne({
      user: receiver._id,
    });
    receiverProfile.pendingRequests.push({
      user: sender._id,
      status: "received",
    });
    await receiverProfile.save();

    return res.status(200).json({
      message: "Friend request sent",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error sending friend request",
    });
  }
};

//remove existing friend
const removeFriend = async (req, res) => {
  const userId = req.userId;
  const friendId = req.body.friendId;

  try {
    await connectToDB();
    const userProfile = await Profile.findOne({
      user: userId,
    });

    if (!userProfile.friendList.includes(friendId)) {
      return res.status(404).json({
        message: "Friend not found",
      });
    }

    userProfile.friendList = userProfile.friendList.filter(
      (friend) => friend.toString() !== friendId.toString()
    );
    await userProfile.save();

    const friendProfile = await Profile.findOne({ user: friendId });

    friendProfile.friendList = friendProfile.friendList.filter(
      (friend) => friend.toString() !== userId.toString()
    );
    await friendProfile.save();

    return res.status(200).json({
      message: "Friend removed",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error removing friend",
    });
  }
};

//accept pending req
const acceptRequest = async (req, res) => {
  const userId = req.userId;
  const senderId = req.body.senderId;

  try {
    await connectToDB();
    const userProfile = await Profile.findOne({
      user: userId,
    });

    const pendingRequest = userProfile.pendingRequests.find(
      (req) =>
        req.user.toString() === senderId.toString() && req.status === "received"
    );

    if (!pendingRequest) {
      return res.status(400).json({
        message: "No pending request from the user",
      });
    }

    userProfile.pendingRequests = userProfile.pendingRequests.filter(
      (req) => req.user.toString() !== senderId.toString()
    );
    userProfile.friendList.push(senderId);
    await userProfile.save();

    const senderProfile = await Profile.findOne({
      user: senderId,
    });

    senderProfile.pendingRequests = senderProfile.pendingRequests.filter(
      (req) =>
        req.user.toString() !== userId.toString() || req.status !== "sent"
    );

    senderProfile.friendList.push(userId);
    await senderProfile.save();

    return res.status(200).json({
      message: "Friend request accepted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error accepting request",
    });
  }
};

//reject pending req
const rejectRequest = async (req, res) => {
  const userId = req.userId;
  const senderId = req.body.senderId;
  try {
    await connectToDB();

    const userProfile = await Profile.findOne({
      user: userId,
    });

    const pendingRequest = userProfile.pendingRequests.find(
      (req) =>
        req.user.toString() === senderId.toString() && req.status === "received"
    );

    if (!pendingRequest) {
      return res.status(400).json({
        message: "No pending request from the user",
      });
    }

    userProfile.pendingRequests = userProfile.pendingRequests.filter(
      (req) => req.user.toString() !== senderId.toString()
    );
    await userProfile.save();

    const senderProfile = await Profile.findOne({ user: senderId });
    senderProfile.pendingRequests = senderProfile.pendingRequests.filter(
      (req) => req.user.toString() !== userId.toString()
    );
    await senderProfile.save();

    return res.status(200).json({
      message: "Friend request rejected",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error rejecting request",
    });
  }
};

module.exports = {
  friendList,
  sendRequest,
  removeFriend,
  acceptRequest,
  rejectRequest,
  myProfile,
};
