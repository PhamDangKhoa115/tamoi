/*
 * TẤM ƠI! – runtime nhỏ để chạy các trang của website (không cần thư viện ngoài).
 * Mỗi trang có:
 *   - <template id="tpl"> chứa giao diện, dùng {{bien}}, <sc-for list as>, <sc-if value>
 *   - class Component extends DCLogic { renderVals() {...} } trả dữ liệu + hàm xử lý sự kiện
 * Runtime dựng DOM từ template, gắn sự kiện, và cập nhật lại (patch) khi gọi setState.
 */
(function () {
  "use strict";

  var HOLE = /\{\{\s*([\w$.]+)\s*\}\}/g;
  var SINGLE = /^\{\{\s*([\w$.]+)\s*\}\}$/;

  function lookup(path, scope) {
    var parts = path.split(".");
    var v = scope[parts[0]];
    for (var i = 1; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }

  function single(str) {
    var m = str && str.match(SINGLE);
    return m ? m[1] : null;
  }

  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? "" : String(v);
    });
  }

  function eventName(attr, tag) {
    var t = attr.slice(2); // onclick -> click
    // Giống React: onChange của input/textarea chạy mỗi lần gõ phím
    if (t === "change" && (tag === "input" || tag === "textarea"))
      return "input";
    return t;
  }

  function attachDispatcher(el, type) {
    el.__bound = el.__bound || {};
    if (el.__bound[type]) return;
    el.__bound[type] = true;
    el.addEventListener(type, function (e) {
      var f = el.__h && el.__h[type];
      if (typeof f === "function") f(e);
    });
  }

  function build(node, scope, out) {
    if (node.nodeType === 3) {
      out.appendChild(document.createTextNode(interp(node.nodeValue, scope)));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;

    if (tag === "sc-for") {
      var list = lookup(single(node.getAttribute("list")), scope) || [];
      var as = node.getAttribute("as");
      for (var i = 0; i < list.length; i++) {
        var s = Object.create(scope);
        s[as] = list[i];
        for (var c = 0; c < node.childNodes.length; c++)
          build(node.childNodes[c], s, out);
      }
      return;
    }
    if (tag === "sc-if") {
      if (lookup(single(node.getAttribute("value")), scope)) {
        for (var k = 0; k < node.childNodes.length; k++)
          build(node.childNodes[k], scope, out);
      }
      return;
    }

    var el = document.createElementNS(node.namespaceURI, node.localName);
    var hasValue = false,
      valueToSet;
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a];
      var name = at.name,
        raw = at.value;
      if (name.indexOf("hint-") === 0) continue;
      var key = single(raw);
      if (name.length > 2 && name.slice(0, 2) === "on") {
        var fn = key ? lookup(key, scope) : null;
        var type = eventName(name, tag);
        el.__h = el.__h || {};
        el.__h[type] = fn;
        attachDispatcher(el, type);
        continue;
      }
      var val = key ? lookup(key, scope) : interp(raw, scope);
      if (
        name === "value" &&
        (tag === "input" || tag === "textarea" || tag === "select")
      ) {
        hasValue = true;
        valueToSet = val == null ? "" : String(val);
        continue;
      }
      if (val === false || val == null) continue;
      el.setAttribute(name, val === true ? "" : String(val));
    }
    var kids =
      node.localName === "template" ? node.content.childNodes : node.childNodes;
    for (var j = 0; j < kids.length; j++) build(kids[j], scope, el);
    if (hasValue) {
      el.__value = valueToSet;
      el.value = valueToSet;
    }
    out.appendChild(el);
  }

  // ---- patch DOM cũ theo DOM mới (giữ focus, không chạy lại animation) ----
  function sameKind(a, b) {
    return a.nodeType === b.nodeType && a.nodeName === b.nodeName;
  }

  function morph(a, b) {
    if (a.nodeType === 3) {
      if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
      return;
    }
    var i;
    var oldAttrs = Array.prototype.slice.call(a.attributes);
    for (i = 0; i < oldAttrs.length; i++) {
      if (!b.hasAttribute(oldAttrs[i].name))
        a.removeAttribute(oldAttrs[i].name);
    }
    for (i = 0; i < b.attributes.length; i++) {
      var at = b.attributes[i];
      if (a.getAttribute(at.name) !== at.value)
        a.setAttribute(at.name, at.value);
    }
    a.__h = b.__h;
    if (b.__h) for (var t in b.__h) attachDispatcher(a, t);
    morphChildren(a, b);
    if ("__value" in b) {
      a.__value = b.__value;
      if (a.value !== b.__value) a.value = b.__value;
    }
  }

  function morphChildren(a, b) {
    var an = Array.prototype.slice.call(a.childNodes);
    var bn = Array.prototype.slice.call(b.childNodes);
    for (var i = 0; i < bn.length; i++) {
      var x = an[i],
        y = bn[i];
      if (!x) {
        a.appendChild(y);
        continue;
      }
      if (!sameKind(x, y)) {
        a.replaceChild(y, x);
        continue;
      }
      morph(x, y);
    }
    for (var j = bn.length; j < an.length; j++) a.removeChild(an[j]);
  }

  // ---- lớp nền cho component ----
  function DCLogic(props) {
    this.props = props || {};
    this.state = {};
  }
  DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === "function" ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, next);
    if (this.__schedule) this.__schedule();
  };
  window.DCLogic = DCLogic;

  window.TamOi = {
    mount: function (Component, rootId, tplId) {
      var root = document.getElementById(rootId || "app");
      var tpl = document.getElementById(tplId || "tpl").content;
      var inst = new Component({});
      var pending = false;

      function render() {
        pending = false;
        var vals = inst.renderVals();
        var tmp = document.createElement("div");
        for (var i = 0; i < tpl.childNodes.length; i++)
          build(tpl.childNodes[i], vals, tmp);
        morphChildren(root, tmp);
      }
      inst.__schedule = function () {
        if (pending) return;
        pending = true;
        Promise.resolve().then(render);
      };
      render();

      // Cuộn tới #neo (VD: index.html#quan) sau khi trang dựng xong
      if (location.hash) {
        var target = document.getElementById(
          decodeURIComponent(location.hash.slice(1)),
        );
        if (target)
          setTimeout(function () {
            target.scrollIntoView();
          }, 60);
      }
      return inst;
    },
  };
})();
