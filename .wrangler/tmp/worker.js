// worker.js
var SUPABASE_URL = "https://ixfmstlnwnfjkocpordu.supabase.co";
var STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/project-files`;
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path === "/api/health") {
        return new Response(JSON.stringify({ status: "ok", project: "Moss & Tea" }), {
          headers: { "Content-Type": "application/json" }
        });
      }
      if (path.startsWith("/api/files/")) {
        const key = path.replace("/api/files/", "");
        const resp = await fetch(`${STORAGE_URL}/${key}`);
        return new Response(resp.body, {
          headers: {
            "Content-Type": resp.headers.get("Content-Type") || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000"
          }
        });
      }
      if (path.startsWith("/api/contracts/")) {
        const key = path.replace("/api/contracts/", "");
        const resp = await fetch(`${STORAGE_URL}/${key}`);
        return new Response(resp.body, {
          headers: {
            "Content-Type": resp.headers.get("Content-Type") || "application/pdf",
            "Content-Disposition": `inline; filename="${key.split("/").pop()}"`
          }
        });
      }
      if (path.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Not found", path }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (e) {
      return new Response(`API error: ${e.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
