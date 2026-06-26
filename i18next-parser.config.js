// i18next-parser configuration for extraction tool.
// Run: npx i18next-parser
// This complements the newer i18next-cli approach (i18next.config.ts).

export default {
  locales: ['en-US', 'pt-BR'],
  defaultNamespace: 'translation',
  output: 'src/i18n/locales/$LOCALE/translation.json',
  input: ['src/**/*.{ts,tsx}'],
  verbose: true,
  keepRemoved: true,
  createOldCatalogs: false,
  keySeparator: '.',
  namespaceSeparator: ':',
  react: {
    useSuspense: false,
  },
}
