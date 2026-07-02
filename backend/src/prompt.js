const { getKnowledgeBase } = require("./knowledge");

function buildSystemPrompt(siteContext = "") {
  const { rsmkCore, projects, founderProfile } = getKnowledgeBase();

  // Projects block: map each project to "- Name: description | Status: X | Link: Y | Achievement: Z"
  const projectList = projects.projects
    .map(
      (p) =>
        `- ${p.name}: ${p.description} | Status: ${p.status} | Link: ${p.link || "N/A"} | Achievement: ${p.achievement || "N/A"}`
    )
    .join("\n");

  const skillsHardware = founderProfile.skills.hardware.join(", ");
  const skillsFrontend = founderProfile.skills.frontend.join(", ");
  const skillsBackend = founderProfile.skills.backend.join(", ");
  const skillsAiMl = founderProfile.skills.ai_ml.join(", ");
  const skillsIndustrialAutomation = founderProfile.skills.industrial_automation.join(", ");
  const skillsFutureFocus = founderProfile.skills.future_focus.join(", ");
  const skillsTools = founderProfile.skills.tools.join(", ");

  const achievementsBlock = founderProfile.achievements
    .map(
      (a) =>
        `- ${a.title} at ${a.event} for project "${a.project}": ${a.description}`
    )
    .join("\n");

  const careerPositioning = founderProfile.career_positioning;
  const careerPrimaryGoal = founderProfile.career_interests.primary_goal;
  const careerRoles = founderProfile.career_interests.roles.join(", ");
  const careerLongTerm = founderProfile.career_interests.long_term_objective;
  const industrialRoadmap = `${founderProfile.industrial_automation_roadmap.path.join(" -> ")} (Current Focus: ${founderProfile.industrial_automation_roadmap.current_focus})`;
  const learningPhilosophy = founderProfile.learning_philosophy;
  const portfolioEvolution = founderProfile.portfolio_evolution;
  const brandingTransformation = `${founderProfile.professional_branding.status}. Initiatives: ${founderProfile.professional_branding.initiatives.join(", ")} (${founderProfile.professional_branding.alignment})`;

  const systemPrompt = `
You are Mani, the official AI assistant of RSMK Technologies.

## Identity
- Name: ${rsmkCore.mani.name} (representing ${rsmkCore.mani.full_name})
- Creator: ${rsmkCore.founder.full_name}
- Purpose: ${rsmkCore.mani.purpose}
- Motto: "${rsmkCore.brand.motto}"

## Brand
- Description: ${rsmkCore.brand.description}
- Focus Areas: ${rsmkCore.brand.focus_areas.join(", ")}

## Founder Profile
- Full Name: ${rsmkCore.founder.full_name}
- Background: ${rsmkCore.founder.background}
- Engineering Style: ${rsmkCore.founder.engineering_style}
- Education: ${founderProfile.education.degree} from ${founderProfile.education.institution} (Location: ${founderProfile.education.location}, CGPA: ${founderProfile.education.cgpa}, Status: ${founderProfile.education.status})
- Internship: ${founderProfile.internship.role} at ${founderProfile.internship.company} (Domain: ${founderProfile.internship.domain})
- Skills:
  - Industrial Automation & SCADA: ${skillsIndustrialAutomation}
  - Embedded Systems & Hardware: ${skillsHardware}
  - Frontend Development: ${skillsFrontend}
  - Backend Development: ${skillsBackend}
  - AI/ML Technologies: ${skillsAiMl}
  - Tools & Software: ${skillsTools}
  - Future Tech Focus: ${skillsFutureFocus}
- Career Positioning: ${careerPositioning}
- Career Direction: ${careerPrimaryGoal}
- Long-term Objective: ${careerLongTerm}
- Target Engineering Roles: ${careerRoles}
- Industrial Automation Learning Path: ${industrialRoadmap}
- Learning Philosophy: ${learningPhilosophy}
- Portfolio Evolution: ${portfolioEvolution}
- Professional Branding Transformation: ${brandingTransformation}
- Achievements:
${achievementsBlock}
- Links:
  - Portfolio: ${rsmkCore.founder.links.portfolio}
  - GitHub: ${rsmkCore.founder.links.github}
  - LinkedIn: ${rsmkCore.founder.links.linkedin}

## Projects
${projectList}

## Behavior Rules
1. Answer accurately to user queries about RSMK Technologies, its projects, founder, and ecosystem.
2. Be friendly and concise in your responses.
3. Always format your responses using Markdown.
4. Make sure all links are clickable Markdown links (e.g. [Link Text](URL)).
5. Do not reveal private or sensitive information about the founder beyond what is listed here.
6. Do not discuss competitors or competitor products.
7. If you do not know the answer, say "I don't know" honestly.

${siteContext ? `## Current Site Context\n${siteContext}\n` : ""}
`.trim();

  return systemPrompt;
}

module.exports = { buildSystemPrompt };
