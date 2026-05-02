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
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

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
  if (!cents) return 'Pending';
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
  renderProjects();
  renderOverview();
  await Promise.all([loadFiles(projectId), loadDocuments(projectId), loadInvoices(projectId)]);
}

async function loadFiles(projectId) {
  if (!projectId) return;
  const { data, error } = await supabase
    .from('project_files')
    .select('id, project_id, original_name, filename, mime_type, r2_key, is_client_visible, download_allowed, sort_order, created_at')
    .eq('project_id', projectId)
    .eq('is_client_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  state.files = data || [];
  await signVisibleFiles();
  renderGallery();
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

function renderProjects() {
  const list = $('[data-project-list]');
  if (!state.projects.length) {
    list.innerHTML = '<article class="empty"><p>No projects are visible yet.</p></article>';
    return;
  }
  list.innerHTML = state.projects.map((project) => `
    <button type="button" class="project-card ${state.selectedProject?.id === project.id ? 'is-active' : ''}" data-project-id="${project.id}">
      <span>${statusLabel(project.status)}</span>
      <strong>${project.title}</strong>
      <small>${formatDate(project.shoot_date)}</small>
    </button>
  `).join('');
  $$('[data-project-id]').forEach((button) => {
    button.addEventListener('click', () => selectProject(button.dataset.projectId).catch(reportError));
  });
}

function renderOverview() {
  const project = state.selectedProject;
  const customer = project?.customers;
  $('[data-client-name]').textContent = customer?.first_name ? `${customer.first_name}'s Hermitage` : 'Your Hermitage';
  $('[data-project-title]').textContent = project?.title || 'Select a project';
  $('[data-project-description]').textContent = project?.description || 'Review project status, gallery files, documents, and billing links.';
  $('[data-project-status]').textContent = statusLabel(project?.status);
  $('[data-project-shoot]').textContent = formatDate(project?.shoot_date);
  $('[data-project-delivery]').textContent = formatDate(project?.delivery_date);
  $('[data-project-file-count]').textContent = String(state.files.length || 0);
}

function renderGallery() {
  const gallery = $('[data-gallery]');
  $('[data-project-file-count]').textContent = String(state.files.length || 0);
  if (!state.files.length) {
    gallery.innerHTML = '<article class="empty"><p>No client-visible images are ready yet.</p></article>';
    return;
  }
  gallery.innerHTML = state.files.map((file) => {
    const src = state.signedUrls[file.id] || '';
    const selected = state.selections.has(file.id);
    return `
      <article class="image-card">
        <button type="button" data-open-image="${file.id}" ${src ? '' : 'disabled'}>
          ${src ? `<img src="${src}" alt="${file.original_name || file.filename}" loading="lazy">` : '<span>Preview pending</span>'}
        </button>
        <div>
          <strong>${file.original_name || file.filename}</strong>
          <label><input type="checkbox" data-select-file="${file.id}" ${selected ? 'checked' : ''}> Final pick</label>
        </div>
      </article>
    `;
  }).join('');
  $$('[data-select-file]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) state.selections.add(input.dataset.selectFile);
      else state.selections.delete(input.dataset.selectFile);
    });
  });
  $$('[data-open-image]').forEach((button) => {
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
        <strong>${doc.title}</strong>
        <span>${doc.document_type || 'document'} - ${doc.status || 'ready'}</span>
      </div>
      ${doc.file_url ? `<a class="text-button" href="${doc.file_url}" target="_blank" rel="noreferrer">Open</a>` : ''}
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
        <strong>${invoice.title}</strong>
        <span>${money(invoice.amount_cents)} - ${invoice.status || 'pending'}</span>
      </div>
      ${invoice.payment_url ? `<a class="button button--secondary" href="${invoice.payment_url}" target="_blank" rel="noreferrer">Pay</a>` : ''}
    </article>
  `).join('');
}

async function submitSelections() {
  if (!state.selectedProject || !state.selections.size) {
    setStatus('Choose at least one image first.', false);
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
  const file = state.files.find((candidate) => candidate.id === fileId);
  const src = state.signedUrls[fileId];
  if (!file || !src) return;
  const lightbox = $('[data-lightbox]');
  const image = lightbox.querySelector('img');
  image.src = src;
  image.alt = file.original_name || file.filename;
  lightbox.hidden = false;
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
    await supabase.auth.signOut();
    state.session = null;
    showWorkspace(false);
    setStatus('Signed out.', false);
  });
  $$('[data-view-button]').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewButton));
  });
  $('[data-submit-selections]').addEventListener('click', () => submitSelections().catch(reportError));
  $('[data-close-lightbox]').addEventListener('click', closeLightbox);
  $('[data-lightbox]').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeLightbox();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
  });
}

bindEvents();
loadSession().catch(reportError);
