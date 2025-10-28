"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_wechatAuthNew = require("../../utils/wechatAuthNew.js");
const utils_auth = require("../../utils/auth.js");
const utils_store = require("../../utils/store.js");
const utils_api = require("../../utils/api.js");
if (!Array) {
  const _component_login = common_vendor.resolveComponent("login");
  _component_login();
}
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const agreed = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const showTestInfo = common_vendor.ref(false);
    const isLoggedIn = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const token = common_vendor.ref(null);
    const modal = common_vendor.ref({
      title: "完善用户信息",
      content: "授权登录后，开始使用完整功能"
    });
    const login_show = common_vendor.ref(false);
    common_vendor.onMounted(async () => {
      const state = utils_store.initState();
      isLoggedIn.value = state.isLoggedIn;
      userInfo.value = state.userInfo;
      token.value = state.token;
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
    function toggleTestInfo() {
      showTestInfo.value = !showTestInfo.value;
    }
    async function testWeChatLogin() {
      loading.value = true;
      try {
        await utils_wechatAuthNew.wechatLogin();
        common_vendor.index.showToast({ title: "微信登录成功", icon: "success" });
        const state = utils_store.initState();
        isLoggedIn.value = state.isLoggedIn;
        userInfo.value = state.userInfo;
        token.value = state.token;
      } catch (error) {
        common_vendor.index.showToast({ title: "微信登录失败", icon: "error" });
        common_vendor.index.__f__("error", "at pages/login/login.vue:133", "微信登录失败:", error);
      } finally {
        loading.value = false;
      }
    }
    async function testPhoneLogin() {
      loading.value = true;
      try {
        await utils_auth.loginWithPhone();
        common_vendor.index.showToast({ title: "手机登录成功", icon: "success" });
        const state = utils_store.initState();
        isLoggedIn.value = state.isLoggedIn;
        userInfo.value = state.userInfo;
        token.value = state.token;
      } catch (error) {
        common_vendor.index.showToast({ title: "手机登录失败", icon: "error" });
        common_vendor.index.__f__("error", "at pages/login/login.vue:151", "手机登录失败:", error);
      } finally {
        loading.value = false;
      }
    }
    function testLogout() {
      utils_store.handleLogout();
      isLoggedIn.value = false;
      userInfo.value = null;
      token.value = null;
      common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
    }
    async function testAPI() {
      loading.value = true;
      try {
        const result = await utils_api.api.getProfile();
        common_vendor.index.showToast({ title: "API测试成功", icon: "success" });
        common_vendor.index.__f__("log", "at pages/login/login.vue:170", "API响应:", result);
      } catch (error) {
        common_vendor.index.showToast({ title: "API测试失败", icon: "error" });
        common_vendor.index.__f__("error", "at pages/login/login.vue:173", "API测试失败:", error);
      } finally {
        loading.value = false;
      }
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
    async function handlePhoneLogin() {
      if (!agreed.value) {
        common_vendor.index.showToast({
          title: "请先同意用户协议",
          icon: "none"
        });
        return;
      }
      loading.value = true;
      try {
        await utils_auth.loginWithPhone();
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:355", "手机号登录失败:", error);
        common_vendor.index.showToast({
          title: error.message || "登录失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
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
      return common_vendor.e({
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
        k: common_assets._imports_2,
        l: common_vendor.t(loading.value ? "登录中..." : "手机号登录"),
        m: loading.value,
        n: common_vendor.o(handlePhoneLogin),
        o: agreed.value ? 1 : "",
        p: common_vendor.o(openAgreement),
        q: common_vendor.o(openPrivacy),
        r: common_vendor.o(toggleAgree),
        s: showTestInfo.value
      }, showTestInfo.value ? {
        t: common_vendor.t(isLoggedIn.value ? "已登录" : "未登录"),
        v: common_vendor.t(userInfo.value ? JSON.stringify(userInfo.value) : "无"),
        w: common_vendor.t(token.value ? "有" : "无"),
        x: common_vendor.t(agreed.value ? "是" : "否")
      } : {}, {
        y: showTestInfo.value
      }, showTestInfo.value ? {
        z: common_vendor.o(testWeChatLogin),
        A: loading.value,
        B: common_vendor.o(testPhoneLogin),
        C: loading.value,
        D: common_vendor.o(testLogout),
        E: loading.value,
        F: common_vendor.o(testAPI),
        G: loading.value
      } : {}, {
        H: common_vendor.t(showTestInfo.value ? "隐藏测试" : "显示测试"),
        I: common_vendor.o(toggleTestInfo)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
