"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const utils_upload = require("../../utils/upload.js");
const _sfc_main = /* @__PURE__ */ Object.assign({ name: "SettingsIndex" }, {
  __name: "setting",
  setup(__props) {
    const avatarCache = /* @__PURE__ */ new Map();
    const userInfo = common_vendor.ref({
      id: "",
      name: "",
      desc: "",
      // 映射到用户设置中的 bio
      phone: "",
      email: "",
      avatar: "/static/user/user.png",
      registerTime: ""
    });
    const editMode = common_vendor.ref(false);
    const form = common_vendor.reactive({
      name: "",
      desc: "",
      phone: "",
      email: "",
      avatar: ""
    });
    const settings = common_vendor.reactive({
      notifications: true,
      privacy: false
    });
    const cacheSize = common_vendor.ref("—");
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
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            avatarCache.set(normalized, res.tempFilePath);
            userInfo.value = { ...userInfo.value || {} };
          } else {
            avatarCache.set(normalized, "/static/user/user.png");
            userInfo.value = { ...userInfo.value || {} };
          }
        },
        fail: () => {
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
    common_vendor.onLoad(() => {
      common_vendor.index.setNavigationBarTitle({ title: "个人设置" });
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      try {
        const keys = common_vendor.index.getStorageInfoSync().keys || [];
        cacheSize.value = `${keys.length} 项`;
      } catch (e) {
        cacheSize.value = "—";
      }
      loadProfileAndSettings();
    });
    function startEdit() {
      editMode.value = true;
      Object.assign(form, {
        name: userInfo.value.name,
        desc: userInfo.value.desc,
        phone: userInfo.value.phone,
        email: userInfo.value.email,
        avatar: userInfo.value.avatar
      });
    }
    function cancelEdit() {
      editMode.value = false;
    }
    async function saveEdit() {
      try {
        const profilePayload = {
          nickname: form.name,
          email: form.email,
          phone: form.phone,
          bio: form.desc,
          avatarUrl: form.avatar && form.avatar.startsWith("http") ? form.avatar : void 0
        };
        Object.keys(profilePayload).forEach((k) => profilePayload[k] === void 0 && delete profilePayload[k]);
        await utils_api.api.updateProfile(profilePayload);
        userInfo.value = {
          ...userInfo.value,
          name: form.name,
          desc: form.desc,
          phone: form.phone,
          email: form.email,
          avatar: form.avatar || userInfo.value.avatar
        };
        editMode.value = false;
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      }
    }
    async function pickAvatar() {
      try {
        const url = await utils_upload.pickAndUploadAvatar();
        await utils_api.api.updateProfile({ avatarUrl: url });
        if (editMode.value) {
          form.avatar = url;
        }
        userInfo.value.avatar = url;
        userInfo.value.avatarUrl = url;
        common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "头像更新失败", icon: "none" });
      }
    }
    function clearCache() {
      common_vendor.index.showModal({
        title: "确认清除",
        content: "确定要清除所有缓存吗？",
        success: (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.clearStorageSync();
              cacheSize.value = "0 项";
              common_vendor.index.showToast({ title: "已清除", icon: "success" });
            } catch (e) {
            }
          }
        }
      });
    }
    function formatRegisterTime(iso) {
      if (!iso)
        return "";
      try {
        const d = new Date(iso);
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        return `${y}-${m}-${day}`;
      } catch (_) {
        return "";
      }
    }
    async function loadProfileAndSettings() {
      try {
        const [profile, userSettings] = await Promise.all([
          utils_api.api.getProfile(),
          utils_api.api.getSettings().catch(() => ({}))
        ]);
        userInfo.value = {
          id: (profile == null ? void 0 : profile.id) || "",
          name: (profile == null ? void 0 : profile.nickname) || "新用户",
          desc: (profile == null ? void 0 : profile.bio) || "",
          phone: (profile == null ? void 0 : profile.phone) || "",
          email: (profile == null ? void 0 : profile.email) || "",
          avatar: (profile == null ? void 0 : profile.avatarUrl) || "/static/user/user.png",
          registerTime: formatRegisterTime(profile == null ? void 0 : profile.createdAt)
        };
      } catch (e) {
        userInfo.value = {
          id: "",
          name: "新用户",
          desc: "",
          phone: "",
          email: "",
          avatar: "/static/user/user.png",
          registerTime: ""
        };
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: getUserAvatarSrc(userInfo.value.avatar),
        b: common_vendor.o(onAvatarError),
        c: common_vendor.o(onAvatarLoad),
        d: common_vendor.o(pickAvatar),
        e: common_vendor.t(userInfo.value.name),
        f: common_vendor.t(userInfo.value.desc),
        g: !editMode.value
      }, !editMode.value ? {
        h: common_assets._imports_0$9,
        i: common_vendor.o(startEdit)
      } : {
        j: common_vendor.o(cancelEdit),
        k: common_vendor.o(saveEdit)
      }, {
        l: !editMode.value
      }, !editMode.value ? {
        m: common_vendor.t(userInfo.value.name)
      } : {
        n: form.name,
        o: common_vendor.o(($event) => form.name = $event.detail.value)
      }, {
        p: !editMode.value
      }, !editMode.value ? {
        q: common_vendor.t(userInfo.value.desc || "暂无简介")
      } : {
        r: form.desc,
        s: common_vendor.o(($event) => form.desc = $event.detail.value)
      }, {
        t: !editMode.value
      }, !editMode.value ? {
        v: common_vendor.t(userInfo.value.phone || "未绑定")
      } : {
        w: form.phone,
        x: common_vendor.o(($event) => form.phone = $event.detail.value)
      }, {
        y: !editMode.value
      }, !editMode.value ? {
        z: common_vendor.t(userInfo.value.email || "未绑定")
      } : {
        A: form.email,
        B: common_vendor.o(($event) => form.email = $event.detail.value)
      }, {
        C: common_vendor.t(userInfo.value.registerTime),
        D: settings.notifications,
        E: common_vendor.o((e) => settings.notifications = e.detail.value),
        F: settings.privacy,
        G: common_vendor.o((e) => settings.privacy = e.detail.value),
        H: common_vendor.t(cacheSize.value),
        I: common_vendor.o(clearCache)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2d8e7af2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/setting.js.map
