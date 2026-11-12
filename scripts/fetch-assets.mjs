// Récupère les médias au moment du build (Vercel) et les optimise en WebP
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3GPCajXK1bbKOlrAkyd4vqdyxsy/';
const imgs = {
  distribution: 'hf_20261112_202049_08302251-ecdf-4334-b1be-cca5944c06a4.png',
  logistique: 'hf_20261112_202048_b8e0e5da-e952-494e-8406-d36a5cc94f1e.png',
  recrutement: 'hf_20261112_202048_ba3a9ad6-fd09-4616-b56e-8ecb5e830b94.png',
  littoral: 'hf_20261112_202049_0e3ad147-cb4a-4a86-929d-7181c4f2d9ae.png',
};
const get = async (u) => { const r = await fetch(u); if (!r.ok) throw new Error(u + ' ' + r.status); return Buffer.from(await r.arrayBuffer()); };
mkdirSync('public/img', { recursive: true }); mkdirSync('public/video', { recursive: true });
for (const [name, f] of Object.entries(imgs)) {
  if (existsSync(`public/img/${name}.webp`)) continue;
  await sharp(await get(CDN + f)).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`public/img/${name}.webp`);
}
await sharp('public/img/littoral.webp').webp({ quality: 70 }).toFile('public/img/hero-poster.webp');
if (!existsSync('public/video/yole.mp4')) writeFileSync('public/video/yole.mp4', await get(CDN + 'hf_20261112_202611_e2503b69-7de3-4f07-93db-79ed15bc3efe.mp4'));
if (!existsSync('public/img/logo-creo-blanc.png')) writeFileSync('public/img/logo-creo-blanc.png', await get('https://cdn.brandfetch.io/idaYMheAUe/w/299/h/104/theme/light/logo.png?c=1bxdgf96bvlvylbpyeh7lxdzgmkImnXdWef'));
console.log('assets ok');
