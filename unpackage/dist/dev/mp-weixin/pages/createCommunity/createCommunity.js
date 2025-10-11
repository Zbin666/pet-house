"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "createCommunity",
  setup(__props) {
    const content = common_vendor.ref("");
    const images = common_vendor.ref([]);
    const topics = common_vendor.ref([]);
    const currentTopic = common_vendor.ref("");
    common_vendor.ref("");
    const userInfo = common_vendor.ref({});
    const currentPet = common_vendor.ref({});
    async function publish() {
      if (!content.value.trim() && images.value.length === 0) {
        common_vendor.index.showToast({ title: "请输入内容或添加图片", icon: "none" });
        return;
      }
      try {
        const payload = {
          text: content.value.trim(),
          images: images.value,
          tags: topics.value,
          petId: currentPet.value.id
        };
        await utils_api.api.createFeed(payload);
        common_vendor.index.showToast({ title: "发布成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
          try {
            common_vendor.index.$emit("feeds:refresh");
          } catch (e) {
          }
        }, 800);
      } catch (e) {
        common_vendor.index.showToast({ title: "发布失败", icon: "none" });
      }
    }
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
    function addTopic() {
      const topic = currentTopic.value.trim().replace(/^#+/, "");
      if (topic && !topics.value.includes(topic)) {
        topics.value.push(topic);
        currentTopic.value = "";
      }
    }
    function removeTopic(index) {
      topics.value.splice(index, 1);
    }
    async function loadUserAndPet() {
      try {
        const user = await utils_api.api.getProfile();
        userInfo.value = user;
        const pets = await utils_api.api.getPets();
        if (pets && pets.length > 0) {
          currentPet.value = pets[0];
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/createCommunity/createCommunity.vue:163", "Failed to load user/pet info:", e);
      }
    }
    common_vendor.onMounted(() => {
      loadUserAndPet();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: userInfo.value.avatarUrl || "/static/logo.png",
        b: common_vendor.t(userInfo.value.nickname || "用户"),
        c: common_vendor.t(currentPet.value.name || "未设置宠物"),
        d: common_vendor.t(currentPet.value.breed ? "｜" + currentPet.value.breed : ""),
        e: content.value,
        f: common_vendor.o(($event) => content.value = $event.detail.value),
        g: common_vendor.t(content.value.length),
        h: common_vendor.f(images.value, (image, index, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => removeImage(index), index),
            c: index
          };
        }),
        i: images.value.length < 9
      }, images.value.length < 9 ? {
        j: common_vendor.o(chooseImage)
      } : {}, {
        k: topics.value.length > 0
      }, topics.value.length > 0 ? {
        l: common_vendor.f(topics.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTopic(index), index),
            c: index
          };
        })
      } : {}, {
        m: common_vendor.o(addTopic),
        n: currentTopic.value,
        o: common_vendor.o(($event) => currentTopic.value = $event.detail.value),
        p: common_vendor.o(publish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d3a0ca1a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createCommunity/createCommunity.js.map
