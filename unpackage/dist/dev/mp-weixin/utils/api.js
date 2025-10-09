"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://10.161.43.37:3000/api";
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    const header = {
      "Content-Type": "application/json"
    };
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
    common_vendor.index.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
const api = {
  // 用户认证
  login: (data) => request({
    url: "/auth/login",
    method: "POST",
    data
  }),
  getProfile: () => request({
    url: "/auth/profile",
    method: "GET"
  }),
  // 用户管理
  updateProfile: (data) => request({
    url: "/users/profile",
    method: "PUT",
    data
  }),
  getSettings: () => request({
    url: "/users/settings",
    method: "GET"
  }),
  updateSettings: (data) => request({
    url: "/users/settings",
    method: "PUT",
    data
  }),
  uploadAvatar: (data) => request({
    url: "/users/avatar",
    method: "POST",
    data
  }),
  // 宠物管理
  getPets: () => request({
    url: "/pets",
    method: "GET"
  }),
  getPet: (id) => request({
    url: `/pets/${id}`,
    method: "GET"
  }),
  createPet: (data) => request({
    url: "/pets",
    method: "POST",
    data
  }),
  updatePet: (id, data) => request({
    url: `/pets/${id}`,
    method: "PUT",
    data
  }),
  deletePet: (id) => request({
    url: `/pets/${id}`,
    method: "DELETE"
  }),
  // 记录管理
  getRecords: (params) => request({
    url: "/records",
    method: "GET",
    data: params
  }),
  getCalendar: (params) => request({
    url: "/records/calendar",
    method: "GET",
    data: params
  }),
  getStats: (params) => request({
    url: "/records/stats",
    method: "GET",
    data: params
  }),
  createRecord: (data) => request({
    url: "/records",
    method: "POST",
    data
  }),
  updateRecord: (id, data) => request({
    url: `/records/${id}`,
    method: "PUT",
    data
  }),
  deleteRecord: (id) => request({
    url: `/records/${id}`,
    method: "DELETE"
  }),
  // 媒体管理
  getUploadPolicy: (data) => request({
    url: "/media/policy",
    method: "POST",
    data
  }),
  completeUpload: (data) => request({
    url: "/media/complete",
    method: "POST",
    data
  }),
  // 社区功能
  getFeeds: (params) => request({
    url: "/feeds",
    method: "GET",
    data: params
  }),
  createFeed: (data) => request({
    url: "/feeds",
    method: "POST",
    data
  }),
  likeFeed: (id) => request({
    url: `/feeds/${id}/like`,
    method: "POST"
  }),
  createComment: (id, data) => request({
    url: `/feeds/${id}/comments`,
    method: "POST",
    data
  }),
  // 问答系统
  getQuestions: (params) => request({
    url: "/questions",
    method: "GET",
    data: params
  }),
  createQuestion: (data) => request({
    url: "/questions",
    method: "POST",
    data
  }),
  createAnswer: (id, data) => request({
    url: `/questions/${id}/answers`,
    method: "POST",
    data
  }),
  // 科普文章
  getArticles: (params) => request({
    url: "/articles",
    method: "GET",
    data: params
  }),
  getArticle: (id) => request({
    url: `/articles/${id}`,
    method: "GET"
  }),
  // 话题管理
  getTopics: (params) => request({
    url: "/topics",
    method: "GET",
    data: params
  }),
  getPopularTopics: () => request({
    url: "/topics/popular",
    method: "GET"
  }),
  createTopic: (data) => request({
    url: "/topics",
    method: "POST",
    data
  }),
  // 媒体管理
  getUploadPolicy: (type) => request({
    url: "/media/policy",
    method: "POST",
    data: { type }
  }),
  completeUpload: (data) => request({
    url: "/media/complete",
    method: "POST",
    data
  }),
  createMedia: (data) => request({
    url: "/media",
    method: "POST",
    data
  }),
  getMedia: (params) => request({
    url: "/media",
    method: "GET",
    data: params
  }),
  deleteMedia: (id) => request({
    url: `/media/${id}`,
    method: "DELETE"
  })
};
exports.api = api;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
