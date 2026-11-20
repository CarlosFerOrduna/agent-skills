/*
 * Base ESLint flat-config for the working-agreements code style.
 *
 * High-value, low-cost rules shared across project repos. Copy the relevant
 * fragments into the consuming project's eslint.config.mjs and adjust the
 * ignore list for that repo.
 *
 * Setup: npm install -D eslint @eslint/js typescript-eslint eslint-plugin-unicorn
 */
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      unicorn,
    },
    rules: {
      // Lowercase kebab-case files: user-profile.service.ts, auth.module.ts
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          // Barrel files and root configs are conventionally exempt.
          ignore: [/^index\.ts$/, /^\.?[\w.-]*config\.(ts|js|mjs|cjs)$/],
        },
      ],

      // No `as` casts; `as const` stays allowed by this rule.
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],

      // 3+ params go in a typed object. DI constructors and callbacks passed
      // to a call (reduce, middleware) are exempt.
      'no-restricted-syntax': [
        'error',
        {
          selector: [
            'FunctionDeclaration[params.length>2]',
            'MethodDefinition[kind!="constructor"] > FunctionExpression[params.length>2]',
            'ArrowFunctionExpression[params.length>2]:not(CallExpression > ArrowFunctionExpression)',
          ].join(', '),
          message: 'Use a single object parameter with a named type for 3+ parameters.',
        },
      ],

      // Optional: keep within-module imports relative and forbid hopping
      // across many parent directories (deep "../../../../shared" chains).
      // Cross-module imports should use the project path alias (@/, @app/).
      //
      // "no-restricted-imports": [
      //   "error",
      //   {
      //     patterns: [
      //       {
      //         group: ["../../../../*"],
      //         message: "use the path alias (@/) for cross-boundary imports",
      //       },
      //     ],
      //   },
      // ],
    },
  },
  {
    // Mocks and fixtures need casts.
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
);
