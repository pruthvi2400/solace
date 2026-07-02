import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./server/config/db";
import authRoutes from "./server/routes/authRoutes";
import stateRoutes from "./server/routes/stateRoutes";
import User from "./server/models/User";
import { UserState } from "./server/models/UserState";
import { DEFAULT_STATE } from "./server/config/defaultState";
import { protect } from "./server/middleware/authMiddleware";

dotenv.config();

// Connect to database
connectDB();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/state", stateRoutes);


// Path to persist database
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

// Unified response generator for Gemini & OpenRouter
async function generateAIResponse(
  message: string,
  history: any[],
  systemInstruction: string,
  temperature: number = 0.7
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    throw new Error("API key is not defined or is placeholder.");
  }

  if (key.startsWith("sk-")) {
    // OpenRouter path
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemInstruction },
          ...(history || []).map((msg: any) => ({
            role: msg.role === "model" ? "assistant" : "user",
            content: msg.text,
          })),
          { role: "user", content: message },
        ],
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("Invalid response from OpenRouter API");
    }
    return text;
  } else {
    // Google GenAI path
    const aiClient = getGeminiAI();
    if (!aiClient) {
      throw new Error("Failed to initialize Google GenAI client");
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "model" ? "model" : "user",
          parts: [{ text: msg.text }]
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Invalid response from Gemini API");
    }
    return text;
  }
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong. Please try again later.";

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = "An account with this email already exists.";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(", ");
  }

  // Express validator errors passed via ErrorResponse
  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    statusCode = 400;
    message = err.errors[0].msg || err.message;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
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
app.post("/api/chat", protect, async (req: Request, res: Response, next: NextFunction) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const userId = (req as any).user?.id; 
  let userName = "Friend";
  let userFeeling = "hurting";
  let userReasons = "healing";
  let userGoals = "building routines";

  let userState: any = null;
  if (userId) {
    try {
      userState = await UserState.findOne({ user: userId });
      if (!userState) {
        userState = await UserState.create({ user: userId, ...DEFAULT_STATE });
      }
      if (userState.onboarding) {
        userName = userState.onboarding.name || "Friend";
        userFeeling = userState.onboarding.feeling || "hurting";
        userReasons = (userState.onboarding.reasons && userState.onboarding.reasons.length > 0)
          ? userState.onboarding.reasons.join(", ")
          : "healing";
        userGoals = (userState.onboarding.goals && userState.onboarding.goals.length > 0)
          ? userState.onboarding.goals.join(", ")
          : "building routines";
      }
    } catch (error) {
      console.error("Error fetching/creating userState for AI chat:", error);
    }
  }

  // Save the user message to userState.chatHistory
  const userMsg = {
    id: "user-" + Date.now(),
    role: "user",
    text: message,
    createdAt: new Date().toISOString(),
  };

  if (userState) {
    userState.chatHistory.push(userMsg);
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    const fallbackText = getOfflineReply(message, userName);
    if (userState) {
      const modelMsg = {
        id: "model-" + Date.now(),
        role: "model",
        text: fallbackText,
        createdAt: new Date().toISOString(),
      };
      userState.chatHistory.push(modelMsg);
      await userState.save();
    }
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
      4. DO NOT PRESSSURE: Never use words like 'you should just move on', 'plenty of fish in the sea', 'get over it', or 'forget about them'. Instead, say things like 'It makes perfect sense that you feel this way', 'That love was real, and so is the grief.'
      5. GENTLE ACTION COAXING: Only after validating and listening, you may gently invite them to perform a small self-care activity (e.g., a deep breath, drinking water, looking out the window).
      6. IF THEY TEMPT TO CONTACT THE EX: Remind them of their goals or why they started healing. Suggest writing the message privately here instead. Suggest a 30-minute pause to see if the urge cools down.

      Format your responses nicely with clean paragraphs. Keep them relatively concise (1-3 small paragraphs) so they fit nicely in a mobile-like chat window.
    `;

    const responseText = await generateAIResponse(message, history, systemInstruction, 0.7);
    if (userState) {
      const modelMsg = {
        id: "model-" + Date.now(),
        role: "model",
        text: responseText,
        createdAt: new Date().toISOString(),
      };
      userState.chatHistory.push(modelMsg);
      await userState.save();
    }
    res.json({ text: responseText });
  } catch (error: any) {
    console.error("AI API error inside chat:", error);
    const fallbackText = getOfflineReply(message, userName);
    if (userState) {
      const modelMsg = {
        id: "model-" + Date.now(),
        role: "model",
        text: fallbackText,
        createdAt: new Date().toISOString(),
      };
      userState.chatHistory.push(modelMsg);
      await userState.save();
    }
    res.json({ text: fallbackText, note: "Fallback mode activated due to a connection issue." });
  }
});

// Emergency Chat Endpoint (for "I'm about to text them")
app.post("/api/emergency/chat", async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;
  const userId = (req as any).user?.id;
  let userName = "Friend";
  let userReasons: string[] = [];

  if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        userName = user.name || "Friend";
      }
    } catch (error) {
      console.error("Error fetching user for emergency chat:", error);
    }
  }

  const reasonText = userReasons.length > 0 
    ? `They started this journey to: ${userReasons.join(", ")}.` 
    : "They are trying to heal and rebuild their strength.";

  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return res.json({
      text: `Please pause, ${userName}. Before you hit send, let's take a deep breath. Write down exactly what you want to say to them right here. Let it exit your mind, but keep it in this safe, private vault instead. I'm right here with you, and we can wait 30 minutes together to see how you feel.`
    });
  }

  try {
    const systemInstruction = `
      You are Solace in "Emergency Contact Buffer Mode".
      The user is experiencing a powerful, immediate urge to text or call their ex-partner. They pressed 'I'm about to text them'.
      
      User name: ${userName}
      User's initial reasons for healing: ${reasonText}

      Your task:
      1. ACT AS AN EMOTIONAL BUFFER: Your goal is to create a 30-minute pause between their urge and their action.
      2. ZERO JUDGMENT: Do not make them feel guilty. Validate that the urge is normal, intense, and painful.
      3. GENTLE RE-DIRECTION:
         - Ask them to type the exact message they want to send to their ex *here in our chat* so it gets out of their chest.
         - GENTLY remind them of their healing reasons, without preaching.
         - Suggest a 5-breath grounding exercise or a 30-minute cooling-off window.
      
      Keep your reply exceptionally warm, grounded, stable, and calming. Keep it to 2 short paragraphs max.
    `;

    const responseText = await generateAIResponse(
      message || "I'm about to text them. Help me.",
      [],
      systemInstruction,
      0.5
    );
    res.json({ text: responseText });
  } catch (error) {
    console.error("Emergency chat error:", error);
    res.json({
      text: `Please pause, ${userName}. Before you hit send, let's take a deep breath. Write down exactly what you want to say to them right here. Let it exit your mind, but keep it in this safe, private vault instead. I'm right here with you, and we can wait 30 minutes together to see how you feel.`
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
