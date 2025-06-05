# ZeitiosAI Learning Assistant

A modern AI-powered learning platform that provides personalized tutoring experiences with image analysis, curriculum processing, and intelligent course generation capabilities.

## Project Overview

ZeitiosAI is a full-stack application that combines React frontend with Express backend to deliver:

- **AI-Powered Tutoring**: Interactive chat interface with GPT-4 for personalized learning
- **Marketing Image Analysis**: Upload images to receive detailed feedback on marketing graphics
- **Web Research Integration**: Real-time web search capabilities via Exa API for current information
- **Curriculum Processing**: Intelligent parsing and content generation from uploaded curricula
- **Course Generation**: Automated course creation with presentations via Magic Slides API
- **Audio Narration**: Text-to-speech conversion using ElevenLabs for immersive learning
- **File Upload Support**: Process various file formats (PDF, DOCX, images) for analysis

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Radix UI components
- React Router for navigation
- TanStack Query for data fetching

**Backend:**
- Node.js with Express
- TypeScript
- OpenAI GPT-4 integration
- Exa API for web search
- Magic Slides API for presentation generation
- ElevenLabs API for text-to-speech
- Multer for file uploads

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- API keys for the following services (see setup section)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd zeitios
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   EXA_API_KEY=your_exa_api_key_here
   MAGIC_SLIDES_API_KEY=your_magic_slides_api_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

## API Keys Setup

### Required API Keys

1. **OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create an account and generate an API key
   - Used for: AI tutoring, image analysis, and curriculum processing

2. **Exa API Key**
   - Visit: https://exa.ai/
   - Sign up and get your API key
   - Used for: Real-time web search and content discovery

3. **Magic Slides API Key**
   - Visit: https://magicslides.app/
   - Create an account and obtain API access
   - Used for: Automated presentation generation

4. **ElevenLabs API Key**
   - Visit: https://elevenlabs.io/
   - Create an account and generate an API key
   - Used for: Text-to-speech audio generation for course materials

### Setting up .env file

Create a `.env` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# Exa Search API
EXA_API_KEY=your-exa-api-key-here

# Magic Slides API
MAGIC_SLIDES_API_KEY=your-magic-slides-key-here

# ElevenLabs Text-to-Speech API
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key-here
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Keep your API keys secure and rotate them regularly

## Running the Application

### Option 1: Run Both Frontend and Backend (Recommended)

```bash
npm run both
```

This single command starts both the Vite development server (frontend) and the Express server (backend) concurrently.

### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run start
```

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```

### Available Scripts

- `npm run both` - Start both frontend and backend concurrently
- `npm run dev` - Start Vite development server (frontend only)
- `npm run start` - Start Express server (backend only)
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint for code quality

## Application URLs

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express server)

## Project Structure

```
zeitios/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── App.tsx            # Main App component
├── server/                # Backend Express application
│   └── server.ts          # Main server file
├── public/                # Static assets
├── uploads/               # File upload storage
├── videos/                # Video assets
├── presentations/         # Generated presentations
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── .env                   # Environment variables (create this)
```

## Features & Usage

### 1. AI Tutoring Chat
- Navigate to the main page
- Select a topic from the predefined list
- Start chatting with the AI tutor for personalized learning

### 2. Marketing Image Analysis
- Upload images through the interface
- Receive detailed feedback on design, word choice, and marketing effectiveness
- Get actionable suggestions for improvement

### 3. Web Research Integration
- During chat sessions, request current information
- The system uses Exa API to find relevant, up-to-date articles
- Sources are integrated into the learning experience

### 4. Curriculum Upload & Processing
- Visit `/curriculum-upload`
- Upload curriculum files (PDF, DOCX)
- The system parses and generates comprehensive course content
- Track processing progress in real-time

### 5. Course Upload & Analysis
- Visit `/course-upload`
- Upload course materials for analysis
- Generate structured learning content

## Configuration

### Environment Variables Explained

- `OPENAI_API_KEY`: Powers the AI tutoring and image analysis features
- `EXA_API_KEY`: Enables real-time web search capabilities
- `MAGIC_SLIDES_API_KEY`: Allows automated presentation generation
- `VITE_ELEVENLABS_API_KEY`: Enables text-to-speech audio generation for course materials

### File Upload Limits

- Supported formats: PDF, DOCX, common image formats
- Files are stored in the `uploads/` directory
- Automatic cleanup may be implemented for production use

## Troubleshooting

### Common Issues

1. **"API key not found" errors:**
   - Ensure your `.env` file is in the root directory
   - Verify all required API keys are properly set
   - Restart the server after adding new environment variables

2. **Port conflicts:**
   - Frontend runs on port 5173 (Vite default)
   - Backend runs on port 3001
   - Ensure these ports are available

3. **Slow response times:**
   - This is normal for AI processing
   - The UI shows "AI is typing..." during processing
   - Response times depend on API service load

4. **File upload issues:**
   - Check that the `uploads/` directory exists
   - Verify file format is supported
   - Ensure sufficient disk space

### Development Notes

- The application uses ES modules (`"type": "module"` in package.json)
- TypeScript is configured for both frontend and backend
- Hot reload is enabled for development
- CORS is configured for local development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for detailed error messages
3. Ensure all API keys are valid and have sufficient credits
4. Verify your internet connection for API calls

---

**Happy Learning with ZeitiosAI! ** 
