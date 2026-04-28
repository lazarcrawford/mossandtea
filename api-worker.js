// ============================================
// Moss & Tea — Worker
// API only — assets served directly by Cloudflare
// ============================================

const SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/project-files`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API routes only
    if (path.startsWith('/api/')) {
      if (path === '/api/health') {
        return Response.json({ status: 'ok', project: 'Moss & Tea' });
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
    }

    // Everything else: let ASSETS serve it
    return env.ASSETS.fetch(request);
  }
};
