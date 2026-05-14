import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';
import { remarkBasePaths } from './scripts/remark-base-paths.mjs';

const BASE = '/site-redalint';

export default defineConfig({
  site: 'https://colabhd.github.io',
  base: BASE,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  integrations: [
    mdx({ remarkPlugins: [[remarkBasePaths, { base: BASE }]] }),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
});
