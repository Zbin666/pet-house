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
      common_vendor.index.__f__("log", "at pages/index/index.vue:140", "currentPet computed:", pet);
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
    const avatarCache = /* @__PURE__ */ new Map();
    function getPetAvatarSrc(url) {
      if (!url)
        return "/static/index/add.png";
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
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            avatarCache.set(normalized, res.tempFilePath);
            pets.value = [...pets.value];
          } else {
            avatarCache.set(normalized, "/static/index/add.png");
            pets.value = [...pets.value];
          }
        },
        fail: () => {
          avatarCache.set(normalized, "/static/index/add.png");
          pets.value = [...pets.value];
        }
      });
      return "/static/index/add.png";
    }
    async function loadPets() {
      var _a, _b;
      try {
        common_vendor.index.__f__("log", "at pages/index/index.vue:262", "=== 首页加载宠物数据调试信息 ===");
        const result = await utils_api.api.getPets();
        common_vendor.index.__f__("log", "at pages/index/index.vue:264", "API返回结果:", result);
        pets.value = Array.isArray(result) ? result : result.data || [];
        common_vendor.index.__f__("log", "at pages/index/index.vue:269", "宠物数据:", pets.value);
        common_vendor.index.__f__("log", "at pages/index/index.vue:270", "第一个宠物的头像URL:", (_a = pets.value[0]) == null ? void 0 : _a.avatarUrl);
        common_vendor.index.__f__("log", "at pages/index/index.vue:271", "第一个宠物的完整数据:", pets.value[0]);
        hasPet.value = pets.value.length > 0;
        common_vendor.index.__f__("log", "at pages/index/index.vue:274", "是否有宠物:", hasPet.value);
        if ((_b = pets.value[0]) == null ? void 0 : _b.avatarUrl) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:278", "头像URL详情:", {
            url: pets.value[0].avatarUrl,
            type: typeof pets.value[0].avatarUrl,
            length: pets.value[0].avatarUrl.length
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:285", "加载宠物数据失败:", error);
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
        common_vendor.index.__f__("log", "at pages/index/index.vue:310", "🔍 开始加载今日科普...");
        const res = await utils_api.api.getArticles({ page: 1, limit: 200 });
        common_vendor.index.__f__("log", "at pages/index/index.vue:312", "📡 科普API返回:", res);
        const list = Array.isArray(res) ? res : res.articles || res.data || [];
        common_vendor.index.__f__("log", "at pages/index/index.vue:315", "📋 科普文章列表:", list);
        if (!list.length) {
          common_vendor.index.__f__("log", "at pages/index/index.vue:318", "⚠️ 没有找到科普文章");
          dailyScience.value = null;
          return;
        }
        const stable = list.slice().sort((a, b) => {
          const at = new Date(a.createdAt || 0).getTime();
          const bt = new Date(b.createdAt || 0).getTime();
          if (at !== bt)
            return at - bt;
          return String(a.id).localeCompare(String(b.id));
        });
        const dayIndex = Math.floor(Date.now() / 864e5);
        const idx = dayIndex % stable.length;
        common_vendor.index.__f__("log", "at pages/index/index.vue:334", "📅 今日索引:", idx, "总文章数:", stable.length);
        const selectedArticle = stable[idx];
        common_vendor.index.__f__("log", "at pages/index/index.vue:337", "✅ 选中的科普文章:", selectedArticle);
        if (selectedArticle) {
          if (!selectedArticle.content || selectedArticle.content === null) {
            selectedArticle.content = selectedArticle.title || "暂无内容";
            common_vendor.index.__f__("log", "at pages/index/index.vue:344", "⚠️ 文章content为null，使用title作为内容:", selectedArticle.content);
          } else {
            const maxLength = 120;
            const content = selectedArticle.content;
            if (content.length > maxLength) {
              selectedArticle.content = content.substring(0, maxLength) + "...";
              common_vendor.index.__f__("log", "at pages/index/index.vue:350", "✂️ 内容已截断:", selectedArticle.content);
            }
          }
        }
        dailyScience.value = selectedArticle;
        common_vendor.index.__f__("log", "at pages/index/index.vue:356", "🎯 最终科普数据:", dailyScience.value);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:358", "❌ 加载今日科普失败:", e);
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
      common_vendor.index.__f__("log", "at pages/index/index.vue:388", "图片加载成功:", e);
    }
    function onImageError(e) {
      var _a;
      common_vendor.index.__f__("error", "at pages/index/index.vue:392", "图片加载失败:", e);
      common_vendor.index.__f__("error", "at pages/index/index.vue:393", "失败的图片URL:", (_a = currentPet.value) == null ? void 0 : _a.avatarUrl);
    }
    function goPetDetail(pet) {
      pet = pet || currentPet.value;
      common_vendor.index.__f__("log", "at pages/index/index.vue:401", "=== 首页跳转宠物详情调试信息 ===");
      common_vendor.index.__f__("log", "at pages/index/index.vue:402", "当前宠物数据:", pet);
      common_vendor.index.__f__("log", "at pages/index/index.vue:403", "宠物头像URL:", pet == null ? void 0 : pet.avatarUrl);
      if (!pet || !pet.id)
        return;
      const q = encodeURIComponent(JSON.stringify(pet));
      common_vendor.index.__f__("log", "at pages/index/index.vue:407", "编码后的数据:", q);
      common_vendor.index.__f__("log", "at pages/index/index.vue:408", "跳转URL:", `/pages/petDetail/petDetail?pet=${q}`);
      common_vendor.index.navigateTo({ url: `/pages/petDetail/petDetail?pet=${q}` });
    }
    function goScienceDetail() {
      if (!dailyScience.value || !dailyScience.value.id) {
        common_vendor.index.__f__("log", "at pages/index/index.vue:416", "⚠️ 没有科普内容可跳转");
        return;
      }
      common_vendor.index.__f__("log", "at pages/index/index.vue:420", "🔍 跳转科普详情:", dailyScience.value);
      common_vendor.index.navigateTo({
        url: `/pages/scienceDetail/scienceDetail?id=${dailyScience.value.id}`,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:426", "✅ 科普详情页跳转成功");
          try {
            res.eventChannel.emit("science", dailyScience.value);
            common_vendor.index.__f__("log", "at pages/index/index.vue:429", "📤 已发送科普数据到详情页:", dailyScience.value);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/index/index.vue:431", "❌ 发送科普数据失败:", e);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:435", "❌ 科普详情页跳转失败:", err);
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e;
      return common_vendor.e({
        a: common_vendor.t(((_a = userInfo.value) == null ? void 0 : _a.nickname) || "用户"),
        b: common_vendor.t(getGreeting()),
        c: common_assets._imports_0$2,
        d: hasPet.value && pets.value.length === 1
      }, hasPet.value && pets.value.length === 1 ? common_vendor.e({
        e: getPetAvatarSrc((_b = currentPet.value) == null ? void 0 : _b.avatarUrl),
        f: common_vendor.o(onImageError),
        g: common_vendor.o(onImageLoad),
        h: common_vendor.t(((_c = currentPet.value) == null ? void 0 : _c.name) || "我的宠物"),
        i: common_vendor.t(petMeta.value),
        j: petTags.value.length
      }, petTags.value.length ? {
        k: common_vendor.f(petTags.value, (tag, i, i0) => {
          return {
            a: common_vendor.t(tag),
            b: i
          };
        })
      } : {}, {
        l: common_vendor.o(($event) => goPetDetail(currentPet.value))
      }) : hasPet.value && pets.value.length > 1 ? {
        n: common_vendor.f(pets.value, (pet, k0, i0) => {
          return common_vendor.e({
            a: getPetAvatarSrc(pet == null ? void 0 : pet.avatarUrl),
            b: common_vendor.t((pet == null ? void 0 : pet.name) || "我的宠物"),
            c: common_vendor.t(getPetMeta(pet)),
            d: getPetTags(pet).length
          }, getPetTags(pet).length ? {
            e: common_vendor.f(getPetTags(pet), (tag, i, i1) => {
              return {
                a: common_vendor.t(tag),
                b: i
              };
            })
          } : {}, {
            f: pet.id,
            g: common_vendor.o(($event) => goPetDetail(pet), pet.id)
          });
        })
      } : {
        o: common_assets._imports_0$1,
        p: common_vendor.o(goAddPet)
      }, {
        m: hasPet.value && pets.value.length > 1,
        q: homeReminders.value.length === 0
      }, homeReminders.value.length === 0 ? {} : {
        r: common_vendor.f(homeReminders.value, (r, k0, i0) => {
          return {
            a: common_vendor.t(r.title),
            b: r.id
          };
        })
      }, {
        s: common_assets._imports_2$1,
        t: common_vendor.o(($event) => goToRecord("calendar")),
        v: common_assets._imports_3,
        w: common_vendor.o(($event) => goToRecord("stats")),
        x: common_vendor.t(((_d = dailyScience.value) == null ? void 0 : _d.title) ? `【${dailyScience.value.title}】` : "【今日小知识】"),
        y: common_vendor.t(((_e = dailyScience.value) == null ? void 0 : _e.content) || "每日为你推荐一条宠物健康小知识～"),
        z: common_assets._imports_4,
        A: common_assets._imports_5,
        B: common_vendor.o(goScienceDetail)
      });
    };
  }
});
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
