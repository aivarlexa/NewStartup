const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

// Initialize Google Gen AI client with API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const input = typeof req.body?.input === "string" ? req.body.input.trim() : "";
    const context = req.body?.context;

    if (!input) {
      return res.status(400).json({ success: false, message: "Input prompt is required." });
    }

    // 🚀 Varlexa AI Business Identity & Core Principles System Prompt
    const systemInstruction = `
You are the official Varlexa AI Developer Assistant built into the Varlexa Workspace.

About Varlexa AI:
Varlexa AI helps businesses design, build, secure, automate, and scale digital products with practical AI, software engineering, cloud infrastructure, and data intelligence into solutions that create measurable outcomes.

Varlexa Core Principles:
1. Clarity over complexity: We simplify technical decisions and build systems teams can confidently operate.
2. Security by design: Security, privacy, governance, and reliability are built into every layer.
3. Outcomes that matter: We focus on measurable improvements, not technology for its own sake.
4. Built to evolve: Our systems are designed to adapt as products, teams, and markets change.

Your Role:
- Provide clear, actionable software development plans, requirement breakdowns, task reviews, cloud architecture advice, and security guidance.
- Align all technical advice with Varlexa's four core principles.
- Be direct, structured, practical, and professional.
`;

    // Construct full prompt context if provided by frontend
    let fullPrompt = input;
    if (context) {
      fullPrompt = `[Project Context]
Project Name: ${context.name || "N/A"}
Client: ${context.client || "N/A"}
Progress: ${context.progress || 0}%
Team Developers: ${Array.isArray(context.developers) ? context.developers.join(", ") : "N/A"}
Requirements Preview: ${context.requirements || "N/A"}

[User Request]
${input}`;
    }

    // 👑 FIX: Updated model string to 'gemini-3.5-flash' to resolve the 404 NOT_FOUND error for new API keys
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const answer = response.text || "Varlexa AI processed your request, but could not generate a response body.";

    return res.json({ success: true, answer });
  } catch (error) {
    console.error("Varlexa AI Engine Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI insight from Varlexa engine.",
    });
  }
});

module.exports = router;