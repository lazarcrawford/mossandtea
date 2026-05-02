const SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zm1zdGxud25mamtvY3BvcmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTA0NTAsImV4cCI6MjA5Mjg4NjQ1MH0.qHwyaMistajwFrO9snQ44SLJmW8qs95A-c9GPywv0-c';

const supabase = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const state = {
  session: null,
  projects: [],
  selectedProject: null,
  files: [],
  documents: [],
  invoices: [],
  signedUrls: {},
  selections: new Set(),
  filter: 'all',
  lightboxIndex: 0,
};
const demoMode = new URLSearchParams(window.location.search).has('demo');

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function setStatus(message, active = false) {
  $('[data-status]').textContent = message;
  $('[data-status-dot]').classList.toggle('is-active', active);
}

function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(`${value}T00:00:00`).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(value) {
  return String(value || 'in review').replace(/_/g, ' ');
}

function money(cents) {
  if (!cents) return 'No balance due';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

function showWorkspace(show) {
  $('[data-auth-panel]').hidden = show;
  $('[data-workspace]').hidden = !show;
  $('[data-sign-out]').hidden = !show;
}

async function sendMagicLink(email) {
  if (!supabase) throw new Error('Supabase client is not available.');
  const redirectTo = `${window.location.origin}/hermitage/`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

async function loadSession() {
  if (demoMode) {
    loadDemoState();
    return;
  }
  if (!supabase) {
    setStatus('Supabase client unavailable.', false);
    return;
  }
  const { data } = await supabase.auth.getSession();
  state.session = data.session;
  if (!state.session) {
    showWorkspace(false);
    setStatus('Waiting for invite access.', false);
    return;
  }
  showWorkspace(true);
  setStatus('Session active.', true);
  await loadProjects();
}

function loadDemoState() {
  state.session = { user: { email: 'client@example.com' } };
  state.projects = [{
    id: 'demo-project',
    title: 'CENIT Portrait Study',
    description: 'A private proofing room for a portrait session that moves between icon, body, nature, and myth. The goal is simple: identify the frames that still feel alive after the first look.',
    status: 'editing',
    shoot_date: '2026-04-18',
    delivery_date: '2026-05-08',
    studio_note: 'Start with the suggested frames, then make a second pass from instinct. Choose the images that feel like presence, not performance.',
    customers: { first_name: 'CENIT', last_name: '' },
  }];
  state.selectedProject = state.projects[0];
  state.files = [
    demoFile('demo-1', 'cenit_12B.jpg', 'Figure among oranges', 'Suggested', true, false, '50% 36%'),
    demoFile('demo-2', 'cenit_21B.jpg', 'Black form, held still', 'Body landscape', true, true, '48% 42%'),
    demoFile('demo-3', 'cenit_28.jpg', 'Threshold portrait', 'Quiet power', false, false, '50% 28%'),
    demoFile('demo-4', 'cenit_river01.jpg', 'River study', 'Water / afterimage', false, true, '50% 38%'),
    demoFile('demo-5', 'G3A5320.jpg', 'Soft field', 'Atmosphere', true, false, '50% 58%'),
    demoFile('demo-6', 'G3A5407B.jpg', 'Line and breath', 'Gesture', false, false, '50% 34%'),
  ];
  state.signedUrls = Object.fromEntries(
    state.files.map((file) => [file.id, `../images/irina/${file.filename}`])
  );
  state.documents = [
    {
      id: 'demo-doc',
      title: 'Sample CENIT Agreement',
      document_type: 'agreement',
      status: 'draft',
      file_url: '',
    },
    {
      id: 'demo-release',
      title: 'Retouching Direction Notes',
      document_type: 'studio note',
      status: 'ready for review',
      file_url: '',
    },
  ];
  state.invoices = [{
    id: 'demo-invoice',
    title: 'Sample Invoice Draft',
    amount_cents: 0,
    status: 'pending',
    payment_url: '',
  }];
  showWorkspace(true);
  setStatus('Demo room. No client data is being used.', true);
  renderAll();
}

function demoFile(id, filename, caption, tag, favorite, downloadAllowed, position) {
  return {
    id,
    project_id: 'demo-project',
    original_name: filename,
    filename,
    caption,
    tag,
    favorite,
    mime_type: 'image/jpeg',
    is_client_visible: true,
    download_allowed: downloadAllowed,
    position,
  };
}

async function loadProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, status, shoot_date, delivery_date, location, customer_id, customers(first_name, last_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  state.projects = data || [];
  renderProjects();
  if (state.projects.length) selectProject(state.projects[0].id);
}

async function selectProject(projectId) {
  state.selectedProject = state.projects.find((project) => project.id === projectId) || null;
  state.filter = 'all';
  renderProjects();
  renderOverview();
  if (demoMode) {
    renderGallery();
    renderDocuments();
    renderInvoices();
    renderSelectionTray();
    return;
  }
  await Promise.all([loadFiles(projectId), loadDocuments(projectId), loadInvoices(projectId)]);
}

async function loadFiles(projectId) {
  if (!projectId) return;
  const { data, error } = await supabase
    .from('project_files')
    .select('id, project_id, original_name, filename, mime_type, r2_key, is_client_visible, download_allowed, sort_order, created_at, client_caption')
    .eq('project_id', projectId)
    .eq('is_client_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  state.files = data || [];
  await signVisibleFiles();
  renderGallery();
  renderOverview();
  renderSelectionTray();
}

async function signVisibleFiles() {
  const signedUrls = {};
  for (const file of state.files) {
    if (!file.r2_key || !String(file.mime_type || '').startsWith('image/')) continue;
    const { data, error } = await supabase.storage
      .from('project-files')
      .createSignedUrl(file.r2_key, 60 * 15);
    if (!error && data?.signedUrl) signedUrls[file.id] = data.signedUrl;
  }
  state.signedUrls = signedUrls;
}

async function loadDocuments(projectId) {
  const { data, error } = await supabase
    .from('project_documents')
    .select('id, title, document_type, status, file_url, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) {
    state.documents = [];
    return;
  }
  state.documents = data || [];
  renderDocuments();
}

async function loadInvoices(projectId) {
  const { data, error } = await supabase
    .from('invoices')
    .select('id, title, amount_cents, status, due_date, payment_url, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) {
    state.invoices = [];
    return;
  }
  state.invoices = data || [];
  renderInvoices();
}

function renderAll() {
  renderProjects();
  renderOverview();
  renderGallery();
  renderDocuments();
  renderInvoices();
  renderSelectionTray();
}

function renderProjects() {
  const list = $('[data-project-list]');
  if (!state.projects.length) {
    list.innerHTML = '<article class="empty"><p>No projects are visible yet.</p></article>';
    return;
  }
  list.innerHTML = state.projects.map((project) => `
    <button type="button" class="project-card ${state.selectedProject?.id === project.id ? 'is-active' : ''}" data-project-id="${escapeHtml(project.id)}">
      <span>${escapeHtml(statusLabel(project.status))}</span>
      <strong>${escapeHtml(project.title)}</strong>
      <small>${escapeHtml(formatDate(project.shoot_date))}</small>
    </button>
  `).join('');
  $$('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => selectProject(button.dataset.projectId).catch(reportError));
  });
}

function renderOverview() {
  const project = state.selectedProject;
  const customer = project?.customers;
  const heroFile = state.files.find((file) => state.signedUrls[file.id]) || null;
  $('[data-client-name]').textContent = customer?.first_name ? `${customer.first_name}'s Hermitage` : 'Your Hermitage';
  $('[data-project-title]').textContent = project?.title || 'Select a project';
  $('[data-project-description]').textContent = project?.description || 'Review project status, gallery files, documents, and billing links.';
  $('[data-project-status]').textContent = statusLabel(project?.status);
  $('[data-project-shoot]').textContent = formatDate(project?.shoot_date);
  $('[data-project-delivery]').textContent = formatDate(project?.delivery_date);
  $('[data-project-file-count]').textContent = String(state.files.length || 0);
  $('[data-studio-note]').textContent = project?.studio_note || 'The studio will leave a note here when the next pass is ready.';
  if (heroFile) $('[data-project-hero]').src = state.signedUrls[heroFile.id];
  renderTimeline(project);
}

function renderTimeline(project) {
  const status = statusLabel(project?.status);
  const steps = [
    ['Session held', formatDate(project?.shoot_date)],
    ['First edit', status === 'editing' ? 'In progress now' : 'Prepared'],
    ['Client proofing', `${state.files.length || 0} visible images`],
    ['Final delivery', formatDate(project?.delivery_date)],
  ];
  $('[data-timeline]').innerHTML = steps.map(([title, detail]) => `
    <li><div></div><p><strong>${escapeHtml(title)}</strong><span>${escapeHtml(detail)}</span></p></li>
  `).join('');
}

function visibleFiles() {
  return state.files.filter((file) => {
    if (state.filter === 'favorite') return Boolean(file.favorite);
    if (state.filter === 'download') return Boolean(file.download_allowed);
    if (state.filter === 'selected') return state.selections.has(file.id);
    return true;
  });
}

function renderGallery() {
  const gallery = $('[data-gallery]');
  $('[data-project-file-count]').textContent = String(state.files.length || 0);
  $$('[data-filter]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === state.filter);
  });
  const files = visibleFiles();
  if (!files.length) {
    gallery.innerHTML = '<article class="empty"><p>No images match this view yet.</p></article>';
    return;
  }
  gallery.innerHTML = files.map((file) => {
    const src = state.signedUrls[file.id] || '';
    const selected = state.selections.has(file.id);
    const caption = file.caption || file.client_caption || file.original_name || file.filename;
    const tag = file.tag || (file.download_allowed ? 'Download ready' : 'Proof');
    const position = file.position ? ` style="object-position:${escapeHtml(file.position)}"` : '';
    return `
      <article class="image-card">
        <button class="image-card__open" type="button" data-open-image="${escapeHtml(file.id)}" ${src ? '' : 'disabled'}>
          ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy"${position}>` : '<span>Preview pending</span>'}
        </button>
        <div class="image-meta">
          <div>
            <strong>${escapeHtml(caption)}</strong>
            <span>${escapeHtml(tag)}</span>
          </div>
          <button type="button" class="pick-toggle ${selected ? 'is-selected' : ''}" data-select-file="${escapeHtml(file.id)}">
            ${selected ? 'Picked' : 'Pick'}
          </button>
        </div>
      </article>
    `;
  }).join('');
  $$('[data-select-file]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSelection(button.dataset.selectFile);
    });
  });
  $$('[data-open-image]').forEach((button) => {
    button.addEventListener('click', () => openLightbox(button.dataset.openImage));
  });
}

function renderSelectionTray() {
  const selectedFiles = state.files.filter((file) => state.selections.has(file.id));
  $('[data-selection-count]').textContent = `${selectedFiles.length} selected`;
  const strip = $('[data-selection-strip]');
  if (!selectedFiles.length) {
    strip.innerHTML = '<p class="muted">Your final set will collect here.</p>';
    return;
  }
  strip.innerHTML = selectedFiles.map((file) => `
    <button type="button" class="selection-thumb" data-open-image="${escapeHtml(file.id)}" aria-label="Open ${escapeHtml(file.original_name || file.filename)}">
      <img src="${escapeHtml(state.signedUrls[file.id])}" alt="">
    </button>
  `).join('');
  $$('.selection-thumb[data-open-image]').forEach((button) => {
    button.addEventListener('click', () => openLightbox(button.dataset.openImage));
  });
}

function renderDocuments() {
  const target = $('[data-documents]');
  if (!state.documents.length) {
    target.innerHTML = '<article class="empty"><p>No client-visible documents are ready yet.</p></article>';
    return;
  }
  target.innerHTML = state.documents.map((doc) => `
    <article class="list-item">
      <div>
        <strong>${escapeHtml(doc.title)}</strong>
        <span>${escapeHtml(doc.document_type || 'document')} - ${escapeHtml(doc.status || 'ready')}</span>
      </div>
      ${doc.file_url ? `<a class="text-button" href="${escapeHtml(doc.file_url)}" target="_blank" rel="noreferrer">Open</a>` : '<span>Preview only</span>'}
    </article>
  `).join('');
}

function renderInvoices() {
  const target = $('[data-invoices]');
  if (!state.invoices.length) {
    target.innerHTML = '<article class="empty"><p>No payment links are ready yet.</p></article>';
    return;
  }
  target.innerHTML = state.invoices.map((invoice) => `
    <article class="list-item">
      <div>
        <strong>${escapeHtml(invoice.title)}</strong>
        <span>${escapeHtml(money(invoice.amount_cents))} - ${escapeHtml(invoice.status || 'pending')}</span>
      </div>
      ${invoice.payment_url ? `<a class="button button--secondary" href="${escapeHtml(invoice.payment_url)}" target="_blank" rel="noreferrer">Pay</a>` : '<span>Sample only</span>'}
    </article>
  `).join('');
}

function toggleSelection(fileId) {
  if (state.selections.has(fileId)) state.selections.delete(fileId);
  else state.selections.add(fileId);
  renderGallery();
  renderSelectionTray();
  updateLightboxControls();
}

async function submitSelections() {
  if (!state.selectedProject || !state.selections.size) {
    setStatus('Choose at least one image first.', false);
    return;
  }
  if (demoMode) {
    setStatus(`${state.selections.size} demo final pick${state.selections.size === 1 ? '' : 's'} held in the tray.`, true);
    return;
  }
  const rows = Array.from(state.selections).map((fileId) => ({
    project_id: state.selectedProject.id,
    project_file_id: fileId,
    selection_type: 'final_pick',
  }));
  const { error } = await supabase.from('client_file_selections').upsert(rows, {
    onConflict: 'project_file_id,user_id,selection_type',
  });
  if (error) throw error;
  setStatus('Final picks saved.', true);
}

function openLightbox(fileId) {
  const files = visibleFiles();
  const index = files.findIndex((candidate) => candidate.id === fileId);
  if (index < 0) return;
  state.lightboxIndex = index;
  renderLightbox();
  $('[data-lightbox]').hidden = false;
}

function renderLightbox() {
  const files = visibleFiles();
  const file = files[state.lightboxIndex];
  const src = file ? state.signedUrls[file.id] : '';
  if (!file || !src) return;
  const lightbox = $('[data-lightbox]');
  const image = lightbox.querySelector('img');
  image.src = src;
  image.alt = file.caption || file.original_name || file.filename;
  $('[data-lightbox-caption]').textContent = file.caption || file.original_name || file.filename;
  updateLightboxControls();
}

function updateLightboxControls() {
  const files = visibleFiles();
  const file = files[state.lightboxIndex];
  const button = $('[data-lightbox-select]');
  if (!button || !file) return;
  const selected = state.selections.has(file.id);
  button.textContent = selected ? 'Remove final pick' : 'Mark final pick';
  button.classList.toggle('is-selected', selected);
}

function moveLightbox(direction) {
  const files = visibleFiles();
  if (!files.length) return;
  state.lightboxIndex = (state.lightboxIndex + direction + files.length) % files.length;
  renderLightbox();
}

function closeLightbox() {
  const lightbox = $('[data-lightbox]');
  lightbox.hidden = true;
  lightbox.querySelector('img').removeAttribute('src');
}

function setView(view) {
  $$('[data-view]').forEach((section) => {
    section.hidden = section.dataset.view !== view;
  });
  $$('[data-view-button]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.viewButton === view);
  });
}

function reportError(error) {
  console.error(error);
  setStatus(error.message || 'Something needs attention.', false);
}

function bindEvents() {
  $('[data-login-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    $('[data-auth-message]').textContent = 'Sending access link...';
    try {
      await sendMagicLink(email);
      $('[data-auth-message]').textContent = 'Check your email for the private access link.';
    } catch (error) {
      $('[data-auth-message]').textContent = error.message || 'Unable to send access link.';
    }
  });
  $('[data-sign-out]').addEventListener('click', async () => {
    if (supabase) await supabase.auth.signOut();
    state.session = null;
    showWorkspace(false);
    setStatus('Signed out.', false);
  });
  $$('[data-view-button]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewButton));
  });
  $$('[data-enter-gallery], [data-jump-gallery]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      if ($('[data-workspace]').hidden) return;
      setView('gallery');
      $('[data-view="gallery"]').scrollIntoView({ block: 'start' });
    });
  });
  $$('[data-nav-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if ($('[data-workspace]').hidden) return;
      setView(link.dataset.navView);
      $('[data-workspace]').scrollIntoView({ block: 'start' });
    });
  });
  $$('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      renderGallery();
    });
  });
  $('[data-submit-selections]').addEventListener('click', () => submitSelections().catch(reportError));
  $('[data-close-lightbox]').addEventListener('click', closeLightbox);
  $('[data-lightbox-prev]').addEventListener('click', () => moveLightbox(-1));
  $('[data-lightbox-next]').addEventListener('click', () => moveLightbox(1));
  $('[data-lightbox-select]').addEventListener('click', () => {
    const file = visibleFiles()[state.lightboxIndex];
    if (file) toggleSelection(file.id);
    renderLightbox();
  });
  $('[data-lightbox]').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeLightbox();
  });
  window.addEventListener('keydown', (event) => {
    if ($('[data-lightbox]').hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}

bindEvents();
loadSession().catch(reportError);
