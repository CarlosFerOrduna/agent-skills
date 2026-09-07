/*
 * Base commitlint config for the working-agreements commit conventions.
 *
 * Rules on top of @commitlint/config-conventional:
 *  - type must be one of the 11 valid Conventional Commits types (gitmojis that
 *    suggest new "types" like critical/security hotfix map back to `fix`).
 *  - the header must start with a gitmoji.
 *  - the header must be at most 72 characters EXCLUDING the emoji (gitmojis can
 *    carry U+FE0F / multiple code points, so counting them is unstable).
 *
 * Setup in the consuming project:
 *    pnpm add -D @commitlint/cli @commitlint/config-conventional
 *    cp enforcement/commitlint.config.cjs commitlint.config.cjs
 * Add a git hook: `npx --no-install commitlint --edit $1` (husky 'commit-msg'
 * or plain .git/hooks/commit-msg).
 */
"use strict";

const VALID_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

// One or more emoji at the start of the header (with possible variation
// selectors and whitespace). Only the FIRST variant selector is consumed so the
// regex stays permissive with sequences like ⚡️ or 🚀.
const EMOJI_RE = /^(\p{Extended_Pictographic}\uFE0F?\s*)+/u;

const withoutEmoji = (input) => input.replace(EMOJI_RE, "");

module.exports = {
  extends: ["@commitlint/config-conventional"],
  parserPreset: {
    parserOpts: {
      // Allow an optional leading gitmoji before `type(scope): subject`.
      headerPattern:
        /^(\p{Extended_Pictographic}\uFE0F?\s*)?(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(([^)]+)\))?!?: (.*)$/u,
      headerCorrespondence: ["", "", "type", "scope", "subject"],
    },
  },
  rules: {
    // We enforce gitmoji + an emoji-aware length below; disable the stock rule.
    "header-max-length": [0],
    "type-enum": [2, "always", VALID_TYPES],
  },
  plugins: [
    {
      rules: {
        "header-leading-gitmoji": ({ header }) => {
          if (!header) return [true];
          return [EMOJI_RE.test(header), "header must start with a gitmoji"];
        },
        "header-max-length-no-emoji": ({ header }) => {
          if (!header) return [true];
          const text = withoutEmoji(header);
          return [
            text.length <= 72,
            `header must not be longer than 72 characters excluding the emoji (got ${text.length})`,
          ];
        },
      },
    },
  ],
};