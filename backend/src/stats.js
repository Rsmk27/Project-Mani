const startTime = Date.now();

const stats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  totalQueryChars: 0,
};

function recordRequest({ success, queryLength = 0 }) {
  stats.totalRequests++;
  stats.totalQueryChars += queryLength;
  if (success) {
    stats.successfulRequests++;
  } else {
    stats.failedRequests++;
  }
}

function getStatus() {
  const raw_ms = Date.now() - startTime;

  const totalSecs = Math.floor(raw_ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const formatted = `${hours}h ${minutes}m ${seconds}s`;

  let success_rate = "N/A";
  if (stats.totalRequests > 0) {
    success_rate = `${((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%`;
  }

  const avg_query_length = stats.totalRequests > 0
    ? stats.totalQueryChars / stats.totalRequests
    : 0;

  return {
    status: "Mani Core is live 🧠",
    version: "1.2.0",
    model: "llama-3.3-70b-versatile",
    uptime: {
      raw_ms,
      formatted,
    },
    requests: {
      total: stats.totalRequests,
      successful: stats.successfulRequests,
      failed: stats.failedRequests,
      success_rate,
    },
    avg_query_length,
  };
}

module.exports = {
  recordRequest,
  getStatus,
};
