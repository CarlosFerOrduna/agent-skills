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
'use strict';

const VALID_TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

// Exactly one emoji at the start of the header (with possible variation
// selector and whitespace). A single pictographic keeps the leading-gitmoji
// and length rules honest: repeated emoji like ✨✨✨ do not slip through and
// do not get stripped from the 72-character count.
const EMOJI_RE = /^\p{Extended_Pictographic}\uFE0F?\s*/u;

const withoutEmoji = (input) => input.replace(EMOJI_RE, '');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      // Allow an optional leading gitmoji run before `type(scope): subject`.
      // Named groups make the correspondence explicit and resilient to the
      // parser's positional fallback (matches[i + 1]).
      // The emoji group swallows a whole run of pictographs so repeated emoji
      // like ✨✨✨ reach the rules (exactly-one-gitmoji) instead of crashing
      // the stock parser into a `type may not be empty` report.
      // The type group accepts any word; `type-enum` then reports the invalid
      // value with a readable message instead of a parse failure.
      headerPattern:
        /^(?<emoji>(?:\p{Extended_Pictographic}\uFE0F?\s*)+)?(?<type>\w+)(?:\((?<scope>[^)]+)\))?!?: (?<subject>.*)$/u,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
  rules: {
    // We enforce gitmoji + an emoji-aware length below; disable the stock rule.
    'header-max-length': [0],
    'type-enum': [2, 'always', VALID_TYPES],
    'header-leading-gitmoji': [2, 'always'],
    'header-max-length-no-emoji': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'header-leading-gitmoji': ({ header }) => {
          if (!header) return [true];
          if (!EMOJI_RE.test(header)) return [false, 'header must start with a gitmoji'];
          const rest = header.replace(EMOJI_RE, '');
          return [!EMOJI_RE.test(rest), 'header must start with exactly one gitmoji'];
        },
        'header-max-length-no-emoji': ({ header }) => {
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
