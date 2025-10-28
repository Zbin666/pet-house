"use strict";
const common_vendor = require("../common/vendor.js");
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
const logout = () => {
  const userInfo = common_vendor.index.getStorageSync("userInfo");
  const basicUserInfo = userInfo ? {
    nickname: userInfo.nickname,
    avatarUrl: userInfo.avatarUrl
  } : null;
  common_vendor.index.removeStorageSync("token");
  common_vendor.index.removeStorageSync("userInfo");
  common_vendor.index.removeStorageSync("agreed");
  if (basicUserInfo && basicUserInfo.nickname && basicUserInfo.avatarUrl) {
    common_vendor.index.setStorageSync("basicUserInfo", basicUserInfo);
  }
  common_vendor.index.reLaunch({
    url: "/pages/login/login"
  });
};
exports.checkLogin = checkLogin;
exports.isTokenValid = isTokenValid;
exports.logout = logout;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
