require("dotenv").config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { Server } = require("socket.io");

const { connectDB } = require("./Configuration/DB.config");

const app = express();

const PORT = process.env.PORT;
// app.locals.BASE_URL = process.env.BASE_URL

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log(process.env.FRONTEND_URL)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

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
const quizRoutes = require("./Routes/Quiz.routes");
const sessionHistoryRoutes = require("./Routes/sessionHistory.routes");



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
app.use("/api/quiz", quizRoutes);
app.use("/api/history", sessionHistoryRoutes);



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

  socket.on("disconnect", () => {
    console.log("User Disconnected ", socket.id);
  });
});
