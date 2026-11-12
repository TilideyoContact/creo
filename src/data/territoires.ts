// Données reprises de la page « Nos implantations » du site actuel (groupecreo.com).
// À faire valider par la direction de la communication avant mise en ligne.
// Projection : lon -75..65, lat 60..-30, 10 px par degré (viewBox 1400 x 900).
export type Ligne = { enseigne: string; detail: string };
export type Territoire = {
  id: string;
  nom: string;
  lon: number;
  lat: number;
  siege?: boolean;
  distribution?: Ligne[];
  logistique?: Ligne[];
  recrutement?: Ligne[];
  aCompleter?: boolean;
};

export const project = (lon: number, lat: number) => ({
  x: Math.round((lon + 75) * 10),
  y: Math.round((60 - lat) * 10),
});

export const territoires: Territoire[] = [
  {
    id: 'martinique', nom: 'Martinique', lon: -61.0, lat: 14.6, siege: true,
    distribution: [
      { enseigne: 'Caraïbe Price', detail: '9 magasins' },
      { enseigne: 'Pli Bel Price', detail: '7 magasins' },
      { enseigne: 'Thiriet', detail: '5 magasins' },
      { enseigne: 'Naturalia', detail: '4 magasins' },
      { enseigne: 'Méga Stock', detail: '1 club-entrepôt' },
      { enseigne: 'Caraïbe Price Express', detail: '1 magasin' },
      { enseigne: '123 Click', detail: '1 drive' },
    ],
    recrutement: [
      { enseigne: 'Randstad', detail: '2 agences' },
      { enseigne: 'Alpha Conseil', detail: '1 cabinet' },
    ],
  },
  {
    id: 'guadeloupe', nom: 'Guadeloupe', lon: -61.6, lat: 16.3,
    distribution: [{ enseigne: 'Naturalia', detail: '1 magasin' }],
    logistique: [{ enseigne: 'Nausicaa', detail: '1 équipe' }],
    recrutement: [
      { enseigne: 'Randstad', detail: '2 agences' },
      { enseigne: 'Alpha Conseil', detail: '1 cabinet' },
    ],
  },
  {
    id: 'guyane', nom: 'Guyane', lon: -53.1, lat: 4.0,
    distribution: [
      { enseigne: 'Pli Bel Price', detail: '5 magasins' },
      { enseigne: 'Méga Stock', detail: '1 club-entrepôt' },
      { enseigne: 'Thiriet', detail: '1 magasin' },
      { enseigne: 'Naturalia', detail: '1 magasin' },
    ],
    logistique: [
      { enseigne: 'Nausicaa', detail: '1 équipe' },
      { enseigne: 'Log Services', detail: '1 entrepôt' },
    ],
    recrutement: [
      { enseigne: 'Randstad', detail: '2 agences' },
      { enseigne: 'Alpha Conseil', detail: '1 cabinet' },
      { enseigne: 'Axion Insertion', detail: '1 agence' },
    ],
  },
  {
    id: 'reunion', nom: 'La Réunion', lon: 55.5, lat: -21.1,
    distribution: [
      { enseigne: 'Naturalia', detail: '3 magasins' },
      { enseigne: 'Thiriet', detail: '1 magasin' },
    ],
    recrutement: [
      { enseigne: 'Axion', detail: '5 agences' },
      { enseigne: 'Randstad', detail: '2 agences' },
      { enseigne: 'Randstad Search', detail: '1 cabinet' },
    ],
  },
  {
    id: 'mayotte', nom: 'Mayotte', lon: 45.1, lat: -12.8,
    recrutement: [{ enseigne: 'Randstad', detail: '1 agence' }],
  },
  { id: 'hexagone', nom: 'France hexagonale', lon: 2.35, lat: 48.85, aCompleter: true },
  { id: 'belgique', nom: 'Belgique', lon: 4.35, lat: 50.85, aCompleter: true },
];
