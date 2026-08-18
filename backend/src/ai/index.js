const config = require("./config");
const { callOpenRouter } = require("./openrouter");

/**
 * Generate chat completion using configured AI provider
 * @param {string} systemPrompt - Prompt with persona and RAG context
 * @param {string} userMessage - User input
 * @param {Array<{role: string, content: string}>} history - Sanitized chat history
 * @returns {Promise<{content: string, model: string}>}
 */
async function generateChatCompletion(systemPrompt, userMessage, history = []) {
  const provider = (config.provider || "openrouter").toLowerCase();

  switch (provider) {
    case "openrouter":
      return await callOpenRouter(systemPrompt, userMessage, history);
    default:
      throw new Error(`Unsupported AI provider configured: "${provider}"`);
  }
}

/**
 * Get active model name
 * @returns {string}
 */
function getActiveModel() {
  const provider = (config.provider || "openrouter").toLowerCase();
  if (provider === "openrouter") {
    return config.openrouter.model;
  }
  return "custom";
}

/**
 * Get active provider name
 * @returns {string}
 */
function getActiveProvider() {
  return config.provider || "openrouter";
}

module.exports = {
  generateChatCompletion,
  getActiveModel,
  getActiveProvider,
};
