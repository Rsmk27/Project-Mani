const MAX_QUERY_LENGTH = 1000;
const MAX_SITE_CONTEXT_LENGTH = 500;
const MAX_HISTORY_ITEMS = 20;
const MAX_HISTORY_CONTENT_LENGTH = 2000;

function validateChatRequest(body) {
  if (!body) {
    return { valid: false, status: 400, error: "Request body is required." };
  }

  const { query, siteContext = "", history = [] } = body;

  // Validate query: required, must be non-empty string, max 1000 chars
  if (query === undefined || query === null) {
    return { valid: false, status: 400, error: "Query is required." };
  }
  if (typeof query !== "string") {
    return { valid: false, status: 400, error: "Query must be a string." };
  }
  if (query.trim() === "") {
    return { valid: false, status: 400, error: "Query cannot be empty." };
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      status: 400,
      error: `Query is too long. Maximum length is ${MAX_QUERY_LENGTH} characters.`,
    };
  }

  // Validate siteContext: must be string, max 500 chars
  if (typeof siteContext !== "string") {
    return { valid: false, status: 400, error: "Site context must be a string." };
  }
  if (siteContext.length > MAX_SITE_CONTEXT_LENGTH) {
    return {
      valid: false,
      status: 400,
      error: `Site context is too long. Maximum length is ${MAX_SITE_CONTEXT_LENGTH} characters.`,
    };
  }

  // Validate history: must be array, max 20 items
  if (!Array.isArray(history)) {
    return { valid: false, status: 400, error: "History must be an array." };
  }
  if (history.length > MAX_HISTORY_ITEMS) {
    return {
      valid: false,
      status: 400,
      error: `History has too many items. Maximum is ${MAX_HISTORY_ITEMS} items.`,
    };
  }

  // Sanitize each history item: force role to "user" or "assistant", truncate content to 2000 chars, drop empty content entries
  const sanitizedHistory = [];
  for (const item of history) {
    if (!item || typeof item !== "object") continue;

    const content = item.content !== undefined && item.content !== null ? String(item.content) : "";
    if (content.trim() === "") continue;

    let role = "user";
    if (item.role === "assistant") {
      role = "assistant";
    }

    const truncatedContent = content.substring(0, MAX_HISTORY_CONTENT_LENGTH);

    sanitizedHistory.push({
      role,
      content: truncatedContent,
    });
  }

  return {
    valid: true,
    data: {
      query: query.trim(),
      siteContext: siteContext.trim(),
      history: sanitizedHistory,
    },
  };
}

module.exports = {
  MAX_QUERY_LENGTH,
  MAX_SITE_CONTEXT_LENGTH,
  MAX_HISTORY_ITEMS,
  MAX_HISTORY_CONTENT_LENGTH,
  validateChatRequest,
};
