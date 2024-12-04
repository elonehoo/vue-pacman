// eslint.config.js
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    '@typescript-eslint/no-empty-object-type': 'off',
  },
  ignores: [
    'dist',
    'public',
    '.github',
    '.vscode',
    'shims.d.ts',
    'tsconfig.json',
  ],
})
