
const Teacher = require('../Models/Teacher.model');
const Session = require('../Models/Session.model');
const Assignment = require('../Models/Assignment.model');
const Submission = require('../Models/Submission.model');
const Quiz = require('../Models/Quiz.model')
require('dotenv').config();



const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = process.env.API_KEY_Y;
const JOB_API_KEY =  process.env.JOB_API_KEY ;
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const generateStory = async (req, res) => {
  try {
    const customMessage1 = "You are a career counselor.i will give u info about many jobs, I want you to tell me jobs which u think best fit my educational background with the links of the jobs , make sure to give job title, company,description ,work expected,salary,avg experience and skills and link to apply job .important reminder: select jobs from the list provoded to you and always provide the exact link of that job given to you. here is my educational background:";
    const customMessage2 = "You are a career counselor. I will tell you some of the jobs i aspire to do one day along with other relevant info, ans in paragraphs but clearly indicate when u move from one job to another. i would like you to analyze and tell me how viable my job aspirations are inconstrast to the info i give you. ";
    const customMessage3 = "You are a career counselor. I will tell you some of the jobs i aspire to do one day along with other relevant info, ans in paragraphs but clearly indicate when u move from one job to another. I would like you to tell me what skills i am missing and how much profiecieny i would need in them. ";

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const { prompts, jobQuery } = req.body;

    if (!prompts || !jobQuery) {
      return res.status(400).json({ error: "Prompts and jobQuery are required" });
    }

    // Fetch job data
    const jobs = await getJobs(jobQuery.jobTitle, jobQuery.city, jobQuery.country);

    // Format job data for AI input
    let jobInfo = jobs.map(job => `Job Title: ${job.job_title}, Company: ${job.employer_name}, Salary: ${job.job_min_salary ? job.job_min_salary : 'Not specified'}-${job.job_max_salary ? job.job_max_salary : 'Not specified'}, Skills: ${job.job_required_skills ? job.job_required_skills.join(', ') : 'Not specified'}, Job Apply Link: ${job.job_apply_link}`).join("\n");
    console.log("job info"+jobInfo)
    const result1 = await model.generateContent(customMessage1 + prompts.educationalBackground + "and here is availibale jobs along with links: " + jobInfo);
    const response1 = await result1.response;
    const text1 = await response1.text();

    const result2 = await model.generateContent(customMessage2 + " here are my educational background: " + prompts.educationalBackground + "  here are my work work experience: " + prompts.workExperience + " here are my strengths and weaknesses: " + prompts.strengthsWeaknesses + " and these are the jobs i aspire to do: " + prompts.futureJobs);
    const response2 = await result2.response;
    const text2 = await response2.text();

    const result3 = await model.generateContent(customMessage3 + " here are my educational background: " + prompts.educationalBackground + "  here are my work work experience: " + prompts.workExperience + " here are my strengths and weaknesses: " + prompts.strengthsWeaknesses + " and these are the jobs i aspire to do: " + prompts.futureJobs);
    const response3 = await result3.response;
    const text3 = await response3.text();

    res.json({ story: text3 + "&" + text2 + "&" + text1 });
  } catch (error) {
    console.error("Error generating:", error);
    res.status(500).json({ error: "Failed to generate" });
  }
};

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
        console.log("yes : "+dataForAI)
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



// Updated graphData function
async function graphData(req, res) {
    const teacherId = req.user.profileID;
    const { sessionId } = req.params;
  
    try {
      const session = await Session.findOne({ _id: sessionId, teacher: teacherId })
        .populate({
          path: 'assignment',
          populate: { path: 'submissions' }
        })
        .populate({
          path: 'quiz',
          populate: { path: 'submissions' }
        });
  
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
  
      const analyticsData = {
        assignments: [],
        quizzes: [],
        passFailRatio: {
          totalAssignments: 0,
          totalQuizzes: 0,
          totalPassed: 0,
          totalFailed: 0
        }
      };
  
      session.assignment.forEach(assignment => {
        const totalSubmissions = assignment.submissions.length;
        const failedSubmissions = assignment.submissions.filter(sub => sub.grade < assignment.marks / 2).length;
  
        analyticsData.assignments.push({
          sessionId: session._id,
          sessionName: session.subject,
          assignmentId: assignment._id,
          assignmentTitle: assignment.title,
          totalSubmissions,
          failedSubmissions
        });
  
        analyticsData.passFailRatio.totalAssignments += totalSubmissions;
        analyticsData.passFailRatio.totalFailed += failedSubmissions;
        analyticsData.passFailRatio.totalPassed += totalSubmissions - failedSubmissions; // Calculate passed submissions
      });
  
      session.quiz.forEach(quiz => {
        const totalSubmissions = quiz.submissions.length;
        const failedSubmissions = quiz.submissions.filter(sub => sub.marks < quiz.marks / 2).length;
  
        analyticsData.quizzes.push({
          sessionId: session._id,
          sessionName: session.subject,
          quizId: quiz._id,
          quizTitle: quiz.title,
          totalSubmissions,
          failedSubmissions
        });
  
        analyticsData.passFailRatio.totalQuizzes += totalSubmissions;
        analyticsData.passFailRatio.totalFailed += failedSubmissions;
        analyticsData.passFailRatio.totalPassed += totalSubmissions - failedSubmissions; // Calculate passed submissions
      });
  
      console.log("Analytics Data:", JSON.stringify(analyticsData, null, 2));
      res.status(200).json(analyticsData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  






const getSessionids = async (req, res) => {

    try {
        const teacherId = req.user.profileID; 
    
        // Fetch sessions for the teacher
        const sessions = await Session.find({ teacher: teacherId }).select('subject _id'); 
    
        // Send the response with session names and IDs
        res.json({ sessions });
      } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }



























const https = require('https');
async function generateAnalysisStudent(req, res) {
    try {
        
        const customMessage = "Do an in-depth analysis of the student's performance in assignments and quizzes. Highlight areas of weakness, provide suggestions for improvement, and recommend resources and youtube links for further study. Provide detailed feedback. important rules: never say students id, use his name. The youtube link should be of a video, not a channel";
        const customMessage1="i will prvode u will student data, your job is to identify topics he needs help in and then give me 2 of topics he needs help in most so i can query those and get youtube links. example output should:(topic/another topic). the / is necceasry to separaate dif video suggestions . only give me the suggestions , do not tell me name or any other info about student.try to make the topics suggestions as discriptive as possible to help youtbe algorithm give better suggestions . Do not give back suggestions called quiz 1 , assigment 1 or anything similair:  "
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
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Generate AI content
        const result = await model.generateContent(customMessage + " " + dataForAI);
        const response = await result.response;
        const text = await response.text();

        const result3 = await model.generateContent(customMessage1 + " " + dataForAI);
        const response3 = await result3.response;
        const text3 = await response3.text();
        console.log(text3)

        const topics = text3.split(' / ').map(topic => topic.trim());
        const videos = await searchYouTube(topics);
        



      
        res.json({ text: text , youtubeVideos: videos});
    } catch (error) {
        console.error("Error generating student analysis:", error);
        res.status(500).json({ error: "Failed to generate student analysis" });
    }
  }


  async function searchYouTube(queries) {
    const combinedQuery = queries.join('|');
    console.log(combinedQuery)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(combinedQuery)}&key=${API_KEY}`;
    
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            
            // A chunk of data has been received
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            // The whole response has been received
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    const items = jsonData.items;
                    let videos = [];
                    
                    // Extract video titles and IDs from the response
                    for (const item of items) {
                        if (videos.length >= 10) break; // Maximum of ten videos
                        if (item.id.videoId) {
                            videos.push({
                                title: item.snippet.title,
                                videoId: item.id.videoId,
                                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
                            });
                        }
                    }
                    
                    resolve(videos);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
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

const getJobs = (jobTitle, city, country) => {
  return new Promise((resolve, reject) => {
    const query = `${jobTitle} in ${city}, ${country}`;
    const options = {
      hostname: 'jsearch.p.rapidapi.com',
      path: `/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JOB_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    };

    https.get(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData.data);

        } catch (error) {
          reject('Error parsing response: ' + error);
        }
      });
    }).on('error', (error) => {
      reject('Error with request: ' + error);
    });
  });
};




  module.exports = { 
    generateStory,
    generateAnalysis,
    generateAnalysisStudent,
    graphData,
    getSessionids,
    getJobs,

  };
