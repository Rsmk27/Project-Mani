const assert = require("assert");
const { getActiveModel, getActiveProvider, generateChatCompletion } = require("./src/ai");
const { callOpenRouter } = require("./src/ai/openrouter");
const { buildSystemPrompt } = require("./src/prompt");
const { getKnowledgeBase } = require("./src/knowledge");
const { validateChatRequest } = require("./src/validator");
const { getStatus, recordRequest } = require("./src/stats");

async function runTests() {
  console.log("🚀 Starting Migration Verification Tests...\n");

  // 1. Check AI Provider & Active Model
  console.log("1. Testing AI Provider Configuration...");
  assert.strictEqual(getActiveProvider(), "openrouter", "Provider should default to openrouter");
  assert.ok(getActiveModel().length > 0, "Active model should be configured");
  console.log(`   ✓ Active Provider: ${getActiveProvider()}`);
  console.log(`   ✓ Active Model: ${getActiveModel()}`);

  // 2. Check Knowledge Base & RAG Context
  console.log("\n2. Testing RAG Knowledge Base...");
  const kb = getKnowledgeBase();
  assert.ok(kb.rsmkCore, "rsmkCore must exist");
  assert.ok(kb.projects, "projects must exist");
  assert.ok(kb.founderProfile, "founderProfile must exist");
  console.log(`   ✓ Loaded ${kb.projects.projects.length} projects from knowledge base`);

  const systemPrompt = buildSystemPrompt("User is on https://rsmk.tech");
  assert.ok(systemPrompt.includes("Mani AI"), "System prompt should contain Mani AI identity");
  assert.ok(systemPrompt.includes("Srinivasa Manikanta Rajapantula"), "System prompt should contain founder name");
  assert.ok(systemPrompt.includes("Sustainable Firefighter Monitoring System"), "System prompt should contain SFMS project");
  assert.ok(systemPrompt.includes("User is on https://rsmk.tech"), "System prompt should include site context");
  assert.strictEqual(kb.rsmkCore.founder.links.portfolio, "https://rsmk.tech", "Main portfolio link should be rsmk.tech");
  assert.ok(systemPrompt.includes("[Portfolio](https://rsmk.tech)"), "Prompt should provide rsmk.tech portfolio link");

  // Verify all knowledge base project links have migrated from rsmk.me and rsmk.co.in to rsmk.tech
  kb.projects.projects.forEach((proj) => {
    if (proj.link) {
      assert.ok(!proj.link.includes("rsmk.me"), `Project ${proj.name} should not use rsmk.me: ${proj.link}`);
      assert.ok(!proj.link.includes("rsmk.co.in"), `Project ${proj.name} should not use rsmk.co.in: ${proj.link}`);
    }
  });
  assert.ok(!systemPrompt.includes("rsmk.me"), "System prompt should not contain any rsmk.me links");
  assert.ok(!systemPrompt.includes("rsmk.co.in"), "System prompt should not contain any rsmk.co.in links");

  console.log("   ✓ RAG system prompt built and verified successfully with rsmk.tech as main domain");

  // 3. Check Validation & Conversation History
  console.log("\n3. Testing Request Validation & History Handling...");
  const validReq = validateChatRequest({
    query: "Who is Manikanta?",
    siteContext: "rsmk.tech",
    history: [
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello! How can I help?" },
    ],
  });
  assert.strictEqual(validReq.valid, true);
  assert.strictEqual(validReq.data.history.length, 2);
  assert.strictEqual(validReq.data.query, "Who is Manikanta?");

  const emptyReq = validateChatRequest({ query: "" });
  assert.strictEqual(emptyReq.valid, false);
  console.log("   ✓ Validation rules and history sanitization passed");

  // 4. Check Missing API Key Error Handling
  console.log("\n4. Testing Error Handling for Missing API Key...");
  const originalKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = "";
  try {
    await generateChatCompletion(systemPrompt, "Hello Mani");
    assert.fail("Should have thrown missing key error");
  } catch (err) {
    console.log(`   ✓ Cleanly handled missing key error: "${err.message}"`);
    assert.strictEqual(err.message, "OpenRouter API key is not configured on the server.");
  }
  process.env.OPENROUTER_API_KEY = originalKey;

  // 5. Check Live 401 Invalid Key Error Handling against OpenRouter
  console.log("\n5. Testing Live 401 Invalid Key Rejection from OpenRouter...");
  const aiConfig = require("./src/ai/config");
  aiConfig.openrouter.apiKey = "sk-or-v1-invalid-dummy-key-for-test-999999999999999999999";
  try {
    await callOpenRouter(systemPrompt, "Hello Mani");
    assert.fail("Should have failed with 401");
  } catch (err) {
    console.log(`   ✓ Cleanly caught OpenRouter 401: "${err.message}"`);
    assert.ok(
      err.message.includes("Authentication failed") || err.message.includes("Invalid or expired OpenRouter API key"),
      "Error should indicate authentication failure"
    );
    // Ensure no secrets leaked
    assert.ok(!err.message.includes("sk-or-v1-invalid-dummy-key"), "Error must not leak the raw key");
  }
  aiConfig.openrouter.apiKey = process.env.OPENROUTER_API_KEY || "";

  // 6. Check Stats & Health Check
  console.log("\n6. Testing Stats & Status Reporting...");
  recordRequest({ success: true, queryLength: 15 });
  const status = getStatus();
  assert.strictEqual(status.model, getActiveModel());
  assert.ok(status.requests.total >= 1);
  console.log(`   ✓ Status model is dynamically linked to: ${status.model}`);

  // 7. Check CORS Origin Authorization (including rsmk.tech)
  console.log("\n7. Testing CORS Origin Authorization...");
  const { isOriginAllowed } = require("./src/cors");
  
  // rsmk.tech tests
  assert.strictEqual(isOriginAllowed("https://rsmk.tech"), true, "https://rsmk.tech must be allowed");
  assert.strictEqual(isOriginAllowed("http://rsmk.tech"), true, "http://rsmk.tech must be allowed");
  assert.strictEqual(isOriginAllowed("https://chat.rsmk.tech"), true, "Subdomain chat.rsmk.tech must be allowed");
  assert.strictEqual(isOriginAllowed("https://api.rsmk.tech:3001"), true, "Origin with port on rsmk.tech must be allowed");

  // Existing ecosystem domains
  assert.strictEqual(isOriginAllowed("https://rsmk.me"), true, "https://rsmk.me must be allowed");
  assert.strictEqual(isOriginAllowed("https://portfolio.rsmk.me"), true, "Subdomain portfolio.rsmk.me must be allowed");
  assert.strictEqual(isOriginAllowed("https://rsmk.co.in"), true, "https://rsmk.co.in must be allowed");
  assert.strictEqual(isOriginAllowed("https://zestacademy.tech"), true, "https://zestacademy.tech must be allowed");
  assert.strictEqual(isOriginAllowed("http://localhost:3000"), true, "Localhost must be allowed");
  assert.strictEqual(isOriginAllowed("http://127.0.0.1:8080"), true, "127.0.0.1 must be allowed");
  assert.strictEqual(isOriginAllowed(undefined), true, "Requests without origin (server/mobile) must be allowed");

  // Malicious / unauthorized domains
  assert.strictEqual(isOriginAllowed("https://evil.com"), false, "evil.com must be rejected");
  assert.strictEqual(isOriginAllowed("https://evil-rsmk.tech"), false, "Lookalike evil-rsmk.tech must be rejected");
  assert.strictEqual(isOriginAllowed("https://rsmk.tech.attacker.com"), false, "Spoofed suffix domain must be rejected");
  console.log("   ✓ CORS origin validation verified for rsmk.tech and subdomains");

  console.log("\n✅ All unit and integration verification tests passed successfully!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
