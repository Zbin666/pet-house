"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "questionDetail",
  setup(__props) {
    var _a, _b;
    const dynamicTopPadding = common_vendor.ref("");
    common_vendor.onMounted(() => {
      try {
        const info = common_vendor.index.getSystemInfoSync();
        const statusBar = info.statusBarHeight || 0;
        const screenW = info.screenWidth || 375;
        const rpxToPx = (rpx) => rpx * screenW / 750;
        const topPx = 15;
        dynamicTopPadding.value = `padding-top:${topPx}px;`;
      } catch (e) {
        dynamicTopPadding.value = "";
      }
    });
    const qa = common_vendor.reactive({
      id: "",
      title: "问题标题",
      isUrgent: false,
      hasAnswer: false,
      doctor: null,
      answerPreview: "",
      answerCount: 0,
      readCount: 0,
      time: ""
    });
    try {
      const ec = (_b = (_a = getCurrentPages().pop()) == null ? void 0 : _a.getOpenerEventChannel) == null ? void 0 : _b.call(_a);
      ec && ec.on("qa", (data) => {
        Object.assign(qa, data);
      });
    } catch (e) {
    }
    common_vendor.onLoad(() => {
      try {
        common_vendor.index.setNavigationBarTitle({ title: "问答详情" });
        common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      } catch (e) {
      }
    });
    return (_ctx, _cache) => {
      var _a2, _b2, _c;
      return common_vendor.e({
        a: qa.isUrgent
      }, qa.isUrgent ? {} : {}, {
        b: common_vendor.t(qa.title),
        c: common_vendor.t(qa.time),
        d: common_vendor.t(qa.answerCount),
        e: common_vendor.t(qa.readCount),
        f: qa.hasAnswer
      }, qa.hasAnswer ? {
        g: ((_a2 = qa.doctor) == null ? void 0 : _a2.avatar) || "/static/logo.png",
        h: common_vendor.t((_b2 = qa.doctor) == null ? void 0 : _b2.name),
        i: common_vendor.t((_c = qa.doctor) == null ? void 0 : _c.title),
        j: common_vendor.t(qa.answerPreview)
      } : {}, {
        k: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f887a9d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionDetail/questionDetail.js.map
