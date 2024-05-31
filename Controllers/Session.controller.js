const Session = require('../Models/Session.model');
const Student = require('../Models/Student.model');
const Teacher = require('../Models/Teacher.model');
const ReviewData = require('../Models/ReviewData.model');
const mongoose = require("mongoose");

const createSession = async (req, res) => {
  try {
    const teacherId = req.user.profileID;
    const { startTime, endTime,  subject, sessionPrice,day, sessionDescription, sessionCount } = req.body;

    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    

    const session = await Session.create({
      teacher: teacherId,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      students: [],
      startTime,
      endTime,
      status: 'In Review',
      paymentStatus: 'pending',
      subject,
      sessionPrice,
      sessionDescription,
      day,
      sessionCounter: { // Use an embedded object here
        sessionCount // Correct assignment of sessionCount
      }
    });

    await ReviewData.create({
      session: session._id,
      teacher: teacherId,
    })

    // Add session to teacher's sessions array
    teacher.sessions.push(session._id);
    
    // Check if subject already exists in subjectsTaught
    if (!teacher.subjectsTaught.includes(subject)) {
        teacher.subjectsTaught.push(subject);
      }
  
      // Check if time slot already exists in availableTimeSlots
      const timeSlot = `${startTime}-${endTime}`;
      if (!teacher.availableTimeSlots.includes(timeSlot)) {
        teacher.availableTimeSlots.push(timeSlot);
      }

      await teacher.save();
    return res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAvailableSessions = async (req, res) => {
  try {
    const studentId = req.user.profileID;
    const matchedSessions = [];
    const availableSessions = await Session.find({ status: 'scheduled', students: { $nin: [studentId] } }).populate('teacher');
    const student = await Student.findById(studentId);

    for (const session of availableSessions) {
      const teacher = session.teacher;
      var count = 0;
      
      for (var i = 0; i < teacher.personality.length; i++) {
        if (student.personality[i] === teacher.personality[i]) {
          count++;
          
        }
      }
      
      
      matchedSessions.push(session);
    }
    
    matchedSessions.sort((a, b) => b.count - a.count);
    const first10Sessions = matchedSessions.slice(0, 10);
    res.status(200).json({ sessions: first10Sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const joinSession = async (req, res) => {
    try {
      const {sessionId} = req.params;
      const studentId  = req.user.profileID;
  
      // Find the session
      const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      if (session.status !== 'scheduled') {
        return res.status(400).json({ message: 'Cannot join a completed or canceled session' });
      }

      // Find the student
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Check if the session is already booked
      if (session.students.includes(studentId)) {
        return res.status(400).json({ message: 'Student is already booked for this session' });
      }
  
      // Find the teacher associated with the session
      const teacher = await Teacher.findById(session.teacher);
  
      // Add student to the session's students array
      session.students.push(studentId);
  
      // Add teacherId to student
      student.teachers.push(teacher._id);
  
      // Add session to student's sessions array
      student.sessions.push(sessionId);
  
      // Add studentId to teacher
      teacher.students.push(studentId);
  
      // Save changes
      await session.save();
      await student.save();
      await teacher.save();
  
      res.status(200).json({ message: 'Student joined session successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  

  const updateSession = async (req, res) => {
    try {
      const teacherId = req.user.profileID;
      const sessionId  = req.params.sessionId;
      const { startTime, endTime, status, paymentStatus, subject, sessionPrice ,day, sessionDescription} = req.body;
  
      // Find the session
      const session = await Session.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      // Check if the teacher is the creator of the session
      if (session.teacher.toString() !== teacherId) {
        return res.status(403).json({ message: 'You are not authorized to update this session' });
      }
  
      // Update session details
      session.startTime = startTime || session.startTime;
      session.endTime = endTime || session.endTime;
      session.status = status || session.status;
      session.paymentStatus = paymentStatus || session.paymentStatus;
      session.subject = subject || session.subject;
      session.sessionPrice = sessionPrice || session.sessionPrice;
      session.day = day || session.day;
      session.sessionDescription = sessionDescription || session.sessionDescription;

      await session.save();
  
      res.status(200).json({ message: 'Session updated successfully', session });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  const getSpecificSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Find the session
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.status(200).json({ session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const searchSessionbyQuery = async (req, res) => {
  const profileID = req.user.profileID
  const searchValue = req.query.value;
  const matchedSessions = [];

  if (!mongoose.Types.ObjectId.isValid(profileID)) {
    return res.status(404).json({ error: "invalid" });
  }

  try {
    const sessions = await Session.find({ subject: { $regex: searchValue, $options: 'i' }, status: "scheduled" }).populate('teacher students assignment');
    const student = await Student.findById(profileID);
    for (const session of sessions) {
      const teacher = session.teacher;
      var count = 0;
      for (var i = 0; i < teacher.personality.length; i++) {
        if (student.personality[i] === teacher.personality[i]) {
          count++;
        }
      }
      
      matchedSessions.push({count, session});
    }
    matchedSessions.sort((a, b) => b.count - a.count);
    res.status(200).json(matchedSessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const launchSession = async (req, res) => {
  try {
      const sessionId = req.params.sessionId;
      const session = await Session.findByIdAndUpdate(sessionId, {sessionStarted: true}, {new: true});
      
      if (!session) {
          return res.status(500).json({message: 'failed to launch session'});
      }
      s
      res.sendStatus(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const endSession = async (req, res) => {
  try {
      const sessionId = req.params.sessionId;
      const session = await Session.findByIdAndUpdate(sessionId, {sessionStarted: false, $inc: { 'sessionCounter.currentCount': 1 }}, {new: true});
      if (!session) {
          return res.status(500).json({message: 'failed to end session'});
      }
      res.sendStatus(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const sessionCompleted = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await Session.findByIdAndUpdate(sessionId, {status: "completed"}, {new: true});
    if (!session) {
        return res.status(500).json({message: 'failed to finish course'});
    }
    
    res.sendStatus(200);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
  
module.exports = {
    createSession,
    getAvailableSessions,
    joinSession,
    updateSession,
    getSpecificSession,
    searchSessionbyQuery,
    launchSession,
    endSession,
    sessionCompleted
};