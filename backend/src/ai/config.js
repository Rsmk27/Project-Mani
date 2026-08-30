// Configuration for AI providers
module.exports = {
  provider: process.env.AI_PROVIDER || "openrouter",
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || "",
    // Supports single model, openrouter/auto, or comma-separated fastest model fallback list
    model:
      process.env.OPENROUTER_MODEL ||
      "google/gemini-2.0-flash-001,meta-llama/llama-3.3-70b-instruct,meta-llama/llama-3.1-8b-instruct",
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    siteUrl: process.env.SITE_URL || "https://rsmk.tech",
    siteName: process.env.SITE_NAME || "Mani AI",
    providerSort: process.env.OPENROUTER_PROVIDER_SORT || "throughput", // "throughput" or "latency"
    maxTokens: parseInt(process.env.MAX_TOKENS, 10) || 1024,
    temperature: parseFloat(process.env.TEMPERATURE) || 0.7,
    timeoutMs: parseInt(process.env.API_TIMEOUT_MS, 10) || 30000,
  },
};
