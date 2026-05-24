require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { callGroq } = require("./src/groq");
const { buildSystemPrompt } = require("./src/prompt");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://rsmk.me",
        "https://rsmk.co.in",
        "https://zestacademy.tech",
        "https://zestfolio.zestacademy.tech",
        "https://compilers.zestacademy.tech",
      ];

      const allowedSuffixes = [
        ".rsmk.me",
        ".rsmk.co.in"
      ];

      // Allow all localhost addresses
      const isLocalhost = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");

      const isAllowed =
        isLocalhost ||
        allowedOrigins.includes(origin) ||
        allowedSuffixes.some((suffix) => origin.endsWith(suffix));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "Mani Core is live 🧠",
    version: "1.0.0",
    model: "llama-3.3-70b-versatile",
  });
});

// Core chat endpoint
app.post("/api/chat", async (req, res) => {
  const { query, siteContext = "", history = [] } = req.body;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return res.status(400).json({ error: "Query is required and must be a string." });
  }

  if (typeof siteContext !== "string") {
    return res.status(400).json({ error: "Site context must be a string." });
  }

  if (!Array.isArray(history)) {
    return res.status(400).json({ error: "History must be an array." });
  }

  // Security enhancement: Prevent prompt injection via history
  const sanitizedHistory = history.map(msg => {
    if (!msg || typeof msg !== 'object') {
      return { role: 'user', content: '' };
    }
    return {
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: typeof msg.content === 'string' ? msg.content : ''
    };
  });

  try {
    const systemPrompt = buildSystemPrompt(siteContext);
    const response = await callGroq(systemPrompt, query, sanitizedHistory);

    res.json({
      success: true,
      response,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    res.status(500).json({ success: false, error: "An internal server error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Mani Core running on port ${PORT}`);
});
