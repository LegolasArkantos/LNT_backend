
const Teacher = require('../Models/Teacher.model');
const Session = require('../Models/Session.model');
const Assignment = require('../Models/Assignment.model');
const Submission = require('../Models/Submission.model');
const Quiz = require('../Models/Quiz.model')




const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function generateStory(req, res) {
    try {
      const  customMessage="Rules to follow: only gice indo about jobs and nothing else.  As a career counselor, I will need your educational details, strengths, and weaknesses to recommend three jobs that best fit you. Please provide this information. If you have any unrelated questions, please refrain from asking them, and focus on career-related inquiries. If you don't provide or miss any data required, I won't make any assumptions and will ask you for the necessary information.I will focus on giving detailed and long info on the jobs i am sugessting like description ,work expected,avg pay,avg experience needed according to pakistan. Here is Students reply  :";
      const  customMessage1="You are a career counselor. I want you to tell me 3 jobs which u think best fit my educational background , make sure to give description ,work expected,avg pay,avg experience needed according to pakistan . here is my educational bakcground:";
      const  customMessage2="You are a career counselor. I will tell you some of the jobs i aspire to do one day along with other relevant info, ans in paragraphs but clearly indicate when u move from one job to another. i would like you to analyze and tell me how viable my job aspirations are inconstrast to the info i give you. ";
      const  customMessage3="You are a career counselor. I will tell you some of the jobs i aspire to do one day along with other relevant info, ans in paragraphs but clearly indicate when u move from one job to another. I would like you to tell me what skills i am missing and how much profiecieny i would need in them. ";




      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const { prompts } = req.body;
      console.log(prompts.educationalBackground)
      if (!prompts) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const result = await model.generateContent(customMessage1+prompts.educationalBackground);
      const response = await result.response;
      const text = await response.text();

      const result2 = await model.generateContent(customMessage2+" here are my educational background: "+prompts.educationalBackground+"  here are my work work experience: "+prompts.workExperience+" here are my strenghts and weaknesses: "+prompts.strengthsWeaknesses+" and these are the jobs i aspire to do: "+prompts.futureJobs);
      const response2 = await result2.response;
      const text2 = await response2.text();

      const result3 = await model.generateContent(customMessage3+" here are my educational background: "+prompts.educationalBackground+"  here are my work work experience: "+prompts.workExperience+" here are my strenghts and weaknesses: "+prompts.strengthsWeaknesses+" and these are the jobs i aspire to do: "+prompts.futureJobs);
      const response3 = await result3.response;
      const text3 = await response3.text();
  
      res.json({ story: text3+"&"+text2+"&"+text });
    } catch (error) {
      console.error("Error generating :", error);
      res.status(500).json({ error: "Failed to generate " });
    }
  }

  async function generateAnalysis(req, res) {
    try {
        const customMessage = "Do a indepth analysis tell me the students with the worst grades and in what, along with guidelines to help them and other points of interest you noticed.look over both quizes and assigments and also recommend ways to help him. Try to make it a detailed reply"
        ;
        const teacherId = req.user.profileID;

        // Retrieve teacher's data with populated sessions, assignments, and submissions
        const teacher = await Teacher.findById(teacherId).populate({
            path: 'sessions',
            populate: {
                path: 'assignment',
                populate: {
                    path: 'submissions'
                }
            }
        });

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

         // Retrieve quiz data related to the teacher's sessions
         const quizData = await Quiz.find({ _id: { $in: teacher.sessions.map(session => session.quiz._id) } })
         .populate({
             path: 'submissions',
             populate: {
                 path: 'student',
                 select: 'firstName lastName' // Select only necessary fields
             }
         });

        // Format the populated data for passing to the AI model
        const dataForAI = formatDataForAI(teacher, quizData);

        // Generate AI content
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(customMessage + " " + dataForAI);
        const response = await result.response;
        const text = await response.text();

        res.json({ text: text });
    } catch (error) {
        console.error("Error generating analysis:", error);
        res.status(500).json({ error: "Failed to generate analysis" });
    }
}

// Function to format data for AI
function formatDataForAI(teacher, quizData) {
    // Prepare the data in a suitable format for the AI model
    const data = {
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        sessions: teacher.sessions.map(session => ({
            subject: session.subject,
            assignment: session.assignment.map(assignment => ({
                title: assignment.title,
                totalMarks: assignment.marks,
                submissions: assignment.submissions.map(submission => ({
                    studentName: submission.studentName,
                    grade: submission.grade
                }))
            })),
            quizzes: quizData.filter(quiz => session.quiz.includes(quiz._id)).map(quiz => ({
                title: quiz.title,
                totalMarks: quiz.marks,
                submissions: quiz.submissions.map(submission => ({
                    studentName: submission.student.firstName + ' ' + submission.student.lastName,
                    grade: submission.marks
                }))
            }))
        }))
    };

    // Convert the data to JSON string for passing to the AI model
    const formattedData = JSON.stringify(data);
    return formattedData;
}


async function generateAnalysisStudent(req, res) {
    try {
        const customMessage = "Do an in-depth analysis of the student's performance in assignments and quizzes. Highlight areas of weakness, provide suggestions for improvement, and recommend resources and youtube links for further study. Provide detailed feedback. important rules: never say students id, use his name. Always provde a youtube link or some type link";
        const studentId = req.user.profileID;

        // Retrieve student's sessions, assignments, and submissions
        const studentSessions = await Session.find({ students: studentId })
            .populate({
                path: 'assignment',
                populate: {
                    path: 'submissions',
                    match: { student: studentId }
                }
            })
            .populate({
                path: 'quiz',
                populate: {
                    path: 'submissions',
                    match: { student: studentId }
                }
            });

        if (!studentSessions || studentSessions.length === 0) {
            return res.status(404).json({ error: "No sessions found for the student" });
        }

        // Format the data for passing to the AI model
        const dataForAI = formatDataForAIStudent(studentSessions, studentId);

        // Generate AI content
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(customMessage + " " + dataForAI);
        const response = await result.response;
        const text = await response.text();

        res.json({ text: text });
    } catch (error) {
        console.error("Error generating student analysis:", error);
        res.status(500).json({ error: "Failed to generate student analysis" });
    }
  }


  function formatDataForAIStudent(sessions, studentId) {
    const data = {
        studentId: studentId,
        sessions: sessions.map(session => ({
            subject: session.subject,
            assignments: session.assignment.map(assignment => ({
                title: assignment.title,
                totalMarks: assignment.marks,
                submissions: assignment.submissions
                    .filter(submission => submission.student.toString() === studentId)
                    .map(submission => ({
                        studentName: submission.studentName,
                        grade: submission.grade
                    }))
            })),
            quizzes: session.quiz.map(quiz => ({
                title: quiz.title,
                totalMarks: quiz.marks,
                submissions: quiz.submissions
                    .filter(submission => submission.student.toString() === studentId)
                    .map(submission => ({
                        grade: submission.marks
                    }))
            }))
        }))
    };

    // Convert the data to JSON string for passing to the AI model
    const formattedData = JSON.stringify(data);
    return formattedData;
}
  module.exports = { 
    generateStory,
    generateAnalysis,
    generateAnalysisStudent,
  };
