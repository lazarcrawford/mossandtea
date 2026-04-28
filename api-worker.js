// ============================================
// Moss & Tea — API Worker
// Only handles /api/* routes — static files
// are served directly by Cloudflare Assets
// ============================================

const SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/project-files`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Only handle /api/* paths
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', project: 'Moss & Tea' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/files/')) {
        const key = path.replace('/api/files/', '');
        const resp = await fetch(`${STORAGE_URL}/${key}`);
        return new Response(resp.body, {
          headers: {
            'Content-Type': resp.headers.get('Content-Type') || 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000',
          }
        });
      }

      if (path.startsWith('/api/contracts/')) {
        const key = path.replace('/api/contracts/', '');
        const resp = await fetch(`${STORAGE_URL}/${key}`);
        return new Response(resp.body, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
          }
        });
      }

      // For /api/* paths we don't handle
      if (path.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // All other routes: let Cloudflare's asset system handle them
      // (the wrangler.toml `assets` config serves static files)
      return env.ASSETS.fetch(request);
    } catch (e) {
      return new Response(`Worker error: ${e.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
