module.exports = {
  env: {
    browser: true,
    es2020: true,
    jest: true
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended", "plugin:storybook/recommended"],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react-refresh'],
  rules: {
    // 'react-refresh/only-export-components': 'warn',
    '@typescript-eslint/no-explicit-any': ['off'],
    "import/extensions": 0,
    "semi": [1, "always"],
    "import/no-unresolved": [0],
    "quotes": [1, "single", {
      "allowTemplateLiterals": true
    }],
    "linebreak-style": [0],
    "comma-dangle": [1, "never"],
    "import/prefer-default-export": 0,
    "no-console": 0,
    "global-require": "off"
  }
};