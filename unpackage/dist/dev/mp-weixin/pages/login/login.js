"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_wechatAuthNew = require("../../utils/wechatAuthNew.js");
const utils_auth = require("../../utils/auth.js");
const utils_store = require("../../utils/store.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "login",
  setup(__props) {
    const agreed = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const showTestInfo = common_vendor.ref(false);
    const isLoggedIn = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const token = common_vendor.ref(null);
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
        common_vendor.index.__f__("error", "at pages/login/login.vue:120", "微信登录失败:", error);
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
        common_vendor.index.__f__("error", "at pages/login/login.vue:138", "手机登录失败:", error);
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
        common_vendor.index.__f__("log", "at pages/login/login.vue:157", "API响应:", result);
      } catch (error) {
        common_vendor.index.showToast({ title: "API测试失败", icon: "error" });
        common_vendor.index.__f__("error", "at pages/login/login.vue:160", "API测试失败:", error);
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
      loading.value = true;
      try {
        await utils_wechatAuthNew.wechatLogin();
        common_vendor.index.showToast({
          title: "登录成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:191", "微信登录失败:", error);
        common_vendor.index.showToast({
          title: error.message || "登录失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
      }
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
        common_vendor.index.__f__("error", "at pages/login/login.vue:224", "手机号登录失败:", error);
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
        a: common_assets._imports_0,
        b: common_assets._imports_1,
        c: common_vendor.t(loading.value ? "登录中..." : "微信登录"),
        d: loading.value,
        e: common_vendor.o(handleWeChatLogin),
        f: common_assets._imports_2,
        g: common_vendor.t(loading.value ? "登录中..." : "手机号登录"),
        h: loading.value,
        i: common_vendor.o(handlePhoneLogin),
        j: agreed.value ? 1 : "",
        k: common_vendor.o(openAgreement),
        l: common_vendor.o(openPrivacy),
        m: common_vendor.o(toggleAgree),
        n: showTestInfo.value
      }, showTestInfo.value ? {
        o: common_vendor.t(isLoggedIn.value ? "已登录" : "未登录"),
        p: common_vendor.t(userInfo.value ? JSON.stringify(userInfo.value) : "无"),
        q: common_vendor.t(token.value ? "有" : "无"),
        r: common_vendor.t(agreed.value ? "是" : "否")
      } : {}, {
        s: showTestInfo.value
      }, showTestInfo.value ? {
        t: common_vendor.o(testWeChatLogin),
        v: loading.value,
        w: common_vendor.o(testPhoneLogin),
        x: loading.value,
        y: common_vendor.o(testLogout),
        z: loading.value,
        A: common_vendor.o(testAPI),
        B: loading.value
      } : {}, {
        C: common_vendor.t(showTestInfo.value ? "隐藏测试" : "显示测试"),
        D: common_vendor.o(toggleTestInfo)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
