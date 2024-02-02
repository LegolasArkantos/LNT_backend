const mongoose = require("mongoose");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");
const ChatRoom = require("../Models/ChatRoom.model");

const getAllChatRooms = async (req, res) => {
  const userID = req.user.profileID;

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ error: "invalid" });
  }

  try {
    if (req.user.role === "Teacher") {
      const result = await Teacher.findById(req.user.profileID)
        .select("chatRooms")
        .populate({
          path: "chatRooms",
          populate: [
            {
              path: "participants.participant",
              select: "firstName lastName",
            },
            {
              path: "messages.user.ID",
              select: "firstName lastName",
            },
          ],
        });
        console.log(result)
      res.status(200).send(result);
    } else {
      const result = await Student.findById(req.user.profileID)
        .select("chatRooms")
        .populate({
          path: "chatRooms",
          populate: [
            {
              path: "participants.participant",
              select: "firstName lastName",
            },
            {
              path: "messages.user.ID",
              select: "firstName lastName",
            },
          ],
        });
        console.log(result)
      res.status(200).send(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteChatRoom = async (req, res) => {
  const userID = req.user.profileID;
  const chatID = req.params.chatRoomID;

  try {
    const chat = await ChatRoom.findById(chatID);
    if (chat === null) {
      res.status(404).json({ error: "Invalid chat id." });
    } else {
      for (const part of chat.participants) {
        const userChatRooms = await UserProfile.findById(part).select(
          "chatRooms"
        );
        if (part == userID) {
          const newArray = userChatRooms.chatRooms.filter(
            (item) => item != chatID
          );

          const result = await UserProfile.findByIdAndUpdate(part, {
            $set: { chatRooms: newArray },
          });
        } else {
          if (!userChatRooms.chatRooms.includes(chatID)) {
            const result = await ChatRoom.findByIdAndDelete(chatID);
          }
        }
      }

      res.status(200).json({ message: "Chat deleted successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const createChatRoom = async (req, res) => {
  const userID = req.user.profileID;

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ error: "invalid" });
  }

  try {
    const result = await ChatRoom.findOne({
      "participants.participant": {
        $all: req.body.participants.map((p) => p.participant),
      },
    });

    if (result == null) {
      const chat = new ChatRoom({ participants: req.body.participants });
      await chat.save();

      for (let i = 0; i < req.body.participants.length; i++) {
        if (chat.participants[i].role == "Teacher") {
          const teacher = await Teacher.findById(req.body.participants[i].participant);
          if (teacher) {
            teacher.chatRooms.push(chat._id);
            teacher.save();
          }
        } else {
          const student = await Student.findById(req.body.participants[i].participant);
          if (student) {
            student.chatRooms.push(chat._id);
            student.save();
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const deleteMessage = async (req, res) => {
  const id = req.user.profileID;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("invalid id");
  }

  const chatID = req.body.chatID;
  const messageID = req.body.messageID;

  try {
    await ChatRoom.updateOne(
      { _id: chatID },
      { $pull: { messages: { _id: messageID, userID: id } } }
    );

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

module.exports = {
  getAllChatRooms,
  deleteChatRoom,
  createChatRoom,
  deleteMessage,
};
