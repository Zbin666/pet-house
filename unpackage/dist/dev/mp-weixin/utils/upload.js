"use strict";
const common_vendor = require("../common/vendor.js");
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
exports.compressImage = compressImage;
exports.uploadImage = uploadImage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/upload.js.map
