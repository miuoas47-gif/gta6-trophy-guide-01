// Filter state and matching: search text, grade, kind, earned state, missable
// only, and the spoiler setting that hides hidden trophies until they are earned.
export const KIND_LABELS = {
  story: 'Story',
  side: 'Strangers & side',
  collectibles: 'Collectibles',
  activities: 'Activities',
  misc: 'Miscellaneous',
};

export function readFilterState() {
  return {
    search: document.getElementById('search').value.trim().toLowerCase(),
    grade: document.getElementById('gradeFilter').value,
    kind: document.getElementById('kindFilter').value,
    earned: document.getElementById('earnedFilter').value,
    missableOnly: document.getElementById('missableOnly').checked,
    spoilersHidden: document.getElementById('spoilerToggle').checked,
  };
}

export function trophyMatchesFilters(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.earned === 'earned' && !earned.has(trophy.id)) return false;
  if (filters.earned === 'unearned' && earned.has(trophy.id)) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.search)) return false;
  }
  return true;
}

// A hidden trophy stays concealed while spoilers are hidden and it is unearned:
// the reader sees a placeholder instead of its name and description.
export function trophyIsConcealed(trophy, filters, earned) {
  return filters.spoilersHidden && trophy.hidden && !earned.has(trophy.id);
}

export function countByGrade(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earned.has(trophy.id)) counts[trophy.grade] += 1;
  }
  return counts;
}
