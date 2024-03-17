
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
  
  module.exports = { generateStory };
