"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("./api.js");
const wechatLogin = () => {
  return new Promise((resolve, reject) => {
    const agreed = common_vendor.index.getStorageSync("agreed");
    if (!agreed) {
      common_vendor.index.showToast({
        title: "请先同意用户协议",
        icon: "none"
      });
      return reject(new Error("请先同意用户协议"));
    }
    common_vendor.index.login({
      provider: "weixin",
      success: async (loginRes) => {
        try {
          common_vendor.index.__f__("log", "at utils/wechatAuthNew.js:26", "微信登录凭证获取成功:", loginRes);
          const result = await utils_api.api.login({
            code: loginRes.code,
            nickname: "微信用户",
            // 默认昵称，用户可在设置中修改
            avatarUrl: ""
            // 默认头像，用户可在设置中上传
          });
          common_vendor.index.setStorageSync("token", result.token);
          common_vendor.index.setStorageSync("userInfo", result.user);
          common_vendor.index.__f__("log", "at utils/wechatAuthNew.js:39", "微信登录成功:", result);
          resolve(result);
        } catch (error) {
          common_vendor.index.__f__("error", "at utils/wechatAuthNew.js:42", "后端登录失败:", error);
          reject(error);
        }
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at utils/wechatAuthNew.js:47", "获取微信登录凭证失败:", error);
        reject(error);
      }
    });
  });
};
exports.wechatLogin = wechatLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/wechatAuthNew.js.map
