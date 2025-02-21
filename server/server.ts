import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Exa from "exa-js";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let filePath = "";
let destinationFolder = "uploads/" //change as needed

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinationPath = destinationFolder;
    console.log("File will be saved to:", destinationPath);
    cb(null, destinationPath); 
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + path.extname(file.originalname);
    console.log("File will be saved as:", uniqueFilename);
    cb(null, uniqueFilename);
    
    filePath = "uploads/" + uniqueFilename;
  },
});
const upload = multer({ storage });

const encodeImageToBase64 = (imagePath) => {
  return fs.readFileSync(imagePath, { encoding: "base64" });
};

app.post("/upload", upload.single("file"), (req, res) => {
  console.log("File was uploaded to the following path:", filePath);

  const base64Image = encodeImageToBase64(filePath);
  console.log("done encoding!");

  async function analyzeImage() {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {role: "system", content: "You are an AI that can analyze images related to marketing."},
          {role: "user", content: [{ type: "text", text: "Give me some feedback on how I can fix this marketing graphic. Tell me about word choice (if relevant), graphic design, visual appeal, and other aspects related to marketing I can implement into my picture." }, { type: "image_url", image_url: {"url": `data:image/jpeg;base64,${base64Image}`,}},]},
        ],
        max_tokens: 500,
      });

      const reply = response.choices[0]?.message?.content || "No response.";

      res.json({ reply });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to fetch response from OpenAI" });
    }
  }
  analyzeImage();

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