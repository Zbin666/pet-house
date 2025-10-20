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
    const isQuestion = common_vendor.ref(false);
    const questionTitle = common_vendor.ref("");
    const isUrgent = common_vendor.ref(false);
    async function publish() {
      if (isQuestion.value) {
        if (!questionTitle.value.trim() || !content.value.trim()) {
          common_vendor.index.showToast({ title: "请输入问题标题和内容", icon: "none" });
          return;
        }
        try {
          const payload = {
            title: questionTitle.value.trim(),
            content: content.value.trim(),
            isUrgent: isUrgent.value,
            tags: topics.value,
            petId: currentPet.value.id
          };
          await utils_api.api.createQuestion(payload);
          common_vendor.index.showToast({ title: "问题发布成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
            try {
              common_vendor.index.$emit("questions:refresh");
            } catch (e) {
            }
          }, 800);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/createCommunity/createCommunity.vue:162", "发布问答失败:", e);
          common_vendor.index.showToast({
            title: e.message || "发布失败，请检查网络连接",
            icon: "none",
            duration: 3e3
          });
        }
      } else {
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
          common_vendor.index.__f__("error", "at pages/createCommunity/createCommunity.vue:190", "发布动态失败:", e);
          common_vendor.index.showToast({
            title: e.message || "发布失败，请检查网络连接",
            icon: "none",
            duration: 3e3
          });
        }
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
        common_vendor.index.__f__("warn", "at pages/createCommunity/createCommunity.vue:239", "Failed to load user/pet info:", e);
      }
    }
    common_vendor.onMounted(() => {
      loadUserAndPet();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.n(!isQuestion.value ? "active" : ""),
        b: common_vendor.o(($event) => isQuestion.value = false),
        c: common_vendor.n(isQuestion.value ? "active" : ""),
        d: common_vendor.o(($event) => isQuestion.value = true),
        e: userInfo.value.avatarUrl || "/static/logo.png",
        f: common_vendor.t(userInfo.value.nickname || "用户"),
        g: common_vendor.t(currentPet.value.name || "未设置宠物"),
        h: common_vendor.t(currentPet.value.breed ? "｜" + currentPet.value.breed : ""),
        i: isQuestion.value
      }, isQuestion.value ? {
        j: questionTitle.value,
        k: common_vendor.o(($event) => questionTitle.value = $event.detail.value),
        l: common_vendor.t(questionTitle.value.length)
      } : {}, {
        m: isQuestion.value ? "详细描述你的问题..." : "分享你的宠物日常...",
        n: content.value,
        o: common_vendor.o(($event) => content.value = $event.detail.value),
        p: common_vendor.t(content.value.length),
        q: !isQuestion.value
      }, !isQuestion.value ? common_vendor.e({
        r: common_vendor.f(images.value, (image, index, i0) => {
          return {
            a: image,
            b: common_vendor.o(($event) => removeImage(index), index),
            c: index
          };
        }),
        s: images.value.length < 9
      }, images.value.length < 9 ? {
        t: common_vendor.o(chooseImage)
      } : {}) : {}, {
        v: topics.value.length > 0
      }, topics.value.length > 0 ? {
        w: common_vendor.f(topics.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: common_vendor.o(($event) => removeTopic(index), index),
            c: index
          };
        })
      } : {}, {
        x: common_vendor.o(addTopic),
        y: currentTopic.value,
        z: common_vendor.o(($event) => currentTopic.value = $event.detail.value),
        A: isQuestion.value
      }, isQuestion.value ? common_vendor.e({
        B: isUrgent.value
      }, isUrgent.value ? {} : {}, {
        C: common_vendor.n(isUrgent.value ? "checked" : ""),
        D: common_vendor.o(($event) => isUrgent.value = !isUrgent.value)
      }) : {}, {
        E: common_vendor.t(isQuestion.value ? "发布问题" : "发布"),
        F: common_vendor.o(publish)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d3a0ca1a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createCommunity/createCommunity.js.map
