import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Exa from "exa-js";
import multer from "multer";
import path from "path";
import fs from 'fs';

dotenv.config();
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);


app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ dest: 'uploads/' }); //temporary

app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    const file = req.body;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = file.path;
    console.log("File uploaded to:", filePath);

    const messageWithInfo = "Regardless of the file uploaded just say yay we connected!"; //change this w/prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: messageWithInfo },
        { role: "system", content: `Here is the file uploaded: ${filePath}` },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "No response.";
    console.log("AI Response:", reply);

    res.json({ reply });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to handle file upload or OpenAI API call" });
  }
});

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
