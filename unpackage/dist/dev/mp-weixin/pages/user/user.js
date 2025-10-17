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
    const stats = common_vendor.ref({ feeds: 0, likes: 0 });
    const maxTogetherDays = common_vendor.ref(0);
    const gender = common_vendor.ref("female");
    const genderIcon = common_vendor.computed(() => gender.value === "male" ? "/static/user/male.png" : "/static/user/female.png");
    async function loadData() {
      try {
        const petsResult = await utils_api.api.getPets();
        pets.value = Array.isArray(petsResult) ? petsResult : petsResult.data || [];
        const statsResult = await utils_api.api.getUserStats();
        stats.value.feeds = statsResult.feeds || 0;
        stats.value.likes = statsResult.likes || 0;
        maxTogetherDays.value = pets.value.reduce((max, p) => {
          const start = p.startTogether || p.createdAt;
          if (!start)
            return max;
          const days = Math.max(1, Math.floor((Date.now() - new Date(start).getTime()) / (1e3 * 60 * 60 * 24)));
          return Math.max(max, days);
        }, 0);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:138", "加载数据失败:", error);
      }
    }
    function goEdit() {
      common_vendor.index.navigateTo({ url: "/pages/createPet/createPet" });
    }
    function openSetting() {
      common_vendor.index.navigateTo({ url: "/pages/settings/setting" });
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
        a: common_assets._imports_0$8,
        b: ((_a = userInfo.value) == null ? void 0 : _a.avatarUrl) || "/static/logo.png",
        c: common_vendor.t(((_b = userInfo.value) == null ? void 0 : _b.nickname) || "用户"),
        d: genderIcon.value,
        e: common_vendor.t(stats.value.feeds || 0),
        f: common_vendor.t(stats.value.likes || 0),
        g: common_vendor.o(openSetting),
        h: common_assets._imports_1$3,
        i: common_vendor.t(maxTogetherDays.value),
        j: common_vendor.f(pets.value, (p, k0, i0) => {
          return {
            a: p.avatarUrl || "/static/logo.png",
            b: common_vendor.t(p.name),
            c: p.gender === "male" ? "/static/user/male.png" : "/static/user/female.png",
            d: common_vendor.t(formatMeta(p)),
            e: p.id,
            f: common_vendor.o(($event) => goPetDetail(p), p.id)
          };
        }),
        k: common_assets._imports_2$2,
        l: common_vendor.o(goEdit),
        m: common_assets._imports_3$3,
        n: common_vendor.o(openSetting),
        o: common_assets._imports_3$3,
        p: common_vendor.o(logoutAction),
        q: common_vendor.s(dynamicTopPadding.value)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
