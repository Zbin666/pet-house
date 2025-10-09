"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "createCommunity",
  setup(__props) {
    const content = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const topic = common_vendor.ref("");
    common_vendor.ref("");
    function chooseImage() {
      common_vendor.index.chooseImage({
        count: 9 - images.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          images.value.push(...res.tempFilePaths);
        }
      });
    }
    function removeImage(index) {
      images.value.splice(index, 1);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$9,
        b: content.value,
        c: common_vendor.o(($event) => content.value = $event.detail.value),
        d: common_vendor.t(content.value.length),
        e: common_vendor.f(images.value, (image, index, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => removeImage(index), index),
            c: index
          };
        }),
        f: images.value.length < 9
      }, images.value.length < 9 ? {
        g: common_vendor.o(chooseImage)
      } : {}, {
        h: topic.value,
        i: common_vendor.o(($event) => topic.value = $event.detail.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d3a0ca1a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createCommunity/createCommunity.js.map
