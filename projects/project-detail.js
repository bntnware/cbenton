async function loadProjectDetail() {
  const root = document.getElementById('project-page');
  if (!root) return;
  const slug = root.getAttribute('data-project-slug');
  const res = await fetch('/data/project-registry.json');
  const projects = await res.json();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    root.innerHTML = '<h1>Project not found</h1><p class="prose">This project slug does not exist in the canonical registry.</p>';
    return;
  }

  const pngAssets = (project.assets || []).filter((a) => a.path.endsWith('.png'));
  const overview = pngAssets.slice(0, 3);
  const remaining = pngAssets.slice(3);

  const gallery = (assets) => assets.map((a) => `<figure class="figure-card"><img src="/${a.path}" alt="${a.alt}" loading="lazy" /><figcaption>${a.alt}</figcaption></figure>`).join('');

  const relatedLinks = (project.relatedProjectIds || [])
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => `<a class="btn" href="/projects/${p.slug}">${p.title}</a>`)
    .join(' ');

  root.innerHTML = `
    <nav aria-label="Breadcrumb"><a href="/work">Work</a> › ${project.title}</nav>
    <h1>${project.title}</h1>
    <p class="muted">${project.projectType}</p>
    <p class="prose">${project.summary}</p>

    <section class="section" aria-labelledby="intro-heading">
      <h2 id="intro-heading">Intro</h2>
      <figure class="figure-card"><img src="/${project.hero}" alt="${project.title} hero" /><figcaption>${project.title} representative visual</figcaption></figure>
    </section>

    <section class="section" aria-labelledby="system-heading">
      <h2 id="system-heading">System</h2>
      <p class="prose">${project.systemDescription || ''}</p>
      <p class="prose"><strong>Fixed:</strong> ${(project.fixedElements || []).join(', ') || 'Structured elements documented in project assets.'}</p>
      <p class="prose"><strong>Variables:</strong> ${(project.variables || []).join(', ') || 'Project-defined variable content.'}</p>
      <p class="prose"><strong>Outputs relation:</strong> ${(project.outputs || []).join(', ') || 'Project outputs vary while preserving core logic.'}</p>
      ${project.productionNotes ? `<p class="prose">${project.productionNotes}</p>` : ''}
    </section>

    <section class="section" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading">Gallery</h2>
      <h3>Overview assets</h3>
      <div class="gallery-grid">${gallery(overview)}</div>
      ${remaining.length ? `<h3>Instances / variants</h3><div class="gallery-grid">${gallery(remaining)}</div>` : ''}
    </section>

    <section class="section" aria-labelledby="production-heading">
      <h2 id="production-heading">Production</h2>
      <p class="prose">${project.tools ? `Tools: ${project.tools.join(', ')}.` : 'Production notes are documented through project assets and system structure.'}</p>
    </section>

    ${relatedLinks ? `<section class="section" aria-labelledby="related-heading"><h2 id="related-heading">Related projects</h2><p>${relatedLinks}</p></section>` : ''}
  `;

  document.title = `${project.title} — CBenton`;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = `https://cbenton.art/projects/${project.slug}`;
}

document.addEventListener('DOMContentLoaded', loadProjectDetail);
