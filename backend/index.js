require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { callGroq } = require("./src/groq");
const { buildSystemPrompt } = require("./src/prompt");
const { validateChatRequest } = require("./src/validator");
const { recordRequest, getStatus } = require("./src/stats");

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "https://rsmk.me",
  "https://rsmk.co.in",
  "https://zestacademy.tech",
  "https://zestfolio.zestacademy.tech",
  "https://compilers.zestacademy.tech",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      try {
        const parsed = new URL(origin);
        const hostname = parsed.hostname;

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return callback(null, true);
        }

        if (hostname.endsWith(".rsmk.me") || hostname.endsWith(".rsmk.co.in")) {
          return callback(null, true);
        }

        callback(new Error("Not allowed by CORS"));
      } catch (err) {
        callback(new Error("Invalid Origin"));
      }
    },
  })
);

app.use(express.json());

// GET / -> health check
app.get("/", (req, res) => {
  res.json({
    status: "Mani Core is live 🧠",
    version: "1.2.0",
    model: "llama-3.3-70b-versatile",
  });
});

// GET /api/status -> stats check
app.get("/api/status", (req, res) => {
  res.json(getStatus());
});

// POST /api/chat -> chat endpoint
app.post("/api/chat", async (req, res) => {
  const validation = validateChatRequest(req.body);
  if (!validation.valid) {
    return res.status(validation.status).json({ error: validation.error });
  }

  const { query, siteContext, history } = validation.data;

  try {
    const systemPrompt = buildSystemPrompt(siteContext);
    const response = await callGroq(systemPrompt, query, history);

    recordRequest({ success: true, queryLength: query.length });

    res.json({
      success: true,
      response,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err) {
    recordRequest({ success: false, queryLength: query.length });
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Mani Core v1.2.0 running on port ${PORT}`);
});
