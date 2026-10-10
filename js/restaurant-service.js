/* Browser-only demo adapter. Future API adapters must return accepted server records. */
(function () {
  "use strict";
  var key = "tamoi.submissions.v1";
  var areas = [
    "Long Bình",
    "Long Thạnh Mỹ",
    "Phước Long B",
    "Phước Bình",
    "Khu vực khác",
  ];
  function validate(input) {
    if (
      typeof input.name !== "string" ||
      !input.name.trim() ||
      input.name.trim().length > 120
    )
      return "Nhập tên quán từ 1 đến 120 ký tự nha.";
    if (!areas.includes(input.area)) return "Chọn khu vực hợp lệ nha.";
    if (
      typeof input.story !== "string" ||
      !input.story.trim() ||
      input.story.trim().length > 2000
    )
      return "Kể câu chuyện từ 1 đến 2000 ký tự nha.";
    return "";
  }
  var adapter = {
    list: function () {
      try {
        var records = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(records)
          ? records
              .filter(function (r) {
                return (
                  r &&
                  typeof r.name === "string" &&
                  r.name.length <= 120 &&
                  areas.includes(r.area) &&
                  typeof r.note === "string" &&
                  r.note.length <= 2002
                );
              })
              .slice(0, 100)
              .map(function (r) {
                return {
                  name: r.name,
                  area: r.area,
                  addr: r.area,
                  note: r.note,
                  kind: "pending",
                };
              })
          : [];
      } catch (e) {
        return [];
      }
    },
    submit: async function (input) {
      var error = validate(input);
      if (error) throw new Error(error);
      var records = adapter.list(),
        name = input.name.trim(),
        story = input.story.trim();
      if (
        records.some(function (r) {
          return (
            r.name.toLocaleLowerCase("vi") === name.toLocaleLowerCase("vi") &&
            r.area === input.area
          );
        })
      )
        throw new Error("Quán này đã có trong bản demo của bạn rồi.");
      if (records.length >= 100)
        throw new Error(
          "Bản demo đã lưu 100 quán. Hãy xoá dữ liệu demo trong trình duyệt trước khi gửi thêm.",
        );
      var item = {
        name: name,
        area: input.area,
        addr: input.area,
        note: "“" + story + "”",
        kind: "pending",
      };
      try {
        localStorage.setItem(key, JSON.stringify([item].concat(records)));
      } catch (e) {
        throw new Error(
          "Trình duyệt không lưu được bản demo. Kiểm tra quyền lưu trữ rồi thử lại; nội dung vẫn được giữ.",
        );
      }
      return item;
    },
  };
  window.TamOiSubmissions = {
    validate: validate,
    list: function () {
      return adapter.list();
    },
    submit: function (input) {
      return adapter.submit(input);
    },
  };
})();
