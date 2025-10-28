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
    const avatarCache = /* @__PURE__ */ new Map();
    const petAvatarCache = /* @__PURE__ */ new Map();
    const avatarLoading = common_vendor.ref(false);
    function getUserAvatarSrc(url) {
      if (!url)
        return "/static/user/user.png";
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/")) {
        return normalized;
      }
      if (avatarCache.has(normalized)) {
        return avatarCache.get(normalized);
      }
      avatarLoading.value = true;
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          avatarLoading.value = false;
          if (res.statusCode === 200 && res.tempFilePath) {
            avatarCache.set(normalized, res.tempFilePath);
            userInfo.value = { ...userInfo.value || {} };
          } else {
            avatarCache.set(normalized, "/static/user/user.png");
            userInfo.value = { ...userInfo.value || {} };
          }
        },
        fail: () => {
          avatarLoading.value = false;
          avatarCache.set(normalized, "/static/user/user.png");
          userInfo.value = { ...userInfo.value || {} };
        }
      });
      return "/static/user/user.png";
    }
    function onAvatarError(e) {
      try {
        e && e.target && (e.target.src = "/static/user/user.png");
      } catch {
      }
    }
    function onAvatarLoad(_) {
    }
    function getPetAvatarSrc(url) {
      if (!url)
        return "/static/inedx/add.png";
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/")) {
        return normalized;
      }
      if (petAvatarCache.has(normalized)) {
        return petAvatarCache.get(normalized);
      }
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            petAvatarCache.set(normalized, res.tempFilePath);
            pets.value = [...pets.value];
          } else {
            petAvatarCache.set(normalized, "/static/index/add.png");
            pets.value = [...pets.value];
          }
        },
        fail: () => {
          petAvatarCache.set(normalized, "/static/index/add.png");
          pets.value = [...pets.value];
        }
      });
      return "/static/index/add.png";
    }
    const gender = common_vendor.ref("female");
    const genderIcon = common_vendor.computed(() => gender.value === "male" ? "/static/user/male.png" : "/static/user/female.png");
    async function loadData() {
      var _a;
      try {
        const profile = await utils_api.api.getProfile();
        if (profile) {
          userInfo.value = {
            ...userInfo.value,
            ...profile,
            avatarUrl: profile.avatarUrl || ((_a = userInfo.value) == null ? void 0 : _a.avatarUrl)
          };
        }
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
        common_vendor.index.__f__("error", "at pages/user/user.vue:276", "加载数据失败:", error);
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
      return common_vendor.e({
        a: common_assets._imports_0$8,
        b: getUserAvatarSrc((_a = userInfo.value) == null ? void 0 : _a.avatarUrl),
        c: common_vendor.o(onAvatarError),
        d: common_vendor.o(onAvatarLoad),
        e: avatarLoading.value
      }, avatarLoading.value ? {} : {}, {
        f: common_vendor.t(((_b = userInfo.value) == null ? void 0 : _b.nickname) || "用户"),
        g: genderIcon.value,
        h: common_vendor.t(stats.value.feeds || 0),
        i: common_vendor.t(stats.value.likes || 0),
        j: common_vendor.o(openSetting),
        k: common_assets._imports_1$3,
        l: common_vendor.t(maxTogetherDays.value),
        m: common_vendor.f(pets.value, (p, k0, i0) => {
          return {
            a: getPetAvatarSrc(p.avatarUrl),
            b: common_vendor.t(p.name),
            c: p.gender === "male" ? "/static/user/male.png" : "/static/user/female.png",
            d: common_vendor.t(formatMeta(p)),
            e: p.id,
            f: common_vendor.o(($event) => goPetDetail(p), p.id)
          };
        }),
        n: common_assets._imports_2$1,
        o: common_vendor.o(goEdit),
        p: common_assets._imports_3$3,
        q: common_vendor.o(openSetting),
        r: common_assets._imports_3$3,
        s: common_vendor.o(logoutAction),
        t: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
