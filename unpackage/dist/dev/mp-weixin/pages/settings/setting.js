"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = /* @__PURE__ */ Object.assign({ name: "SettingsIndex" }, {
  __name: "setting",
  setup(__props) {
    const userInfo = common_vendor.ref({
      name: "宠物爱好者",
      desc: "热爱小动物的铲屎官",
      phone: "138****8888",
      email: "user@example.com",
      avatar: "/static/user/user.png",
      registerTime: "2024年1月1日"
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
    common_vendor.onLoad(() => {
      common_vendor.index.setNavigationBarTitle({ title: "个人设置" });
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      try {
        const keys = common_vendor.index.getStorageInfoSync().keys || [];
        cacheSize.value = `${keys.length} 项`;
      } catch (e) {
        cacheSize.value = "—";
      }
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
    function saveEdit() {
      userInfo.value = {
        ...userInfo.value,
        name: form.name,
        desc: form.desc,
        phone: form.phone,
        email: form.email,
        avatar: form.avatar || userInfo.value.avatar
      };
      editMode.value = false;
      common_vendor.index.showToast({
        title: "保存成功",
        icon: "success"
      });
    }
    function pickAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          if (editMode.value) {
            form.avatar = res.tempFilePaths[0];
          } else {
            userInfo.value.avatar = res.tempFilePaths[0];
          }
        }
      });
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatar,
        b: common_vendor.o(pickAvatar),
        c: common_vendor.t(userInfo.value.name),
        d: common_vendor.t(userInfo.value.desc),
        e: !editMode.value
      }, !editMode.value ? {
        f: common_assets._imports_0$8,
        g: common_vendor.o(startEdit)
      } : {
        h: common_vendor.o(cancelEdit),
        i: common_vendor.o(saveEdit)
      }, {
        j: !editMode.value
      }, !editMode.value ? {
        k: common_vendor.t(userInfo.value.name)
      } : {
        l: form.name,
        m: common_vendor.o(($event) => form.name = $event.detail.value)
      }, {
        n: !editMode.value
      }, !editMode.value ? {
        o: common_vendor.t(userInfo.value.desc || "暂无简介")
      } : {
        p: form.desc,
        q: common_vendor.o(($event) => form.desc = $event.detail.value)
      }, {
        r: !editMode.value
      }, !editMode.value ? {
        s: common_vendor.t(userInfo.value.phone || "未绑定")
      } : {
        t: form.phone,
        v: common_vendor.o(($event) => form.phone = $event.detail.value)
      }, {
        w: !editMode.value
      }, !editMode.value ? {
        x: common_vendor.t(userInfo.value.email || "未绑定")
      } : {
        y: form.email,
        z: common_vendor.o(($event) => form.email = $event.detail.value)
      }, {
        A: common_vendor.t(userInfo.value.registerTime),
        B: settings.notifications,
        C: common_vendor.o((e) => settings.notifications = e.detail.value),
        D: settings.privacy,
        E: common_vendor.o((e) => settings.privacy = e.detail.value),
        F: common_vendor.t(cacheSize.value),
        G: common_vendor.o(clearCache)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-2d8e7af2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/settings/setting.js.map
