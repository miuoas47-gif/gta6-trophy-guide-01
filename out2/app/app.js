// Bootstrap: load the trophy data, route between the checklist, roadmap,
// missables and trophy detail views, and keep the progress bar in sync.
import { loadEarned, saveEarned, toggleEarned, exportProgressToFile, importProgressFromFile } from './tracker.js';
import { readFilterState, trophyMatchesFilters, countByGrade } from './filters.js';
import { renderChecklist, renderTrophyDetail, renderRoadmap, renderMissables } from './views.js';

const view = document.getElementById('view');
const detail = document.getElementById('detail');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
let earned = loadEarned(trophies.map((t) => t.id));

function renderProgress() {
  document.getElementById('progressText').textContent = `${earned.size} of ${trophies.length} earned`;
  const counts = countByGrade(trophies, earned);
  document.getElementById('progressByGrade').textContent =
    `Platinum ${counts.platinum}/1 · Gold ${counts.gold}/2 · Silver ${counts.silver}/6 · Bronze ${counts.bronze}/46`;
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  document.getElementById('missableCount').textContent = String(trophies.filter((t) => t.missable && !earned.has(t.id)).length);
}

function setActiveTab(route) {
  document.getElementById('tabChecklist').classList.toggle('active', route === 'checklist');
  document.getElementById('tabRoadmap').classList.toggle('active', route === 'roadmap');
  document.getElementById('tabMissables').classList.toggle('active', route === 'missables');
}

function renderRoute() {
  const hash = window.location.hash || '#/';
  const filters = readFilterState();
  renderProgress();
  if (hash.startsWith('#/trophy/')) {
    const trophy = byId.get(hash.slice('#/trophy/'.length));
    setActiveTab('checklist');
    if (trophy) {
      renderChecklist(view, trophies.filter((t) => trophyMatchesFilters(t, filters, earned)), earned, filters, onToggleEarned);
      renderTrophyDetail(detail, trophy, earned, filters);
    } else {
      detail.hidden = true;
      view.replaceChildren();
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No trophy with that id. Back to the checklist.';
      view.append(empty);
    }
    return;
  }
  detail.hidden = true;
  detail.replaceChildren();
  if (hash.startsWith('#/roadmap')) {
    setActiveTab('roadmap');
    renderRoadmap(view, data, earned);
  } else if (hash.startsWith('#/missables')) {
    setActiveTab('missables');
    renderMissables(view, data, earned);
  } else {
    setActiveTab('checklist');
    renderChecklist(view, trophies.filter((t) => trophyMatchesFilters(t, filters, earned)), earned, filters, onToggleEarned);
  }
}

function onToggleEarned(id) {
  earned = toggleEarned(earned, id);
  renderRoute();
}

for (const id of ['search', 'gradeFilter', 'kindFilter', 'earnedFilter', 'missableOnly', 'spoilerToggle']) {
  document.getElementById(id).addEventListener('input', renderRoute);
  document.getElementById(id).addEventListener('change', renderRoute);
}

document.getElementById('exportBtn').addEventListener('click', () => exportProgressToFile(earned));

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = await importProgressFromFile(file, trophies.map((t) => t.id));
    renderRoute();
  } catch {
    window.alert('That file could not be imported as trophy progress.');
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveEarned(earned);
  renderRoute();
});

window.addEventListener('earned-changed', () => {
  saveEarned(earned);
  renderRoute();
});

window.addEventListener('hashchange', renderRoute);
renderRoute();
