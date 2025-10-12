"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "questionDetail",
  setup(__props) {
    var _a, _b;
    const dynamicTopPadding = common_vendor.ref("");
    common_vendor.onMounted(() => {
      try {
        const info = common_vendor.index.getSystemInfoSync();
        const statusBar = info.statusBarHeight || 0;
        const screenW = info.screenWidth || 375;
        const rpxToPx = (rpx) => rpx * screenW / 750;
        const topPx = 15;
        dynamicTopPadding.value = `padding-top:${topPx}px;`;
      } catch (e) {
        dynamicTopPadding.value = "";
      }
    });
    const qa = common_vendor.reactive({
      id: "",
      title: "问题标题",
      content: "",
      isUrgent: false,
      hasAnswer: false,
      doctor: null,
      answerPreview: "",
      answerCount: 0,
      readCount: 0,
      time: "",
      user: {
        id: "",
        nickname: "",
        avatarUrl: ""
      },
      pet: null,
      answers: [],
      isOwner: false
    });
    const currentAnswer = common_vendor.ref("");
    const isSubmitting = common_vendor.ref(false);
    async function loadQuestionDetail(questionId) {
      try {
        const data = await utils_api.api.getQuestion(questionId);
        let time = "刚刚";
        if (data.createdAt) {
          const created = new Date(data.createdAt);
          const month = created.getUTCMonth() + 1;
          const date = created.getUTCDate();
          const hours = created.getUTCHours().toString().padStart(2, "0");
          const minutes = created.getUTCMinutes().toString().padStart(2, "0");
          time = `${month}/${date} ${hours}:${minutes}`;
        }
        const processedAnswers = data.answers.map((answer) => {
          let answerTime = "刚刚";
          if (answer.createdAt) {
            const created = new Date(answer.createdAt);
            const month = created.getUTCMonth() + 1;
            const date = created.getUTCDate();
            const hours = created.getUTCHours().toString().padStart(2, "0");
            const minutes = created.getUTCMinutes().toString().padStart(2, "0");
            answerTime = `${month}/${date} ${hours}:${minutes}`;
          }
          return {
            ...answer,
            time: answerTime
          };
        });
        Object.assign(qa, {
          ...data,
          time,
          answers: processedAnswers
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:205", "加载问答详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    }
    async function submitAnswer() {
      if (!currentAnswer.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入回答内容",
          icon: "none"
        });
        return;
      }
      if (isSubmitting.value)
        return;
      try {
        isSubmitting.value = true;
        await utils_api.api.createAnswer(qa.id, {
          content: currentAnswer.value.trim()
        });
        common_vendor.index.showToast({
          title: "回答成功",
          icon: "success"
        });
        currentAnswer.value = "";
        await loadQuestionDetail(qa.id);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:244", "提交回答失败:", error);
        common_vendor.index.showToast({
          title: "提交失败",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    }
    async function likeAnswer(answer) {
      try {
        const result = await utils_api.api.likeAnswer(answer.id);
        if (result) {
          answer.likes = result.likes;
          answer.isLiked = result.isLiked;
          common_vendor.index.showToast({
            title: answer.isLiked ? "已点赞" : "已取消点赞",
            icon: "none",
            duration: 1e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:270", "点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    try {
      const ec = (_b = (_a = getCurrentPages().pop()) == null ? void 0 : _a.getOpenerEventChannel) == null ? void 0 : _b.call(_a);
      ec && ec.on("qa", (data) => {
        Object.assign(qa, data);
        if (data.id) {
          loadQuestionDetail(data.id);
        }
      });
    } catch (e) {
    }
    common_vendor.onLoad(() => {
      try {
        common_vendor.index.setNavigationBarTitle({ title: "问答详情" });
        common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      } catch (e) {
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: qa.isUrgent
      }, qa.isUrgent ? {} : {}, {
        b: common_vendor.t(qa.title),
        c: common_vendor.t(qa.content),
        d: common_vendor.t(qa.time),
        e: common_vendor.t(qa.answerCount),
        f: common_vendor.t(qa.readCount),
        g: common_vendor.f(qa.answers, (answer, k0, i0) => {
          return common_vendor.e({
            a: answer.user.avatarUrl || "/static/logo.png",
            b: common_vendor.t(answer.user.nickname),
            c: answer.pet
          }, answer.pet ? {
            d: common_vendor.t(answer.pet.name),
            e: common_vendor.t(answer.pet.breed)
          } : {}, {
            f: answer.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            g: common_vendor.t(answer.likes),
            h: common_vendor.o(($event) => likeAnswer(answer), answer.id),
            i: common_vendor.t(answer.time),
            j: common_vendor.t(answer.content),
            k: answer.id
          });
        }),
        h: qa.answers.length === 0
      }, qa.answers.length === 0 ? {} : {}, {
        i: isSubmitting.value,
        j: currentAnswer.value,
        k: common_vendor.o(($event) => currentAnswer.value = $event.detail.value),
        l: common_vendor.t(isSubmitting.value ? "提交中..." : "提交"),
        m: common_vendor.o(submitAnswer),
        n: isSubmitting.value || !currentAnswer.value.trim(),
        o: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f887a9d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionDetail/questionDetail.js.map
