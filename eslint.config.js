// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'dist-test/*'],
    rules: {
      // Screens fetch data in an effect and update loading/data state from the
      // async callback. The React Compiler rule flags the call itself, even
      // though all setState calls happen after an await.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
