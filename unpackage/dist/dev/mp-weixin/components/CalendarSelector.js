"use strict";
const common_vendor = require("../common/vendor.js");
const common_assets = require("../common/assets.js");
const _sfc_main = {
  __name: "CalendarSelector",
  props: {
    modelValue: { type: Array, default: () => [] },
    start: { type: String, default: "2020-01-01" },
    end: { type: String, default: "2035-12-31" },
    multiple: { type: Boolean, default: true }
  },
  emits: ["update:modelValue", "save"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const today = /* @__PURE__ */ new Date();
    const current = common_vendor.ref(new Date(today.getFullYear(), today.getMonth(), 1));
    const year = common_vendor.computed(() => current.value.getFullYear());
    const month = common_vendor.computed(() => current.value.getMonth());
    const weeks = common_vendor.ref(["一", "二", "三", "四", "五", "六", "日"]);
    const internal = common_vendor.ref(new Set(props.modelValue));
    common_vendor.watch(() => props.modelValue, (val) => {
      internal.value = new Set(val || []);
    });
    const days = common_vendor.computed(() => {
      const y = year.value, m = month.value;
      const first = new Date(y, m, 1);
      const startWeek = (first.getDay() + 6) % 7;
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const daysPrevMonth = new Date(y, m, 0).getDate();
      const res = [];
      for (let i = 0; i < 42; i++) {
        let day, inMonth;
        if (i < startWeek) {
          day = daysPrevMonth - startWeek + i + 1;
          inMonth = false;
        } else if (i < startWeek + daysInMonth) {
          day = i - startWeek + 1;
          inMonth = true;
        } else {
          day = i - startWeek - daysInMonth + 1;
          inMonth = false;
        }
        const isToday = inMonth && day === today.getDate() && m === today.getMonth() && y === today.getFullYear();
        res.push({ y, m, day, inMonth, isToday });
      }
      return res;
    });
    function pad(n) {
      return String(n).padStart(2, "0");
    }
    function keyFrom(d) {
      return `${d.y}-${pad(d.m + 1)}-${pad(d.day)}`;
    }
    function isSelected(d) {
      return d.inMonth && internal.value.has(keyFrom(d));
    }
    function toggle(d) {
      if (!d.inMonth)
        return;
      const key = keyFrom(d);
      if (props.multiple) {
        if (internal.value.has(key))
          internal.value.delete(key);
        else
          internal.value.add(key);
      } else {
        internal.value = /* @__PURE__ */ new Set([key]);
      }
      emit("update:modelValue", Array.from(internal.value));
    }
    function changeMonth(delta) {
      const y = current.value.getFullYear();
      const m = current.value.getMonth() + delta;
      current.value = new Date(y, m, 1);
    }
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => changeMonth(-1)),
        b: common_vendor.t(year.value),
        c: common_vendor.t(month.value + 1),
        d: common_vendor.o(($event) => changeMonth(1)),
        e: common_vendor.f(weeks.value, (w, k0, i0) => {
          return {
            a: common_vendor.t(w),
            b: w
          };
        }),
        f: common_vendor.f(days.value, (d, i, i0) => {
          return common_vendor.e({
            a: common_vendor.t(d.day),
            b: isSelected(d)
          }, isSelected(d) ? {
            c: common_assets._imports_0$4
          } : {}, {
            d: i,
            e: common_vendor.n(d.inMonth ? "in" : "out"),
            f: common_vendor.n(d.isToday ? "today" : ""),
            g: common_vendor.n(isSelected(d) ? "selected" : ""),
            h: common_vendor.o(($event) => toggle(d), i)
          });
        })
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-68668279"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/CalendarSelector.js.map
