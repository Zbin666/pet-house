"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/record/record.js";
  "./pages/createRecord/createRecord.js";
  "./pages/community/community.js";
  "./pages/communityDetail/communityDetail.js";
  "./pages/user/user.js";
  "./pages/petDetail/petDetail.js";
  "./pages/settings/setting.js";
  "./pages/recordDetail/recordDetail.js";
  "./pages/createCommunity/createCommunity.js";
  "./pages/questionDetail/questionDetail.js";
  "./pages/scienceDetail/scienceDetail.js";
  "./pages/createPet/createPet.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    try {
      const info = common_vendor.index.getSystemInfoSync();
      const h = info && info.statusBarHeight ? info.statusBarHeight : 0;
      const root = document && (document.documentElement || document.body);
      if (root)
        root.style.setProperty("--status-bar-height", h + "px");
    } catch (e) {
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:13", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
