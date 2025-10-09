"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("./api.js");
const checkLogin = () => {
  const token = common_vendor.index.getStorageSync("token");
  const userInfo = common_vendor.index.getStorageSync("userInfo");
  return {
    isLoggedIn: !!token,
    token,
    userInfo
  };
};
const isTokenValid = (token) => {
  if (!token || typeof token !== "string")
    return false;
  const parts = token.split(".");
  if (parts.length !== 3)
    return false;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))));
    if (!payload || !payload.exp)
      return false;
    const nowSec = Math.floor(Date.now() / 1e3);
    return payload.exp > nowSec + 60;
  } catch (_e) {
    return false;
  }
};
const loginWithPhone = () => {
  return new Promise(async (resolve, reject) => {
    const agreed = common_vendor.index.getStorageSync("agreed");
    if (!agreed) {
      common_vendor.index.showToast({ title: "请先同意用户协议", icon: "none" });
      return reject(new Error("请先同意用户协议"));
    }
    try {
      const result = await utils_api.api.login({
        code: `phone_${Date.now()}`,
        nickname: "手机用户",
        avatarUrl: ""
      });
      common_vendor.index.setStorageSync("token", result.token);
      common_vendor.index.setStorageSync("userInfo", result.user);
      resolve(result);
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/auth.js:101", "手机号登录失败:", error);
      reject(error);
    }
  });
};
const logout = () => {
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("userInfo");
  common_vendor.index.removeStorageSync("agreed");
  common_vendor.index.reLaunch({
    url: "/pages/login/login"
  });
};
exports.checkLogin = checkLogin;
exports.isTokenValid = isTokenValid;
exports.loginWithPhone = loginWithPhone;
exports.logout = logout;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
