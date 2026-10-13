import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((env) => mergeConfig(viteConfig(env), {
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/features/image-converter/**/*.{ts,tsx}'],
            exclude: ['src/**/*.test.{ts,tsx}', 'src/**/types/**'],
        },
    },
}));
