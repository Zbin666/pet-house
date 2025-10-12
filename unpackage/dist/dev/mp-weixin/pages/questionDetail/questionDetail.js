"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "questionDetail",
  setup(__props) {
    var _a, _b;
    const dynamicTopPadding = common_vendor.ref("");
    common_vendor.onMounted(async () => {
      try {
        const info = common_vendor.index.getSystemInfoSync();
        const statusBar = info.statusBarHeight || 0;
        const screenW = info.screenWidth || 375;
        const rpxToPx = (rpx) => rpx * screenW / 750;
        const topPx = 15;
        dynamicTopPadding.value = `padding-top:${topPx}px;`;
        try {
          const pets = await utils_api.api.getPets();
          const petsList = Array.isArray(pets) ? pets : pets.data || [];
          if (petsList.length > 0) {
            currentUserPet.value = petsList[0];
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:221", "获取宠物信息失败:", e);
        }
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
      followCount: 0,
      time: "",
      user: {
        id: "",
        nickname: "",
        avatarUrl: ""
      },
      pet: null,
      answers: [],
      isOwner: false,
      isFollowed: false
    });
    const currentAnswer = common_vendor.ref("");
    const isSubmitting = common_vendor.ref(false);
    const showCommentInput = common_vendor.ref(false);
    const comments = common_vendor.ref([]);
    const currentComment = common_vendor.ref("");
    const currentReply = common_vendor.ref("");
    const replyingToComment = common_vendor.ref(null);
    const isSubmittingComment = common_vendor.ref(false);
    const isSubmittingReply = common_vendor.ref(false);
    const currentUserPet = common_vendor.ref(null);
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
            const now = /* @__PURE__ */ new Date();
            const timeDiff = now.getTime() - created.getTime();
            const daysDiff = Math.floor(timeDiff / (1e3 * 60 * 60 * 24));
            if (daysDiff === 0) {
              const hours = created.getHours().toString().padStart(2, "0");
              const minutes = created.getMinutes().toString().padStart(2, "0");
              answerTime = `今天 ${hours}:${minutes}`;
            } else if (daysDiff === 1) {
              const hours = created.getHours().toString().padStart(2, "0");
              const minutes = created.getMinutes().toString().padStart(2, "0");
              answerTime = `昨天 ${hours}:${minutes}`;
            } else if (daysDiff < 7) {
              const hours = created.getHours().toString().padStart(2, "0");
              const minutes = created.getMinutes().toString().padStart(2, "0");
              answerTime = `${daysDiff}天前 ${hours}:${minutes}`;
            } else {
              const month = created.getMonth() + 1;
              const date = created.getDate();
              const hours = created.getHours().toString().padStart(2, "0");
              const minutes = created.getMinutes().toString().padStart(2, "0");
              answerTime = `${month}/${date} ${hours}:${minutes}`;
            }
          }
          return {
            ...answer,
            time: answerTime
          };
        });
        Object.assign(qa, {
          ...data,
          time,
          answers: processedAnswers,
          readCount: data.views || 0
          // 确保阅读数正确映射
        });
        await loadComments();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:410", "加载问答详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    }
    async function submitAnswer() {
      var _a2;
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
          content: currentAnswer.value.trim(),
          petId: ((_a2 = qa.pet) == null ? void 0 : _a2.id) || null
        });
        common_vendor.index.showToast({
          title: "回答成功",
          icon: "success"
        });
        currentAnswer.value = "";
        await loadQuestionDetail(qa.id);
        try {
          common_vendor.index.$emit("qa:refresh");
        } catch (e) {
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:455", "提交回答失败:", error);
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
          try {
            common_vendor.index.$emit("qa:refresh");
          } catch (e) {
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:486", "点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function followQuestion() {
      try {
        const result = await utils_api.api.followQuestion(qa.id);
        if (result) {
          qa.followCount = result.followCount;
          qa.isFollowed = result.isFollowed;
          common_vendor.index.showToast({
            title: qa.isFollowed ? "已关注" : "已取消关注",
            icon: "none",
            duration: 1e3
          });
          try {
            common_vendor.index.$emit("qa:refresh");
          } catch (e) {
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:515", "关注操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function loadComments() {
      try {
        const data = await utils_api.api.getComments(qa.id);
        comments.value = data.map((comment) => ({
          ...comment,
          time: formatCommentTime(comment.createdAt)
        }));
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:532", "加载评论失败:", error);
      }
    }
    function formatCommentTime(createdAt) {
      const created = new Date(createdAt);
      const now = /* @__PURE__ */ new Date();
      const timeDiff = now.getTime() - created.getTime();
      const daysDiff = Math.floor(timeDiff / (1e3 * 60 * 60 * 24));
      if (daysDiff === 0) {
        const hours = created.getHours().toString().padStart(2, "0");
        const minutes = created.getMinutes().toString().padStart(2, "0");
        return `今天 ${hours}:${minutes}`;
      } else if (daysDiff === 1) {
        const hours = created.getHours().toString().padStart(2, "0");
        const minutes = created.getMinutes().toString().padStart(2, "0");
        return `昨天 ${hours}:${minutes}`;
      } else if (daysDiff < 7) {
        const hours = created.getHours().toString().padStart(2, "0");
        const minutes = created.getMinutes().toString().padStart(2, "0");
        return `${daysDiff}天前 ${hours}:${minutes}`;
      } else {
        const month = created.getMonth() + 1;
        const date = created.getDate();
        const hours = created.getHours().toString().padStart(2, "0");
        const minutes = created.getMinutes().toString().padStart(2, "0");
        return `${month}/${date} ${hours}:${minutes}`;
      }
    }
    async function submitComment() {
      var _a2;
      if (!currentComment.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return;
      }
      if (isSubmittingComment.value)
        return;
      try {
        isSubmittingComment.value = true;
        const result = await utils_api.api.createComment(qa.id, {
          content: currentComment.value.trim(),
          petId: ((_a2 = currentUserPet.value) == null ? void 0 : _a2.id) || null
        });
        comments.value.push({
          ...result,
          time: formatCommentTime(result.createdAt)
        });
        currentComment.value = "";
        common_vendor.index.showToast({
          title: "评论成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:601", "提交评论失败:", error);
        common_vendor.index.showToast({
          title: "评论失败",
          icon: "none"
        });
      } finally {
        isSubmittingComment.value = false;
      }
    }
    async function submitReply(commentId) {
      var _a2;
      if (!currentReply.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入回复内容",
          icon: "none"
        });
        return;
      }
      if (isSubmittingReply.value)
        return;
      try {
        isSubmittingReply.value = true;
        const result = await utils_api.api.createReply(commentId, {
          content: currentReply.value.trim(),
          petId: ((_a2 = currentUserPet.value) == null ? void 0 : _a2.id) || null
        });
        const commentIndex = comments.value.findIndex((c) => c.id === commentId);
        if (commentIndex !== -1) {
          comments.value[commentIndex].replies.push({
            ...result,
            time: formatCommentTime(result.createdAt)
          });
        }
        currentReply.value = "";
        replyingToComment.value = null;
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:648", "提交回复失败:", error);
        common_vendor.index.showToast({
          title: "回复失败",
          icon: "none"
        });
      } finally {
        isSubmittingReply.value = false;
      }
    }
    async function likeComment(comment) {
      try {
        const result = await utils_api.api.likeComment(comment.id);
        if (result) {
          comment.likes = result.likes;
          comment.isLiked = result.isLiked;
          common_vendor.index.showToast({
            title: comment.isLiked ? "已点赞" : "已取消点赞",
            icon: "none",
            duration: 1e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:673", "点赞评论失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function likeReply(reply) {
      try {
        const result = await utils_api.api.likeReply(reply.id);
        if (result) {
          reply.likes = result.likes;
          reply.isLiked = result.isLiked;
          common_vendor.index.showToast({
            title: reply.isLiked ? "已点赞" : "已取消点赞",
            icon: "none",
            duration: 1e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:696", "点赞回复失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    function startReply(commentId) {
      replyingToComment.value = commentId;
      currentReply.value = "";
    }
    function cancelReply() {
      replyingToComment.value = null;
      currentReply.value = "";
    }
    try {
      const ec = (_b = (_a = getCurrentPages().pop()) == null ? void 0 : _a.getOpenerEventChannel) == null ? void 0 : _b.call(_a);
      ec && ec.on("qa", (data) => {
        Object.assign(qa, {
          id: data.id,
          title: data.title,
          content: data.content,
          isUrgent: data.isUrgent,
          user: data.user,
          pet: data.pet
        });
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
        c: common_vendor.t(qa.isFollowed ? "已关注" : "关注问题"),
        d: qa.isFollowed ? 1 : "",
        e: common_vendor.o(followQuestion),
        f: common_vendor.t(qa.content),
        g: qa.user.avatarUrl || "/static/logo.png",
        h: common_vendor.t(qa.user.nickname || "用户"),
        i: common_vendor.t(qa.time),
        j: common_vendor.f(qa.answers, (answer, k0, i0) => {
          return common_vendor.e({
            a: answer.user.avatarUrl || "/static/logo.png",
            b: common_vendor.t(answer.user.nickname),
            c: answer.pet && answer.pet.name
          }, answer.pet && answer.pet.name ? {
            d: common_vendor.t(answer.pet.name),
            e: common_vendor.t(answer.pet.breed)
          } : {}, {
            f: common_vendor.t(answer.content),
            g: common_vendor.t(answer.time),
            h: answer.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            i: common_vendor.t(answer.likes),
            j: common_vendor.o(($event) => likeAnswer(answer), answer.id),
            k: answer.id
          });
        }),
        k: qa.answers.length === 0
      }, qa.answers.length === 0 ? {} : {}, {
        l: common_vendor.f(comments.value, (comment, k0, i0) => {
          return common_vendor.e({
            a: comment.user.avatarUrl || "/static/logo.png",
            b: common_vendor.t(comment.user.nickname),
            c: comment.pet && comment.pet.name
          }, comment.pet && comment.pet.name ? {
            d: common_vendor.t(comment.pet.name),
            e: common_vendor.t(comment.pet.breed)
          } : {}, {
            f: common_vendor.t(comment.content),
            g: common_vendor.t(comment.time),
            h: common_vendor.o(($event) => startReply(comment.id), comment.id),
            i: comment.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            j: comment.likes > 0
          }, comment.likes > 0 ? {
            k: common_vendor.t(comment.likes)
          } : {}, {
            l: common_vendor.o(($event) => likeComment(comment), comment.id),
            m: comment.replies && comment.replies.length
          }, comment.replies && comment.replies.length ? {
            n: common_vendor.f(comment.replies, (reply, k1, i1) => {
              return common_vendor.e({
                a: reply.user.avatarUrl || "/static/logo.png",
                b: common_vendor.t(reply.user.nickname),
                c: reply.pet && reply.pet.name
              }, reply.pet && reply.pet.name ? {
                d: common_vendor.t(reply.pet.name),
                e: common_vendor.t(reply.pet.breed)
              } : {}, {
                f: common_vendor.t(reply.content),
                g: common_vendor.t(reply.time),
                h: reply.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
                i: reply.likes > 0
              }, reply.likes > 0 ? {
                j: common_vendor.t(reply.likes)
              } : {}, {
                k: common_vendor.o(($event) => likeReply(reply), reply.id),
                l: reply.id
              });
            })
          } : {}, {
            o: replyingToComment.value === comment.id
          }, replyingToComment.value === comment.id ? {
            p: isSubmittingReply.value,
            q: currentReply.value,
            r: common_vendor.o(($event) => currentReply.value = $event.detail.value, comment.id),
            s: common_vendor.o(cancelReply, comment.id),
            t: common_vendor.t(isSubmittingReply.value ? "提交中..." : "提交"),
            v: common_vendor.o(($event) => submitReply(comment.id), comment.id),
            w: isSubmittingReply.value || !currentReply.value.trim()
          } : {}, {
            x: comment.id
          });
        }),
        m: comments.value.length === 0
      }, comments.value.length === 0 ? {} : {}, {
        n: !showCommentInput.value ? 1 : "",
        o: common_vendor.o(($event) => showCommentInput.value = false),
        p: showCommentInput.value ? 1 : "",
        q: common_vendor.o(($event) => showCommentInput.value = true),
        r: !showCommentInput.value
      }, !showCommentInput.value ? {
        s: isSubmitting.value,
        t: currentAnswer.value,
        v: common_vendor.o(($event) => currentAnswer.value = $event.detail.value),
        w: common_vendor.t(isSubmitting.value ? "提交中..." : "提交"),
        x: common_vendor.o(submitAnswer),
        y: isSubmitting.value || !currentAnswer.value.trim()
      } : {
        z: isSubmittingComment.value,
        A: currentComment.value,
        B: common_vendor.o(($event) => currentComment.value = $event.detail.value),
        C: common_vendor.t(isSubmittingComment.value ? "提交中..." : "提交"),
        D: common_vendor.o(submitComment),
        E: isSubmittingComment.value || !currentComment.value.trim()
      }, {
        F: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f887a9d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionDetail/questionDetail.js.map
