const Review = require("../Models/Review.model");
const Teacher = require("../Models/Teacher.model");
const Student = require("../Models/Student.model");
const Sessions = require("../Models/Session.model");
const ReviewData = require('../Models/ReviewData.model');

const addReview = async (req, res) => {
  const studentId = req.user.profileID;
  const { sessionId, teacherId  } = req.params
  try {
    const { rating, comment, time } = req.body;

    // Check if the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const session = await Sessions.findById(sessionId).populate([
      {
        path: "assignment",
        populate: {
          path: "submissions"
        }
      },
      {
        path: "quiz",
        populate: {
          path: "submissions"
        }
      }
    ]);

    const reviewData = await ReviewData.findOne({session: sessionId, teacher: teacherId});
    
    let reviewWeightagesSum = 0;
    let totalAverageMarks = 0;
    if (reviewData.students) {
      for (const reviewWeightage of reviewData.reviewWeightages) {
        reviewWeightagesSum = reviewWeightagesSum + (reviewWeightage.averageMark * reviewWeightage.rating);
        totalAverageMarks = totalAverageMarks + reviewWeightage.averageMark;
      }
    }

    let studentAssignmentMarks = 0
    let studentAssignmentsCount = 0
    
    for (const assignment of session.assignment) {
      for (const submission of assignment.submissions) {
        if (studentId === submission.student.toString()) {
          studentAssignmentsCount++;
          studentAssignmentMarks = studentAssignmentMarks + submission.grade;
        }
      }
    }
    studentAssignmentMarks = studentAssignmentMarks/studentAssignmentsCount;

    let studentQuizMarks = 0;
    let studentQuizCount = 0;
    for (const quiz of session.quiz) {
      for (const quizSubmission of quiz.submissions) {
        if (studentId === quizSubmission.student.toString()) {
          studentQuizCount++;
          studentQuizMarks = studentQuizMarks + quizSubmission.marks;
        }
      }
    }
    studentQuizMarks = studentQuizMarks/studentQuizCount;

    const studentAverageMarks = (studentAssignmentMarks + studentQuizMarks)/2;
    const newTeacherRating = (reviewWeightagesSum + (studentAverageMarks*rating))/(totalAverageMarks + studentAverageMarks)

    reviewData.reviewWeightages.push({averageMark: studentAverageMarks, rating: rating});
    reviewData.students.push(studentId);
    await reviewData.save();
    teacher.rating = Math.round(newTeacherRating);
    await teacher.save();

    
    const review = new Review({
      student: studentId,
      teacher: teacherId,
      sessionName: session.subject,
      rating: rating,
      comment: comment,
      timestamp: time
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

    const reviews = await Review.find({ teacher: teacherId }).populate('student');

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTeacherReviewsBySession = async (req, res) => {
  try {
    const { teacherId, sessionName } = req.params;
    const reviews = await Review.find({ teacher: teacherId, sessionName }).populate('student');

    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const updateReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;
//     const { rating, comment } = req.body;

//     const review = await Review.findByIdAndUpdate(
//       reviewId,
//       { rating, comment },
//       { new: true }
//     );

//     if (!review) {
//       return res.status(404).json({ message: "Review not found" });
//     }

//     res.status(200).json({ message: "Review updated successfully", review });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const deleteReview = async (req, res) => {
//   try {
//     const { reviewId } = req.params;

//     const review = await Review.findByIdAndDelete(reviewId);

//     if (!review) {
//       return res.status(404).json({ message: "Review not found" });
//     }

//     res.status(200).json({ message: "Review deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

module.exports = {
  addReview,
  getTeacherReviews,
  getTeacherReviewsBySession
};
