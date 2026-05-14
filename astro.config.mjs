import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://colabhd.github.io',
  base: '/site-redalint',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory' },
  integrations: [mdx(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    responsiveStyles: true,
  },
});
