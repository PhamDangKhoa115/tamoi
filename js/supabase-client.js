/* Reusable singleton using the official SDK. No persistent auth or storage. */
(function () {
  "use strict";
  var client;
  function getClient() {
    if (client) return client;
    var config = window.TamOiSupabaseConfig || {}, url;
    try { url = new URL(config.SUPABASE_URL); } catch (error) {}
    var local = url && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (!url || (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
        url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
        !/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.SUPABASE_PUBLISHABLE_KEY || "")) {
      throw new Error("Tấm chưa kết nối được kho quán chung. Bạn thử lại sau nhé; nội dung bạn nhập vẫn được giữ.");
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Chưa tải được kết nối kho quán. Bạn tải lại trang hoặc thử lại sau nhé.");
    }
    client = window.supabase.createClient(url.origin, config.SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: function (input, options) {
        // Do not retry writes: a lost response can follow a committed insertion.
        var controller = new AbortController(), timer = setTimeout(function () { controller.abort(); }, 15000);
        return fetch(input, Object.assign({}, options, { signal: controller.signal }))
          .finally(function () { clearTimeout(timer); });
      } }
    });
    return client;
  }
  window.TamOiDatabase = Object.freeze({ getClient: getClient });
})();
