"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_store = require("../../utils/store.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ Object.assign({ name: "HomeIndex" }, {
  __name: "index",
  setup(__props) {
    const hasPet = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const pets = common_vendor.ref([]);
    const currentPet = common_vendor.computed(() => {
      var _a;
      return ((_a = pets.value) == null ? void 0 : _a[0]) || null;
    });
    const petMeta = common_vendor.computed(() => {
      if (!currentPet.value)
        return "";
      const months = currentPet.value.months ? `${currentPet.value.months}个月` : "";
      const weight = currentPet.value.weight ? `${currentPet.value.weight}kg` : "";
      return [months, weight].filter(Boolean).join(" | ");
    });
    const petTags = common_vendor.computed(() => {
      if (!currentPet.value)
        return [];
      const temperament = currentPet.value.temperament || "";
      if (!temperament)
        return [];
      if (Array.isArray(temperament))
        return temperament;
      return String(temperament).split(/[，,\s]+/).filter(Boolean).slice(0, 3);
    });
    common_vendor.onMounted(async () => {
      const state = utils_store.initState();
      userInfo.value = state.userInfo;
      if (!state.isLoggedIn) {
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
        return;
      }
      await loadPets();
    });
    common_vendor.onShow(async () => {
      await loadPets();
    });
    async function loadPets() {
      try {
        const result = await utils_api.api.getPets();
        pets.value = Array.isArray(result) ? result : result.data || [];
        hasPet.value = pets.value.length > 0;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:154", "加载宠物数据失败:", error);
      }
    }
    function getGreeting() {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 12) {
        return "Good Morning!";
      } else if (hour < 18) {
        return "Good Afternoon!";
      } else {
        return "Good Evening!";
      }
    }
    function goAddPet() {
      common_vendor.index.navigateTo({ url: "/pages/createPet/createPet" });
    }
    function goToRecord(tab) {
      common_vendor.index.setStorageSync("recordTab", tab);
      common_vendor.index.switchTab({ url: "/pages/record/record" });
    }
    function goPetDetail() {
      const pet = currentPet.value;
      if (!pet || !pet.id)
        return;
      const q = encodeURIComponent(JSON.stringify(pet));
      common_vendor.index.navigateTo({ url: `/pages/petDetail/petDetail?pet=${q}` });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: common_vendor.t(((_a = userInfo.value) == null ? void 0 : _a.nickname) || "用户"),
        b: common_vendor.t(getGreeting()),
        c: common_assets._imports_0$2,
        d: hasPet.value
      }, hasPet.value ? common_vendor.e({
        e: (_b = currentPet.value) == null ? void 0 : _b.avatarUrl
      }, ((_c = currentPet.value) == null ? void 0 : _c.avatarUrl) ? {
        f: currentPet.value.avatarUrl
      } : {}, {
        g: common_vendor.t(((_d = currentPet.value) == null ? void 0 : _d.name) || "我的宠物"),
        h: common_vendor.t(petMeta.value),
        i: petTags.value.length
      }, petTags.value.length ? {
        j: common_vendor.f(petTags.value, (tag, i, i0) => {
          return {
            a: common_vendor.t(tag),
            b: i
          };
        })
      } : {}, {
        k: common_vendor.o(goPetDetail)
      }) : {
        l: common_assets._imports_0$1,
        m: common_vendor.o(goAddPet)
      }, {
        n: common_assets._imports_2$1,
        o: common_vendor.o(($event) => goToRecord("calendar")),
        p: common_assets._imports_3,
        q: common_vendor.o(($event) => goToRecord("stats")),
        r: common_assets._imports_4,
        s: common_assets._imports_5
      });
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
