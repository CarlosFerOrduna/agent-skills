#!/usr/bin/env node

/**
 * Validate the skills repo consistency.
 *
 * Run locally via `npm run check:skills`; requires only Node
 * (no Python or extra toolchain needed).
 *
 *   - every skills/<name>/SKILL.md has valid frontmatter (name == folder,
 *     non-empty description, version matching package.json);
 *   - plugin.json and every marketplace plugin version match package.json;
 *   - the "Stack skills" index in working-agreements matches the actual skill set;
 *   - the "# Contract version" section matches package.json;
 *   - the README mentions every skill;
 *   - runtime surfaces (skills/, hooks/, .opencode/) have no stale references
 *     to the archived using-working-agreements bootstrap. Docs are excluded so
 *     migration notes and changelogs can mention the name.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = path.join(root, 'skills');
const runtimeDirs = ['skills', 'hooks', '.opencode'];
const staleNames = ['using-working-agreements'];

function fail(msg) {
  console.error(`FAIL ${msg}`);
  process.exit(1);
}

// Anchored on the delimiter lines so a "---" sequence inside a description
// does not truncate the frontmatter.
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return {};

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > -1) {
      fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  return fields;
}

const pkgVersion = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;

const skills = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (!skills.length) fail('no skills found');

for (const name of skills) {
  const skillPath = path.join(skillsDir, name, 'SKILL.md');
  if (!fs.existsSync(skillPath)) fail(`skill '${name}' missing SKILL.md`);

  const contents = fs.readFileSync(skillPath, 'utf8');
  const fm = parseFrontmatter(contents);
  if (fm.name !== name) fail(`${name}/SKILL.md frontmatter name mismatch: '${fm.name}'`);
  if (!fm.description) fail(`${name}/SKILL.md missing description`);
  if (fm.version !== pkgVersion) fail(`${name}/SKILL.md version '${fm.version}' != package.json '${pkgVersion}'`);
  if (!contents.endsWith('\n')) fail(`${name}/SKILL.md must end with a final newline (.editorconfig)`);
}

// Claude Code installs against these manifests; every published version must
// match so two collaborators on different installs can compare contracts.
for (const rel of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']) {
  const filePath = path.join(root, rel);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const versions = rel.endsWith('marketplace.json') ? json.plugins.map((plugin) => plugin.version) : [json.version];
  for (const version of versions) {
    if (version !== pkgVersion) fail(`${rel} version '${version}' != package.json '${pkgVersion}'`);
  }
}

const waText = fs.readFileSync(path.join(skillsDir, 'working-agreements', 'SKILL.md'), 'utf8');

const indexed = new Set([...waText.matchAll(/^\s*- `([a-z0-9-]+)` —/gm)].map((match) => match[1]));
const stack = new Set(skills.filter((name) => name !== 'working-agreements'));
const missing = [...stack].filter((name) => !indexed.has(name)).sort();
const extra = [...indexed].filter((name) => !stack.has(name)).sort();

if (missing.length || extra.length) {
  fail(`contract stack index drift: missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)}`);
}

const versionMatch = waText.match(/\*\*v([0-9][0-9a-z.-]*)\*\*/);
if (!versionMatch || versionMatch[1] !== pkgVersion) {
  fail(`contract version section mismatch: '${versionMatch ? versionMatch[1] : 'none'}' != ${pkgVersion}`);
}

const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
for (const name of skills) {
  if (!readme.includes(name)) fail(`README does not mention skill '${name}'`);
}

for (const dir of runtimeDirs) {
  for (const filePath of walk(path.join(root, dir))) {
    const content = fs.readFileSync(filePath, 'utf8');

    for (const name of staleNames) {
      if (content.includes(name)) fail(`stale reference to '${name}' in ${path.relative(root, filePath)}`);
    }
  }
}

console.log(`PASS ${skills.length} skills, versions @ ${pkgVersion}, index and README in sync`);

function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }

  return results;
}
