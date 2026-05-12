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
        "http://localhost:3000",
        "https://rsmk.me",
        "https://zestacademy.tech",
        "https://zestfolio.zestacademy.tech",
        "https://compilers.zestacademy.tech",
      ];

      const allowedSuffixes = [
        ".rsmk.me",
        ".rsmk.co.in"
      ];

      const isAllowed =
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

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Query is required." });
  }

  try {
    const systemPrompt = buildSystemPrompt(siteContext);
    const response = await callGroq(systemPrompt, query, history);

    res.json({
      success: true,
      response,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Mani Core running on port ${PORT}`);
});
