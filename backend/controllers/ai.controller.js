import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
dotenv.config();


const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAi.getGenerativeModel({
  model: "gemini-1.0-pro",
});

export const chatBot = async (req, res) => {
  try {
    const query = req.params.query;
    const r = await model.generateContent(query);

    // Check if the AI response was blocked
    if (r.status === 400 && r.message.includes("RECITATION")) {
        return res.status(400).json({error: "Response blocked due to repetitive content or recitation"});
    }

    // console.log(r.response.text())
    res.json(r.response.text());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
