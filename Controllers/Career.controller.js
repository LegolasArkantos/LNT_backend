const Teacher = require('../Models/Teacher.model');
const TeacherCareer = require('../Models/TeacherCareer.model')
const Student = require('../Models/Student.model');


const  getCareer = async (req, res) => {

    try {
      const teacherId = req.user.profileID;
        
        const teacher = await Teacher.findById(teacherId);
    
        if (!teacher) {
          return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json({ careerCounselling: teacher.careerCounselling });
      } catch (err) {
        // Handle any errors
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
}


const  createProfile = async (req, res) => {
  try {
    const { description, timings } = req.body;
    const teacherId = req.user.profileID;

    const existingEntry = await TeacherCareer.findOne({ teacherId });

    if (existingEntry) {
      return res.status(400).json({ error: 'Teacher career entry already exists' });
    }
     
    const teacher = await Teacher.findById(teacherId);


    const newEntry = new TeacherCareer({
      name: `${teacher.firstName} ${teacher.lastName}`,
      profilePic:teacher.profilePicture,
      teacher:teacherId,
      description,
      timing:timings,
    });

    await newEntry.save();

    teacher.careerCounselling=true,
    await teacher.save();

    res.status(201).json({ message: 'Teacher career entry created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }

}

const  updateProfile = async (req, res) => {
  try {
    const { description, timing } = req.body;
    const teacherId = req.user.profileID;

    const existingEntry = await TeacherCareer.findOne({ teacherId });

    if (!existingEntry) {
      return res.status(404).json({ error: 'Teacher career entry not found' });
    }

    existingEntry.description = description;
    existingEntry.timing = timing;



    await existingEntry.save();

    res.status(200).json({ message: 'Teacher career entry updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
const  getProfile = async (req, res) => {

try {
  const teacherId = req.user.profileID;

  const teacherCareerData = await TeacherCareer.findOne({ teacher:teacherId });

  if (!teacherCareerData) {
    return res.status(404).json({ message: 'Teacher career data not found' });
  }

  res.json(teacherCareerData);
} catch (error) {
  console.error('Error getting teacher career data:', error);
  res.status(500).json({ message: 'Server error' });
}
}

const  getCareerTeachers = async (req, res) => {

  try {
    
    const teacherCareerData = await TeacherCareer.find().populate('teacher', 'rating')
    .exec();

    
    
    if (!teacherCareerData.length) {
      return res.status(200).json([]);
    }
    res.json(teacherCareerData);
  } catch (error) {
    console.error('Error getting teacher career data:', error);
    res.status(500).json({ message: 'Server error' });
  }
  }

  const addCareerTeacher = async (req, res) => {
    try {
      const studentId = req.user.profileID;
      const { careerTeacherId } = req.body;
  
      const student = await Student.findById(studentId);
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      if (student.careerteacher.includes(careerTeacherId)) {
        return res.status(400).json({ message: 'Career teacher already joined' });
      }
  
      student.careerteacher.push(careerTeacherId);
  
      await student.save();
      
      const careerTeacher = await TeacherCareer.findById(careerTeacherId);
      
      if (!careerTeacher) {
        return res.status(404).json({ message: 'Career teacher not found' });
      }
      
      careerTeacher.students.push(studentId);
      
      await careerTeacher.save();
  
      res.json({ message: 'Career teacher joined successfully' });
    } catch (error) {
      console.error('Error joining career teacher:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  
  const getStudentCareerTeachers = async (req,res) => {

    try {
      const studentId = req.user.profileID;
  
      const student = await Student.findById(studentId).populate('careerteacher');
  
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      const careerTeachers = student.careerteacher;
  
      res.json({ careerTeachers });
    } catch (error) {
      console.error('Error fetching career teachers:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  const getCareerTeacherStudents = async (req, res) => {
    try {
        const { careerTeacherId } = req.params;

        // Find the career teacher by ID
        const careerTeacher = await TeacherCareer.findById(careerTeacherId).populate('students');

        if (!careerTeacher) {
            return res.status(404).json({ message: 'Career teacher not found' });
        }

        const students = careerTeacher.students;

        res.json({ students });
    } catch (error) {
        console.error('Error fetching career teacher students:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports ={
    getCareer,
    createProfile,
    updateProfile,
    getProfile,
    getCareerTeachers,
    addCareerTeacher,
    getStudentCareerTeachers,
    getCareerTeacherStudents,

}