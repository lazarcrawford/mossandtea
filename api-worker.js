// ============================================
// Moss & Tea — API Worker (Cloudflare)
// File uploads, contract downloads, auth helpers
// ============================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- File upload ---
    if (path === '/api/upload' && method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        const projectId = formData.get('projectId');

        if (!file || !projectId) {
          return new Response(JSON.stringify({ error: 'File and projectId required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Generate unique key: projects/{projectId}/{uuid}-{filename}
        const ext = file.name.split('.').pop();
        const key = `projects/${projectId}/${crypto.randomUUID()}-${file.name}`;

        // Upload to R2
        await env.FILES_BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type }
        });

        // Record in Supabase
        const supabaseRes = await fetch(`${env.SUPABASE_URL}/rest/v1/project_files`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({
            project_id: projectId,
            filename: key,
            original_name: file.name,
            mime_type: file.type,
            file_size: file.size,
            r2_key: key,
            uploaded_by: 'admin'
          })
        });

        if (!supabaseRes.ok) {
          // Clean up R2 if DB insert failed
          await env.FILES_BUCKET.delete(key);
          return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, key }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // --- Get file (serves from R2 with signed URL or direct) ---
    if (path.startsWith('/api/files/') && method === 'GET') {
      const key = path.replace('/api/files/', '');
      const object = await env.FILES_BUCKET.get(key);
      if (!object) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
      }
      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000',
        }
      });
    }

    // --- Delete file ---
    if (path.startsWith('/api/files/') && method === 'DELETE') {
      const key = path.replace('/api/files/', '');
      await env.FILES_BUCKET.delete(key);

      // Remove from Supabase
      await fetch(`${env.SUPABASE_URL}/rest/v1/project_files?r2_key=eq.${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
        }
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- Contract upload ---
    if (path === '/api/contracts/upload' && method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        const projectId = formData.get('projectId');
        const title = formData.get('title');

        const key = `contracts/${projectId}/${crypto.randomUUID()}.pdf`;
        await env.FILES_BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: 'application/pdf' }
        });

        await fetch(`${env.SUPABASE_URL}/rest/v1/contracts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({
            project_id: projectId,
            title: title,
            r2_key: key
          })
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // --- Contract download ---
    if (path.startsWith('/api/contracts/') && method === 'GET') {
      const key = path.replace('/api/contracts/', '');
      const object = await env.FILES_BUCKET.get(key);
      if (!object) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
      }
      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${key.split('/').pop()}"`,
        }
      });
    }

    // --- Health check ---
    if (path === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', project: 'Moss & Tea' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default: serve static assets
    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
