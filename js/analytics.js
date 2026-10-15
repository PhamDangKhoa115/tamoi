/* GA4 basic consent mode: no Google request or pre-consent event backlog.
 * Only predefined identifiers may cross this boundary. See ANALYTICS.md. */
(function () {
  'use strict';
  if (window.TamOiAnalytics) return;
  var ID = 'G-B51G96ZP8R', KEY = 'tamoi.analytics.consent.v1';
  var pages = {
    'index.html': ['home', 'TẤM ƠI! – Trang chủ'],
    've-du-an.html': ['about', 'TẤM ƠI! – Về dự án'],
    'thong-tin.html': ['articles', 'TẤM ƠI! – Thông tin'],
    'giai-phau-dia-com.html': ['anatomy', 'TẤM ƠI! – Giải phẫu dĩa cơm'],
    'rap-dia.html': ['rice_game', 'TẤM ƠI! – Ráp dĩa cơm'],
    'that-hay-giai-thoai.html': ['myth_game', 'TẤM ƠI! – Thật, Sai hay Giai thoại?']
  };
  var file = location.pathname.split('/').pop() || 'index.html', page = pages[file];
  var areas = ['all', 'Long Bình', 'Long Thạnh Mỹ', 'Phước Long B', 'Phước Bình', 'Khu vực khác'];
  var schemas = {
    restaurant_submit_success: { restaurant_area: areas.slice(1), page_name: ['home'] },
    restaurant_filter: { area: areas }, restaurant_directions_click: {},
    article_open: { article_id: ['article_1','article_2','article_3','article_4','article_5','article_6','article_7','article_8'] },
    interview_tab_change: { tab_id: ['person_1','person_2','person_3'] },
    rice_game_start: {}, rice_game_complete: {}, rice_game_restart: {},
    myth_game_start: {}, myth_game_complete: {}, myth_game_restart: {},
    ingredient_select: { ingredient_id: ['com','suon','bi','cha','trung','mam','dochua'] }
  };
  var choice = null, configured = false, viewed = false, banner, settings;
  var disabled = 'ga-disable-' + ID;
  window[disabled] = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  function command() { try { window.gtag.apply(window, arguments); } catch (error) {} }
  function consent(value) { return { analytics_storage: value, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }; }
  command('consent', 'default', consent('denied'));
  command('set', 'ads_data_redaction', true);
  function readChoice() {
    try {
      var record = JSON.parse(localStorage.getItem(KEY));
      if (record && record.version === 1 && ['granted','denied'].includes(record.choice) &&
          Number.isFinite(record.at) && record.at <= Date.now() && Date.now() - record.at < 180 * 86400000) return record.choice;
    } catch (error) {}
    return null;
  }
  function context() {
    // Never send query strings, fragments, referrer URLs, dynamic titles or form data.
    return { page_location: 'https://tamoi.vercel.app/' + file, page_referrer: '', page_title: page[1] };
  }
  function activate() {
    if (choice !== 'granted' || !page) return;
    window[disabled] = false;
    command('consent', 'update', consent('granted'));
    if (!configured) {
      configured = true;
      command('js', new Date());
      command('config', ID, Object.assign(context(), {
        send_page_view: false, allow_google_signals: false,
        allow_ad_personalization_signals: false, cookie_domain: 'none', cookie_path: '/', cookie_expires: 15552000, cookie_update: false
      }));
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
      script.id = 'tamoi-google-tag';
      document.head.appendChild(script);
    }
    if (!viewed) {
      viewed = true;
      command('event', 'page_view', Object.assign({ send_to: ID }, context()));
    }
  }
  function clearCookies() {
    try {
      document.cookie.split(';').forEach(function (cookie) {
        var name = cookie.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) return;
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; Path=/; Domain=' + location.hostname + '; SameSite=Lax';
      });
    } catch (error) {}
  }
  function apply(value) {
    choice = value;
    if (value === 'granted') activate();
    else {
      window[disabled] = true;
      // Purge unprocessed event commands if a visitor withdraws before tag load.
      for (var i = window.dataLayer.length - 1; i >= 0; i--) {
        if (window.dataLayer[i] && window.dataLayer[i][0] === 'event') window.dataLayer.splice(i, 1);
      }
      command('consent', 'update', consent('denied'));
      clearCookies();
    }
    if (banner) banner.hidden = value !== null;
  }
  function setConsent(value) {
    try {
      if (!['granted','denied'].includes(value)) return;
      try { localStorage.setItem(KEY, JSON.stringify({ version: 1, choice: value, at: Date.now() })); } catch (error) {}
      apply(value);
      if (settings && banner && banner.contains(document.activeElement)) settings.focus();
    } catch (error) {}
  }
  function trackEvent(name, parameters) {
    try {
      if (choice !== 'granted' || !page || window[disabled]) return;
      if (!Object.prototype.hasOwnProperty.call(schemas, name)) return;
      var schema = schemas[name], input = parameters || {}, safe = {};
      if (Object.keys(input).some(function (key) { return !Object.prototype.hasOwnProperty.call(schema, key); })) return;
      if (Object.keys(schema).some(function (key) { return !schema[key].includes(input[key]); })) return;
      Object.keys(schema).forEach(function (key) { safe[key] = input[key]; });
      command('event', name, Object.assign({ send_to: ID }, context(), safe));
    } catch (error) {}
  }
  function element(tag, text, parent) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  function showPreferences() {
    if (banner) { banner.hidden = false; banner.querySelector('button').focus(); }
  }
  function ui() {
    banner = element('section', '', document.body);
    banner.id = 'tamoi-analytics-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Lựa chọn phân tích truy cập');
    banner.style.cssText = 'position:fixed;right:12px;bottom:54px;z-index:1100;box-sizing:border-box;width:calc(100% - 24px);max-width:420px;max-height:70vh;overflow:auto;padding:18px;background:#FFF4E2;color:#2A1A12;border:2px solid #2A1A12;border-radius:16px;box-shadow:4px 4px 0 #2A1A12;font:14px/1.5 Montserrat,sans-serif';
    element('strong', 'Quyền riêng tư của bạn', banner);
    element('p', 'Tấm Ơi! chỉ dùng Google Analytics khi bạn đồng ý để đo lượt xem và các tương tác như đọc bài, trò chơi. Không gửi nội dung biểu mẫu, tên quán, câu chuyện hay biệt danh. Bạn có thể từ chối hoặc đổi lựa chọn bất cứ lúc nào.', banner);
    var details = element('details', '', banner);
    element('summary', 'Chi tiết quyền riêng tư', details);
    element('p', 'Khi được cho phép, Google Analytics dùng cookie _ga để thống kê và nhận dữ liệu kỹ thuật trình duyệt; Google xử lý địa chỉ IP khi trình duyệt kết nối. Lựa chọn của bạn được lưu tối đa 180 ngày trên thiết bị. Không dùng cá nhân hóa quảng cáo. Bạn có thể rút lại đồng ý bằng nút Quyền riêng tư; khi đó Tấm dừng theo dõi và xóa cookie Analytics của website. Việc gửi quán tới Supabase dùng sự đồng ý riêng trong biểu mẫu và vẫn hoạt động khi bạn từ chối Analytics.', details);
    var buttons = element('div', '', banner);
    buttons.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;margin-top:12px';
    [['Từ chối','denied'],['Đồng ý phân tích','granted']].forEach(function (entry) {
      var button = element('button', entry[0], buttons);
      button.type = 'button';
      button.style.cssText = 'font:inherit;font-weight:700;border:2px solid #2A1A12;border-radius:999px;padding:10px 14px;background:#FFF4E2;color:#2A1A12;cursor:pointer';
      button.addEventListener('click', function () { setConsent(entry[1]); });
    });
    settings = element('button', 'Quyền riêng tư', document.body);
    settings.id = 'tamoi-analytics-settings';
    settings.type = 'button';
    settings.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:1100;border:2px solid #2A1A12;border-radius:999px;padding:8px 12px;background:#FFF4E2;color:#2A1A12;font:600 12px Montserrat,sans-serif;cursor:pointer';
    settings.addEventListener('click', showPreferences);
    banner.hidden = choice !== null;
  }
  window.TamOiAnalytics = Object.freeze({ trackEvent: trackEvent, setConsent: setConsent, showPreferences: showPreferences, getConsent: function () { return choice; } });
  window.addEventListener('storage', function (event) { if (event.key === KEY || event.key === null) apply(readChoice()); });
  choice = readChoice();
  if (choice === 'granted') activate();
  else if (choice === 'denied') clearCookies();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui, { once: true });
  else ui();
})();
