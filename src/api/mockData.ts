import type { MediaItem, MediaType } from '../types/media';
import { randBetween, randomDate, inferType } from './utils.ts';

const IMAGE_NAMES = [
  'sunset_beach.jpg',
  'mountain_peak.jpg',
  'city_lights.png',
  'forest_trail.jpg',
  'ocean_waves.webp',
  'desert_dunes.png',
  'northern_lights.jpg',
  'waterfall_hike.webp',
  'autumn_leaves.jpg',
  'snow_peaks.png',
];

const VIDEO_NAMES = [
  'product_demo.mp4',
  'team_intro.mp4',
  'tutorial_react.mp4',
  'conference_talk.mp4',
  'travel_vlog.mp4',
];

const DOCUMENT_NAMES = [
  'q4_report.pdf',
  'design_spec.pdf',
  'onboarding_guide.pdf',
  'api_reference.pdf',
  'roadmap_2025.pdf',
  'meeting_notes.pdf',
];

const ALL_NAMES = [...IMAGE_NAMES, ...VIDEO_NAMES, ...DOCUMENT_NAMES];

const SIZES: Record<MediaType, [number, number]> = {
  image: [200_000, 4_000_000],
  video: [5_000_000, 50_000_000],
  document: [50_000, 2_000_000],
};

export const MOCK_ITEMS: MediaItem[] = Array.from({ length: 60 }, (_, i) => {
  const name = ALL_NAMES[i % ALL_NAMES.length].replace(/(\.\w+)$/, `_${i + 1}$1`);
  const type = inferType(name);
  const [minSize, maxSize] = SIZES[type];
  return {
    id: `item-${i + 1}`,
    name,
    type,
    size: randBetween(minSize, maxSize),
    createdAt: randomDate(new Date('2026-01-01'), new Date('2026-04-31')),
  };
});
