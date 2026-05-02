// ============================================
// Moss & Tea — Worker Entry Point
// Handles /api/* routes, falls through to static assets
// ============================================

const DEFAULT_SUPABASE_URL = 'https://ixfmstlnwnfjkocpordu.supabase.co';

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function cleanText(value, max = 2000) {
  return String(value || '').trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readJson(request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Expected application/json');
  }
  return request.json();
}

async function persistInquiry(request, env) {
  const payload = await readJson(request);
  const inquiry = {
    name: cleanText(payload.name, 160),
    email: cleanText(payload.email, 240).toLowerCase(),
    subject: cleanText(payload.subject || 'Photography Inquiry', 240),
    message: cleanText(payload.message, 5000),
    source: 'website',
    user_agent: cleanText(request.headers.get('User-Agent'), 500),
    ip_hint: cleanText(request.headers.get('CF-Connecting-IP'), 80),
  };

  if (!inquiry.name) throw new Error('Name is required');
  if (!isEmail(inquiry.email)) throw new Error('A valid email is required');
  if (!inquiry.message) throw new Error('Message is required');

  if (env.MT_INQUIRIES_KV) {
    const key = `inquiry:${new Date().toISOString()}:${crypto.randomUUID()}`;
    await env.MT_INQUIRIES_KV.put(key, JSON.stringify(inquiry));
    return { ok: true, stored: 'kv' };
  }

  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseKey) {
    const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const resp = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(inquiry),
    });
    if (!resp.ok) {
      throw new Error(`Inquiry storage failed (${resp.status})`);
    }
    return { ok: true, stored: 'supabase' };
  }

  return {
    ok: false,
    needsConfiguration: true,
    message: 'Inquiry storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY or bind MT_INQUIRIES_KV.',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const supabaseUrl = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;

    try {
      if (request.method === 'OPTIONS' && path.startsWith('/api/')) {
        return new Response(null, {
          status: 204,
          headers: {
            Allow: 'GET, POST, OPTIONS',
          },
        });
      }

      // ── Health check ──
      if (path === '/api/health') {
        return json({ status: 'ok', project: 'Moss & Tea' });
      }

      // ── Compatibility redirect for old portal references ──
      if (path === '/portal' || path === '/portal/') {
        return Response.redirect(`${url.origin}/hermitage/${url.hash || ''}`, 302);
      }

      // ── Public inquiry capture ──
      if (path === '/api/inquiries' && request.method === 'POST') {
        const result = await persistInquiry(request, env);
        return json(result, { status: result.ok ? 202 : 503 });
      }

      // ── Serve files from Supabase Storage ──
      if (path.startsWith('/api/files/')) {
        return json({ error: 'File proxy is disabled. Use authenticated signed URLs.' }, { status: 403 });
      }

      // ── Serve contract PDFs from Supabase Storage ──
      if (path.startsWith('/api/contracts/')) {
        return json({ error: 'Contract proxy is disabled. Use authenticated signed URLs.' }, { status: 403 });
      }

      // ── Unknown API route ──
      if (path.startsWith('/api/')) {
        return json({ error: 'Not found', path }, { status: 404 });
      }
    } catch (e) {
      return json({ error: e.message || 'API error' }, { status: 400 });
    }

    // ── Fall through to static assets ──
    return env.ASSETS.fetch(request);
  }
};
