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
    const homeReminders = common_vendor.ref([]);
    const dailyScience = common_vendor.ref(null);
    const currentPet = common_vendor.computed(() => {
      var _a;
      const pet = ((_a = pets.value) == null ? void 0 : _a[0]) || null;
      common_vendor.index.__f__("log", "at pages/index/index.vue:154", "currentPet computed:", pet);
      return pet;
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
    function getPetMeta(pet) {
      if (!pet)
        return "";
      const months = pet.months ? `${pet.months}个月` : "";
      const weight = pet.weight ? `${pet.weight}kg` : "";
      return [months, weight].filter(Boolean).join(" | ");
    }
    function getPetTags(pet) {
      if (!pet)
        return [];
      const temperament = pet.temperament || "";
      if (!temperament)
        return [];
      if (Array.isArray(temperament))
        return temperament.slice(0, 3);
      return String(temperament).split(/[，,\s]+/).filter(Boolean).slice(0, 3);
    }
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
      await loadTodayReminders();
      await loadDailyScience();
    });
    common_vendor.onShow(async () => {
      await loadPets();
      await loadTodayReminders();
      await loadDailyScience();
    });
    function processImageUrl(url) {
      if (!url)
        return null;
      if (url.startsWith("wxfile://")) {
        return url;
      }
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      if (url.startsWith("/")) {
        return `http://pet-api.zbinli.cn${url}`;
      }
      return `http://pet-api.zbinli.cn/${url}`;
    }
    function getDefaultPetAvatar() {
      return "/static/index/add.png";
    }
    async function loadPets() {
      var _a, _b;
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:247", "=== 首页加载宠物数据调试信息 ===");
        const result = await utils_api.api.getPets();
        common_vendor.index.__f__("log", "at pages/index/index.vue:249", "API返回结果:", result);
        pets.value = Array.isArray(result) ? result : result.data || [];
        pets.value = pets.value.map((pet) => ({
          ...pet,
          avatarUrl: processImageUrl(pet.avatarUrl)
        }));
        common_vendor.index.__f__("log", "at pages/index/index.vue:260", "处理后的宠物数据:", pets.value);
        common_vendor.index.__f__("log", "at pages/index/index.vue:261", "第一个宠物的头像URL:", (_a = pets.value[0]) == null ? void 0 : _a.avatarUrl);
        common_vendor.index.__f__("log", "at pages/index/index.vue:262", "第一个宠物的完整数据:", pets.value[0]);
        hasPet.value = pets.value.length > 0;
        common_vendor.index.__f__("log", "at pages/index/index.vue:265", "是否有宠物:", hasPet.value);
        if ((_b = pets.value[0]) == null ? void 0 : _b.avatarUrl) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:269", "头像URL详情:", {
            url: pets.value[0].avatarUrl,
            type: typeof pets.value[0].avatarUrl,
            length: pets.value[0].avatarUrl.length
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:276", "加载宠物数据失败:", error);
      }
    }
    async function loadTodayReminders() {
      try {
        const now = /* @__PURE__ */ new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();
        const res = await utils_api.api.getSubscriptions({ startDate: start, endDate: end });
        const list = Array.isArray(res) ? res : res.subscriptions || res.data || [];
        homeReminders.value = list.map((s) => ({
          id: s.id,
          title: s.content || (s.type === "medicine" ? "用药提醒" : s.type === "vaccine" ? "疫苗提醒" : s.type === "wash" ? "洗护提醒" : "日常提醒"),
          time: new Date(s.fireAt).toTimeString().slice(0, 5)
        }));
      } catch (e) {
        homeReminders.value = [];
      }
    }
    async function loadDailyScience() {
      try {
        const res = await utils_api.api.getArticles({ category: "science", page: 1, limit: 200 });
        const list = Array.isArray(res) ? res : res.articles || res.data || [];
        if (!list.length) {
          dailyScience.value = null;
          return;
        }
        const dayIndex = Math.floor(Date.now() / 864e5);
        const idx = dayIndex % list.length;
        const stable = list.slice().sort((a, b) => {
          const at = new Date(a.createdAt || 0).getTime();
          const bt = new Date(b.createdAt || 0).getTime();
          if (at !== bt)
            return at - bt;
          return String(a.id).localeCompare(String(b.id));
        });
        dailyScience.value = stable[idx];
      } catch (e) {
        dailyScience.value = null;
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
    function onImageLoad(e) {
      common_vendor.index.__f__("log", "at pages/index/index.vue:348", "图片加载成功:", e);
    }
    function onImageError(e) {
      var _a;
      common_vendor.index.__f__("error", "at pages/index/index.vue:352", "图片加载失败:", e);
      common_vendor.index.__f__("error", "at pages/index/index.vue:353", "失败的图片URL:", (_a = currentPet.value) == null ? void 0 : _a.avatarUrl);
      if (currentPet.value) {
        currentPet.value.avatarUrl = getDefaultPetAvatar();
      }
    }
    function goPetDetail(pet) {
      pet = pet || currentPet.value;
      common_vendor.index.__f__("log", "at pages/index/index.vue:363", "=== 首页跳转宠物详情调试信息 ===");
      common_vendor.index.__f__("log", "at pages/index/index.vue:364", "当前宠物数据:", pet);
      common_vendor.index.__f__("log", "at pages/index/index.vue:365", "宠物头像URL:", pet == null ? void 0 : pet.avatarUrl);
      if (!pet || !pet.id)
        return;
      const q = encodeURIComponent(JSON.stringify(pet));
      common_vendor.index.__f__("log", "at pages/index/index.vue:369", "编码后的数据:", q);
      common_vendor.index.__f__("log", "at pages/index/index.vue:370", "跳转URL:", `/pages/petDetail/petDetail?pet=${q}`);
      common_vendor.index.navigateTo({ url: `/pages/petDetail/petDetail?pet=${q}` });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f;
      return common_vendor.e({
        a: common_vendor.t(((_a = userInfo.value) == null ? void 0 : _a.nickname) || "用户"),
        b: common_vendor.t(getGreeting()),
        c: common_assets._imports_0$2,
        d: hasPet.value && pets.value.length === 1
      }, hasPet.value && pets.value.length === 1 ? common_vendor.e({
        e: (_b = currentPet.value) == null ? void 0 : _b.avatarUrl
      }, ((_c = currentPet.value) == null ? void 0 : _c.avatarUrl) ? {
        f: currentPet.value.avatarUrl,
        g: common_vendor.o(onImageError),
        h: common_vendor.o(onImageLoad)
      } : {
        i: getDefaultPetAvatar()
      }, {
        j: common_vendor.t(((_d = currentPet.value) == null ? void 0 : _d.name) || "我的宠物"),
        k: common_vendor.t(petMeta.value),
        l: petTags.value.length
      }, petTags.value.length ? {
        m: common_vendor.f(petTags.value, (tag, i, i0) => {
          return {
            a: common_vendor.t(tag),
            b: i
          };
        })
      } : {}, {
        n: common_vendor.o(($event) => goPetDetail(currentPet.value))
      }) : hasPet.value && pets.value.length > 1 ? {
        p: common_vendor.f(pets.value, (pet, k0, i0) => {
          return common_vendor.e({
            a: pet == null ? void 0 : pet.avatarUrl
          }, (pet == null ? void 0 : pet.avatarUrl) ? {
            b: pet.avatarUrl
          } : {
            c: getDefaultPetAvatar()
          }, {
            d: common_vendor.t((pet == null ? void 0 : pet.name) || "我的宠物"),
            e: common_vendor.t(getPetMeta(pet)),
            f: getPetTags(pet).length
          }, getPetTags(pet).length ? {
            g: common_vendor.f(getPetTags(pet), (tag, i, i1) => {
              return {
                a: common_vendor.t(tag),
                b: i
              };
            })
          } : {}, {
            h: pet.id,
            i: common_vendor.o(($event) => goPetDetail(pet), pet.id)
          });
        })
      } : {
        q: common_assets._imports_0$1,
        r: common_vendor.o(goAddPet)
      }, {
        o: hasPet.value && pets.value.length > 1,
        s: homeReminders.value.length === 0
      }, homeReminders.value.length === 0 ? {} : {
        t: common_vendor.f(homeReminders.value, (r, k0, i0) => {
          return {
            a: common_vendor.t(r.title),
            b: r.id
          };
        })
      }, {
        v: common_assets._imports_2$1,
        w: common_vendor.o(($event) => goToRecord("calendar")),
        x: common_assets._imports_3,
        y: common_vendor.o(($event) => goToRecord("stats")),
        z: common_vendor.t(((_e = dailyScience.value) == null ? void 0 : _e.title) ? `【${dailyScience.value.title}】` : "【今日小知识】"),
        A: common_vendor.t(((_f = dailyScience.value) == null ? void 0 : _f.content) || "每日为你推荐一条宠物健康小知识～"),
        B: common_assets._imports_4,
        C: common_assets._imports_5
      });
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
