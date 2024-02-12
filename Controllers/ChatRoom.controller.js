const mongoose = require("mongoose");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");
const ChatRoom = require("../Models/ChatRoom.model");
const Notifications = require("../Models/Notification.model");

const getAllChatRooms = async (req, res) => {
  const userID = req.user.profileID;

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(404).json({ error: "invalid" });
  }

  try {
    if (req.user.role === "Teacher") {
      const result = await Teacher.findById(req.user.profileID)
        .select("chatRooms")
        .populate("chatRooms");
      res.status(200).send(result);
    } else {
      const result = await Student.findById(req.user.profileID)
        .select("chatRooms")
        .populate("chatRooms");
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
    const chatRoom = await ChatRoom.findById(chatID);
    
    if (!chatRoom) {
      res.status(404).json({ error: "Invalid chat ID" });
    } else {
      for (const partData of chatRoom.participants) {
        
        if (partData.role === "Student") {
          const studentChatRooms = await Student.findById(
            partData.participant
          ).select("chatRooms");
          if (partData.participant.toString() === userID) {
            
            studentChatRooms.chatRooms.filter(
              (item) => item !== chatID
            );
            const result = await Student.findByIdAndUpdate(
              partData.participant,
              {
                $set: { chatRooms: studentChatRooms },
              }
            );
          } else {
            if (!studentChatRooms.chatRooms.includes(chatID)) {
              const result = await ChatRoom.findByIdAndDelete(chatID);
              
            }
          }
        } else {
          const teacherChatRooms = await Teacher.findById(
            partData.participant
          ).select("chatRooms");
          if (partData.participant.toString() === userID) {
            teacherChatRooms.chatRooms.filter(
              (item) => item !== chatID
            );

            const result = await Teacher.findByIdAndUpdate(
              partData.participant,
              {
                $set: { chatRooms: teacherChatRooms },
              }
            );
          } else {
            if (!teacherChatRooms.chatRooms.includes(chatID)) {
              const result = await ChatRoom.findByIdAndDelete(chatID);
            }
          }
        }
      }
      res.status(200).send();
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

      for (let i = 0; i < chat.participants.length; i++) {
      // if (req.user.role === "Student") {
      //   const student = await Student.findById(req.user.profileID);
      //   if (student) {
      //     student.chatRooms.push(chat._id);
      //     student.save();
      //   }
      // } else {
      //   const teacher = await Teacher.findById(req.user.profileID);
      //   if (teacher) {
      //     teacher.chatRooms.push(chat._id);
      //     teacher.save();
      //   }
      // }
      if (chat.participants[i].role == "Teacher") {
        const teacher = await Teacher.findById(
          chat.participants[i].participant
        );
        if (teacher) {
          teacher.chatRooms.push(chat._id);
          await teacher.save();
        }
      } else {
        const student = await Student.findById(
          chat.participants[i].participant
        );
        if (student) {
          student.chatRooms.push(chat._id);
          await student.save();
        }
      }
      }
      res.status(200).json({mssg: "Chat created successfully!"});
    }
    else {
      res.status(200).json({mssg: "Chat already exists"});
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const sendMessage = async (req, res) => {
  const chatID = req.body.chatID;
  const message = req.body.message;

  try {
    const chatRoom = await ChatRoom.findOne({ _id: chatID, disabled: false });

    for (const part of chatRoom.participants) {
      if (part.participant != req.user.profileID) {
        if (part.role === "Student") {
          const student = await Student.findById(part.participant);
          const notification = await Notifications.findById(student.notificationsID);
          
          if (!notification) {
            console.log("hello1")
            res.status(404).json({messg: "Notifications not found!"});
          }
          else {
            console.log("hello2")
            notification.notifications.push({title: "Message received from: " + message.user.name, timestamp: message.timestamp });
            await notification.save();
          }
          if (!student.chatRooms.includes(chatID)) {
            student.chatRooms.push(chatID);
            await student.save();
          }
        } else {
          const teacher = await Teacher.findById(part.participant);
          const notification = await Notifications.findById(teacher.notificationsID);
          if (!notification) {
            console.log("hello3")
            res.status(404).json({messg: "Notifications not found!"});
          }
          else {
            console.log("hello4")
            notification.notifications.push({title: "Message received from: " + message.user.name, timestamp: message.timestamp });
            await notification.save();
          }
          if (!teacher.chatRooms.includes(chatID)) {
            teacher.chatRooms.push(chatID);
            await teacher.save();
          }
        }
      }
    }

    console.log("hello chatroom")
    chatRoom.messages.push(message);

    await chatRoom.save();

    res.status(200).json({ message: "Message Sent" });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const getChatroom = async (req, res) => {
  const chatID = req.params.chatID;
  const id = req.user.profileID;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("invalid id");
  }
  try {
    const chatRoom = await ChatRoom.findById(chatID);
    res.status(200).json(chatRoom);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
};

const deleteMessage = async (req, res) => {
  const id = req.user.profileID;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("Invalid ID");
  }

  const chatID = req.body.chatID;
  const messageID = req.body.messageID;

  try {
    const chatRoom = await ChatRoom.findById(chatID);

    // Filter out the message with the given messageID
    chatRoom.messages = chatRoom.messages.filter(
      (message) => message._id.toString() !== messageID
    );

    // Save the updated chatRoom
    await chatRoom.save();

    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getAllChatRooms,
  deleteChatRoom,
  createChatRoom,
  deleteMessage,
  sendMessage,
  getChatroom,
};
