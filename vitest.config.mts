import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'src/lib/mecanu/**/*.test.ts',
      'src/lib/security/**/*.test.ts',
      'src/lib/kapso/**/*.test.ts',
      'src/lib/landing/**/*.test.ts',
      'src/lib/slack/**/*.test.ts',
      'src/lib/next-invariants/**/*.test.ts',
      'src/lib/entorno.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'src/lib/mecanu/mecanu-data.ts',
        'src/lib/mecanu/mecanu-pipeline.ts',
        'src/lib/mecanu/mecanu-rutas.ts',
        'src/lib/mecanu/mecanu-whatsapp.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
