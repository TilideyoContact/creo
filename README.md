# Groupe CréO : refonte de la page d'accueil (Astro)

Brouillon de refonte de groupecreo.com (WordPress) en Astro. Page non indexée (`noindex`) tant que la mise en ligne n'est pas validée.

## Lancer
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # site statique dans dist/
```

## Stack
- Astro (site statique, aucun JS côté serveur)
- GSAP + ScrollTrigger, Lenis (défilement fluide), SplitType (titres)
- Polices auto-hébergées : Bricolage Grotesque (titres), Figtree (texte), Caveat (annotations)

## Structure
- `src/pages/index.astro` : page + styles des sections
- `src/styles/global.css` : tokens (couleurs, boutons, icônes)
- `src/scripts/motion.js` : animations (toutes coupées si « réduire les animations » est activé)
- `src/data/territoires.ts` : données de la carte, reprises de la page « Nos implantations »

## À valider avant mise en ligne
- Chiffres de la carte (page « Nos implantations » datée), activités Hexagone et Belgique
- Logistique en Martinique (Log Services, Trans Log, Presta Log, Calypso Overseas : implantation à confirmer)
- Lien « Voir nos offres d'emploi » vers le site carrières
- Logo en SVG (version actuelle : PNG blanc)

## Édition par la communication
Recommandation : brancher un CMS headless (WordPress actuel en mode headless pour une transition douce, ou CMS dédié) pour que l'équipe modifie textes, chiffres et actualités sans toucher au code.
