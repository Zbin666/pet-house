"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_store = require("../../utils/store.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const dynamicTopPadding = common_vendor.ref("");
    common_vendor.onMounted(async () => {
      try {
        const info = common_vendor.index.getSystemInfoSync();
        const statusBar = info.statusBarHeight || 0;
        const screenW = info.screenWidth || 375;
        const rpxToPx = (rpx) => rpx * screenW / 750;
        const topPx = Math.round(rpxToPx(120) + statusBar);
        dynamicTopPadding.value = `padding-top:${topPx}px;`;
      } catch (e) {
        dynamicTopPadding.value = "";
      }
      if (!utils_store.checkAuth()) {
        return;
      }
      const state = utils_store.initState();
      userInfo.value = state.userInfo;
      await loadData();
    });
    common_vendor.onShow(async () => {
      if (!utils_store.checkAuth())
        return;
      await loadData();
    });
    const userInfo = common_vendor.ref(null);
    const pets = common_vendor.ref([]);
    const stats = common_vendor.ref({
      feeds: 0,
      likes: 0
    });
    const gender = common_vendor.ref("female");
    const genderIcon = common_vendor.computed(() => gender.value === "male" ? "/static/user/male.png" : "/static/user/female.png");
    async function loadData() {
      var _a;
      try {
        const petsResult = await utils_api.api.getPets();
        pets.value = Array.isArray(petsResult) ? petsResult : petsResult.data || [];
        const feedsResult = await utils_api.api.getFeeds({ page: 1, limit: 1 });
        stats.value.feeds = ((_a = feedsResult.pagination) == null ? void 0 : _a.total) || 0;
        if (pets.value.length > 0) {
          const firstPet = pets.value[0];
          const start = firstPet.startTogether || firstPet.createdAt;
          if (start) {
            const days = Math.floor((Date.now() - new Date(start).getTime()) / (1e3 * 60 * 60 * 24));
            stats.value.days = days;
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:151", "加载数据失败:", error);
      }
    }
    function goEdit() {
      common_vendor.index.navigateTo({ url: "/pages/createPet/createPet" });
    }
    function openSetting() {
      common_vendor.index.navigateTo({ url: "/pages/settings/setting" });
    }
    function openPrivacy() {
      common_vendor.index.showToast({ title: "打开隐私中心", icon: "none" });
    }
    function openFeedback() {
      common_vendor.index.showToast({ title: "打开问题反馈", icon: "none" });
    }
    function goPetDetail(p) {
      const payload = encodeURIComponent(JSON.stringify(p));
      common_vendor.index.navigateTo({ url: `/pages/petDetail/petDetail?pet=${payload}` });
    }
    function logoutAction() {
      common_vendor.index.showModal({
        title: "退出登录",
        content: "确认退出当前账号吗？",
        success: (res) => {
          if (res.confirm) {
            utils_store.handleLogout();
          }
        }
      });
    }
    function formatMeta(p) {
      const months = (p == null ? void 0 : p.months) ? `${p.months}个月` : "";
      const weight = (p == null ? void 0 : p.weight) ? `${p.weight}kg` : "";
      return [months, weight].filter(Boolean).join(" | ");
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return {
        a: common_assets._imports_0$7,
        b: ((_a = userInfo.value) == null ? void 0 : _a.avatarUrl) || "/static/logo.png",
        c: common_vendor.t(((_b = userInfo.value) == null ? void 0 : _b.nickname) || "用户"),
        d: genderIcon.value,
        e: common_vendor.t(stats.value.feeds || 0),
        f: common_vendor.t(stats.value.likes || 0),
        g: common_vendor.o(openSetting),
        h: common_assets._imports_1$4,
        i: common_vendor.f(pets.value, (p, k0, i0) => {
          return {
            a: p.avatarUrl || "/static/logo.png",
            b: common_vendor.t(p.name),
            c: p.gender === "male" ? "/static/user/male.png" : "/static/user/female.png",
            d: common_vendor.t(formatMeta(p)),
            e: p.id,
            f: common_vendor.o(($event) => goPetDetail(p), p.id)
          };
        }),
        j: common_assets._imports_2$5,
        k: common_vendor.o(goEdit),
        l: common_assets._imports_3$1,
        m: common_vendor.o(openSetting),
        n: common_assets._imports_4$2,
        o: common_vendor.o(openPrivacy),
        p: common_assets._imports_5$1,
        q: common_vendor.o(openFeedback),
        r: common_assets._imports_3$1,
        s: common_vendor.o(logoutAction),
        t: common_vendor.s(dynamicTopPadding.value)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
