"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _component_login = common_vendor.resolveComponent("login");
  _component_login();
}
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const agreed = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const modal = common_vendor.ref({
      title: "完善用户信息",
      content: "授权登录后，开始使用完整功能"
    });
    const login_show = common_vendor.ref(false);
    common_vendor.onMounted(async () => {
      const savedAgreed = common_vendor.index.getStorageSync("agreed");
      agreed.value = savedAgreed || false;
      try {
        const local = utils_auth.checkLogin();
        if (local.token) {
          if (!utils_auth.isTokenValid(local.token)) {
          }
          await utils_api.api.getProfile();
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }
      } catch (_e) {
      }
    });
    function toggleAgree() {
      agreed.value = !agreed.value;
      common_vendor.index.setStorageSync("agreed", agreed.value);
    }
    async function handleWeChatLogin() {
      if (!agreed.value) {
        common_vendor.index.showToast({
          title: "请先同意用户协议",
          icon: "none"
        });
        return;
      }
      const basicUserInfo = common_vendor.index.getStorageSync("basicUserInfo");
      const existingUserInfo = common_vendor.index.getStorageSync("userInfo");
      const userInfoToCheck = basicUserInfo || existingUserInfo;
      const hasCompleteInfo = userInfoToCheck && userInfoToCheck.nickname && userInfoToCheck.avatarUrl;
      if (hasCompleteInfo) {
        loading.value = true;
        try {
          const result = await utils_api.api.login({
            code: `silent_login_${Date.now()}`,
            nickname: userInfoToCheck.nickname,
            avatarUrl: userInfoToCheck.avatarUrl
          });
          if (result.token) {
            common_vendor.index.setStorageSync("token", result.token);
            common_vendor.index.setStorageSync("userInfo", result.user);
            common_vendor.index.removeStorageSync("basicUserInfo");
          }
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/index/index" });
          }, 1500);
        } catch (error) {
          login_show.value = true;
          common_vendor.index.showToast({
            title: "登录失败，请重新选择",
            icon: "none"
          });
        } finally {
          loading.value = false;
        }
      } else {
        login_show.value = true;
      }
    }
    async function loginSuccess(e) {
      login_show.value = false;
      loading.value = true;
      try {
        let nickname = "";
        let avatarUrl = "";
        if (e.target && e.target.res) {
          nickname = e.target.res.nickName || "";
          avatarUrl = e.target.res.avatarUrl || "";
        }
        const result = await utils_api.api.login({
          code: `plugin_login_${Date.now()}`,
          // 插件登录用特殊的 code
          nickname,
          avatarUrl
        });
        if (result.token) {
          common_vendor.index.setStorageSync("token", result.token);
        }
        if (result.user) {
          common_vendor.index.setStorageSync("userInfo", result.user);
          common_vendor.index.removeStorageSync("basicUserInfo");
        }
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } catch (error) {
        common_vendor.index.showToast({
          title: "登录失败",
          icon: "error"
        });
      } finally {
        loading.value = false;
      }
    }
    function loginFail(e) {
      login_show.value = false;
      common_vendor.index.showToast({
        title: "登录失败",
        icon: "error"
      });
    }
    function loginCancel(e) {
      login_show.value = false;
    }
    function openAgreement() {
      common_vendor.index.showModal({
        title: "用户协议",
        content: "这里是用户协议的内容...",
        showCancel: false
      });
    }
    function openPrivacy() {
      common_vendor.index.showModal({
        title: "隐私政策",
        content: "这里是隐私政策的内容...",
        showCancel: false
      });
    }
    return (_ctx, _cache) => {
      return {
        a: modal.value,
        b: common_vendor.o(loginSuccess),
        c: common_vendor.o(loginFail),
        d: common_vendor.o(loginCancel),
        e: login_show.value,
        f: common_assets._imports_0,
        g: common_assets._imports_1,
        h: common_vendor.t(loading.value ? "登录中..." : "微信登录"),
        i: loading.value,
        j: common_vendor.o(handleWeChatLogin),
        k: agreed.value ? 1 : "",
        l: common_vendor.o(openAgreement),
        m: common_vendor.o(openPrivacy),
        n: common_vendor.o(toggleAgree)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
