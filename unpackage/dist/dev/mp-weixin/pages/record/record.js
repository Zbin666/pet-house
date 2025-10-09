"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "record",
  setup(__props) {
    const activeTab = common_vendor.ref("calendar");
    const weeks = common_vendor.ref(["M", "T", "W", "T", "F", "S", "S"]);
    const current = common_vendor.ref(/* @__PURE__ */ new Date());
    const selected = common_vendor.ref({ y: current.value.getFullYear(), m: current.value.getMonth(), d: current.value.getDate() });
    const collapsed = common_vendor.ref(true);
    common_vendor.onMounted(() => {
      const storedTab = common_vendor.index.getStorageSync("recordTab");
      if (storedTab === "calendar" || storedTab === "stats") {
        activeTab.value = storedTab;
        common_vendor.index.removeStorageSync("recordTab");
      }
    });
    common_vendor.ref([
      { id: "1", type: "喂食", time: "今天 08:00", desc: "鸡胸+猫粮 50g" },
      { id: "2", type: "饮水", time: "今天 10:30", desc: "自动饮水机补水" }
    ]);
    common_vendor.ref({ feed: 9, clean: 3, weight: 4.2 });
    const reminders = common_vendor.ref([
      { id: "r1", type: "t1", title: "给火火称体重", time: "08:00", done: true, deleting: false },
      { id: "r2", type: "t2", title: "铲屎", time: "08:20", done: false, deleting: false },
      { id: "r3", type: "t3", title: "更换新的猫砂", time: "11:00", done: false, deleting: false },
      { id: "r4", type: "t4", title: "出门带火火去医院体检", time: "16:30", done: false, deleting: false }
    ]);
    const currentYear = common_vendor.computed(() => current.value.getFullYear());
    const currentMonth = common_vendor.computed(() => current.value.getMonth());
    const calendarDays = common_vendor.computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;
      const first = new Date(year, month, 1);
      const startWeek = (first.getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysPrevMonth = new Date(year, month, 0).getDate();
      const cells = [];
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
        const today = /* @__PURE__ */ new Date();
        const isToday = inMonth && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const hasRecord = inMonth && day % 2 === 0;
        cells.push({ day, inMonth, isToday, hasRecord, y: year, m: month });
      }
      return cells;
    });
    const weekDays = common_vendor.computed(() => {
      const days = calendarDays.value;
      const idx = days.findIndex((d) => d.inMonth && d.day === selected.value.d && d.m === selected.value.m && d.y === selected.value.y);
      const start = Math.max(0, Math.floor((idx >= 0 ? idx : 0) / 7) * 7);
      return days.slice(start, start + 7);
    });
    function goCreate() {
      common_vendor.index.navigateTo({ url: "/pages/createRecord/createRecord" });
    }
    function goRecordDetail(type) {
      common_vendor.index.navigateTo({ url: `/pages/recordDetail/recordDetail?type=${type}` });
    }
    const recordOptions = common_vendor.ref([
      { key: "eating", title: "饮食", icon: "/static/record/eating.png" },
      { key: "drinking", title: "饮水", icon: "/static/record/drinking.png", hasValue: true, value: 300, unit: "ml" },
      { key: "weight", title: "体重", icon: "/static/record/weight.png", hasValue: true, value: 2.5, unit: "kg" },
      { key: "washing", title: "洗护", icon: "/static/record/washing.png" },
      { key: "shit", title: "便便", icon: "/static/record/shit.png" },
      { key: "noting", title: "记事", icon: "/static/record/noting.png" },
      { key: "abnormal", title: "异常", icon: "/static/record/abnormal.png" },
      { key: "medicine", title: "用药", icon: "/static/record/medicine.png" }
    ]);
    function changeMonth(delta) {
      const y = current.value.getFullYear();
      const m = current.value.getMonth() + delta;
      current.value = new Date(y, m, 1);
      selected.value = { y: current.value.getFullYear(), m: current.value.getMonth(), d: 1 };
    }
    function selectDay(d) {
      if (!d.inMonth)
        return;
      selected.value = { y: currentYear.value, m: currentMonth.value, d: d.day };
    }
    function isSelected(d) {
      return d.inMonth && d.day === selected.value.d && d.m === selected.value.m && d.y === selected.value.y;
    }
    function toggleCollapse() {
      collapsed.value = !collapsed.value;
    }
    function toggleReminder(id) {
      const idx = reminders.value.findIndex((r) => r.id === id);
      if (idx !== -1) {
        reminders.value[idx].done = !reminders.value[idx].done;
      }
    }
    function startDelete(id) {
      reminders.value.forEach((r) => r.deleting = true);
    }
    function handleItemTap(id) {
      const isDeletingMode = reminders.value.some((r) => r.deleting);
      if (isDeletingMode) {
        reminders.value.forEach((r) => r.deleting = false);
      } else {
        toggleReminder(id);
      }
    }
    function handleIconTap(id) {
      const reminder = reminders.value.find((r) => r.id === id);
      if (reminder && reminder.deleting) {
        deleteReminder(id);
      } else {
        toggleReminder(id);
      }
    }
    function deleteReminder(id) {
      const reminder = reminders.value.find((r) => r.id === id);
      if (!reminder)
        return;
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除提醒"${reminder.title}"吗？`,
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            const idx = reminders.value.findIndex((r) => r.id === id);
            if (idx !== -1) {
              reminders.value.splice(idx, 1);
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          } else {
            reminders.value.forEach((r) => r.deleting = false);
          }
        }
      });
    }
    function setValue(key, value) {
      const option = recordOptions.value.find((opt) => opt.key === key);
      if (option && option.hasValue) {
        option.value = parseFloat(value) || 0;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.n(activeTab.value === "calendar" ? "active yellow" : ""),
        b: common_vendor.o(($event) => activeTab.value = "calendar"),
        c: common_vendor.n(activeTab.value === "stats" ? "active yellow" : ""),
        d: common_vendor.o(($event) => activeTab.value = "stats"),
        e: activeTab.value === "calendar"
      }, activeTab.value === "calendar" ? {
        f: common_assets._imports_0$3
      } : activeTab.value === "stats" ? {
        h: common_assets._imports_0$3
      } : {}, {
        g: activeTab.value === "stats",
        i: common_vendor.o(($event) => changeMonth(-1)),
        j: common_vendor.t(currentYear.value),
        k: common_vendor.t(currentMonth.value + 1),
        l: common_vendor.o(($event) => changeMonth(1)),
        m: common_vendor.f(weeks.value, (w, k0, i0) => {
          return {
            a: common_vendor.t(w),
            b: w
          };
        }),
        n: !collapsed.value
      }, !collapsed.value ? {
        o: common_vendor.f(calendarDays.value, (d, idx, i0) => {
          return common_vendor.e({
            a: isSelected(d)
          }, isSelected(d) ? {
            b: common_assets._imports_0$4
          } : {}, {
            c: common_vendor.t(d.day),
            d: idx,
            e: common_vendor.n(d.inMonth ? "in" : "out"),
            f: common_vendor.n(d.isToday ? "today" : ""),
            g: common_vendor.n(isSelected(d) ? "selected" : ""),
            h: common_vendor.o(($event) => selectDay(d), idx)
          });
        })
      } : {
        p: common_vendor.f(weekDays.value, (d, idx, i0) => {
          return common_vendor.e({
            a: isSelected(d)
          }, isSelected(d) ? {
            b: common_assets._imports_0$4
          } : {}, {
            c: common_vendor.t(d.day),
            d: "w" + idx,
            e: common_vendor.n(d.inMonth ? "in" : "out"),
            f: common_vendor.n(d.isToday ? "today" : ""),
            g: common_vendor.n(isSelected(d) ? "selected" : ""),
            h: common_vendor.o(($event) => selectDay(d), "w" + idx)
          });
        })
      }, {
        q: collapsed.value ? "/static/record/down.png" : "/static/record/up.png",
        r: common_vendor.o(toggleCollapse),
        s: activeTab.value === "calendar"
      }, activeTab.value === "calendar" ? {
        t: common_vendor.f(recordOptions.value, (opt, k0, i0) => {
          return common_vendor.e({
            a: opt.icon,
            b: common_vendor.t(opt.title),
            c: opt.hasValue
          }, opt.hasValue ? common_vendor.e({
            d: opt.key === "drinking"
          }, opt.key === "drinking" ? {
            e: opt.value,
            f: common_vendor.o(($event) => setValue(opt.key, $event.detail.value), opt.key)
          } : opt.key === "weight" ? {
            h: opt.value,
            i: common_vendor.o(($event) => setValue(opt.key, $event.detail.value), opt.key)
          } : {}, {
            g: opt.key === "weight",
            j: common_vendor.t(opt.unit)
          }) : opt.key === "noting" ? {
            l: common_assets._imports_2$3
          } : {}, {
            k: opt.key === "noting",
            m: opt.key,
            n: common_vendor.o(($event) => opt.hasValue ? null : goRecordDetail(opt.key), opt.key)
          });
        })
      } : {}, {
        v: activeTab.value === "stats"
      }, activeTab.value === "stats" ? {} : {}, {
        w: activeTab.value === "stats" && reminders.value.length
      }, activeTab.value === "stats" && reminders.value.length ? {
        x: common_vendor.f(reminders.value, (r, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.n(r.type),
            b: common_vendor.t(r.title),
            c: common_vendor.t(r.time),
            d: r.deleting
          }, r.deleting ? {
            e: common_assets._imports_1$1
          } : r.done ? {
            g: common_assets._imports_4$1
          } : {}, {
            f: r.done,
            h: r.done ? 1 : "",
            i: common_vendor.o(($event) => handleIconTap(r.id), r.id),
            j: r.id,
            k: common_vendor.n({
              done: r.done,
              deleting: r.deleting
            }),
            l: common_vendor.o(($event) => startDelete(r.id), r.id),
            m: common_vendor.o(($event) => handleItemTap(r.id), r.id)
          });
        })
      } : {}, {
        y: activeTab.value === "stats" && reminders.value.length
      }, activeTab.value === "stats" && reminders.value.length ? {
        z: common_assets._imports_2$2,
        A: common_vendor.o(($event) => goCreate())
      } : activeTab.value === "stats" ? {
        C: common_assets._imports_2$2
      } : {}, {
        B: activeTab.value === "stats"
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-ef6850c5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/record/record.js.map
