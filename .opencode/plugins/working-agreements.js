/**
 * Working-agreements plugin for opencode.
 *
 * Injects the working-agreements contract via message transform.
 * Auto-registers the skills directory via the config hook (no symlinks needed).
 * Mirrors the bootstrap pattern used by superpowers for opencode.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Simple frontmatter extraction (avoid a dependency for the bootstrap read)
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line
        .slice(colonIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return {
    frontmatter,
    content: body,
  };
};

// Normalize a path: trim whitespace, expand ~, resolve to absolute
const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== 'string') return null;

  let normalized = p.trim();
  if (!normalized) return null;

  if (normalized.startsWith('~/')) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }

  return path.resolve(normalized);
};

// Module-level cache for bootstrap content.
// The SKILL.md file does not change during a session, so reading + parsing it
// once eliminates redundant fs.existsSync + fs.readFileSync + regex work on
// every agent step.
let _bootstrapCache = undefined; // undefined = not yet loaded, null = file missing

export const WorkingAgreementsPlugin = async ({ directory }) => {
  const homeDir = os.homedir();
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);

  // Resolve the skills directory for both install styles, preferring a single
  // source so opencode never sees the same skill name twice:
  //  - ~/.agents/skills wins when it already contains the contract, because
  //    opencode discovers that directory natively;
  //  - otherwise the repo's skills/ (git-backed plugin spec) is registered, which
  //    covers the fresh-machine install where ~/.agents/skills does not exist.
  const repoSkillsDir = path.resolve(__dirname, '../../skills');
  const homeSkillsDir = path.join(homeDir, '.agents', 'skills');
  const homeContract = path.join(homeSkillsDir, 'working-agreements', 'SKILL.md');

  let skillsDirs = [];
  if (fs.existsSync(homeContract)) {
    skillsDirs = [homeSkillsDir];
  } else if (fs.existsSync(repoSkillsDir)) {
    skillsDirs = [repoSkillsDir];
  } else if (fs.existsSync(homeSkillsDir)) {
    skillsDirs = [homeSkillsDir];
  }

  // Helper to generate bootstrap content (cached after first call)
  const getBootstrapContent = () => {
    if (_bootstrapCache !== undefined) return _bootstrapCache;

    // Try to load the working-agreements skill
    let skillPath = null;
    for (const dir of skillsDirs) {
      const candidate = path.join(dir, 'working-agreements', 'SKILL.md');
      if (fs.existsSync(candidate)) {
        skillPath = candidate;
        break;
      }
    }
    if (!skillPath) {
      _bootstrapCache = null;
      return null;
    }

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);

    const toolMapping = `**Tool Mapping for OpenCode:**
When the skills request actions, substitute OpenCode equivalents:
- Create or update todos → \`todowrite\`
- \`Subagent (general-purpose):\` → \`task\` with \`subagent_type: "general"\`
- Invoke a skill → OpenCode's native \`skill\` tool
- Read files → \`read\`
- Create, edit, or delete files → \`edit\`, \`write\`
- Run shell commands → \`bash\`
- Search files → \`grep\`, \`glob\`
- Ask the user a question → \`question\`
- Fetch a URL → \`webfetch\`

Use OpenCode's native \`skill\` tool to list and load skills.`;

    _bootstrapCache = `<EXTREMELY_IMPORTANT>
**IMPORTANT: The working-agreements skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "working-agreements" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;

    return _bootstrapCache;
  };

  return {
    // Register the resolved skills directory so opencode discovers the skills
    // without manual symlinks or config file edits.
    config: async (config) => {
      if (!skillsDirs.length) return;
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      for (const dir of skillsDirs) {
        if (!config.skills.paths.includes(dir)) {
          config.skills.paths.push(dir);
        }
      }
    },

    // Inject the bootstrap into the first user message of each session.
    // Using a user message instead of a system message avoids:
    //   1. Token bloat from system messages repeated every turn
    //   2. Multiple system messages breaking some models
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find((m) => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;

      // Guard: skip if the first user message already contains the bootstrap.
      if (firstUser.parts.some((p) => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;

      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
