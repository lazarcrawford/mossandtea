// ============================================
// Moss & Tea — Pages Functions API
// Handles /api/* routes for Cloudflare Pages
// Static files are served directly by Pages
// ============================================

const SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/project-files`;

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Health check
    if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', project: 'Moss & Tea' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Serve files from Supabase Storage
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

    // Serve contract PDFs from Supabase Storage
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

    // Unknown API route
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(`API error: ${e.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
