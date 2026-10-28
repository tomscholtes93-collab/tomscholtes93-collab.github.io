export default {
  singleQuote: true,
  printWidth: 100,
  plugins: ['prettier-plugin-astro'],
  overrides: [{ files: '*.svg', options: { parser: 'html' } }],
};
