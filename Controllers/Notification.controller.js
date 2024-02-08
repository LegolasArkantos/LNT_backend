const mongoose = require("mongoose");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");
const Notification = require("../Models/Notification.model");

const getNotifications = async (req, res) => {
  const userID = req.user.profileID;

  try {
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(404).json({ error: "invalid" });
    }

    const notificationBox = await Notification.findOne({
      profileID: userID,
    })

    res.status(200).json(notificationBox.notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteNotification = async (req, res) => {
  const userID = req.user.profileID;
  const notiID = req.params.notificationID;
  console.log(notiID)
  try {
    const notificationBox = await Notification.findOne({
      profileID: userID,
    })
    console.log(notificationBox)
    notificationBox.notifications = notificationBox.notifications.filter((notification) => notification._id.toString() !== notiID);
    console.log(notificationBox.notifications)
    await notificationBox.save();
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getNotifications, deleteNotification };
