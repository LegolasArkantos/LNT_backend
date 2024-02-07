const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  profileID: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "role",
    required: true,
  },

  role: {
    type: String,
    enum: ["Teacher", "Student"],
    required: true,
  },

  notifications: [
    {
      title: String,
      time: {
        type: String,
        default: new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
      },
    },
  ],
});

module.exports = mongoose.model("Notification", notificationSchema);
