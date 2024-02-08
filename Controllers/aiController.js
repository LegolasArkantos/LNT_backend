// controllers/aiController.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function generateStory(req, res) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
  
      res.json({ story: text });
    } catch (error) {
      console.error("Error generating story:", error);
      res.status(500).json({ error: "Failed to generate story" });
    }
  }
  
  module.exports = { generateStory };
