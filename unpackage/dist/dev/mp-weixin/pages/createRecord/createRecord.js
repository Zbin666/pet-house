"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  CalendarSelector();
}
const CalendarSelector = () => "../../components/CalendarSelector.js";
const _sfc_main = {
  __name: "createRecord",
  setup(__props) {
    const now = /* @__PURE__ */ new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const content = common_vendor.ref("");
    const types = common_vendor.ref(["日常提醒", "洗护提醒", "清洁提醒", "用药提醒"]);
    const typeIndex = common_vendor.ref(0);
    const time = common_vendor.ref(`${hh}:${mi}`);
    const selectedDates = common_vendor.ref([`${yyyy}-${mm}-${dd}`]);
    const showCal = common_vendor.ref(false);
    const tempDates = common_vendor.ref([]);
    common_vendor.onLoad(() => {
      common_vendor.index.setNavigationBarTitle({ title: "添加提醒" });
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
    });
    const currentType = common_vendor.computed(() => types.value[typeIndex.value]);
    const timeDisplay = common_vendor.computed(() => time.value);
    const dateDisplay = common_vendor.computed(() => {
      if (!selectedDates.value || selectedDates.value.length === 0)
        return "请选择日期";
      if (selectedDates.value.length === 1)
        return selectedDates.value[0];
      return `${selectedDates.value[0]} 等${selectedDates.value.length}天`;
    });
    function onTypeChange(e) {
      var _a;
      typeIndex.value = Number(((_a = e.detail) == null ? void 0 : _a.value) || 0);
    }
    function onTimeChange(e) {
      time.value = e.detail.value;
    }
    function openCalendar() {
      tempDates.value = [...selectedDates.value];
      showCal.value = true;
    }
    function closeCalendar() {
      showCal.value = false;
    }
    function confirmCalendar() {
      selectedDates.value = [...tempDates.value];
      showCal.value = false;
    }
    function submit() {
      try {
        common_vendor.index.setStorageSync("lastReminderDraft", {
          content: content.value,
          type: currentType.value,
          time: time.value,
          dates: selectedDates.value
        });
      } catch (e) {
      }
      common_vendor.index.showToast({ title: "已保存", icon: "success" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 300);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: content.value,
        b: common_vendor.o(($event) => content.value = $event.detail.value),
        c: common_vendor.t(currentType.value),
        d: types.value,
        e: typeIndex.value,
        f: common_vendor.o(onTypeChange),
        g: common_vendor.t(dateDisplay.value),
        h: common_vendor.o(openCalendar),
        i: common_vendor.t(timeDisplay.value),
        j: time.value,
        k: common_vendor.o(onTimeChange),
        l: showCal.value
      }, showCal.value ? {
        m: common_vendor.o(($event) => tempDates.value = $event),
        n: common_vendor.p({
          multiple: false,
          modelValue: tempDates.value
        }),
        o: common_vendor.o(closeCalendar),
        p: common_vendor.o(confirmCalendar),
        q: common_vendor.o(() => {
        }),
        r: common_vendor.o(closeCalendar)
      } : {}, {
        s: common_vendor.o(submit)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c6b119df"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createRecord/createRecord.js.map
