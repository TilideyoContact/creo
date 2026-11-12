import { defineConfig } from 'astro/config';

// GitHub Pages : le site est servi sous /creo/
export default defineConfig({
  site: 'https://tilideyocontact.github.io',
  base: '/creo/',
  build: { assets: 'assets', format: 'file' },
  vite: { build: { assetsInlineLimit: 0 } },
});
