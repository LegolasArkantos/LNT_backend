const Teacher = require('../Models/Teacher.model');
const TeacherCareer = require('../Models/TeacherCareer.model')

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

module.exports ={
    getCareer,
    createProfile,
    updateProfile,
    getProfile,

}