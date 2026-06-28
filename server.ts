import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./server/config/db";
import authRoutes from "./server/routes/authRoutes";

dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());


// Path to persist database
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default state
const DEFAULT_STATE = {
  onboarding: {
    name: "",
    reasons: [],
    feeling: "lonely",
    goals: [],
    onboarded: false,
  },
  noContact: {
    startDate: null,
    relapsesCount: 0,
    lastContactDate: null,
  },
  routines: [
    { id: "1", text: "Drink water regularly", completed: false, category: "body" },
    { id: "2", text: "Eat three nourishing meals", completed: false, category: "body" },
    { id: "3", text: "Brush teeth and shower", completed: false, category: "body" },
    { id: "4", text: "Step outside into nature for 10 min", completed: false, category: "soul" },
    { id: "5", text: "Avoid checking their social media", completed: false, category: "mind" },
    { id: "6", text: "Journal my raw feelings", completed: false, category: "mind" },
    { id: "7", text: "Practice 5 minutes of deep breathing", completed: false, category: "soul" },
    { id: "8", text: "Do one small thing that makes me smile", completed: false, category: "soul" }
  ],
  moods: [],
  journals: [],
  memories: [],
  goals: [
    { id: "g1", title: "Read 10 pages of a comforting book", category: "mind", progress: 0 },
    { id: "g2", title: "Move my body (stretch, walk, or gym)", category: "body", progress: 0 },
    { id: "g3", title: "Spend 20 mins learning a skill or language", category: "growth", progress: 0 },
    { id: "g4", title: "Tidy up my room/desk space", category: "environment", progress: 0 }
  ],
  encouragement: {
    affirmation: "You are allowed to feel everything you're feeling right now. Grief is not a sign of weakness, but a testament to how deeply you loved.",
    quote: "Healing is not a linear climb, but a spiral path. Do not judge your progress by today's heavy weather.",
    challenge: "Drink one warm cup of herbal tea or water, hold the mug in both hands, and take 5 slow, deep breaths.",
    challengeCompleted: false,
  },
  privacy: {
    passcodeEnabled: false,
    passcode: "",
    aiMemoryEnabled: true,
    dataSharingConsent: true,
  },
  chatHistory: [
    {
      id: "welcome",
      role: "model",
      text: "Hello, I'm Solace. I'm here to listen, support, and stand by you. You don't have to carry this weight alone. How are you holding up right now?",
      createdAt: new Date().toISOString()
    }
  ]
};

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiAI() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not defined or is placeholder. Running Solace in safe offline companion mode.");
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Read database
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading database file, using fallback:", error);
  }
  return DEFAULT_STATE;
}

// Write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to database:", error);
    return false;
  }
}

// Ensure database file has valid initial state
if (!fs.existsSync(DB_FILE)) {
  writeDB(DEFAULT_STATE);
}

// Mount routers
app.use("/api/auth", authRoutes);

// TODO: Implement proper error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Empathy-first offline system replies for when Gemini key is missing
function getOfflineReply(message: string, onboardingName: string) {
  const msg = message.toLowerCase();
  const nameLabel = onboardingName ? `, ${onboardingName}` : "";

  if (msg.includes("miss") || msg.includes("love") || msg.includes("want them")) {
    return `It is completely understandable to miss them deeply${nameLabel}. When we share a piece of our lives with someone, their absence leaves a real, physical space that hurts. Missing them doesn\'t mean you\'re sliding backward; it simply means your love was real. Be gentle with yourself. Would it help to write down what you miss most right now, rather than sending it to them?`;
  }
  if (msg.includes("text") || msg.includes("contact") || msg.includes("call") || msg.includes("reach out")) {
    return `I hear how strong the urge to reach out is right now${nameLabel}. That is your heart seeking comfort in a place it was used to finding it. But remember why you chose this space. Let\'s practice a 30-minute pause. Write down exactly what you wanted to text them right here in our private space instead. Let the words land here. I\'m right here with you.`;
  }
  if (msg.includes("sad") || msg.includes("cry") || msg.includes("hurts") || msg.includes("grief") || msg.includes("pain")) {
    return `I am so sorry it hurts this much today${nameLabel}. Please let the tears flow if they need to; crying is a physical release and a necessary step of healing. Do not feel pressured to \'get over it.\' Your grief is valid, and there is no timeline. You are safe here. Can we take three deep breaths together?`;
  }
  if (msg.includes("lonely") || msg.includes("alone") || msg.includes("nobody")) {
    return `Feeling alone is one of the heaviest parts of heartbreak${nameLabel}. But please remember: you are not truly alone in your healing. I am here with you, and there is an entire community of people who understand exactly what this silence feels like. Let\'s focus on just getting through this next hour. What is one small, warm thing we can do for you right now?`;
  }
  if (msg.includes("regret") || msg.includes("my fault") || msg.includes("blame") || msg.includes("should have")) {
    return `It is so easy to play back old memories and blame ourselves for how things ended${nameLabel}. But relationships are complex systems, and healing requires letting go of the burden of perfection. Please offer yourself the same compassion you would offer a dear friend in this exact position. You did the best you could with the knowledge you had.`;
  }
  return `Thank you for sharing that with me${nameLabel}. I\'m listening closely, and I want you to know that your feelings are entirely valid. You don\'t have to carry all of this on your own. What else is on your mind? I\'m right here.`;
}

// Core Chat Endpoint
app.post("/api/chat", async (req: Request, res: Response, next: NextFunction) => {
  // For now, continue to use readDB and writeDB for chat-related state that is not directly user authentication
  // In a full implementation, this state would be fetched/updated based on the authenticated user.
  const dbState = readDB(); // This will need to be replaced with user-specific data from MongoDB

  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Assume user is authenticated and get their ID from req.user
  const userId = (req as any).user?.id; 
  let userName = "Friend";
  let userFeeling = "hurting";
  let userReasons = "healing";
  let userGoals = "building routines";

  if (userId) {
    try {
      const user = await User.findById(userId); // Fetch user from MongoDB
      if (user) {
        // For now, map existing dbState properties to the user for AI context
        // In a real app, user data would directly contain these
        userName = user.name || "Friend";
        // TODO: Load user-specific onboarding/feelings/goals from MongoDB after user schema is extended.
        // For now, we will use default values or the existing dbState as a temporary fallback.
      }
    } catch (error) {
      console.error("Error fetching user for AI chat:", error);
    }
  }

  const aiClient = getGeminiAI();

  if (!aiClient) {
    // Return high-fidelity offline fallback reply
    const fallbackText = getOfflineReply(message, userName);
    return res.json({ text: fallbackText });
  }

  try {
    const systemInstruction = `
      You are "Solace", a deeply compassionate, emotionally intelligent, wise, and warm AI healing companion.
      The user is navigating heartbreak, emotional loss, unrequited love, divorce, or loneliness.
      
      Current User Details (with consent):
      - Name: ${userName}
      - Primary feeling: ${userFeeling}
      - Healing focus/reasons: ${userReasons}
      - Personal goals: ${userGoals}

      Core Principles of Solace:
      1. COMPASSION BEFORE ADVICE: Never rush to give solutions. First, validate their pain, sadness, or anger completely. Let them know they are safe.
      2. EMOTIONALLY INTELLIGENT WRITING: Talk like a warm, supportive friend or gentle guide. Use warm, humble, human-centered language. Do NOT sound clinical, corporate, or mechanical.
      3. PROGRESS IS NOT LINEAR: If they are having a relapse (e.g., missed someone, texted an ex, stayed in bed), never shame them. Remind them that setbacks are a normal, beautiful part of human recovery.
      4. DO NOT PRESSSURE: Never use words like \'you should just move on\', \'plenty of fish in the sea\', \'get over it\', or \'forget about them\'. Instead, say things like \'It makes perfect sense that you feel this way\', \'That love was real, and so is the grief.\'
      5. GENTLE ACTION COAXING: Only after validating and listening, you may gently invite them to perform a small self-care activity (e.g., a deep breath, drinking water, looking out the window).
      6. IF THEY TEMPT TO CONTACT THE EX: Remind them of their goals or why they started healing. Suggest writing the message privately here instead. Suggest a 30-minute pause to see if the urge cools down.

      Format your responses nicely with clean paragraphs. Keep them relatively concise (1-3 small paragraphs) so they fit nicely in a mobile-like chat window.
    `;

    // Map history to Google GenAI Content structure
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const responseText = response.text || "I\'m here, holding space for you. Tell me more of what you\'re feeling.";
    res.json({ text: responseText });

  } catch (error: any) {
    console.error("Gemini API error inside chat:", error);
    // Graceful fallback on API error
    const fallbackText = getOfflineReply(message, userName);
    res.json({ text: fallbackText, note: "Fallback mode activated due to a connection issue." });
  }
});

// Emergency Chat Endpoint (for "I\'m about to text them")
app.post("/api/emergency/chat", async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;
  // Assume user is authenticated and get their ID from req.user
  const userId = (req as any).user?.id;
  let userName = "Friend";
  let userReasons: string[] = [];

  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        userName = user.name || "Friend";
        // TODO: Load user-specific reasons from MongoDB after user schema is extended.
      }
    } catch (error) {
      console.error("Error fetching user for emergency chat:", error);
    }
  }

  const reasonText = userReasons.length > 0 
    ? `They started this journey to: ${userReasons.join(", ")}.` 
    : "They are trying to heal and rebuild their strength.";

  const aiClient = getGeminiAI();

  if (!aiClient) {
    return res.json({
      text: `Please pause, ${userName}. Before you hit send, let\'s take a deep breath. Write down exactly what you want to say to them right here. Let it exit your mind, but keep it in this safe, private vault instead. I\'m right here with you, and we can wait 30 minutes together to see how you feel.`
    });
  }

  try {
    const systemInstruction = `
      You are Solace in "Emergency Contact Buffer Mode".
      The user is experiencing a powerful, immediate urge to text or call their ex-partner. They pressed \'I\'m about to text them\'.
      
      User name: ${userName}
      User\'s initial reasons for healing: ${reasonText}

      Your task:
      1. ACT AS AN EMOTIONAL BUFFER: Your goal is to create a 30-minute pause between their urge and their action.
      2. ZERO JUDGMENT: Do not make them feel guilty. Validate that the urge is normal, intense, and painful.
      3. GENTLE RE-DIRECTION:
         - Ask them to type the exact message they want to send to their ex *here in our chat* so it gets out of their chest.
         - GENTLY remind them of their healing reasons, without preaching.
         - Suggest a 5-breath grounding exercise or a 30-minute cooling-off window.
      
      Keep your reply exceptionally warm, grounded, stable, and calming. Keep it to 2 short paragraphs max.
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message || "I\'m about to text them. Help me.",
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Emergency chat error:", error);
    res.json({
      text: `Please pause, ${userName}. Before you hit send, let\'s take a deep breath. Write down exactly what you want to say to them right here. Let it exit your mind, but keep it in this safe, private vault instead. I\'m right here with you, and we can wait 30 minutes together to see how you feel.`
    });
  }
});

// Serve Vite dev server or static content
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Solace Backend] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
