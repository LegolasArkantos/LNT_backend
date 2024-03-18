require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { Server } = require("socket.io");

const { connectDB } = require("./Configuration/DB.config");

const app = express();

const PORT = process.env.PORT;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

connectDB();

// import routes here
const authRoutes = require("./Routes/Auth.routes");
const studentRoutes = require("./Routes/Student.routes");
const teacherRoutes = require("./Routes/Teacher.routes");
const sessionRoutes = require("./Routes/Session.routes");
const reviewRoutes = require("./Routes/Review.routes");
const chatRoutes = require("./Routes/ChatRoom.route");
const assignmentRoutes = require("./Routes/Assignment.routes")
const notificationRoutes = require('./Routes/Notification.routes');
const aiRoutes = require("./Routes/aiRoutes");
const pollRoutes = require("./Routes/Poll.routes");
const adminRoutes = require("./Routes/Admin.routes");
const noteRoutes = require("./Routes/Note.routes");
const CareerRoutes = require("./Routes/Career.routes");
const ProgressRoutes = require("./Routes/Progress.routes");



// use routes here
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/assignment",assignmentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/career", CareerRoutes);
app.use("/api/progress", ProgressRoutes);



const server = app.listen(PORT, () => {
  console.log("server connected and listening on port " + PORT);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with id: ${socket.id} joined room ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log(data.roomID)
    socket.to(data.roomID).emit("receive_message", data);
    console.log(data);
  })

  socket.on("join:video-call", (data) => {
    const {roomID} = data;
    console.log(roomID);
    io.to(roomID).emit("user:joined", {id: socket.id});
    socket.join(roomID);
  })

  socket.on("user:call", (data) => {
    console.log("whatup")
     io.to(data.to).emit("incoming:call", {from: socket.id, offer: data.offer})
  })

  socket.on("call:accepted", (data) => {
    io.to(data.to).emit("call:accepted", {from: socket.id, ans: data.ans})
  })

  socket.on("peer:nego:needed", (data) => {
    io.to(data.to).emit("peer:nego:needed", {from: socket.id, offer: data.offer})
  })

  socket.on("peer:nego:done", (data) => {
    io.to(data.to).emit("peer:nego:final", {from: socket.id, ans: data.ans})
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected ", socket.id);
  });
});
