"use strict";
const common_vendor = require("../common/vendor.js");
const utils_api = require("./api.js");
function compressImage(filePath, quality = 0.8) {
  return new Promise((resolve, reject) => {
    common_vendor.index.compressImage({
      src: filePath,
      quality: Math.floor(quality * 100),
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (error) => {
        common_vendor.index.__f__("error", "at utils/upload.js:18", "图片压缩失败:", error);
        reject(error);
      }
    });
  });
}
async function uploadImage(filePath, type = "gallery") {
  try {
    common_vendor.index.__f__("log", "at utils/upload.js:33", "=== 前端图片上传调试信息 ===");
    common_vendor.index.__f__("log", "at utils/upload.js:34", "文件路径:", filePath);
    common_vendor.index.__f__("log", "at utils/upload.js:35", "上传类型:", type);
    common_vendor.index.__f__("log", "at utils/upload.js:36", "上传URL:", "https://pet-api.zbinli.cn/api/media/upload");
    common_vendor.index.__f__("log", "at utils/upload.js:37", "Token:", common_vendor.index.getStorageSync("token"));
    const uploadTask = common_vendor.index.uploadFile({
      url: "https://pet-api.zbinli.cn/api/media/upload",
      filePath,
      name: "file",
      formData: {
        type
      },
      header: {
        "Authorization": `Bearer ${common_vendor.index.getStorageSync("token")}`
      }
    });
    return new Promise((resolve, reject) => {
      uploadTask.then((res) => {
        common_vendor.index.__f__("log", "at utils/upload.js:54", "📤 上传响应:");
        common_vendor.index.__f__("log", "at utils/upload.js:55", "- 状态码:", res.statusCode);
        common_vendor.index.__f__("log", "at utils/upload.js:56", "- 响应头:", res.header);
        common_vendor.index.__f__("log", "at utils/upload.js:57", "- 响应数据:", res.data);
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          common_vendor.index.__f__("log", "at utils/upload.js:61", "📋 解析后的数据:", data);
          if (data.success) {
            const imageUrl = `https://pet-api.zbinli.cn/uploads/${data.filename}`;
            common_vendor.index.__f__("log", "at utils/upload.js:66", "✅ 图片上传成功:");
            common_vendor.index.__f__("log", "at utils/upload.js:67", "- 文件名:", data.filename);
            common_vendor.index.__f__("log", "at utils/upload.js:68", "- 相对URL:", data.url);
            common_vendor.index.__f__("log", "at utils/upload.js:69", "- 完整URL:", imageUrl);
            common_vendor.index.__f__("log", "at utils/upload.js:70", "- 媒体ID:", data.id);
            common_vendor.index.request({
              url: imageUrl,
              method: "HEAD",
              success: (testRes) => {
                common_vendor.index.__f__("log", "at utils/upload.js:77", "🔍 图片URL测试结果:", testRes.statusCode);
              },
              fail: (testErr) => {
                common_vendor.index.__f__("error", "at utils/upload.js:80", "❌ 图片URL测试失败:", testErr);
              }
            });
            resolve(imageUrl);
          } else {
            common_vendor.index.__f__("error", "at utils/upload.js:86", "❌ 上传失败:", data.message);
            reject(new Error(data.message || "上传失败"));
          }
        } else {
          common_vendor.index.__f__("error", "at utils/upload.js:90", "❌ HTTP错误:", res.statusCode);
          reject(new Error(`上传失败: ${res.statusCode}`));
        }
      }).catch((error) => {
        common_vendor.index.__f__("error", "at utils/upload.js:94", "❌ 图片上传异常:", error);
        reject(error);
      });
    });
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/upload.js:99", "❌ 图片上传失败:", error);
    throw error;
  }
}
async function uploadImages(filePaths, type = "gallery", petId = null) {
  try {
    common_vendor.index.showLoading({ title: `上传${filePaths.length}张图片中...` });
    const compressedPaths = await Promise.all(
      filePaths.map((filePath) => compressImage(filePath, 0.7))
    );
    const uploadPromises = compressedPaths.map((filePath) => uploadImage(filePath, type));
    const urls = await Promise.all(uploadPromises);
    if (petId && urls.length > 0) {
      try {
        await utils_api.api.createMedia({
          petId,
          type: "image",
          urls,
          description: "宠物照片"
        });
      } catch (error) {
        common_vendor.index.__f__("warn", "at utils/upload.js:134", "创建媒体记录失败:", error);
      }
    }
    common_vendor.index.hideLoading();
    return urls;
  } catch (error) {
    common_vendor.index.hideLoading();
    throw error;
  }
}
async function pickAndUploadAvatar() {
  try {
    const res = await common_vendor.index.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"]
    });
    const filePath = res.tempFilePaths[0];
    const compressedPath = await compressImage(filePath, 0.8);
    common_vendor.index.showLoading({ title: "上传头像中..." });
    const avatarUrl = await uploadImage(compressedPath, "avatar");
    common_vendor.index.hideLoading();
    common_vendor.index.showToast({ title: "头像上传成功", icon: "success" });
    return avatarUrl;
  } catch (error) {
    common_vendor.index.hideLoading();
    common_vendor.index.__f__("error", "at utils/upload.js:212", "选择头像失败:", error);
    common_vendor.index.showToast({ title: "头像上传失败", icon: "none" });
    throw error;
  }
}
exports.compressImage = compressImage;
exports.pickAndUploadAvatar = pickAndUploadAvatar;
exports.uploadImage = uploadImage;
exports.uploadImages = uploadImages;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/upload.js.map
