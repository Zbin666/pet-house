"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
          common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:170", "获取宠物信息失败:", e);
        }
        try {
          const profile = await utils_api.api.getProfile();
          currentUserId.value = (profile == null ? void 0 : profile.id) || (profile == null ? void 0 : profile.userId) || "";
        } catch (e) {
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
    common_vendor.ref(false);
    const currentUserPet = common_vendor.ref(null);
    const replyingToComment = common_vendor.ref(null);
    const replyingToAnswer = common_vendor.ref(null);
    const replyingToAnswerDirect = common_vendor.ref(null);
    const inputRef = common_vendor.ref(null);
    const currentUserId = common_vendor.ref("");
    const avatarCache = /* @__PURE__ */ new Map();
    const avatarUpdateTrigger = common_vendor.ref(0);
    function getUserAvatarSrc(url) {
      if (!url)
        return "/static/user/user.png";
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/"))
        return normalized;
      if (avatarCache.has(normalized))
        return avatarCache.get(normalized);
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            avatarCache.set(normalized, res.tempFilePath);
            avatarUpdateTrigger.value++;
          } else {
            avatarCache.set(normalized, "/static/user/user.png");
            avatarUpdateTrigger.value++;
          }
        },
        fail: () => {
          avatarCache.set(normalized, "/static/user/user.png");
          avatarUpdateTrigger.value++;
        }
      });
      return "/static/user/user.png";
    }
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
            time: answerTime,
            comments: [],
            newComment: "",
            showComments: false,
            expandedComments: 0
          };
        });
        Object.assign(qa, {
          ...data,
          time,
          answers: processedAnswers,
          readCount: data.views || 0
          // 确保阅读数正确映射
        });
        for (const answer of qa.answers) {
          await loadAnswerComments(answer.id);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:397", "加载问答详情失败:", error);
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
          petId: ((_a2 = currentUserPet.value) == null ? void 0 : _a2.id) || null
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
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:442", "提交回答失败:", error);
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
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:473", "点赞操作失败:", error);
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
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:502", "关注操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function loadAnswerComments(answerId) {
      try {
        const data = await utils_api.api.getAnswerComments(answerId);
        common_vendor.index.__f__("log", "at pages/questionDetail/questionDetail.vue:515", "加载评论数据:", data);
        const answer = qa.answers.find((a) => a.id === answerId);
        if (answer) {
          answer.comments = data.map((comment, index) => ({
            ...comment,
            time: formatCommentTime(comment.createdAt),
            replies: [],
            replyCount: comment.replyCount || (index % 2 === 0 ? 5 : 0),
            // 临时测试：偶数索引的评论有5条回复
            showReplies: false,
            expandedReplies: 0
          }));
          common_vendor.index.__f__("log", "at pages/questionDetail/questionDetail.vue:526", "更新后的回答评论:", answer.comments);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:529", "加载评论失败:", error);
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
    function startReply(comment, answer) {
      replyingToComment.value = comment;
      replyingToAnswer.value = answer;
      replyingToAnswerDirect.value = null;
      currentAnswer.value = "";
    }
    function startReplyToAnswer(answer) {
      replyingToAnswerDirect.value = answer;
      replyingToComment.value = null;
      replyingToAnswer.value = null;
      currentAnswer.value = "";
    }
    function cancelReply() {
      replyingToComment.value = null;
      replyingToAnswer.value = null;
      replyingToAnswerDirect.value = null;
      currentAnswer.value = "";
      if (inputRef.value) {
        inputRef.value.blur();
      }
    }
    async function submitReply() {
      var _a2, _b2;
      if (!currentAnswer.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入回复内容",
          icon: "none"
        });
        return;
      }
      if (!replyingToComment.value || !replyingToAnswer.value)
        return;
      if (isSubmitting.value)
        return;
      try {
        isSubmitting.value = true;
        const result = await utils_api.api.createAnswerComment(replyingToAnswer.value.id, {
          content: currentAnswer.value.trim(),
          petId: ((_a2 = currentUserPet.value) == null ? void 0 : _a2.id) || null,
          replyToCommentId: ((_b2 = replyingToComment.value) == null ? void 0 : _b2.id) || null
        });
        replyingToAnswer.value.comments.unshift({
          ...result,
          time: formatCommentTime(result.createdAt)
        });
        replyingToAnswer.value.showComments = true;
        replyingToAnswer.value.expandedComments = Math.min(
          replyingToAnswer.value.comments.length,
          Math.max(replyingToAnswer.value.expandedComments + 1, 3)
        );
        replyingToComment.value = null;
        replyingToAnswer.value = null;
        currentAnswer.value = "";
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:639", "提交回复失败:", error);
        common_vendor.index.showToast({
          title: "回复失败",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    }
    async function submitReplyToAnswer() {
      var _a2;
      if (!currentAnswer.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入回复内容",
          icon: "none"
        });
        return;
      }
      if (!replyingToAnswerDirect.value)
        return;
      if (isSubmitting.value)
        return;
      try {
        isSubmitting.value = true;
        const result = await utils_api.api.createAnswerComment(replyingToAnswerDirect.value.id, {
          content: currentAnswer.value.trim(),
          petId: ((_a2 = currentUserPet.value) == null ? void 0 : _a2.id) || null
        });
        replyingToAnswerDirect.value.comments.unshift({
          ...result,
          time: formatCommentTime(result.createdAt)
        });
        replyingToAnswerDirect.value.showComments = true;
        replyingToAnswerDirect.value.expandedComments = Math.min(
          replyingToAnswerDirect.value.comments.length,
          Math.max(replyingToAnswerDirect.value.expandedComments + 1, 3)
        );
        replyingToAnswerDirect.value = null;
        currentAnswer.value = "";
        common_vendor.index.showToast({
          title: "回复成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:692", "提交回复失败:", error);
        common_vendor.index.showToast({
          title: "回复失败",
          icon: "none"
        });
      } finally {
        isSubmitting.value = false;
      }
    }
    async function likeComment(comment) {
      try {
        const result = await utils_api.api.likeAnswerComment(comment.id);
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
        common_vendor.index.__f__("error", "at pages/questionDetail/questionDetail.vue:718", "点赞评论失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function confirmDeleteAnswerComment(answer, comment) {
      try {
        await new Promise((resolve, reject) => {
          common_vendor.index.showModal({
            title: "删除确认",
            content: "确定要删除这条评论吗？",
            confirmText: "删除",
            confirmColor: "#e64340",
            success: async (res) => {
              if (res.confirm) {
                try {
                  await utils_api.api.deleteAnswerComment(comment.id);
                  const idx = answer.comments.findIndex((c) => c.id === comment.id);
                  if (idx !== -1) {
                    answer.comments.splice(idx, 1);
                    if (answer.expandedComments > answer.comments.length) {
                      answer.expandedComments = answer.comments.length;
                    }
                  }
                  common_vendor.index.showToast({ title: "已删除", icon: "success" });
                  resolve(true);
                } catch (e) {
                  common_vendor.index.showToast({ title: "删除失败", icon: "none" });
                  reject(e);
                }
              } else {
                resolve(false);
              }
            }
          });
        });
      } catch (_) {
      }
    }
    async function confirmDeleteAnswer(answer) {
      try {
        await new Promise((resolve, reject) => {
          common_vendor.index.showModal({
            title: "删除确认",
            content: "确定要删除这条回答吗？",
            confirmText: "删除",
            confirmColor: "#e64340",
            success: async (res) => {
              if (res.confirm) {
                try {
                  await utils_api.api.deleteAnswer(answer.id);
                  const idx = qa.answers.findIndex((a) => a.id === answer.id);
                  if (idx !== -1) {
                    qa.answers.splice(idx, 1);
                  }
                  common_vendor.index.showToast({ title: "已删除", icon: "success" });
                  resolve(true);
                } catch (e) {
                  common_vendor.index.showToast({ title: "删除失败", icon: "none" });
                  reject(e);
                }
              } else {
                resolve(false);
              }
            }
          });
        });
      } catch (_) {
      }
    }
    async function confirmDeleteQuestion() {
      try {
        await new Promise((resolve, reject) => {
          common_vendor.index.showModal({
            title: "删除确认",
            content: "确定要删除这个问答吗？删除后将无法恢复。",
            confirmText: "删除",
            confirmColor: "#e64340",
            success: async (res) => {
              if (res.confirm) {
                try {
                  await utils_api.api.deleteQuestion(qa.id);
                  common_vendor.index.showToast({ title: "已删除", icon: "success" });
                  setTimeout(() => {
                    common_vendor.index.navigateBack();
                  }, 1500);
                  resolve(true);
                } catch (e) {
                  common_vendor.index.showToast({ title: "删除失败", icon: "none" });
                  reject(e);
                }
              } else {
                resolve(false);
              }
            }
          });
        });
      } catch (_) {
      }
    }
    function toggleAnswerComments(answer) {
      answer.showComments = true;
      answer.expandedComments = Math.min(3, answer.comments.length);
    }
    function expandMoreComments(answer) {
      answer.expandedComments = Math.min(answer.expandedComments + 10, answer.comments.length);
    }
    function collapseComments(answer) {
      answer.showComments = false;
      answer.expandedComments = 0;
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
        g: getUserAvatarSrc(qa.user.avatarUrl),
        h: `qa-user-avatar-${avatarUpdateTrigger.value}`,
        i: common_vendor.t(qa.user.nickname || "用户"),
        j: common_vendor.t(qa.time),
        k: qa.user.id === currentUserId.value
      }, qa.user.id === currentUserId.value ? {
        l: common_assets._imports_0$4,
        m: common_vendor.o(confirmDeleteQuestion)
      } : {}, {
        n: common_vendor.f(qa.answers, (answer, k0, i0) => {
          var _a2, _b2;
          return common_vendor.e({
            a: getUserAvatarSrc(answer.user.avatarUrl),
            b: `answer-avatar-${answer.id}-${avatarUpdateTrigger.value}`,
            c: common_vendor.t(answer.user.nickname),
            d: answer.pet && answer.pet.name
          }, answer.pet && answer.pet.name ? {
            e: common_vendor.t(answer.pet.name),
            f: common_vendor.t(answer.pet.breed)
          } : {}, {
            g: common_vendor.t(answer.content),
            h: common_vendor.t(answer.time),
            i: common_vendor.o(($event) => startReplyToAnswer(answer), answer.id),
            j: answer.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            k: common_vendor.t(answer.likes),
            l: common_vendor.o(($event) => likeAnswer(answer), answer.id),
            m: ((_a2 = answer.user) == null ? void 0 : _a2.id) === currentUserId.value
          }, ((_b2 = answer.user) == null ? void 0 : _b2.id) === currentUserId.value ? {
            n: common_assets._imports_0$4,
            o: common_vendor.o(($event) => confirmDeleteAnswer(answer), answer.id)
          } : {}, {
            p: answer.showComments && answer.comments && answer.comments.length
          }, answer.showComments && answer.comments && answer.comments.length ? {
            q: common_vendor.f(answer.comments.slice(0, answer.expandedComments), (comment, k1, i1) => {
              var _a3, _b3;
              return common_vendor.e({
                a: getUserAvatarSrc(comment.user.avatarUrl),
                b: `comment-avatar-${comment.id}-${avatarUpdateTrigger.value}`,
                c: common_vendor.t(comment.user.nickname),
                d: comment.replyTo && comment.replyTo.nickname
              }, comment.replyTo && comment.replyTo.nickname ? {
                e: common_vendor.t(comment.replyTo.nickname)
              } : {}, {
                f: comment.pet && comment.pet.name
              }, comment.pet && comment.pet.name ? {
                g: common_vendor.t(comment.pet.name),
                h: common_vendor.t(comment.pet.breed)
              } : {}, {
                i: common_vendor.t(comment.content),
                j: common_vendor.t(comment.time),
                k: common_vendor.o(($event) => startReply(comment, answer), comment.id),
                l: comment.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
                m: comment.likes > 0
              }, comment.likes > 0 ? {
                n: common_vendor.t(comment.likes)
              } : {}, {
                o: common_vendor.o(($event) => likeComment(comment), comment.id),
                p: ((_a3 = comment.user) == null ? void 0 : _a3.id) === currentUserId.value
              }, ((_b3 = comment.user) == null ? void 0 : _b3.id) === currentUserId.value ? {
                q: common_assets._imports_0$4,
                r: common_vendor.o(($event) => confirmDeleteAnswerComment(answer, comment), comment.id)
              } : {}, {
                s: comment.id
              });
            }),
            r: common_vendor.o(() => {
            }, answer.id)
          } : {}, {
            s: answer.comments && answer.comments.length > 0
          }, answer.comments && answer.comments.length > 0 ? common_vendor.e({
            t: !answer.showComments
          }, !answer.showComments ? {
            v: common_vendor.t(answer.comments.length),
            w: common_vendor.o(($event) => toggleAnswerComments(answer), answer.id)
          } : common_vendor.e({
            x: answer.expandedComments < answer.comments.length
          }, answer.expandedComments < answer.comments.length ? {
            y: common_vendor.o(($event) => expandMoreComments(answer), answer.id)
          } : {}, {
            z: common_vendor.o(($event) => collapseComments(answer), answer.id)
          })) : {}, {
            A: answer.id
          });
        }),
        o: qa.answers.length === 0
      }, qa.answers.length === 0 ? {} : {}, {
        p: common_vendor.o(cancelReply),
        q: replyingToComment.value ? `回复 ${replyingToComment.value.user.nickname}：` : replyingToAnswerDirect.value ? `回复 ${replyingToAnswerDirect.value.user.nickname}：` : "输入你的回答",
        r: isSubmitting.value,
        s: replyingToComment.value !== null || replyingToAnswerDirect.value !== null,
        t: common_vendor.o(($event) => replyingToComment.value ? submitReply() : replyingToAnswerDirect.value ? submitReplyToAnswer() : submitAnswer()),
        v: common_vendor.o(() => {
        }),
        w: currentAnswer.value,
        x: common_vendor.o(($event) => currentAnswer.value = $event.detail.value),
        y: common_vendor.o(() => {
        }),
        z: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f887a9d3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/questionDetail/questionDetail.js.map
