import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Exa from "exa-js";



dotenv.config();
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);


app.use(express.json());
app.use(cors()); // Allow frontend to communicate with the backend

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Adjust model if needed
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = completion.choices[0]?.message?.content || "No response.";

    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch response from OpenAI" });
  }
});

app.post("/exa", async (req, res) => {

  try {

  const linkRequest = req.body.message;
  const currentConversation = req.body.conversation;

  const result = await exa.searchAndContents(
    `find cool articles about topics related to ${linkRequest}. Make sure the articles are related to the following conversation: ${currentConversation}`, {
      type: "auto",
      text: {
        maxCharacters: 1000
      },
      category: "news",
      numResults: 3
    }
  )

  res.json({ result });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Failed to fetch response from Exa" });
}
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
