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
    common_vendor.index.getUserProfile({
      desc: "用于完善用户资料",
      success: async (userRes) => {
        try {
          common_vendor.index.__f__("log", "at utils/wechatAuthNew.js:25", "获取用户授权信息成功:", userRes);
          common_vendor.index.login({
            provider: "weixin",
            success: async (loginRes) => {
              try {
                common_vendor.index.__f__("log", "at utils/wechatAuthNew.js:32", "微信登录凭证获取成功:", loginRes);
                const result = await utils_api.api.login({
                  code: loginRes.code,
                  nickname: userRes.userInfo.nickName,
                  avatarUrl: userRes.userInfo.avatarUrl
                });
                common_vendor.index.setStorageSync("token", result.token);
                common_vendor.index.setStorageSync("userInfo", result.user);
                common_vendor.index.__f__("log", "at utils/wechatAuthNew.js:45", "微信登录成功:", result);
                resolve(result);
              } catch (error) {
                common_vendor.index.__f__("error", "at utils/wechatAuthNew.js:48", "后端登录失败:", error);
                reject(error);
              }
            },
            fail: (error) => {
              common_vendor.index.__f__("error", "at utils/wechatAuthNew.js:53", "获取微信登录凭证失败:", error);
              reject(error);
            }
          });
        } catch (error) {
          common_vendor.index.__f__("error", "at utils/wechatAuthNew.js:58", "处理用户信息失败:", error);
          reject(error);
        }
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at utils/wechatAuthNew.js:63", "获取用户授权信息失败:", error);
        if (error.errMsg && error.errMsg.includes("deny")) {
          common_vendor.index.showToast({
            title: "需要授权才能登录",
            icon: "none"
          });
        }
        reject(error);
      }
    });
  });
};
exports.wechatLogin = wechatLogin;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/wechatAuthNew.js.map
