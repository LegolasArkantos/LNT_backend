const mongoose = require("mongoose");
const Session = require('../Models/Session.model'); 


const DisplayTeacherSessionsCompleted = async (req, res) => {
    try {
        // Get the teacher ID from the request user profile
        const teacherId = req.user.profileID;
    
        // Fetch completed sessions for the teacher
        const completedSessions = await Session.find({
          teacher: teacherId,
          status: 'completed'
        }).populate('students'); // Populate the 'students' field if needed
    
        // Send the fetched completed sessions as a response
        res.json({ sessions: completedSessions });
      } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }



}



module.exports = {

    DisplayTeacherSessionsCompleted
}
