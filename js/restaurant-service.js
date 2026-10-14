/* Shared submissions use Supabase exclusively; no client-only persistence fallback. */
(function () {
  "use strict";
  var areas = ["Long Bình", "Long Thạnh Mỹ", "Phước Long B", "Phước Bình", "Khu vực khác"];
  var inserting = false;
  function text(value, compact) {
    if (typeof value !== "string") return "";
    value = value.normalize("NFC").trim();
    return compact ? value.replace(/\s+/g, " ") : value;
  }
  function normalize(input) {
    input = input || {};
    return { restaurant_name: text(input.name, true), area: text(input.area, true),
      story: text(input.story, false), nickname: text(input.nickname, true) || null };
  }
  function validate(input) {
    var row = normalize(input);
    if (!row.restaurant_name || Array.from(row.restaurant_name).length > 120)
      return "Nhập tên quán từ 1 đến 120 ký tự nha.";
    if (!areas.includes(row.area)) return "Chọn khu vực hợp lệ nha.";
    if (!row.story || Array.from(row.story).length > 2000)
      return "Kể câu chuyện từ 1 đến 2000 ký tự nha.";
    if (row.nickname && Array.from(row.nickname).length > 80)
      return "Biệt danh tối đa 80 ký tự nha.";
    if (!input || input.consent !== true)
      return "Bạn cần đồng ý cho Tấm chia sẻ quán và câu chuyện ẩn danh trước khi gửi nhé.";
    return "";
  }
  function failure(error, write) {
    if (error && error.code === "23514") return new Error("Thông tin chưa hợp lệ. Bạn kiểm tra tên quán, câu chuyện và khu vực rồi gửi lại nhé.");
    if (write) return new Error("Chưa xác nhận được bài gửi. Có thể kết nối bị gián đoạn; bạn giữ nội dung và thử lại sau nhé. Nếu đã gửi trước đó, tránh gửi lại nhiều lần.");
    return new Error("Chưa tải được quán do bạn đọc gửi. Các quán có sẵn vẫn ở đây; bạn thử tải lại sau nhé.");
  }
  async function submitRestaurant(input) {
    var error = validate(input);
    if (error) throw new Error(error);
    if (inserting) throw new Error("Tấm đang nhận bài gửi, bạn chờ một chút nhé.");
    var db = window.TamOiDatabase.getClient();
    inserting = true;
    try {
      // Minimal response: new pending rows cannot be SELECT-ed by visitors.
      // normalize constructs exactly the four permitted columns.
      var result = await db.from("restaurant_submissions").insert(normalize(input));
      if (!result || result.error || !Number.isInteger(result.status) || result.status < 200 || result.status >= 300)
        throw failure(result && result.error, true);
      return { accepted: true };
    } catch (error) {
      throw error && error.message && error.message.startsWith("Thông tin") ? error : failure(error, true);
    } finally { inserting = false; }
  }
  async function getApprovedRestaurants(area) {
    if (area && area !== "all" && !areas.includes(area)) throw new Error("Chọn khu vực hợp lệ nha.");
    var db = window.TamOiDatabase.getClient(), records = [], offset = 0, batch = 250;
    try {
      while (true) {
        var query = db.from("restaurant_submissions")
          .select("id,restaurant_name,area,story,status,created_at")
          .eq("status", "approved").order("created_at", { ascending: false }).order("id", { ascending: false });
        if (area && area !== "all") query = query.eq("area", area);
        var result = await query.range(offset, offset + batch - 1);
        if (result.error || !Array.isArray(result.data)) throw failure(result.error, false);
        result.data.forEach(function (row) {
          // Defense in depth. RLS remains the security boundary.
          if (row.status !== "approved" || !areas.includes(row.area) || typeof row.restaurant_name !== "string" ||
              typeof row.story !== "string" || !row.restaurant_name.trim() || !row.story.trim() ||
              Array.from(row.restaurant_name).length > 120 || Array.from(row.story).length > 2000) return;
          records.push({ name: row.restaurant_name, area: row.area,
            addr: row.area + " · Địa chỉ chưa xác minh", note: "“" + row.story + "”", kind: "community" });
        });
        if (result.data.length < batch) break;
        offset += batch;
      }
      return records;
    } catch (error) { throw failure(error, false); }
  }
  function mergeRestaurants(seed, approved) {
    var seen = new Set();
    return seed.concat(approved).filter(function (row) {
      var key = text(row.name, true).toLocaleLowerCase("vi") + "|" + row.area;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  window.TamOiSubmissions = Object.freeze({
    validate: validate, submitRestaurant: submitRestaurant,
    getApprovedRestaurants: getApprovedRestaurants,
    getRestaurantsByArea: function (area) { return getApprovedRestaurants(area); },
    mergeRestaurants: mergeRestaurants
  });
})();
