import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'playwright-report/', 'test-results/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      // Constitución, Principio III: el dominio no depende de Phaser ni de la UI.
      'no-restricted-imports': [
        'error',
        { patterns: ['phaser', '**/scene/**', '**/ui/**'] },
      ],
      'no-restricted-globals': ['error', 'document', 'window'],
    },
  },
);
