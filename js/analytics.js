/* GA4 basic consent mode: no Google request or pre-consent event backlog.
 * Only predefined identifiers may cross this boundary. See ANALYTICS.md. */
(function () {
  "use strict";
  if (window.TamOiAnalytics) return;
  var ID = "G-B51G96ZP8R",
    KEY = "tamoi.analytics.consent.v1";
  var pages = {
    "index.html": ["home", "TẤM ƠI! – Trang chủ"],
    "ve-du-an.html": ["about", "TẤM ƠI! – Về dự án"],
    "thong-tin.html": ["articles", "TẤM ƠI! – Thông tin"],
    "giai-phau-dia-com.html": ["anatomy", "TẤM ƠI! – Giải phẫu dĩa cơm"],
    "rap-dia.html": ["rice_game", "TẤM ƠI! – Ráp dĩa cơm"],
    "that-hay-giai-thoai.html": [
      "myth_game",
      "TẤM ƠI! – Thật, Sai hay Giai thoại?",
    ],
  };
  var file = location.pathname.split("/").pop() || "index.html",
    page = pages[file];
  var areas = [
    "all",
    "Long Bình",
    "Long Thạnh Mỹ",
    "Phước Long B",
    "Phước Bình",
    "Khu vực khác",
  ];
  var schemas = {
    restaurant_submit_success: {
      restaurant_area: areas.slice(1),
      page_name: ["home"],
    },
    restaurant_filter: { area: areas },
    restaurant_directions_click: {},
    article_open: {
      article_id: [
        "article_1",
        "article_2",
        "article_3",
        "article_4",
        "article_5",
        "article_6",
        "article_7",
        "article_8",
      ],
    },
    interview_tab_change: { tab_id: ["person_1", "person_2", "person_3"] },
    rice_game_start: {},
    rice_game_complete: {},
    rice_game_restart: {},
    myth_game_start: {},
    myth_game_complete: {},
    myth_game_restart: {},
    ingredient_select: {
      ingredient_id: ["com", "suon", "bi", "cha", "trung", "mam", "dochua"],
    },
  };
  var choice = null,
    configured = false,
    viewed = false;
  var disabled = "ga-disable-" + ID;
  window[disabled] = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
  function command() {
    try {
      window.gtag.apply(window, arguments);
    } catch (error) {}
  }
  function consent(value) {
    return {
      analytics_storage: value,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    };
  }
  command("consent", "default", consent("denied"));
  command("set", "ads_data_redaction", true);
  function readChoice() {
    try {
      var record = JSON.parse(localStorage.getItem(KEY));
      if (
        record &&
        record.version === 1 &&
        ["granted", "denied"].includes(record.choice) &&
        Number.isFinite(record.at) &&
        record.at <= Date.now() &&
        Date.now() - record.at < 180 * 86400000
      )
        return record.choice;
    } catch (error) {}
    return null;
  }
  function context() {
    // Never send query strings, fragments, referrer URLs, dynamic titles or form data.
    return {
      page_location: "https://tamoi.vercel.app/" + file,
      page_referrer: "",
      page_title: page[1],
    };
  }
  function activate() {
    if (choice !== "granted" || !page) return;
    window[disabled] = false;
    command("consent", "update", consent("granted"));
    if (!configured) {
      configured = true;
      command("js", new Date());
      command(
        "config",
        ID,
        Object.assign(context(), {
          send_page_view: false,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          cookie_domain: "none",
          cookie_path: "/",
          cookie_expires: 15552000,
          cookie_update: false,
        }),
      );
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
      script.id = "tamoi-google-tag";
      document.head.appendChild(script);
    }
    if (!viewed) {
      viewed = true;
      command("event", "page_view", Object.assign({ send_to: ID }, context()));
    }
  }
  function clearCookies() {
    try {
      document.cookie.split(";").forEach(function (cookie) {
        var name = cookie.split("=")[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) return;
        document.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax";
        document.cookie =
          name +
          "=; Max-Age=0; Path=/; Domain=" +
          location.hostname +
          "; SameSite=Lax";
      });
    } catch (error) {}
  }
  function apply(value) {
    choice = value;
    if (value === "granted") activate();
    else {
      window[disabled] = true;
      // Purge unprocessed event commands if a visitor withdraws before tag load.
      for (var i = window.dataLayer.length - 1; i >= 0; i--) {
        if (window.dataLayer[i] && window.dataLayer[i][0] === "event")
          window.dataLayer.splice(i, 1);
      }
      command("consent", "update", consent("denied"));
      clearCookies();
    }
  }
  function setConsent(value) {
    try {
      if (!["granted", "denied"].includes(value)) return;
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ version: 1, choice: value, at: Date.now() }),
        );
      } catch (error) {}
      apply(value);
    } catch (error) {}
  }
  function trackEvent(name, parameters) {
    try {
      if (choice !== "granted" || !page || window[disabled]) return;
      if (!Object.prototype.hasOwnProperty.call(schemas, name)) return;
      var schema = schemas[name],
        input = parameters || {},
        safe = {};
      if (
        Object.keys(input).some(function (key) {
          return !Object.prototype.hasOwnProperty.call(schema, key);
        })
      )
        return;
      if (
        Object.keys(schema).some(function (key) {
          return !schema[key].includes(input[key]);
        })
      )
        return;
      Object.keys(schema).forEach(function (key) {
        safe[key] = input[key];
      });
      command("event", name, Object.assign({ send_to: ID }, context(), safe));
    } catch (error) {}
  }
  window.TamOiAnalytics = Object.freeze({
    trackEvent: trackEvent,
    setConsent: setConsent,
    getConsent: function () {
      return choice;
    },
  });
  window.addEventListener("storage", function (event) {
    if (event.key === KEY || event.key === null) apply(readChoice());
  });
  choice = readChoice();
  if (choice === "granted") activate();
  else if (choice === "denied") clearCookies();
})();
