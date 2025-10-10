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
    common_vendor.index.__f__("log", "at utils/upload.js:35", "开发环境：使用本地文件路径作为图片URL");
    return filePath;
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/upload.js:55", "图片上传失败:", error);
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
        common_vendor.index.__f__("warn", "at utils/upload.js:90", "创建媒体记录失败:", error);
      }
    }
    common_vendor.index.hideLoading();
    return urls;
  } catch (error) {
    common_vendor.index.hideLoading();
    throw error;
  }
}
exports.compressImage = compressImage;
exports.uploadImage = uploadImage;
exports.uploadImages = uploadImages;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/upload.js.map
