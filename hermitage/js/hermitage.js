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
  services: [],
  serviceRequests: new Set(),
  serviceOrderApprovedAt: null,
  deliveryFiles: [],
  deliveryAcceptedAt: null,
  signedUrls: {},
  selections: new Set(),
  editRequests: new Map(),
  filter: 'all',
  lightboxIndex: 0,
  submittedAt: null,
  purchaseConfirmed: false,
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

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
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

function projectEditLimit() {
  return Number(state.selectedProject?.included_edit_count || 3);
}

function projectEditFeeCents() {
  return Number(state.selectedProject?.additional_edit_fee_cents || 7900);
}

function editCount() {
  return state.editRequests.size;
}

function overageEditCount() {
  return Math.max(0, editCount() - projectEditLimit());
}

function editFeeTotalCents() {
  return overageEditCount() * projectEditFeeCents();
}

function selectedServices() {
  return state.services.filter((service) => state.serviceRequests.has(service.id));
}

function serviceOrderTotalCents() {
  return selectedServices().reduce((sum, service) => sum + Number(service.price_cents || 0), 0);
}

function projectBalanceCents() {
  const invoiceTotal = state.invoices.reduce((sum, invoice) => {
    if (invoice.status === 'paid') return sum;
    return sum + Number(invoice.amount_cents || 0);
  }, 0);
  return invoiceTotal;
}

function currentSelectedFiles() {
  return state.files.filter((file) => state.selections.has(file.id));
}

function parseSelectionNote(note) {
  if (!note) return {};
  try {
    const parsed = JSON.parse(note);
    return parsed && typeof parsed === 'object' ? parsed : { submissionNote: note };
  } catch {
    return { submissionNote: note };
  }
}

function nextAction(project) {
  if (!project) return 'Open the project';
  if (state.deliveryAcceptedAt) return 'Delivery accepted';
  if (state.deliveryFiles.length && state.submittedAt && (!editFeeTotalCents() || state.purchaseConfirmed)) return 'Review final delivery';
  if (state.serviceRequests.size && !state.serviceOrderApprovedAt) return 'Approve service order';
  if (state.submittedAt && editFeeTotalCents() && !state.purchaseConfirmed) return 'Approve edit charge';
  if (state.submittedAt) return 'Selection submitted';
  if (state.selections.size) return 'Submit or refine final picks';
  if (state.files.length) return 'Choose the first final set';
  if (state.documents.length) return 'Review studio documents';
  return 'Wait for the studio to prepare files';
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
    description: 'A private proofing space for a portrait session shaped by Irina’s quiet attention to presence, gesture, shadow, and the charged spaces between expression and stillness.',
    status: 'editing',
    shoot_date: '2026-04-18',
    delivery_date: '2026-05-08',
    studio_note: 'Begin with the suggested frames, then make a second pass from instinct. Choose the images that still feel alive after the first look; edit notes can stay simple and exact.',
    included_edit_count: 3,
    additional_edit_fee_cents: 7900,
    customers: { first_name: 'CENIT', last_name: '' },
  }];
  state.selectedProject = state.projects[0];
  state.files = [
    demoFile('demo-1', 'cenit_12B.jpg', 'Figure among oranges', 'Suggested', true, false, '50% 36%'),
    demoFile('demo-2', 'cenit_21B.jpg', 'Black form, held still', 'Table mark', true, true, '48% 42%'),
    demoFile('demo-3', 'cenit_28.jpg', 'Threshold portrait', 'Quiet power', false, false, '50% 28%'),
    demoFile('demo-4', 'cenit_river01.jpg', 'River study', 'Water / afterimage', false, true, '50% 38%'),
    demoFile('demo-5', 'G3A5320.jpg', 'Soft field', 'Breath', true, false, '50% 58%'),
    demoFile('demo-6', 'G3A5407B.jpg', 'Line and breath', 'Gesture', false, false, '50% 34%'),
  ];
  state.signedUrls = Object.fromEntries(
    state.files.map((file) => [file.id, `../images/irina/${file.filename}`])
  );
  state.documents = [
    {
      id: 'demo-doc',
      title: 'Sample CENIT Agreement',
      document_type: 'contract',
      status: 'signed',
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
  state.services = [
    {
      id: 'svc-rush',
      title: 'Rush final gallery',
      description: 'Move the edit pass to the front of the studio queue when timing matters.',
      price_cents: 14900,
      turnaround: '2 studio days',
    },
    {
      id: 'svc-card',
      title: 'Digital card design',
      description: 'A refined announcement, holiday, or keepsake card built from the final photographs.',
      price_cents: 12900,
      turnaround: '3 studio days',
    },
    {
      id: 'svc-print',
      title: 'Print-ready master files',
      description: 'Prepare selected images with crop, export, and finish guidance for archival printing.',
      price_cents: 9900,
      turnaround: '2 studio days',
    },
  ];
  state.serviceRequests = new Set();
  state.serviceOrderApprovedAt = null;
  state.deliveryFiles = state.files.slice(0, 3).map((file) => ({
    ...file,
    deliveryLabel: 'Final retouched file',
  }));
  state.deliveryAcceptedAt = null;
  showWorkspace(true);
  setStatus('Demo portal. No client data is being used.', true);
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
  state.selections = new Set();
  state.editRequests = new Map();
  state.submittedAt = null;
  state.purchaseConfirmed = false;
  state.serviceRequests = new Set();
  state.serviceOrderApprovedAt = null;
  state.deliveryFiles = [];
  state.deliveryAcceptedAt = null;
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
  await loadSelections(projectId);
  renderAll();
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

async function loadSelections(projectId) {
  if (!projectId) return;
  const { data, error } = await supabase
    .from('client_file_selections')
    .select('project_file_id, selection_type, note, submitted_at')
    .eq('project_id', projectId)
    .eq('selection_type', 'final_pick');
  if (error) {
    state.selections = new Set();
    state.editRequests = new Map();
    state.submittedAt = null;
    return;
  }
  const rows = data || [];
  state.selections = new Set(rows.map((row) => row.project_file_id));
  state.editRequests = new Map();
  rows.forEach((row) => {
    const payload = parseSelectionNote(row.note);
    if (payload.editRequested) {
      state.editRequests.set(row.project_file_id, payload.editNote || '');
    }
  });
  state.submittedAt = rows.find((row) => row.submitted_at)?.submitted_at || null;
}

function renderAll() {
  renderProjects();
  renderOverview();
  renderGallery();
  renderDocuments();
  renderInvoices();
  renderServices();
  renderDelivery();
  renderSelectionTray();
  renderProofingLedger();
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
  $('[data-client-name]').textContent = customer?.first_name ? `${customer.first_name}'s Client Portal` : 'Your Client Portal';
  $('[data-project-title]').textContent = project?.title || 'Select a project';
  setText('[data-hero-project-title]', project?.title || 'Project');
  setText('[data-hero-next-action]', nextAction(project));
  setText('[data-room-phase]', `${statusLabel(project?.status)} - ${nextAction(project)}`);
  $('[data-project-description]').textContent = project?.description || 'Review project status, gallery files, documents, and billing links.';
  $('[data-project-status]').textContent = statusLabel(project?.status);
  setText('[data-hero-project-status]', statusLabel(project?.status));
  $('[data-project-shoot]').textContent = formatDate(project?.shoot_date);
  $('[data-project-delivery]').textContent = formatDate(project?.delivery_date);
  $('[data-project-file-count]').textContent = String(state.files.length || 0);
  setText('[data-project-contract]', contractStatus());
  setText('[data-project-balance]', projectBalanceCents() ? money(projectBalanceCents()) : 'Clear');
  setText('[data-hero-file-count]', String(state.files.length || 0));
  $('[data-studio-note]').textContent = project?.studio_note || 'The studio will leave a note here when the next pass is ready.';
  if (heroFile) $('[data-project-hero]').src = state.signedUrls[heroFile.id];
  renderTimeline(project);
  renderProofingLedger();
}

function contractStatus() {
  const contract = state.documents.find((doc) => /contract|agreement/i.test(`${doc.document_type} ${doc.title}`));
  if (!contract) return 'Not posted';
  return statusLabel(contract.status || 'ready');
}

function renderTimeline(project) {
  const status = statusLabel(project?.status);
  const steps = [
    ['Invite', 'Private room opened'],
    ['Contract', contractStatus()],
    ['Session', formatDate(project?.shoot_date)],
    ['Proofing', state.submittedAt ? 'Submitted' : `${state.files.length || 0} visible images`],
    ['Studio edit', status === 'editing' ? 'In progress now' : 'Queued'],
    ['Delivery', state.deliveryAcceptedAt ? 'Accepted' : formatDate(project?.delivery_date)],
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
    const editRequested = state.editRequests.has(file.id);
    const submitted = Boolean(state.submittedAt && selected);
    const caption = file.caption || file.client_caption || file.original_name || file.filename;
    const tag = file.tag || (file.download_allowed ? 'Download ready' : 'Proof');
    const position = file.position ? ` style="object-position:${escapeHtml(file.position)}"` : '';
    return `
      <article class="image-card ${selected ? 'is-picked' : ''} ${editRequested ? 'is-edit-requested' : ''} ${submitted ? 'is-submitted' : ''}">
        <button class="image-card__open" type="button" data-open-image="${escapeHtml(file.id)}" ${src ? '' : 'disabled'}>
          ${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy"${position}>` : '<span>Preview pending</span>'}
        </button>
        <div class="image-meta">
          <div>
            <strong>${escapeHtml(caption)}</strong>
            <span>${escapeHtml(submitted ? 'Submitted' : tag)}</span>
          </div>
          <div class="proof-actions">
            <button type="button" class="pick-toggle ${selected ? 'is-selected' : ''}" data-select-file="${escapeHtml(file.id)}">
              ${selected ? 'Picked' : 'Pick'}
            </button>
            <button type="button" class="edit-toggle ${editRequested ? 'is-selected' : ''}" data-edit-file="${escapeHtml(file.id)}">
              ${editRequested ? 'Edit requested' : 'Request edit'}
            </button>
          </div>
          ${editRequested ? `
            <label class="edit-note">
              Edit note
              <textarea data-edit-note="${escapeHtml(file.id)}" rows="2" placeholder="Skin tone, crop, contrast, blemish, mood...">${escapeHtml(state.editRequests.get(file.id) || '')}</textarea>
            </label>
          ` : ''}
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
  $$('[data-edit-file]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEditRequest(button.dataset.editFile);
    });
  });
  $$('[data-edit-note]').forEach((input) => {
    input.addEventListener('input', () => {
      state.editRequests.set(input.dataset.editNote, input.value);
      renderProofingLedger();
    });
  });
  $$('[data-open-image]').forEach((button) => {
    button.addEventListener('click', () => openLightbox(button.dataset.openImage));
  });
  renderProofingLedger();
}

function renderSelectionTray() {
  const selectedFiles = currentSelectedFiles();
  $('[data-selection-count]').textContent = `${selectedFiles.length} selected`;
  setText('[data-hero-selection-count]', String(selectedFiles.length));
  setText('[data-hero-next-action]', nextAction(state.selectedProject));
  setText('[data-room-phase]', `${statusLabel(state.selectedProject?.status)} - ${nextAction(state.selectedProject)}`);
  setText('[data-edit-ledger]', `${editCount()} of ${projectEditLimit()} included edits requested`);
  setText('[data-edit-fee]', editFeeTotalCents() ? `${money(editFeeTotalCents())} edit overage` : 'No edit fee');
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

function renderProofingLedger() {
  const limit = projectEditLimit();
  const overage = overageEditCount();
  const fee = editFeeTotalCents();
  setText('[data-proof-pick-count]', String(state.selections.size));
  setText('[data-proof-edit-count]', `${editCount()} / ${limit}`);
  setText('[data-proof-overage]', fee ? `${overage} extra · ${money(fee)}` : 'No fee');
  setText('[data-proof-state]', state.submittedAt ? 'Submitted' : 'Open');
  setText('[data-proof-drawer-summary]', `${visibleFiles().length || state.files.length} photograph${(visibleFiles().length || state.files.length) === 1 ? '' : 's'}`);
  const banner = $('[data-submission-banner]');
  if (banner) {
    banner.hidden = !state.submittedAt;
    setText('[data-submission-summary]', `${state.selections.size} final pick${state.selections.size === 1 ? '' : 's'} and ${editCount()} edit request${editCount() === 1 ? '' : 's'} submitted.`);
  }
  const purchasePanel = $('[data-purchase-panel]');
  if (purchasePanel) {
    purchasePanel.hidden = !(state.submittedAt && fee && !state.purchaseConfirmed);
    setText('[data-purchase-total]', money(fee));
    setText('[data-purchase-copy]', `${overage} edit${overage === 1 ? '' : 's'} beyond the included ${limit}.`);
  }
  $$('[data-submit-selections]').forEach((button) => {
    button.textContent = state.submittedAt ? 'Update selection' : 'Submit final picks';
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

function renderServices() {
  const target = $('[data-services]');
  if (!target) return;
  if (!state.services.length) {
    target.innerHTML = '<article class="empty"><p>No additional services are available for this project yet.</p></article>';
    return;
  }
  target.innerHTML = state.services.map((service) => {
    const selected = state.serviceRequests.has(service.id);
    return `
      <article class="service-card ${selected ? 'is-selected' : ''}">
        <div>
          <span>${escapeHtml(service.turnaround || 'Studio timing')}</span>
          <strong>${escapeHtml(service.title)}</strong>
          <p>${escapeHtml(service.description)}</p>
        </div>
        <div class="service-card__action">
          <b>${escapeHtml(money(service.price_cents))}</b>
          <button type="button" class="pick-toggle ${selected ? 'is-selected' : ''}" data-toggle-service="${escapeHtml(service.id)}">
            ${selected ? 'Added' : 'Add'}
          </button>
        </div>
      </article>
    `;
  }).join('');
  $$('[data-toggle-service]').forEach((button) => {
    button.addEventListener('click', () => toggleService(button.dataset.toggleService));
  });
  renderServiceSummary();
}

function renderServiceSummary() {
  setText('[data-service-count]', String(state.serviceRequests.size));
  setText('[data-service-total]', serviceOrderTotalCents() ? money(serviceOrderTotalCents()) : 'No balance due');
  setText('[data-service-state]', state.serviceOrderApprovedAt ? 'Approved' : 'Open');
  setText('[data-hero-next-action]', nextAction(state.selectedProject));
  setText('[data-room-phase]', `${statusLabel(state.selectedProject?.status)} - ${nextAction(state.selectedProject)}`);
}

function renderDelivery() {
  const target = $('[data-delivery-files]');
  if (!target) return;
  setText('[data-delivery-status]', state.deliveryAcceptedAt ? 'Accepted' : (state.submittedAt ? 'Ready for review' : 'Preparing'));
  setText('[data-delivery-accepted]', state.deliveryAcceptedAt ? formatDate(state.deliveryAcceptedAt.slice(0, 10)) : 'Not yet');
  if (!state.deliveryFiles.length) {
    target.innerHTML = '<article class="empty"><p>Final files will appear after proofing and the studio edit pass.</p></article>';
    return;
  }
  target.innerHTML = state.deliveryFiles.map((file) => `
    <article class="delivery-file ${state.deliveryAcceptedAt ? 'is-accepted' : ''}">
      <img src="${escapeHtml(state.signedUrls[file.id] || '')}" alt="${escapeHtml(file.caption || file.original_name || file.filename)}">
      <div>
        <strong>${escapeHtml(file.caption || file.original_name || file.filename)}</strong>
        <span>${escapeHtml(file.deliveryLabel || 'Final file')}</span>
      </div>
    </article>
  `).join('');
}

function toggleService(serviceId) {
  if (state.serviceRequests.has(serviceId)) state.serviceRequests.delete(serviceId);
  else state.serviceRequests.add(serviceId);
  state.serviceOrderApprovedAt = null;
  renderServices();
}

function approveServiceOrder() {
  if (!state.serviceRequests.size) {
    setStatus('Choose a service first.', false);
    return;
  }
  state.serviceOrderApprovedAt = new Date().toISOString();
  if (demoMode && serviceOrderTotalCents()) {
    state.invoices = [{
      id: 'demo-service-order',
      title: 'Additional service order',
      amount_cents: serviceOrderTotalCents(),
      status: 'pending',
      payment_url: '',
    }, ...state.invoices.filter((invoice) => invoice.id !== 'demo-service-order')];
  }
  setStatus('Service order approved for the studio queue.', true);
  renderServices();
  renderInvoices();
  renderOverview();
}

function acceptDelivery() {
  if (!state.submittedAt) {
    setStatus('Submit final picks before accepting delivery.', false);
    return;
  }
  if (editFeeTotalCents() && !state.purchaseConfirmed) {
    setStatus('Approve the edit charge before accepting delivery.', false);
    return;
  }
  state.deliveryAcceptedAt = new Date().toISOString();
  if (state.selectedProject) state.selectedProject.status = 'delivered';
  setStatus('Delivery accepted. The project is ready to close.', true);
  renderOverview();
  renderDelivery();
  renderProjects();
}

function toggleSelection(fileId) {
  if (state.selections.has(fileId)) state.selections.delete(fileId);
  else state.selections.add(fileId);
  if (!state.selections.has(fileId)) state.editRequests.delete(fileId);
  state.submittedAt = null;
  renderGallery();
  renderSelectionTray();
  renderProofingLedger();
  updateLightboxControls();
}

function toggleEditRequest(fileId) {
  if (state.editRequests.has(fileId)) state.editRequests.delete(fileId);
  else {
    state.selections.add(fileId);
    state.editRequests.set(fileId, '');
  }
  state.submittedAt = null;
  renderGallery();
  renderSelectionTray();
  renderProofingLedger();
  updateLightboxControls();
}

async function submitSelections() {
  if (!state.selectedProject || !state.selections.size) {
    setStatus('Choose at least one image first.', false);
    return;
  }
  const submittedAt = new Date().toISOString();
  const submissionNote = $('[data-submission-note]')?.value || '';
  if (demoMode) {
    state.submittedAt = submittedAt;
    if (editFeeTotalCents()) {
      state.invoices = [{
        id: 'demo-edit-overage',
        title: 'Additional edit approval',
        amount_cents: editFeeTotalCents(),
        status: state.purchaseConfirmed ? 'paid' : 'pending',
        payment_url: '',
      }, ...state.invoices.filter((invoice) => invoice.id !== 'demo-edit-overage')];
      renderInvoices();
    }
    setStatus(`${state.selections.size} final pick${state.selections.size === 1 ? '' : 's'} submitted.`, true);
    renderGallery();
    renderSelectionTray();
    renderProofingLedger();
    renderDelivery();
    return;
  }
  const rows = Array.from(state.selections).map((fileId) => ({
    project_id: state.selectedProject.id,
    project_file_id: fileId,
    selection_type: 'final_pick',
    submitted_at: submittedAt,
    note: JSON.stringify({
      editRequested: state.editRequests.has(fileId),
      editNote: state.editRequests.get(fileId) || '',
      submissionNote,
      includedEditCount: projectEditLimit(),
      editFeeCents: projectEditFeeCents(),
      overageEditCount: overageEditCount(),
    }),
  }));
  const { error } = await supabase.from('client_file_selections').upsert(rows, {
    onConflict: 'project_file_id,user_id,selection_type',
  });
  if (error) throw error;
  state.submittedAt = submittedAt;
  setStatus('Final picks saved.', true);
  renderGallery();
  renderSelectionTray();
  renderProofingLedger();
  renderDelivery();
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
  $$('[data-enter-view]').forEach((button) => {
    button.addEventListener('click', () => {
      if ($('[data-workspace]').hidden) return;
      setView(button.dataset.enterView);
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
  $('[data-approve-services]').addEventListener('click', approveServiceOrder);
  $('[data-accept-delivery]').addEventListener('click', acceptDelivery);
  $('[data-close-lightbox]').addEventListener('click', closeLightbox);
  $('[data-lightbox-prev]').addEventListener('click', () => moveLightbox(-1));
  $('[data-lightbox-next]').addEventListener('click', () => moveLightbox(1));
  $('[data-lightbox-select]').addEventListener('click', () => {
    const file = visibleFiles()[state.lightboxIndex];
    if (file) toggleSelection(file.id);
    renderLightbox();
  });
  $('[data-confirm-purchase]').addEventListener('click', () => {
    state.purchaseConfirmed = true;
    if (demoMode) {
      state.invoices = state.invoices.map((invoice) => (
        invoice.id === 'demo-edit-overage' ? { ...invoice, status: 'paid' } : invoice
      ));
      renderInvoices();
    }
    setStatus('Edit charge approved.', true);
    renderProofingLedger();
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
