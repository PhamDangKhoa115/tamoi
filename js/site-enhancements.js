(function () {
  "use strict";
  document.addEventListener("click", function (e) {
    var menu = e.target.closest('[data-action="menu"]');
    if (menu) {
      var open = document.body.classList.toggle("tam-menu-open");
      menu.setAttribute("aria-expanded", String(open));
      return;
    }
    if (e.target.closest("#tam-nav-links a")) {
      document.body.classList.remove("tam-menu-open");
      var toggle = document.querySelector('[data-action="menu"]');
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
    var media = e.target.closest("[data-media]");
    if (!media) return;
    e.preventDefault();
    var dialog = document.createElement("dialog");
    dialog.className = "tam-media-dialog";
    var title = document.createElement("h2");
    title.textContent =
      media.dataset.media === "film"
        ? "Phim ngắn"
        : media.dataset.media === "trailer"
          ? "Trailer"
          : "Hậu trường";
    dialog.appendChild(title);
    var url = window.TamOiConfig.media[media.dataset.media],
      embed = "";
    try {
      var u = new URL(url);
      if (u.protocol === "https:") {
        var id =
          u.hostname === "youtu.be"
            ? u.pathname.slice(1)
            : ["www.youtube.com", "youtube.com"].includes(u.hostname)
              ? u.searchParams.get("v")
              : null;
        if (id && /^[a-zA-Z0-9_-]{11}$/.test(id))
          embed = "https://www.youtube-nocookie.com/embed/" + id;
      }
    } catch (e) {}
    if (embed) {
      var frame = document.createElement("iframe");
      frame.src = embed;
      frame.title = title.textContent;
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      dialog.appendChild(frame);
    } else {
      var p = document.createElement("p");
      p.textContent = url
        ? "Xem video trên kênh chính thức."
        : "Video đang chờ phát hành. Tấm sẽ cập nhật khi có đường dẫn chính thức.";
      dialog.appendChild(p);
      try {
        var external = new URL(url);
        if (
          external.protocol === "https:" &&
          [
            "www.tiktok.com",
            "tiktok.com",
            "youtu.be",
            "www.youtube.com",
            "youtube.com",
          ].includes(external.hostname)
        ) {
          var link = document.createElement("a");
          link.href = external.href;
          link.textContent = "Mở video";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          dialog.appendChild(link);
        }
      } catch (e) {}
    }
    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "Đóng";
    close.addEventListener("click", function () {
      dialog.close();
    });
    dialog.appendChild(close);
    dialog.addEventListener("close", function () {
      dialog.remove();
      media.focus();
    });
    document.body.appendChild(dialog);
    dialog.showModal();
  });
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("app");
    new MutationObserver(function () {
      var toggle = root.querySelector('[data-action="menu"]');
      if (toggle) {
        var expanded = String(
          document.body.classList.contains("tam-menu-open"),
        );
        if (toggle.getAttribute("aria-expanded") !== expanded)
          toggle.setAttribute("aria-expanded", expanded);
      }
    }).observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-expanded"],
    });
  });
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      var tabs = Array.from(tab.parentElement.querySelectorAll('[role="tab"]')),
        i = tabs.indexOf(tab);
      i =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? tabs.length - 1
            : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      e.preventDefault();
      tabs[i].focus();
      tabs[i].click();
      return;
    }
    if (e.key === "Escape") {
      document.body.classList.remove("tam-menu-open");
      var toggle = document.querySelector('[data-action="menu"]');
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  });
})();
