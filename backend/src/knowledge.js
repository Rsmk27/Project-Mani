const rsmkCore = require("../knowledge/rsmk-core.json");
const projects = require("../knowledge/projects.json");
const founderProfile = require("../knowledge/founder-profile.json");

function getKnowledgeBase() {
  return { rsmkCore, projects, founderProfile };
}

module.exports = { getKnowledgeBase };
