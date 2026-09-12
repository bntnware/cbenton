function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function updateMeta(selector, content) {
  const node = document.querySelector(selector);
  if (!node || !content) return;
  node.setAttribute('content', content);
}

function renderGallery(grid, assets) {
  assets.forEach((asset) => {
    const figure = el('figure', 'figure-card');
    const img = el('img');
    img.src = `/${asset.path}`;
    img.alt = asset.alt;
    img.loading = 'lazy';
    const caption = el('figcaption', null, asset.alt);
    figure.append(img, caption);
    grid.appendChild(figure);
  });
}

async function loadProjectDetail() {
  const root = document.getElementById('project-page');
  if (!root) return;

  const slug = root.getAttribute('data-project-slug');
  let projects = [];
  try {
    const res = await fetch('/data/project-registry.json');
    if (!res.ok) throw new Error('Registry request failed');
    projects = await res.json();
  } catch (err) {
    root.append(
      el('h1', null, 'Project temporarily unavailable'),
      el('p', 'prose', 'Project details could not be loaded at this time.')
    );
    return;
  }

  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    const h1 = el('h1', null, 'Project not found');
    const p = el('p', 'prose', 'This project slug does not exist in the canonical registry.');
    root.append(h1, p);
    return;
  }

  const pngAssets = (project.assets || []).filter((a) => a.path.endsWith('.png'));
  const overview = pngAssets.slice(0, 3);
  const remaining = pngAssets.slice(3);

  const breadcrumb = el('nav');
  breadcrumb.setAttribute('aria-label', 'Breadcrumb');
  const workLink = el('a', null, 'Work');
  workLink.href = '/work';
  breadcrumb.append(workLink, document.createTextNode(` › ${project.title}`));

  const heading = el('h1', null, project.title);
  const type = el('p', 'muted', project.projectType);
  const summary = el('p', 'prose', project.summary);

  const intro = el('section', 'section');
  intro.setAttribute('aria-labelledby', 'intro-heading');
  const introHeading = el('h2', null, 'Intro');
  introHeading.id = 'intro-heading';
  intro.appendChild(introHeading);
  const introFigure = el('figure', 'figure-card');
  const introImg = el('img');
  introImg.src = `/${project.hero}`;
  introImg.alt = `${project.title} hero`;
  const introCaption = el('figcaption', null, `${project.title} representative visual`);
  introFigure.append(introImg, introCaption);
  intro.appendChild(introFigure);

  const system = el('section', 'section');
  system.setAttribute('aria-labelledby', 'system-heading');
  const systemHeading = el('h2', null, 'System');
  systemHeading.id = 'system-heading';
  system.appendChild(systemHeading);
  system.appendChild(el('p', 'prose', project.systemDescription || ''));
  system.appendChild(el('p', 'prose', `Fixed: ${(project.fixedElements || []).join(', ') || 'Structured elements documented in project assets.'}`));
  system.appendChild(el('p', 'prose', `Variables: ${(project.variables || []).join(', ') || 'Project-defined variable content.'}`));
  system.appendChild(el('p', 'prose', `Outputs relation: ${(project.outputs || []).join(', ') || 'Project outputs vary while preserving core logic.'}`));
  if (project.productionNotes) {
    system.appendChild(el('p', 'prose', project.productionNotes));
  }

  const gallerySection = el('section', 'section');
  gallerySection.setAttribute('aria-labelledby', 'gallery-heading');
  const galleryHeading = el('h2', null, 'Gallery');
  galleryHeading.id = 'gallery-heading';
  gallerySection.appendChild(galleryHeading);
  gallerySection.appendChild(el('h3', null, 'Overview assets'));
  const overviewGrid = el('div', 'gallery-grid');
  renderGallery(overviewGrid, overview);
  gallerySection.appendChild(overviewGrid);
  if (remaining.length) {
    gallerySection.appendChild(el('h3', null, 'Instances / variants'));
    const remainingGrid = el('div', 'gallery-grid');
    renderGallery(remainingGrid, remaining);
    gallerySection.appendChild(remainingGrid);
  }

  const production = el('section', 'section');
  production.setAttribute('aria-labelledby', 'production-heading');
  const productionHeading = el('h2', null, 'Production');
  productionHeading.id = 'production-heading';
  production.appendChild(productionHeading);
  production.appendChild(el('p', 'prose', project.tools ? `Tools: ${project.tools.join(', ')}.` : 'Production notes are documented through project assets and system structure.'));

  root.append(breadcrumb, heading, type, summary, intro, system, gallerySection, production);

  const related = (project.relatedProjectIds || [])
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean);
  if (related.length) {
    const relatedSection = el('section', 'section');
    relatedSection.setAttribute('aria-labelledby', 'related-heading');
    const relatedHeading = el('h2', null, 'Related projects');
    relatedHeading.id = 'related-heading';
    const wrap = el('p');
    related.forEach((r) => {
      const link = el('a', 'btn', r.title);
      link.href = `/projects/${r.slug}`;
      wrap.appendChild(link);
      wrap.appendChild(document.createTextNode(' '));
    });
    relatedSection.append(relatedHeading, wrap);
    root.appendChild(relatedSection);
  }

  const canonicalUrl = `https://cbenton.art/projects/${project.slug}`;
  document.title = `${project.title} — CBenton`;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = canonicalUrl;
  updateMeta('meta[name="description"]', project.seoDescription || project.summary);
  updateMeta('meta[property="og:title"]', project.seoTitle || `${project.title} — CBenton`);
  updateMeta('meta[property="og:description"]', project.seoDescription || project.summary);
  updateMeta('meta[property="og:url"]', canonicalUrl);
}

document.addEventListener('DOMContentLoaded', loadProjectDetail);
