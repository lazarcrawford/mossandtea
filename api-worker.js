// ============================================
// Moss & Tea — Static site + API Worker (Cloudflare)
// Serves the main site, admin panel, and API
// ============================================

const SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/project-files`;

// Static assets served from the Workers KV/assets namespace
// The admin panel is a single-page app at /admin/
const ASSET_MANIFEST = {
  '/': 'index.html',
  '/admin/': 'admin/index.html',
  '/admin': 'admin/index.html',
  '/css/style.css': 'css/style.css',
  '/css/motion.css': 'css/motion.css',
  '/css/admin.css': 'admin/css/admin.css',
  '/js/main.js': 'js/main.js',
  '/js/admin.js': 'admin/js/admin.js',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- API Routes ---

    // Health check
    if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', project: 'Moss & Tea' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Proxy file serving from Supabase Storage
    if (path.startsWith('/api/files/') && method === 'GET') {
      const key = path.replace('/api/files/', '');
      const response = await fetch(`${STORAGE_URL}/${key}`);
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000',
          ...corsHeaders
        }
      });
    }

    // Proxy contract PDF
    if (path.startsWith('/api/contracts/') && method === 'GET') {
      const key = path.replace('/api/contracts/', '');
      const response = await fetch(`${STORAGE_URL}/${key}`);
      return new Response(response.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
          ...corsHeaders
        }
      });
    }

    // --- Static Assets ---
    // Serve from Cloudflare's static asset system
    // If assets.get() isn't available (KV-based), fall through to Cloudflare Pages
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Fallback: proxy to the Cloudflare Pages deployment
    const pagesHost = 'mossandtea.pages.dev';
    const pagesUrl = `https://${pagesHost}${path}`;

    try {
      const response = await fetch(pagesUrl, {
        headers: { 'Host': pagesHost, ...request.headers }
      });
      if (response.ok) {
        return response;
      }
    } catch (e) {
      // Fallback continues
    }

    // Final fallback
    return new Response('Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain', ...corsHeaders }
    });
  }
};
