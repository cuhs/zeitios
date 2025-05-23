import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import Exa from "exa-js";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config({override: true});
console.log("API KEY:", process.env.OPENAI_API_KEY);

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const exa = new Exa(process.env.EXA_API_KEY);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let filePath = "";
let destinationFolder = "uploads/" 

if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

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
      messages: [{ role: "user", content: "You are a marketing AI tutor receiving requests from student users. Assume they are new to marketing and will need help learning the basics of the proposed topic. Above all else keep the conversation restrained marketing topics, here is the user prompt: " + userMessage }],
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
    `find informational articles about topics related to ${linkRequest}. Make sure the articles are related to the following conversation: ${currentConversation}`, {
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

// Curriculum Processing Agent
class CurriculumAgent {
  private openai: OpenAI;
  private curriculum: string;
  private moduleOutlines: { title: string; content: string }[] = [];
  private generatedContent: string = '';
  private processingStatus: {
    stage: 'parsing' | 'introduction' | 'module' | 'conclusion' | 'complete';
    currentModule?: string;
    moduleIndex?: number;
    totalModules?: number;
    progress: number;
  } = { stage: 'parsing', progress: 0 };
  private processingId: string;
  
  constructor(openai: OpenAI, curriculum: string, processingId: string) {
    this.openai = openai;
    this.curriculum = curriculum;
    this.processingId = processingId;
    curriculumProcessors.set(processingId, this);
  }
  
  getStatus() {
    return this.processingStatus;
  }
  
  async parseCurriculum(): Promise<void> {
    try {
      this.processingStatus = { stage: 'parsing', progress: 10 };
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a curriculum parsing agent that helps break down a curriculum into distinct modules or sections."
          },
          {
            role: "user",
            content: `Parse the following curriculum and extract each module or section title along with its brief description. Format your response as a JSON array of objects with 'title' and 'content' properties.\n\n${this.curriculum}`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(response.choices[0]?.message?.content || '{"modules":[]}');
      this.moduleOutlines = result.modules || [];
      
      if (this.moduleOutlines.length === 0) {
        this.moduleOutlines = [{
          title: "Complete Curriculum",
          content: this.curriculum
        }];
      }
      
      this.processingStatus = { 
        stage: 'parsing', 
        progress: 20,
        totalModules: this.moduleOutlines.length
      };
      
      console.log(`Parsed ${this.moduleOutlines.length} modules from curriculum`);
    } catch (error) {
      console.error("Error parsing curriculum:", error);
      throw new Error("Failed to parse curriculum");
    }
  }
  
  async generateModuleContent(module: { title: string; content: string }, index: number): Promise<string> {
    try {
      this.processingStatus = { 
        stage: 'module', 
        currentModule: module.title,
        moduleIndex: index,
        totalModules: this.moduleOutlines.length,
        progress: 40 + Math.floor((index / this.moduleOutlines.length) * 40)
      };
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert course content creator specializing in creating detailed educational material.
            
Your task is to expand a module outline into comprehensive, detailed course content.
The content should include:
1. A thorough explanation of all concepts
2. Practical examples and applications
3. Key points and takeaways
4. Relevant analogies to aid understanding
5. Theoretical background where appropriate

Write enough content that could fill a 20-30 minute lecture on the topic. 
These courses are to be online courses, so don't include in-person activities.
The content should be educational, engaging, and complete enough to serve as a standalone learning resource.`
          },
          {
            role: "user",
            content: `Please generate detailed course content for the module titled "${module.title}".
            
Here's the module outline:
${module.content}

Generate comprehensive educational material that thoroughly covers all the necessary concepts and information for this module.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });
      
      return response.choices[0]?.message?.content || "Failed to generate module content.";
    } catch (error) {
      console.error(`Error generating content for module ${module.title}:`, error);
      return `## ${module.title}\n\nContent generation failed for this module. Please try again later.`;
    }
  }
  
  // Generate content for all modules
  async generateFullCourseContent(): Promise<string> {
    try {
      // First, parse the curriculum to extract modules
      await this.parseCurriculum();
      
      // Generate an introduction
      const introduction = await this.generateIntroduction();
      this.generatedContent = introduction;
      
      // Generate content for each module sequentially
      for (let i = 0; i < this.moduleOutlines.length; i++) {
        const module = this.moduleOutlines[i];
        console.log(`Generating content for module: ${module.title}`);
        const moduleContent = await this.generateModuleContent(module, i);
        this.generatedContent += `\n\n${moduleContent}`;
      }
      
      // Generate a conclusion
      const conclusion = await this.generateConclusion();
      this.generatedContent += `\n\n${conclusion}`;
      
      // Mark as complete
      this.processingStatus = { stage: 'complete', progress: 100, totalModules: this.moduleOutlines.length };
      
      return this.generatedContent;
    } catch (error) {
      console.error("Error generating full course content:", error);
      throw new Error("Failed to generate course content");
    } finally {
      // Remove from the processors map after 5 minutes to clean up
      setTimeout(() => {
        curriculumProcessors.delete(this.processingId);
      }, 5 * 60 * 1000);
    }
  }
  
  // Generate an introduction for the course
  async generateIntroduction(): Promise<string> {
    try {
      this.processingStatus = { 
        stage: 'introduction', 
        progress: 30,
        totalModules: this.moduleOutlines.length
      };
      
      // Extract titles for context
      const moduleTitles = this.moduleOutlines.map(module => module.title).join(", ");
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert course content creator specializing in creating engaging course introductions."
          },
          {
            role: "user",
            content: `Generate an engaging introduction for a course with the following modules: ${moduleTitles}. 
            
The introduction should:
1. Provide an overview of what the course will cover
2. Explain the importance and relevance of the subject matter
3. Set clear expectations for what learners will gain from the course
4. Be concise but comprehensive (about 300-500 words)

Based on the module titles, craft an appropriate course introduction.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      return response.choices[0]?.message?.content || "# Course Introduction\n\nWelcome to this comprehensive course.";
    } catch (error) {
      console.error("Error generating introduction:", error);
      return "# Course Introduction\n\nWelcome to this comprehensive course.";
    }
  }
  
  // Generate a conclusion for the course
  async generateConclusion(): Promise<string> {
    try {
      this.processingStatus = { 
        stage: 'conclusion', 
        progress: 90,
        totalModules: this.moduleOutlines.length
      };
      
      // Extract titles for context
      const moduleTitles = this.moduleOutlines.map(module => module.title).join(", ");
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert course content creator specializing in creating effective course conclusions."
          },
          {
            role: "user",
            content: `Generate a meaningful conclusion for a course with the following modules: ${moduleTitles}. 
            
The conclusion should:
1. Summarize the key points covered in the course
2. Reinforce the main learning objectives
3. Suggest next steps or further learning opportunities
4. End on an inspiring note
5. Be concise but meaningful (about 200-400 words)

Based on the module titles, craft an appropriate course conclusion.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      return response.choices[0]?.message?.content || "# Conclusion\n\nThank you for completing this course.";
    } catch (error) {
      console.error("Error generating conclusion:", error);
      return "# Conclusion\n\nThank you for completing this course.";
    }
  }
}

// Store active curriculum processors
const curriculumProcessors = new Map<string, CurriculumAgent>();

// Generate a unique processing ID
function generateProcessingId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

// Update the generate-course endpoint to use the agent
app.post("/api/generate-course", async (req, res) => {
  try {
    const { curriculum } = req.body;
    
    if (!curriculum) {
      return res.status(400).json({ error: "Curriculum text is required" });
    }
    
    // Generate a unique ID for this processing job
    const processingId = generateProcessingId();
    
    // Create a new curriculum agent
    const agent = new CurriculumAgent(openai, curriculum, processingId);
    
    // Start the content generation in the background
    agent.generateFullCourseContent().catch(err => {
      console.error("Background processing error:", err);
    });
    
    // Return the processing ID immediately
    res.json({ processingId });
  } catch (error) {
    console.error("Error initiating course content generation:", error);
    res.status(500).json({ error: "Failed to initiate course content generation" });
  }
});

// Add a status endpoint to check on processing status
app.get("/api/processing-status/:id", (req, res) => {
  const processingId = req.params.id;
  const agent = curriculumProcessors.get(processingId);
  
  if (!agent) {
    return res.status(404).json({ error: "Processing job not found" });
  }
  
  const status = agent.getStatus();
  res.json({ status });
});

// Add an endpoint to retrieve the generated content
app.get("/api/generated-content/:id", (req, res) => {
  const processingId = req.params.id;
  const agent = curriculumProcessors.get(processingId);
  
  if (!agent) {
    return res.status(404).json({ error: "Processing job not found" });
  }
  
  const status = agent.getStatus();
  
  if (status.stage !== 'complete') {
    return res.status(400).json({ error: "Content generation is not complete yet", status });
  }
  
  const content = agent['generatedContent']; // Access the private property
  res.json({ content });
});

// Define type for multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

app.post("/api/extract-text", upload.single("file"), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let text = "";

    // Extract text based on file type
    if (fileExtension === ".pdf") {
      // Handle PDF extraction
      try {
        // Dynamically import pdf.js-extract
        const { default: pdfJsExtract } = await import('pdf.js-extract');
        const pdfExtract = new pdfJsExtract.PDFExtract();
        const data = await pdfExtract.extract(filePath, {});
        text = data.pages.map(page => page.content.map(item => item.str).join(" ")).join("\n\n");
      } catch (error) {
        console.error("PDF extraction error:", error);
        // If pdf.js-extract fails, use a fallback approach or notify the user
        text = "Error extracting PDF content. The pdf.js-extract package may not be installed.";
      }
    } else if (fileExtension === ".docx" || fileExtension === ".doc") {
      // Handle Word document extraction
      try {
        // Dynamically import mammoth
        const mammoth = await import('mammoth');
        const result = await mammoth.default.extractRawText({ path: filePath });
        text = result.value;
      } catch (error) {
        console.error("DOCX extraction error:", error);
        text = "Error extracting Word document content. The mammoth package may not be installed.";
      }
    } else if (fileExtension === ".rtf") {
      // For RTF files, try to read as text
      text = fs.readFileSync(filePath, "utf8");
    } else {
      // For other files try to read as plain text
      text = fs.readFileSync(filePath, "utf8");
    }

    // Clean up the file after extraction
    fs.unlinkSync(filePath);

    res.json({ text });
  } catch (error) {
    console.error("Error extracting text:", error);
    res.status(500).json({ error: "Failed to extract text from file" });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));