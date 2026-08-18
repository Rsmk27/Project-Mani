const config = require("./config");

/**
 * Call OpenRouter Chat Completions API with dynamic fast model selection and latency/throughput routing
 * @param {string} systemPrompt - Structured system prompt including RAG context
 * @param {string} userMessage - User query
 * @param {Array<{role: string, content: string}>} history - Previous conversation messages
 * @returns {Promise<{content: string, model: string}>}
 */
async function callOpenRouter(systemPrompt, userMessage, history = []) {
  const {
    apiKey,
    model,
    baseUrl,
    siteUrl,
    siteName,
    providerSort,
    maxTokens,
    temperature,
    timeoutMs,
  } = config.openrouter;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("OpenRouter API key is not configured on the server.");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8),
    { role: "user", content: userMessage },
  ];

  // Parse models - supports comma-separated list of fastest fallback models
  const modelList = String(model || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const payload = {
    messages,
    max_tokens: maxTokens,
    temperature,
    // Dynamically prioritize lowest latency and fastest inference throughput providers
    provider: {
      sort: providerSort || "throughput",
      order: [
        "Cerebras",
        "Groq",
        "Together",
        "DeepInfra",
        "Fireworks",
        "SambaNova",
        "Novita",
        "Hyperbolic",
      ],
      allow_fallbacks: true,
    },
  };

  if (modelList.length > 1) {
    payload.models = modelList;
    payload.route = "fallback";
  } else {
    payload.model = modelList[0] || "openrouter/auto";
  }

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("AI provider request timed out. Please try again.");
    }
    throw new Error("Failed to connect to AI provider. Please check network connectivity.");
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON response
    }

    const providerMsg = errorData?.error?.message;

    switch (response.status) {
      case 401:
        throw new Error("Authentication failed: Invalid or expired OpenRouter API key.");
      case 402:
        throw new Error("OpenRouter account credit limit reached or insufficient balance.");
      case 403:
        throw new Error("Access to the requested OpenRouter model or resource was forbidden.");
      case 404:
        throw new Error(`The requested AI model (${model}) is currently unavailable on OpenRouter.`);
      case 429:
        throw new Error("AI provider rate limit reached. Please wait a moment and try again.");
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error("AI provider is temporarily unavailable. Please try again shortly.");
      default:
        throw new Error(providerMsg ? `AI Provider Error: ${providerMsg}` : `AI Provider returned error status ${response.status}.`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error("Malformed response received from AI provider.");
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string" || content.trim() === "") {
    const refusal = data?.choices?.[0]?.message?.refusal;
    if (refusal) {
      return {
        content: `I cannot fulfill this request: ${refusal}`,
        model: data?.model || modelList[0] || "openrouter/auto",
      };
    }
    return {
      content: "I couldn't generate a response. Please try again.",
      model: data?.model || modelList[0] || "openrouter/auto",
    };
  }

  return {
    content,
    model: data?.model || modelList[0] || "openrouter/auto",
  };
}

module.exports = {
  callOpenRouter,
};
