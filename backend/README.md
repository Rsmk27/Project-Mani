# Mani Core Backend

This is the backend server for **Mani**, the official AI assistant of RSMK Technologies. It handles requests from the Mani UI frontend, communicating with the Groq API (`llama-3.3-70b-versatile`) to generate intelligent, context-aware responses.

## Setup & Run

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Create a `.env` file based on `.env.example`. You will need your Groq API key:
   ```env
   PORT=3001
   GROQ_API_KEY=your_groq_api_key_here
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
   *The server will run on port `3001` by default.*

---

## API Endpoints

### 1. Health Check
Checks if the Mani Core server is running.

**Request:**
`GET /`

**Response:**
```json
{
  "status": "Mani Core is live 🧠",
  "version": "1.0.0",
  "model": "llama-3.3-70b-versatile"
}
```

### 2. Chat with Mani
This is the main endpoint used to send a question/query to Mani and receive a generated answer.

**Request:**
`POST /api/chat`

**Headers:**
- `Content-Type: application/json`

**Body (JSON):**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `query` | `string` | **Yes** | The user's question or message for Mani. |
| `siteContext` | `string` | No | Optional context about the site the user is chatting from. |
| `history` | `array` | No | Array of previous messages for conversation history. Each object should have a `role` ("user" or "assistant") and `content`. |

**Example Request (JavaScript / Fetch):**
```javascript
const response = await fetch("http://localhost:3001/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query: "What is Project Mani?",
    history: [
      { role: "user", content: "Hi Mani!" },
      { role: "assistant", content: "Hello! How can I help you today?" }
    ]
  }),
});

const data = await response.json();
console.log(data.response);
```

**Example Successful Response (200 OK):**
```json
{
  "success": true,
  "response": "Project Mani is the central AI ecosystem for RSMK Technologies...",
  "model": "llama-3.3-70b-versatile"
}
```

**Example Error Response (400 Bad Request):**
```json
{
  "error": "Query is required."
}
```

## CORS Policies
The backend is configured to only allow requests from specific RSMK domains. Currently, allowed origins include:
- `http://localhost:3000` (for local development)
- Exact matches: `https://rsmk.me`, `https://zestacademy.tech`, `https://zestfolio.zestacademy.tech`, `https://compilers.zestacademy.tech`
- Subdomain matches ending in: `.rsmk.me`, `.rsmk.co.in`, `.vercel.app`
