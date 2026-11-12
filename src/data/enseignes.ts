// Logos officiels disponibles. Les enseignes sans fichier affichent une pastille neutre
// « logo à fournir » : à remplacer dès réception des fichiers de la direction de la communication.
export type Logo = { src: string; w: number; h: number; ratio: 'carre' | 'large' };
export const logos: Record<string, Logo> = {
  'Pli Bel Price': { src: 'img/logos/plibelprice.png', w: 200, h: 200, ratio: 'carre' },
  '123 Click': { src: 'img/logos/123click.png', w: 261, h: 106, ratio: 'large' },
  'Thiriet': { src: 'img/logos/thiriet.png', w: 693, h: 360, ratio: 'large' },
  'Naturalia': { src: 'img/logos/naturalia.png', w: 308, h: 57, ratio: 'large' },
  'Randstad': { src: 'img/logos/randstad.svg', w: 205, h: 31, ratio: 'large' },
  'Randstad Search': { src: 'img/logos/randstad.svg', w: 205, h: 31, ratio: 'large' },
};
export const initiales = (n: string) => n.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const poles = [
  { titre: 'Distribution', accent: 'var(--pop)', enseignes: ['Pli Bel Price', 'Caraïbe Price', 'Méga Stock', '123 Click', 'Thiriet', 'Naturalia'] },
  { titre: 'Logistique', accent: 'var(--lagoon)', enseignes: ['Log Services', 'Trans Log', 'Presta Log', 'Calypso Overseas', 'Nausicaa'] },
  { titre: 'Recrutement & intérim', accent: 'var(--sun)', enseignes: ['Randstad', 'Randstad Search', 'Axion', 'Alpha Conseil'] },
];
