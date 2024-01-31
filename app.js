require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const {Server} = require('socket.io');

const {connectDB} = require('./Configuration/DB.config');

const app = express();


const PORT = process.env.PORT;

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));



connectDB();




// import routes here
const authRoutes = require('./Routes/Auth.routes');
const studentRoutes = require('./Routes/Student.routes');
const teacherRoutes = require('./Routes/Teacher.routes');
const sessionRoutes = require('./Routes/Session.routes');
const reviewRoutes = require('./Routes/Review.routes');

// use routes here
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);


const server = app.listen(PORT, () => {
    console.log("server connected and listening on port " + PORT);
});

const io = new Server(server);

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("join_room", (data) => {
        socket.join(data);
        console.log(`User with id: ${socket.id} joined room ${data}`)
    })

    socket.on("disconnect", () => {
        console.log("User Disconnected ", socket.id);
    });
});
