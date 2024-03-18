
const Progress = require('../Models/progress.model');

// GET assignment progress for a teacher
const getAssignmentData = async (req, res) => {
    try {
        const profileID = req.user.profileID;


        const progress = await Progress.findOne({ teacher: profileID });

        if (!progress) {
            return res.status(404).json({ message: 'Progress not found for this teacher' });
        }

        res.status(200).json({ assignments: progress.assignments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getAssignmentData
  };
  