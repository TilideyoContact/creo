// Génère public/data/land.json : points répartis sur les terres émergées (sphère de Fibonacci)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { feature } from 'topojson-client';
import { geoContains } from 'd3-geo';
const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-50m.json', import.meta.url)));
const land = feature(topo, topo.objects.land);
const N = 42000, out = [], g = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = g * i;
  const lat = Math.asin(y) * 180 / Math.PI;
  const lon = ((Math.atan2(Math.sin(th) * r, Math.cos(th) * r) * 180 / Math.PI) + 540) % 360 - 180;
  if (geoContains(land, [lon, lat])) out.push(+lat.toFixed(2), +lon.toFixed(2));
}
mkdirSync(new URL('../public/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/data/land.json', import.meta.url), JSON.stringify(out));
console.log('points', out.length / 2);
