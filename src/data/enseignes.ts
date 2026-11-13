// Logos officiels disponibles. Les enseignes sans fichier affichent une pastille neutre
// « logo à fournir » : à remplacer dès réception des fichiers de la direction de la communication.
export type Logo = { src: string; w: number; h: number; ratio: 'carre' | 'large' };
// Logos officiels repris du carrousel « Nos enseignes » de groupecreo.com (vignettes carrées 300 px, fond blanc).
const CDN = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3GPCajXK1bbKOlrAkyd4vqdyxsy/';
export const logos: Record<string, Logo> = {
  'Pli Bel Price': { src: CDN + 'fbc4c221-e18d-4cfd-b140-199ef6c7b89b.png', w: 300, h: 300, ratio: 'carre' },
  'Caraïbe Price': { src: CDN + 'e48900a6-c367-4d60-90f2-2abc851d2164.webp', w: 300, h: 300, ratio: 'carre' },
  'Caraïbe Price Express': { src: CDN + 'e48900a6-c367-4d60-90f2-2abc851d2164.webp', w: 300, h: 300, ratio: 'carre' },
  'Méga Stock': { src: CDN + '1738a240-acb2-4f97-af39-ae6dd0bb40bc.webp', w: 300, h: 300, ratio: 'carre' },
  '123 Click': { src: CDN + '855bf0d6-d7db-4718-ad5e-e8e4cb507b2f.webp', w: 300, h: 300, ratio: 'carre' },
  'Thiriet': { src: CDN + '221e8fd3-854e-4005-8c3e-b32e23cf5938.webp', w: 300, h: 300, ratio: 'carre' },
  'Naturalia': { src: CDN + '9d71043d-d441-4a2b-abf7-ea16b1ee4e92.webp', w: 300, h: 300, ratio: 'carre' },
  'Log Services': { src: CDN + '36af5d99-fc35-42e9-8214-3437865f30e0.webp', w: 300, h: 300, ratio: 'carre' },
  'Trans Log': { src: CDN + '7b481d8d-4e58-4a90-a908-9a27aa9f607e.webp', w: 300, h: 300, ratio: 'carre' },
  'Presta Log': { src: CDN + '347a4460-f5f4-4707-8527-1677cae6d962.webp', w: 300, h: 300, ratio: 'carre' },
  'Calypso Overseas': { src: CDN + 'f11003e8-c2bf-4415-9745-538e6de134cc.webp', w: 300, h: 300, ratio: 'carre' },
  'Randstad': { src: CDN + '279387b5-a563-4a4e-bcea-b0722af918b2.png', w: 300, h: 300, ratio: 'carre' },
  'Randstad Search': { src: CDN + '279387b5-a563-4a4e-bcea-b0722af918b2.png', w: 300, h: 300, ratio: 'carre' },
  'Axion': { src: CDN + '6418d9f9-9ab0-408b-9c65-a12f0139e06f.webp', w: 300, h: 300, ratio: 'carre' },
  'Axion Insertion': { src: CDN + '6418d9f9-9ab0-408b-9c65-a12f0139e06f.webp', w: 300, h: 300, ratio: 'carre' },
  'Alpha Conseil': { src: CDN + 'eafaa85e-bb1b-4660-9c53-578abc18dfb8.webp', w: 300, h: 300, ratio: 'carre' },
};
export const initiales = (n: string) => n.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const poles = [
  { titre: 'Distribution', accent: 'var(--pop)', enseignes: ['Pli Bel Price', 'Caraïbe Price', 'Méga Stock', '123 Click', 'Thiriet', 'Naturalia'] },
  { titre: 'Logistique', accent: 'var(--lagoon)', enseignes: ['Log Services', 'Trans Log', 'Presta Log', 'Calypso Overseas', 'Nausicaa'] },
  { titre: 'Recrutement & intérim', accent: 'var(--sun)', enseignes: ['Randstad', 'Randstad Search', 'Axion', 'Alpha Conseil'] },
];
