/**
 * Forest View — a Google Maps style in the Truffle Hunter palette, so the real
 * map reads as a friendly forest while staying a fully interactive map.
 *
 *   #4A7C59  parks and vegetation
 *   #F5EFE0  roads and paths
 *   #B8D4C8  water
 *   #FAF9F6  background / land (design-system cream)
 *   #201642  all text and labels (keyline purple)
 */

const LAND = '#FAF9F6';
const ROAD = '#F5EFE0';
const ROAD_EDGE = '#E7DEC9'; // a shade under ROAD, so edges read without a hard line
const VEGETATION = '#4A7C59';
const WATER = '#B8D4C8';
const TEXT = '#201642';

export const FOREST_MAP_STYLE = [
  // ── Text: keyline purple everywhere, on a cream halo so it stays legible
  //    over both the cream land and the dark sage parks.
  { elementType: 'labels.text.fill', stylers: [{ color: TEXT }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: LAND }, { weight: 3 }] },

  // ── Ground
  { elementType: 'geometry', stylers: [{ color: LAND }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: LAND }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: LAND }] },

  // ── Vegetation
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: VEGETATION }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: TEXT }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: VEGETATION }] },
  { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: VEGETATION }] },
  { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: VEGETATION }] },

  // ── Roads: one warm beige at every level, so no motorway colour-coding
  //    breaks the illustrated look.
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: ROAD }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: ROAD_EDGE }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: ROAD }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: ROAD_EDGE }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: ROAD }] },
  { featureType: 'road.local', elementType: 'geometry.fill', stylers: [{ color: ROAD }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: TEXT }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  // ── Water
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: WATER }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: TEXT }] },

  // ── Strip the stock clutter so the palette carries the screen
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
];

/** Standard Map — no overrides, Google's default colours. */
export const STANDARD_MAP_STYLE: typeof FOREST_MAP_STYLE = [];
