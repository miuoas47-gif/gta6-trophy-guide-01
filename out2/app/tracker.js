// Progress tracker: the earned set, saved in localStorage, with file export/import.
// Nothing here touches the network; the file round-trips through a download and a file input.
export const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';

// Thirteen trophies earned for the screenshot seed: the story opening, a few
// activities and one stranger strand, so the checklist shot shows real progress.
export const SEED_EARNED_IDS = [
  'just-like-paradise', 'paradise-lost', 'trust', 'break-the-bank',
  'family-matters', 'master-of-none', 'stick-fiddler', 'lets-go-bowling',
  'in-the-beginning', 'capital-offense', 'a-classic-blitz-play',
  'hot-together', 'on-the-spot',
];

export function loadEarned(allIds) {
  const known = new Set(allIds);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved)) return new Set(saved.filter((id) => known.has(id)));
    }
  } catch {
    // A corrupt save is ignored rather than breaking the page.
  }
  const seedCount = readSeedCountFromUrl();
  if (seedCount > 0) {
    // Seed from the curated list, never the platinum: the first N entries of
    // SEED_EARNED_IDS are a plausible early-game set, in list order.
    const seeded = new Set(SEED_EARNED_IDS.slice(0, seedCount).filter((id) => known.has(id)));
    saveEarned(seeded);
    return seeded;
  }
  return new Set();
}

export function readSeedCountFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed'));
  return Number.isInteger(seed) && seed > 0 ? seed : 0;
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

export function toggleEarned(earned, id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned(earned);
  return earned;
}

export function exportProgressToFile(earned) {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgressFromFile(file, allIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('That file does not hold a trophy list.');
  const known = new Set(allIds);
  const earned = new Set(ids.filter((id) => typeof id === 'string' && known.has(id)));
  saveEarned(earned);
  return earned;
}
