# 🧠 Project Mani

> The AI brain of RSMK Technologies — a smart, fast, and free personal AI assistant that knows everything about RSMK Technologies and powers intelligent chat across all RSMK websites.

---

## What is Mani?

**Project Mani** is a centralized AI assistant built and owned by RSMK Technologies. It is not a generic chatbot — it is a purpose-built AI that carries deep knowledge about RSMK Technologies, its founder, and all projects under the brand.

Mani is designed to:

- Answer questions about RSMK Technologies and its projects accurately
- Power chat widgets embedded across multiple RSMK websites
- Use site-specific knowledge (RAG) to answer context-aware questions per website
- Fall back to general AI reasoning for queries outside its knowledge base

Think of Mani as the **single AI brain** that all RSMK websites share — each website adds its own layer of knowledge on top.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  RSMK Websites                      │
│   rsmk.me   │   BudgetBuddy   │   GridForge   │ ... │
└──────┬───────────────┬─────────────────┬────────────┘
       │               │                 │
       ▼               ▼                 ▼
┌─────────────────────────────────────────────────────┐
│              Mani Core API (Render)                  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            Groq Inference Engine             │   │
│  │         llama-3.3-70b-versatile              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐  │
│  │  RSMK Core   │    │   Per-Site RAG Context   │  │
│  │  Knowledge   │    │  (injected per request)  │  │
│  │    Base      │    │                          │  │
│  └──────────────┘    └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### How it works

1. A user asks a question on any RSMK website
2. The chat widget sends the query + site context to Mani Core API
3. Mani uses its RSMK knowledge base + the site's RAG context to answer
4. The response is returned and displayed in the chat widget

---

## Project Structure

```
project-mani/
├── backend/                  → Mani Core API (Node.js + Express)
│   ├── src/
│   │   ├── groq.js           → Groq inference caller
│   │   ├── knowledge.js      → RSMK knowledge base loader
│   │   └── prompt.js         → System prompt builder
│   ├── knowledge/
│   │   ├── rsmk-core.json    → RSMK Technologies + founder info
│   │   ├── projects.json     → All RSMK projects data
│   │   └── achievements.json → Hackathons, certifications, etc.
│   ├── index.js              → Express server entry point
│   ├── .env.example
│   └── package.json
│
├── widget/                   → Embeddable chat widget
│   ├── mani-widget.js        → Drop-in script tag widget
│   └── mani-widget.css       → Widget styles
│
└── README.md
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| AI Model | Groq — `llama-3.3-70b-versatile` | Free, fastest inference, highly accurate |
| Backend | Node.js + Express | Lightweight, easy to maintain |
| Hosting | Render (free tier) | Always-on, no cold start issues |
| Knowledge | Structured JSON files | Simple, fast, no vector DB needed in v1 |
| RAG | Context injection per request | Site-specific knowledge per website |
| Widget | Vanilla JS + CSS | Embeds into any website with one script tag |

---

## Phases

### ✅ Phase 1 — Mani Core
A standalone API that knows everything about RSMK Technologies.

- Groq-powered backend
- RSMK knowledge base (JSON)
- System prompt with Mani's identity
- Single `/api/chat` endpoint
- Deployed on Render

### 🔄 Phase 2 — Per-Site RAG Layer
Each website gets its own knowledge layer injected into Mani.

- `rsmk.me` → portfolio, skills, contact info
- `BudgetBuddy` → app features, FAQs, how-to guides
- `GridForge` → project docs, simulation info

### 🔜 Phase 3 — Embeddable Widget
A single script tag that any RSMK website can drop in to get a full Mani chat UI.

```html
<script src="https://mani-core.onrender.com/widget/mani-widget.js"
        data-site="rsmk-portfolio">
</script>
```

### 🔜 Phase 4 — Ecosystem Integration
- Mani connects to BudgetBuddy data
- Mani connects to GridForge simulation outputs
- Project Mani dashboard for managing knowledge bases

---

## API Reference

### Base URL
```
https://mani-core.onrender.com
```

### Health Check
```
GET /
```
```json
{ "status": "Mani Core is live 🧠" }
```

### Chat Endpoint
```
POST /api/chat
```

**Request body:**
```json
{
  "query": "What is BudgetBuddy?",
  "siteContext": "User is on the BudgetBuddy app page.",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! I'm Mani..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "BudgetBuddy is an Android expense tracking app built by RSMK Technologies...",
  "model": "llama-3.3-70b-versatile"
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key from console.groq.com |
| `PORT` | Server port (default: 3001) |

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/project-mani.git
cd project-mani/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run the server
node index.js

# Test
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Who is Mani?"}'
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Mani Core API | Render | `https://mani-core.onrender.com` |
| Widget CDN | Render static | `https://mani-core.onrender.com/widget/` |

---

## Calling the API (Frontend Integration)

Any authorized RSMK website or frontend (like `mani-ui`) can connect to Mani with a straightforward fetch call to the `/api/chat` endpoint. 

Here is a quick example of how you send a question and get an answer:

```javascript
const chatWithMani = async (userMessage, conversationHistory = []) => {
  try {
    const response = await fetch("http://localhost:3001/api/chat", { // Or your production URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: userMessage,
        // Optional context about the site the user is chatting from
        siteContext: "User is browsing the main RSMK ecosystem interface.",
        // History ensures Mani remembers the context of the conversation
        history: conversationHistory 
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log("Mani says:", data.response);
      return data.response;
    } else {
      console.error("Mani Error:", data.error);
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
};
```

> **Note on CORS:** Ensure your frontend URL is allowlisted in the backend `cors` configuration, or the request will be blocked.

### Detailed Backend Documentation
For more in-depth information about backend environment setup, API endpoint structure, and exact response formats, please refer to the **[Backend README](./backend/README.md)**.

---

## Built by

**RSMK Technologies** — a personal tech brand by Srinivasa Manikanta Rajapantula.

> rsmk.me · GitHub · LinkedIn