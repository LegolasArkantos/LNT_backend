const Review = require("../Models/Review.model");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");

const addReview = async (req, res) => {
  const studentId = req.user.profileID;

  try {
    const { teacherId, rating, comment } = req.body;

    // Check if the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the student exists
    const student = await Student.findById(studentId).populate("user");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentName = `${student.user.firstName} ${student.user.lastName}`;

    // Create a new review with studentName
    const review = new Review({
      student: studentId,
      teacher: teacherId,
      studentName: studentName,
      rating: rating,
      comment: comment,
    });

    await review.save();

    res.status(200).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTeacherReviews = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const reviews = await Review.find({ teacher: teacherId });

    res.status(200).json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addReview,
  getTeacherReviews,
  updateReview,
  deleteReview,
};
