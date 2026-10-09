/* Navigation, project exploration, and contact helpers. No build step required. */
(() => {
  'use strict';

  document.documentElement.classList.add('js');
  document.getElementById('year').textContent = new Date().getFullYear();

  const header = document.querySelector('.site-header');
  const menu = document.getElementById('menu-toggle');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  const mobileLayout = window.matchMedia('(max-width: 1100px)');
  menu.hidden = false;

  function closeMenu(returnFocus = false) {
    header.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (returnFocus) menu.focus();
  }

  menu.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const wasOpen = mobileLayout.matches && header.classList.contains('is-open');
    closeMenu();
    if (wasOpen) {
      const destination = link.hash ? document.getElementById(link.hash.slice(1)) : null;
      if (destination) {
        destination.setAttribute('tabindex', '-1');
        destination.focus({ preventScroll: true });
      } else menu.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target) && header.classList.contains('is-open')) closeMenu();
  });
  mobileLayout.addEventListener('change', () => closeMenu());

  const progress = document.getElementById('reading-progress');
  let scrollFrame = null;
  function updateReadingPosition() {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = pageHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / pageHeight)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    const marker = mobileLayout.matches ? 140 : 120;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= marker) current = section;
    }
    if (fraction >= .995) current = sections[sections.length - 1];
    navLinks.forEach((link) => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scrollFrame = null;
  }
  function scheduleReadingUpdate() {
    if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateReadingPosition);
  }
  window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
  window.addEventListener('resize', scheduleReadingUpdate, { passive: true });
  window.addEventListener('load', scheduleReadingUpdate);
  updateReadingPosition();

  const projectList = document.getElementById('project-list');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const count = document.getElementById('project-count');
  let activeFilter = 'all';

  function filterProjects(value) {
    activeFilter = value;
    let visible = 0;
    const cards = [...projectList.querySelectorAll('.project-card')];
    cards.forEach((card) => {
      const show = value === 'all' || card.dataset.category === value;
      card.hidden = !show;
      if (show) visible++;
      else card.querySelector('details').open = false;
    });
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
    count.textContent = value === 'all'
      ? `Showing ${visible} projects`
      : `Showing ${visible} of ${cards.length} projects`;
    scheduleReadingUpdate();
  }
  filters.forEach((button) => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
  document.getElementById('project-controls').hidden = false;

  projectList.addEventListener('toggle', (event) => {
    const detail = event.target;
    if (!detail.matches('.project-details')) return;
    if (detail.open) {
      projectList.querySelectorAll('.project-details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    }
    scheduleReadingUpdate();
  }, true);

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  function validProject(project) {
    if (!project || typeof project !== 'object') return false;
    const strings = ['id', 'number', 'title', 'category', 'categoryLabel', 'summary', 'url', 'linkLabel'];
    if (!strings.every((key) => typeof project[key] === 'string' && project[key].trim())) return false;
    if (!/^[a-z0-9-]+$/.test(project.id) || !['data', 'web', 'research'].includes(project.category)) return false;
    if (!Array.isArray(project.tools) || !project.tools.every((tool) => typeof tool === 'string')) return false;
    if (!Array.isArray(project.notes) || !project.notes.every((note) => note && typeof note.heading === 'string' && typeof note.text === 'string')) return false;
    return project.url === '#contact' || /^https?:\/\//.test(project.url);
  }

  function projectCard(project) {
    const card = element('article', 'project-card');
    card.dataset.category = project.category;
    const headingId = `project-title-${project.id}`;
    card.setAttribute('aria-labelledby', headingId);
    const meta = element('div', 'project-meta');
    meta.append(element('span', 'project-number', project.number), element('span', '', project.categoryLabel));
    const title = element('h3', '', project.title);
    title.id = headingId;
    const tools = element('ul', 'project-tools');
    tools.setAttribute('aria-label', 'Tools and skills');
    project.tools.forEach((tool) => tools.append(element('li', '', tool)));
    const details = element('details', 'project-details');
    details.setAttribute('name', 'project-notes');
    const summary = element('summary');
    summary.append(element('span', '', 'Read the project notes'));
    const arrow = element('span', 'details-arrow', '+');
    arrow.setAttribute('aria-hidden', 'true');
    summary.append(arrow);
    const notes = element('div', 'project-notes');
    project.notes.forEach((note) => {
      const block = element('div', 'project-note');
      block.append(element('h4', '', note.heading), element('p', '', note.text));
      notes.append(block);
    });
    details.append(summary, notes);
    const link = element('a', 'text-link', project.linkLabel);
    link.setAttribute('href', project.url);
    const external = !project.url.startsWith('#');
    if (external) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
    const linkArrow = element('span', '', external ? '↗' : '→');
    linkArrow.setAttribute('aria-hidden', 'true');
    link.append(linkArrow);
    card.append(meta, title, element('p', 'project-summary', project.summary), tools, details, link);
    return card;
  }

  // The HTML contains the same project content as a fallback for direct file opening.
  // On GitHub Pages, edit projects.json to update the rendered project collection.
  if (/^https?:$/.test(window.location.protocol)) {
    fetch('projects.json')
      .then((response) => {
        if (!response.ok) throw new Error('Project data unavailable');
        return response.json();
      })
      .then((projects) => {
        if (!Array.isArray(projects) || !projects.length || !projects.every(validProject)) return;
        if (new Set(projects.map((project) => project.id)).size !== projects.length) return;
        // Keep native details state if someone starts reading during the request.
        const openIds = new Set([...projectList.querySelectorAll('details[open]')].map((detail) => detail.parentElement.getAttribute('aria-labelledby')));
        if (projectList.contains(document.activeElement)) return;
        const fragment = document.createDocumentFragment();
        projects.forEach((project) => {
          const card = projectCard(project);
          if (openIds.has(card.getAttribute('aria-labelledby'))) card.querySelector('details').open = true;
          fragment.append(card);
        });
        projectList.replaceChildren(fragment);
        filterProjects(activeFilter);
      })
      .catch(() => { /* Keep the fully readable static project content. */ });
  }

  const copyButton = document.getElementById('copy-email');
  const copyStatus = document.getElementById('copy-status');
  if (navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('nthuynguyenn25@gmail.com');
        copyStatus.textContent = 'Email address copied.';
      } catch {
        copyStatus.textContent = 'You can select the email address above to copy it.';
      }
    });
  }
})();
