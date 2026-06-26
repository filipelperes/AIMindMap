import { defineConfig } from 'i18next-cli';

// i18next-cli configuration
// - `status` command: checks translation coverage across all locales
// - `types` command: generates TypeScript declarations for translation keys
// - `extract` command: NOT recommended — generates namespace-wrapped JSON
//   incompatible with this project's flat JSON structure.
//   Use `i18next-parser` for extraction instead: npm run i18n:extract

export default defineConfig({
  locales: ['en-US', 'pt-BR'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'src/i18n/locales/{{language}}/translation.json',
    keySeparator: '.',
    nsSeparator: ':',
  },
  types: {
    input: ['src/i18n/locales/{{language}}/{{namespace}}.json'],
    output: 'src/types/i18next.d.ts',
  },
});
