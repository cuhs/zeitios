import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Exa from "exa-js";
import multer from "multer";

dotenv.config();
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const base64String = req.file.buffer.toString("base64");

    const fileContext = "The file that's uploaded is a base64 image. It is supposed to be a marketing-related flyer, document, etc. that you will help the user with. Give the user feedback on how they can improve the document, and provide general design guidelines. I know you can't see the image but try your best to interpret what it would've looked like and give feedback based on that.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: base64String },
        { role: "system", content: fileContext },
      ],
    });

    const reply = completion.choices[0]?.message?.content || "No response.";

    res.json({ reply });

  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to handle file upload or OpenAI API call" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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