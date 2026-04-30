// ============================================
// Moss & Tea — Admin Panel JS
// Alpine.js + Supabase
// ============================================

// --- Supabase Init ---
// These will be swapped for real values once project is created
const SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Zm1zdGxud25mamtvY3BvcmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTA0NTAsImV4cCI6MjA5Mjg4NjQ1MH0.qHwyaMistajwFrO9snQ44SLJmW8qs95A-c9GPywv0-c';

const supabase = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : {};

// --- Helpers ---
function centsToDollars(c) { return c ? (c / 100).toFixed(2) : '0.00'; }
function dollarsToCents(d) { return Math.round(parseFloat(d || 0) * 100); }
function today() { return new Date().toISOString().split('T')[0]; }
function displayMoney(cents, fallback = 'Quote pending') {
  return cents ? `$${(cents / 100).toFixed(0)}` : fallback;
}

// --- Alpine App ---
// Exported as window.createAdminApp so the inline bootstrap in index.html
// can register it at the exact right moment during alpine:init.
// This eliminates CDN-cache timing bugs where admin.js and HTML drift apart.
window.createAdminApp = () => {
  const appState = () => window.Alpine?.$data(document.querySelector('[x-data="adminApp"]')) || root;

  const root = {
    // === NAVIGATION ===
    nav: {
      active: 'dashboard'
    },

    // === AUTH ===
    auth: {
      loggedIn: false,
      email: '',
      password: '',
      error: '',
      loading: false,
      user: null,

      async login() {
        this.loading = true;
        this.error = '';
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.email,
            password: this.password
          });
          if (error) throw error;
          this.loggedIn = true;
          this.user = data.user;
          // Load dashboard data via root reference (nested this can't see parent)
          appState().loadDashboard();
        } catch (e) {
          this.error = e.message || 'Login failed';
        } finally {
          this.loading = false;
        }
      },

      async logout() {
        await supabase.auth.signOut();
        this.loggedIn = false;
        this.user = null;
      },

      async checkSession() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          this.loggedIn = true;
          this.user = session.user;
        }
        return Boolean(session);
      }
    },

    // Auto-check session on mount
    async init() {
      await this.auth.checkSession();
      await this.loadDashboard();
    },

    // === DASHBOARD ===
    stats: {
      totalCustomers: 0,
      activeProjects: 0,
      deliveredThisMonth: 0,
      revenue: 0,
      recentProjects: []
    },
    sampleMode: {
      visible: false
    },

    async loadDashboard() {
      try {
        const { data: projects, error: projectError } = await supabase
          .from('project_details')
          .select('*')
          .order('created_at', { ascending: false });
        if (projectError) throw projectError;

        const projectList = projects || [];
        const customerIds = new Set(projectList.map((p) => p.customer_id).filter(Boolean));
        const activeProjects = projectList.filter((p) =>
          ['booked', 'shoot_complete', 'editing'].includes(p.status)
        ).length;
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);
        const delivered = projectList.filter((p) =>
          p.status === 'delivered' && new Date(p.updated_at || p.created_at) >= firstOfMonth
        ).length;
        const revenue = projectList.reduce((sum, p) => sum + (p.total_paid_cents || 0), 0);

        // Update individual properties to maintain Alpine reactivity
        this.stats.totalCustomers = customerIds.size;
        this.stats.activeProjects = activeProjects;
        this.stats.deliveredThisMonth = delivered;
        this.stats.revenue = revenue;
        this.stats.recentProjects = projectList.slice(0, 5);
        this.sampleMode.visible = projectList.some((p) => {
          const customer = String(p.customer_name || '').toLowerCase();
          const title = String(p.title || '').toLowerCase();
          return customer.includes('cenit archive') ||
            title === 'cenit' ||
            title.includes('history book') ||
            title.includes('sample');
        });
      } catch (e) {
        console.error('Dashboard load error:', e.message);
      }
    },

    displayMoney,

    // === IMAGE LIGHTBOX ===
    lightbox: {
      open: false,
      items: [],
      index: 0,

      show(items, item) {
        const app = appState();
        this.items = items.filter((f) => app.files.isImage(f) && app.files.getUrl(f.r2_key));
        this.index = Math.max(0, this.items.findIndex((f) => f.id === item.id));
        this.open = Boolean(this.items.length);
      },

      close() {
        this.open = false;
      },

      current() {
        return this.items[this.index] || null;
      },

      next() {
        if (!this.items.length) return;
        this.index = (this.index + 1) % this.items.length;
      },

      prev() {
        if (!this.items.length) return;
        this.index = (this.index - 1 + this.items.length) % this.items.length;
      }
    },

    // === CUSTOMERS ===
    customers: {
      list: [],
      search: '',
      loading: false,
      modalOpen: false,
      editing: null,
      form: { first_name: '', last_name: '', email: '', phone: '', instagram: '', notes: '' },

      resetForm() {
        this.form = { first_name: '', last_name: '', email: '', phone: '', instagram: '', notes: '' };
        this.editing = null;
      },

      async load() {
        this.loading = true;
        try {
          let query = supabase.from('customers').select('*');
          if (this.search) {
            query = query.or(`first_name.ilike.%${this.search}%,last_name.ilike.%${this.search}%,email.ilike.%${this.search}%`);
          }
          const { data } = await query.order('created_at', { ascending: false });
          this.list = data || [];

          // Get project counts
          for (const c of this.list) {
            const { count } = await supabase
              .from('projects')
              .select('id', { count: 'exact', head: true })
              .eq('customer_id', c.id);
            c.project_count = count || 0;
          }
        } catch (e) { console.error(e); }
        finally { this.loading = false; }
      },

      openNew() { this.resetForm(); this.modalOpen = true; },
      edit(c) {
        this.editing = c;
        this.form = {
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          phone: c.phone || '',
          instagram: c.instagram || '',
          notes: c.notes || ''
        };
        this.modalOpen = true;
      },

      async save() {
        try {
          if (this.editing) {
            await supabase.from('customers').update(this.form).eq('id', this.editing.id);
          } else {
            await supabase.from('customers').insert(this.form);
          }
          this.modalOpen = false;
          this.load();
        } catch (e) { alert('Error: ' + e.message); }
      },

      viewProjects(c) {
        const app = appState();
        app.projects.customerFilter = c.id;
        app.nav.active = 'projects';
        app.projects.load();
      }
    },

    // === PROJECTS ===
    projects: {
      list: [],
      customerList: [],
      customerFilter: '',
      statusFilter: '',
      search: '',
      loading: false,
      modalOpen: false,
      editing: null,
      form: {
        customer_id: '', title: '', description: '', status: 'inquiry',
        shoot_date: '', price_dollars: '', deposit_dollars: '',
        deposit_paid: false, balance_paid: false, notes: ''
      },

      resetForm() {
        this.form = {
          customer_id: this.customerFilter || '',
          title: '', description: '', status: 'inquiry',
          shoot_date: '', price_dollars: '', deposit_dollars: '',
          deposit_paid: false, balance_paid: false, notes: ''
        };
        this.editing = null;
      },

      async loadCustomers() {
        const { data } = await supabase.from('customers').select('id, first_name, last_name').order('first_name');
        this.customerList = data || [];
      },

      async load() {
        this.loading = true;
        try {
          let query = supabase.from('project_details').select('*');
          if (this.customerFilter) {
            query = query.eq('customer_id', this.customerFilter);
            this.customerFilter = '';
          }
          if (this.statusFilter) query = query.eq('status', this.statusFilter);
          if (this.search) {
            query = query.or(`title.ilike.%${this.search}%,customer_name.ilike.%${this.search}%`);
          }
          const { data } = await query.order('created_at', { ascending: false });
          this.list = data || [];
        } catch (e) { console.error(e); }
        finally { this.loading = false; }
      },

      openNew() {
        this.resetForm();
        this.loadCustomers();
        this.modalOpen = true;
      },

      edit(p) {
        this.editing = p;
        this.loadCustomers();
        this.form = {
          customer_id: p.customer_id,
          title: p.title,
          description: p.description || '',
          status: p.status,
          shoot_date: p.shoot_date || '',
          price_dollars: p.price_cents ? (p.price_cents / 100).toFixed(2) : '',
          deposit_dollars: p.deposit_cents ? (p.deposit_cents / 100).toFixed(2) : '',
          deposit_paid: p.deposit_paid,
          balance_paid: p.balance_paid,
          notes: p.notes || ''
        };
        this.modalOpen = true;
      },

      async save() {
        try {
          const payload = {
            customer_id: this.form.customer_id,
            title: this.form.title,
            description: this.form.description,
            status: this.form.status,
            shoot_date: this.form.shoot_date || null,
            price_cents: dollarsToCents(this.form.price_dollars),
            deposit_cents: dollarsToCents(this.form.deposit_dollars),
            deposit_paid: this.form.deposit_paid,
            balance_paid: this.form.balance_paid,
            notes: this.form.notes
          };

          if (this.editing) {
            await supabase.from('projects').update(payload).eq('id', this.editing.id);
          } else {
            await supabase.from('projects').insert(payload);
          }
          this.modalOpen = false;
          this.load();
        } catch (e) { alert('Error: ' + e.message); }
      },

      openDetail(p) {
        const app = appState();
        app.nav.active = 'files';
        app.files.openProject(p);
      }
    },

    // === FILES ===
    files: {
      list: [],
      projectList: [],
      projectFilter: '',
      selectedProject: null,
      loading: false,
      showUpload: false,
      uploadProject: '',
      uploading: false,
      uploadProgress: '',
      uploadSuccess: false,
      signedUrls: {},

      async load() {
        this.loading = true;
        try {
          // Load projects for filter
          const { data: projs } = await supabase
            .from('project_details')
            .select('id, title, customer_name, status, shoot_date, file_count, price_cents, total_paid_cents')
            .order('title');
          this.projectList = projs || [];
          this.selectedProject = this.projectFilter
            ? this.projectList.find((p) => p.id === this.projectFilter) || this.selectedProject
            : null;

          let query = supabase.from('project_files').select('*');
          if (this.projectFilter) query = query.eq('project_id', this.projectFilter);
          const { data } = await query.order('created_at', { ascending: false });
          this.list = data || [];
          await this.signUrls();
        } catch (e) { console.error(e); }
        finally { this.loading = false; }
      },

      openProject(project) {
        this.selectedProject = project;
        this.projectFilter = project.id;
        this.uploadProject = project.id;
        this.showUpload = false;
        this.load();
      },

      clearProject() {
        this.selectedProject = null;
        this.projectFilter = '';
      },

      async signUrls() {
        const urls = {};
        for (const file of this.list) {
          if (!file.r2_key) continue;
          const { data, error } = await supabase.storage
            .from('project-files')
            .createSignedUrl(file.r2_key, 60 * 60);
          if (!error && data?.signedUrl) {
            urls[file.r2_key] = data.signedUrl;
          }
        }
        this.signedUrls = urls;
      },

      openUpload() {
        this.showUpload = !this.showUpload;
        if (this.showUpload) {
          if (!this.projectList.length) {
            supabase.from('project_details').select('id, title').then(({ data }) => {
              this.projectList = data || [];
            });
          }
        }
      },

      getUrl(r2Key) {
        return this.signedUrls[r2Key] || '';
      },

      isImage(file) {
        return String(file?.mime_type || '').startsWith('image/');
      },

      openLightbox(file) {
        if (!this.isImage(file)) return;
        appState().lightbox.show(this.list, file);
      },

      async upload() {
        const input = document.getElementById('fileInput');
        if (!input.files.length || !this.uploadProject) {
          alert('Please select files and a project');
          return;
        }

        this.uploading = true;
        this.uploadProgress = '';
        this.uploadSuccess = false;

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Not authenticated');

          for (const file of input.files) {
            this.uploadProgress = `Uploading ${file.name}...`;

            // Upload to Supabase Storage
            const ext = file.name.split('.').pop();
            const key = `projects/${this.uploadProject}/${Date.now()}-${file.name}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('project-files')
              .upload(key, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) throw uploadError;

            // Record in project_files table
            const { error: dbError } = await supabase
              .from('project_files')
              .insert({
                project_id: this.uploadProject,
                filename: key,
                original_name: file.name,
                mime_type: file.type,
                file_size: file.size,
                r2_key: key,
                uploaded_by: 'admin'
              });

            if (dbError) {
              // Cleanup: delete storage file if DB insert fails
              await supabase.storage.from('project-files').remove([key]);
              throw dbError;
            }
          }

          this.uploadSuccess = true;
          this.uploadProgress = '';
          input.value = '';
          this.load();
          setTimeout(() => { this.uploadSuccess = false; }, 3000);
        } catch (e) {
          alert('Upload failed: ' + e.message);
        } finally {
          this.uploading = false;
        }
      },

      async delete(f) {
        if (!confirm(`Delete ${f.original_name}?`)) return;
        try {
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('project-files')
            .remove([f.r2_key]);

          if (storageError) throw storageError;

          // Delete from DB
          const { error: dbError } = await supabase
            .from('project_files')
            .delete()
            .eq('id', f.id);

          if (dbError) throw dbError;

          this.list = this.list.filter(x => x.id !== f.id);
        } catch (e) { alert('Delete failed: ' + e.message); }
      }
    },

    // === CONTRACTS ===
    contracts: {
      list: [],
      projectList: [],
      loading: false,
      modalOpen: false,
      fileSelected: null,
      form: { project_id: '', title: '' },

      async load() {
        this.loading = true;
        try {
          const { data } = await supabase
            .from('contracts')
            .select('*, project:project_id ( title, customer:customer_id ( first_name, last_name ) )')
            .order('created_at', { ascending: false });

          this.list = (data || []).map(c => ({
            ...c,
            project_title: c.project?.title || '—',
            customer_name: c.project?.customer
              ? `${c.project.customer.first_name} ${c.project.customer.last_name}`
              : '—'
          }));
        } catch (e) { console.error(e); }
        finally { this.loading = false; }
      },

      openNew() {
        this.form = { project_id: '', title: '' };
        this.fileSelected = null;
        supabase.from('project_details').select('id, title, customer_name').then(({ data }) => {
          this.projectList = data || [];
        });
        this.modalOpen = true;
      },

      async save() {
        if (!this.fileSelected) { alert('Select a PDF file'); return; }
        try {
          // Upload to Supabase Storage
          const key = `contracts/${this.form.project_id}/${Date.now()}-${this.fileSelected.name}`;
          const { error: uploadError } = await supabase.storage
            .from('project-files')
            .upload(key, this.fileSelected, { cacheControl: '3600' });
          if (uploadError) throw uploadError;

          // Record in contracts table
          const { error: dbError } = await supabase
            .from('contracts')
            .insert({
              project_id: this.form.project_id,
              title: this.form.title,
              r2_key: key
            });
          if (dbError) throw dbError;

          this.modalOpen = false;
          this.load();
        } catch (e) { alert('Error: ' + e.message); }
      },

      async download(c) {
        const { data, error } = await supabase.storage
          .from('project-files')
          .createSignedUrl(c.r2_key, 60 * 60);
        if (error || !data?.signedUrl) {
          alert('Could not create a secure contract link');
          return;
        }
        window.open(data.signedUrl, '_blank');
      }
    },

    // === PAYMENTS ===
    payments: {
      list: [],
      projectList: [],
      loading: false,
      modalOpen: false,
      stats: { totalReceived: 0, outstanding: 0 },
      form: { project_id: '', amount_dollars: '', method: 'venmo', notes: '' },

      async load() {
        this.loading = true;
        try {
          const { data } = await supabase
            .from('payments')
            .select('*, project:project_id ( title, customer:customer_id ( first_name, last_name ) )')
            .order('paid_at', { ascending: false });

          this.list = (data || []).map(p => ({
            ...p,
            project_title: p.project?.title || '—',
            customer_name: p.project?.customer?.first_name + ' ' + p.project?.customer?.last_name || '—'
          }));

          this.stats.totalReceived = this.list.reduce((s, p) => s + (p.amount_cents || 0), 0);

          // Outstanding: sum of price minus deposits minus payments for active projects
          const { data: active } = await supabase
            .from('projects')
            .select('price_cents, deposit_cents, deposit_paid')
            .in('status', ['booked', 'shoot_complete', 'editing']);

          this.stats.outstanding = (active || []).reduce((s, p) => {
            let owed = p.price_cents || 0;
            if (p.deposit_paid) owed -= (p.deposit_cents || 0);
            return s + Math.max(0, owed);
          }, 0);

        } catch (e) { console.error(e); }
        finally { this.loading = false; }
      },

      openNew() {
        this.form = { project_id: '', amount_dollars: '', method: 'venmo', notes: '' };
        supabase.from('project_details').select('id, title, customer_name').then(({ data }) => {
          this.projectList = data || [];
        });
        this.modalOpen = true;
      },

      async save() {
        try {
          await supabase.from('payments').insert({
            project_id: this.form.project_id,
            amount_cents: dollarsToCents(this.form.amount_dollars),
            method: this.form.method,
            notes: this.form.notes,
            paid_at: new Date().toISOString()
          });
          this.modalOpen = false;
          this.load();
        } catch (e) { alert('Error: ' + e.message); }
      }
    }
  };
  return root;
};
