"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("./auth.js");
const state = {
  userInfo: null,
  isLoggedIn: false,
  token: null
};
const getState = () => {
  return { ...state };
};
const initState = () => {
  const { isLoggedIn, token, userInfo } = utils_auth.checkLogin();
  state.isLoggedIn = isLoggedIn;
  state.token = token;
  state.userInfo = userInfo;
  return getState();
};
const clearState = () => {
  state.userInfo = null;
  state.isLoggedIn = false;
  state.token = null;
};
const handleLogout = () => {
  clearState();
  utils_auth.logout();
};
const checkAuth = () => {
  const { isLoggedIn } = utils_auth.checkLogin();
  if (!isLoggedIn) {
    common_vendor.index.showModal({
      title: "提示",
      content: "请先登录",
      showCancel: false,
      success: () => {
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
      }
    });
    return false;
  }
  return true;
};
exports.checkAuth = checkAuth;
exports.handleLogout = handleLogout;
exports.initState = initState;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/store.js.map
