// Views: the checklist, the trophy detail, the platinum roadmap and the
// missables page. Every view is built from the trophy data with DOM nodes,
// never innerHTML, so trophy text cannot inject markup.
import { KIND_LABELS, trophyIsConcealed } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(trophy) {
  return el('span', `badge ${trophy.grade}`, trophy.grade);
}

function kindBadge(trophy) {
  return el('span', 'badge', KIND_LABELS[trophy.kind] ?? trophy.kind);
}

function missableBadge(trophy) {
  if (!trophy.missable) return null;
  return el('span', 'badge missable', 'Possibly missable');
}

function countBadge(trophy) {
  if (trophy.count == null) return null;
  const total = trophy.total ?? trophy.count;
  return el('span', 'badge', `${trophy.count} of ${total}`);
}

function sourcesList(trophy) {
  const list = el('ol', 'sources');
  for (const source of trophy.sources ?? []) {
    const item = el('li');
    const link = el('a', undefined, source.name);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    item.append(link);
    list.append(item);
  }
  return list;
}

function guideDetails(trophy, open) {
  const details = el('details', 'trophy-guide');
  details.open = open;
  details.append(el('summary', undefined, 'Guide & sources'));
  details.append(el('p', undefined, trophy.guide));
  if (trophy.steps?.length) {
    const steps = el('ol', 'steps');
    for (const step of trophy.steps) steps.append(el('li', undefined, step));
    details.append(steps);
  }
  details.append(el('p', undefined, 'Sources:'));
  details.append(sourcesList(trophy));
  return details;
}

export function renderChecklist(view, trophies, earned, filters, onToggle) {
  view.replaceChildren();
  const list = el('ul', 'trophy-list');
  let shown = 0;
  for (const trophy of trophies) {
    const item = el('li', 'trophy');
    if (earned.has(trophy.id)) item.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => onToggle(trophy.id));
    item.append(box);
    const body = el('div');
    const concealed = trophyIsConcealed(trophy, filters, earned);
    const name = el('div', 'trophy-name');
    if (concealed) {
      name.append(el('span', undefined, 'Hidden trophy — earn it to reveal it'));
    } else {
      const link = el('a', undefined, trophy.name);
      link.href = `#/trophy/${trophy.id}`;
      name.append(link);
    }
    body.append(name);
    body.append(el('div', 'trophy-desc', concealed ? 'A hidden story trophy. Its name and description stay hidden until you earn it.' : trophy.description));
    const meta = el('div', 'trophy-meta');
    meta.append(gradeBadge(trophy), kindBadge(trophy));
    const count = countBadge(trophy);
    if (count) meta.append(count);
    if (trophy.hidden) meta.append(el('span', 'badge hidden-badge', 'Hidden'));
    const missable = missableBadge(trophy);
    if (missable) meta.append(missable);
    body.append(meta);
    if (!concealed) body.append(guideDetails(trophy, false));
    item.append(body);
    list.append(item);
    shown += 1;
  }
  if (shown === 0) {
    view.append(el('p', 'empty', 'No trophies match these filters. Clear the search or widen a filter.'));
  } else {
    view.append(list);
  }
}

export function renderTrophyDetail(detail, trophy, earned, filters) {
  detail.hidden = false;
  detail.replaceChildren();
  const concealed = trophyIsConcealed(trophy, filters, earned);
  detail.append(el('h2', undefined, concealed ? 'Hidden trophy' : trophy.name));
  const meta = el('div', 'trophy-meta');
  meta.append(gradeBadge(trophy), kindBadge(trophy));
  const count = countBadge(trophy);
  if (count) meta.append(count);
  if (trophy.hidden) meta.append(el('span', 'badge hidden-badge', 'Hidden'));
  const missable = missableBadge(trophy);
  if (missable) meta.append(missable);
  detail.append(meta);
  detail.append(el('p', undefined, concealed ? 'This hidden trophy stays concealed until you earn it (turn spoilers off to reveal it).' : trophy.description));
  if (!concealed) {
    detail.append(el('p', undefined, trophy.guide));
    if (trophy.steps?.length) {
      const steps = el('ol', 'steps');
      for (const step of trophy.steps) steps.append(el('li', undefined, step));
      detail.append(steps);
    }
    detail.append(el('p', undefined, 'Sources:'));
    detail.append(sourcesList(trophy));
  }
  const back = el('a', undefined, 'Back to the checklist');
  back.href = '#/';
  detail.append(back);
}

export function renderRoadmap(view, data, earned) {
  view.replaceChildren();
  const intro = el('p', undefined, 'One playthrough, about 200 hours, difficulty 4/10 (PowerPyx). No online trophies, no DLC trophies, and no mission replay — save manually at the start and end of every chapter. Cheats disable trophies and saving, so keep them off until the platinum pops.');
  view.append(intro);
  for (const stage of data.roadmap) {
    const section = el('section', 'roadmap-stage');
    section.append(el('h2', undefined, stage.title));
    section.append(el('p', undefined, stage.summary));
    const warnings = el('ul');
    for (const warning of stage.warnings) warnings.append(el('li', 'warning', warning));
    section.append(warnings);
    const chips = el('div', 'roadmap-trophies');
    for (const trophy of data.trophies.filter((t) => t.stage === stage.stage)) {
      const link = el('a', undefined, `${earned.has(trophy.id) ? '✓ ' : ''}${trophy.name}`);
      link.href = `#/trophy/${trophy.id}`;
      chips.append(link);
    }
    section.append(chips);
    view.append(section);
  }
}

export function renderMissables(view, data, earned) {
  view.replaceChildren();
  const callout = el('section', 'callout');
  callout.append(el('h2', undefined, 'Only one trophy is possibly missable'));
  callout.append(el('p', undefined, 'PowerPyx flags Positive Mental Attitude as the list’s only possibly missable trophy, because the first meditation spot is only available in Chapter 1. Push Square reports no missables known. Every other trophy can be earned after the story in free-roam.'));
  view.append(callout);
  const list = el('ul', 'trophy-list');
  for (const trophy of data.trophies.filter((t) => t.missable)) {
    const item = el('li', 'trophy');
    if (earned.has(trophy.id)) item.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.id);
      else earned.delete(trophy.id);
      window.dispatchEvent(new CustomEvent('earned-changed'));
    });
    item.append(box);
    const body = el('div');
    const name = el('div', 'trophy-name');
    const link = el('a', undefined, trophy.name);
    link.href = `#/trophy/${trophy.id}`;
    name.append(link);
    body.append(name, el('div', 'trophy-desc', trophy.description));
    const meta = el('div', 'trophy-meta');
    meta.append(gradeBadge(trophy), kindBadge(trophy), missableBadge(trophy));
    body.append(meta, guideDetails(trophy, true));
    item.append(body);
    list.append(item);
  }
  view.append(list);
  const note = el('p', undefined, 'Timing cautions that are not missables: Andy’s strand is Lucia-only, Tyrone’s and Bret’s are Jason-only, and the stranger quest givers all return after the story. Save at each chapter boundary anyway — there is no mission replay.');
  view.append(note);
}
