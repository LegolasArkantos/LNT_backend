const Teacher = require('../Models/Teacher.model');

const  getCareer = async (req, res) => {

    try {
        const teacherId = req.params.id;
        
        // Fetch the teacher from the database
        const teacher = await Teacher.findById(teacherId);
    
        // If teacher not found, return 404
        if (!teacher) {
          return res.status(404).json({ message: 'Teacher not found' });
        }
    
        // Return the career counselling status
        res.json({ careerCounselling: teacher.careerCounselling });
      } catch (err) {
        // Handle any errors
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
}

module.exports ={
    getCareer
}