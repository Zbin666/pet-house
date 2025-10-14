"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "communityDetail",
  setup(__props) {
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
          const profile = await utils_api.api.getProfile();
          if (profile && profile.id)
            currentUserId.value = profile.id;
        } catch (e) {
        }
        try {
          const pets = await utils_api.api.getPets();
          const petsList = Array.isArray(pets) ? pets : pets.data || [];
          if (petsList.length > 0) {
            currentUserPet.value = petsList[0];
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:210", "获取宠物信息失败:", e);
        }
      } catch (e) {
        dynamicTopPadding.value = "";
      }
    });
    const post = common_vendor.reactive({ id: "", user: "昵称", text: "这是一条圈子动态内容。", cover: "/static/logo.png", likes: 0, avatar: "/static/logo.png", pet: "", breed: "", images: [], shares: 0, isLiked: false, time: "" });
    const commentText = common_vendor.ref("");
    const comments = common_vendor.reactive([]);
    const currentUserId = common_vendor.ref("");
    const totalComments = common_vendor.computed(() => {
      try {
        return comments.reduce((sum, c) => sum + 1 + (c.replies && c.replies.length || 0), 0);
      } catch (_) {
        return comments.length;
      }
    });
    const currentUserPet = common_vendor.ref(null);
    const replyingToComment = common_vendor.ref(null);
    const replyingToReply = common_vendor.ref(null);
    const inputRef = common_vendor.ref(null);
    async function loadDetail(id) {
      try {
        const f = await utils_api.api.getFeed(id);
        const user = f.User || {};
        const pet = f.Pet || {};
        post.id = f.id;
        post.user = user.nickname || "昵称";
        post.pet = pet.name || "";
        post.breed = pet.breed || "";
        post.text = f.text || "";
        post.avatar = user.avatarUrl || "/static/logo.png";
        post.images = Array.isArray(f.images) ? f.images : [];
        post.cover = post.images[0] ? post.images[0] : f.cover || "/static/logo.png";
        post.likes = f.likes || 0;
        post.shares = f.shares || 0;
        post.isLiked = f.isLiked || false;
        let title = "";
        if (f.tags && Array.isArray(f.tags) && f.tags.length > 0) {
          title = f.tags[0];
        } else if (f.tags && typeof f.tags === "string") {
          try {
            const parsedTags = JSON.parse(f.tags);
            if (Array.isArray(parsedTags) && parsedTags.length > 0) {
              title = parsedTags[0];
            }
          } catch (e) {
          }
        }
        post.title = title ? `#${title}` : "";
        if (f.createdAt) {
          const created = new Date(f.createdAt);
          const now = /* @__PURE__ */ new Date();
          const timeDiff = now.getTime() - created.getTime();
          const minutesDiff = Math.floor(timeDiff / (1e3 * 60));
          if (minutesDiff < 1) {
            post.time = "刚刚";
          } else if (minutesDiff < 60) {
            post.time = `${minutesDiff}分钟前`;
          } else if (minutesDiff < 1440) {
            const hoursDiff = Math.floor(minutesDiff / 60);
            post.time = `${hoursDiff}小时前`;
          } else {
            post.time = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
          }
        } else {
          post.time = "";
        }
        await loadComments(id);
      } catch (e) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    }
    common_vendor.onLoad((query) => {
      var _a, _b;
      const eventChannel = (_b = (_a = getCurrentPages().pop()) == null ? void 0 : _a.getOpenerEventChannel) == null ? void 0 : _b.call(_a);
      let incoming = null;
      try {
        eventChannel && eventChannel.on("post", (data) => {
          incoming = data;
        });
      } catch (e) {
      }
      setTimeout(() => {
        if (query && query.id || incoming && incoming.id) {
          loadDetail(query && query.id || incoming.id);
        } else if (incoming) {
          post.id = incoming.id || "";
          post.user = incoming.user || "昵称";
          post.pet = incoming.pet || "";
          post.breed = incoming.breed || "";
          post.text = incoming.text || "";
          post.avatar = incoming.avatar || "/static/logo.png";
          post.images = Array.isArray(incoming.images) ? incoming.images : [];
          post.cover = post.images[0] ? post.images[0] : incoming.cover || "/static/logo.png";
          post.likes = incoming.likes || 0;
          post.shares = incoming.shares || 0;
        }
      }, 0);
    });
    function sharePost() {
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
    }
    async function confirmDeleteComment(comment) {
      try {
        await new Promise((resolve, reject) => {
          common_vendor.index.showModal({
            title: "删除确认",
            content: "确定要删除这条评论及其回复吗？",
            confirmText: "删除",
            confirmColor: "#e64340",
            success: async (res) => {
              if (res.confirm) {
                try {
                  await utils_api.api.deleteComment(comment.id);
                  const idx = comments.findIndex((c) => c.id === comment.id);
                  if (idx !== -1)
                    comments.splice(idx, 1);
                  try {
                    if (post && typeof post.shares !== "undefined") {
                    }
                  } catch (_) {
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
    async function likePost() {
      try {
        const result = await utils_api.api.likeFeed(post.id);
        if (result) {
          post.likes = result.likes;
          post.isLiked = result.isLiked;
          common_vendor.index.showToast({
            title: post.isLiked ? "已点赞" : "已取消点赞",
            icon: "none",
            duration: 1e3
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:372", "点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function loadComments(feedId) {
      try {
        const commentsData = await utils_api.api.getComments(feedId);
        comments.splice(0, comments.length, ...commentsData.map((c) => {
          var _a, _b, _c, _d;
          let commentTime = "";
          if (c.createdAt) {
            const created = new Date(c.createdAt);
            const now = /* @__PURE__ */ new Date();
            const timeDiff = now.getTime() - created.getTime();
            const minutesDiff = Math.floor(timeDiff / (1e3 * 60));
            if (minutesDiff < 1) {
              commentTime = "刚刚";
            } else if (minutesDiff < 60) {
              commentTime = `${minutesDiff}分钟前`;
            } else if (minutesDiff < 1440) {
              const hoursDiff = Math.floor(minutesDiff / 60);
              commentTime = `${hoursDiff}小时前`;
            } else {
              commentTime = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
            }
          }
          const replies = (c.replies || []).map((r) => {
            var _a2, _b2, _c2, _d2;
            let replyTime = "";
            if (r.createdAt) {
              const created = new Date(r.createdAt);
              const now = /* @__PURE__ */ new Date();
              const timeDiff = now.getTime() - created.getTime();
              const minutesDiff = Math.floor(timeDiff / (1e3 * 60));
              if (minutesDiff < 1) {
                replyTime = "刚刚";
              } else if (minutesDiff < 60) {
                replyTime = `${minutesDiff}分钟前`;
              } else if (minutesDiff < 1440) {
                const hoursDiff = Math.floor(minutesDiff / 60);
                replyTime = `${hoursDiff}小时前`;
              } else {
                replyTime = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
              }
            }
            return {
              id: r.id,
              userId: r.userId,
              user: ((_a2 = r.User) == null ? void 0 : _a2.nickname) || "用户",
              petName: ((_b2 = r.Pet) == null ? void 0 : _b2.name) || "",
              petBreed: ((_c2 = r.Pet) == null ? void 0 : _c2.breed) || "",
              time: replyTime,
              avatar: ((_d2 = r.User) == null ? void 0 : _d2.avatarUrl) || "/static/logo.png",
              content: r.content,
              likes: r.likes || 0,
              isLiked: r.isLiked || false,
              replyToUser: r.replyToUser || "",
              showReplies: false,
              expandedReplies: 3
            };
          });
          return {
            id: c.id,
            userId: c.userId,
            user: ((_a = c.User) == null ? void 0 : _a.nickname) || "用户",
            petName: ((_b = c.Pet) == null ? void 0 : _b.name) || "",
            petBreed: ((_c = c.Pet) == null ? void 0 : _c.breed) || "",
            time: commentTime,
            avatar: ((_d = c.User) == null ? void 0 : _d.avatarUrl) || "/static/logo.png",
            text: c.text,
            likes: c.likes || 0,
            isLiked: c.isLiked || false,
            isSelf: currentUserId.value ? c.userId === currentUserId.value : false,
            replies,
            showReplies: false,
            expandedReplies: 0
          };
        }));
        try {
          const lastId = common_vendor.index.getStorageSync("lastRepliedCommentId");
          if (lastId) {
            const target = comments.find((c) => c.id === lastId);
            if (target) {
              target.showReplies = true;
              target.expandedReplies = Math.min(Math.max(target.expandedReplies || 0, 3), target.replies.length);
            }
            common_vendor.index.removeStorageSync("lastRepliedCommentId");
          }
        } catch (_) {
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:468", "加载评论失败:", e);
      }
    }
    function startReply(comment) {
      replyingToComment.value = comment;
      replyingToReply.value = null;
      commentText.value = "";
      common_vendor.nextTick$1(() => {
        if (inputRef.value) {
          inputRef.value.focus();
        }
      });
    }
    function startReplyToReply(comment, reply) {
      replyingToComment.value = comment;
      replyingToReply.value = reply;
      commentText.value = "";
      common_vendor.nextTick$1(() => {
        if (inputRef.value) {
          inputRef.value.focus();
        }
      });
    }
    function getInputPlaceholder() {
      if (replyingToReply.value) {
        return `回复 ${replyingToReply.value.user}：`;
      } else if (replyingToComment.value) {
        return `回复 ${replyingToComment.value.user}：`;
      } else {
        return "输入你的评论";
      }
    }
    async function submitComment() {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      if (!commentText.value.trim()) {
        common_vendor.index.showToast({ title: "请输入评论内容", icon: "none" });
        return;
      }
      try {
        if (replyingToComment.value) {
          const replyData = {
            text: commentText.value.trim(),
            petId: ((_a = currentUserPet.value) == null ? void 0 : _a.id) || null,
            replyToUserId: replyingToReply.value ? replyingToReply.value.userId : replyingToComment.value ? replyingToComment.value.userId : null
          };
          const r = await utils_api.api.createCommentReply(replyingToComment.value.id, replyData);
          let replyTime = "刚刚";
          if (r.createdAt) {
            const created = new Date(r.createdAt);
            const now = /* @__PURE__ */ new Date();
            const timeDiff = now.getTime() - created.getTime();
            const minutesDiff = Math.floor(timeDiff / (1e3 * 60));
            if (minutesDiff < 1) {
              replyTime = "刚刚";
            } else if (minutesDiff < 60) {
              replyTime = `${minutesDiff}分钟前`;
            } else if (minutesDiff < 1440) {
              const hoursDiff = Math.floor(minutesDiff / 60);
              replyTime = `${hoursDiff}小时前`;
            } else {
              replyTime = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
            }
          }
          const newReply = {
            id: r.id,
            user: ((_b = r.User) == null ? void 0 : _b.nickname) || "我",
            petName: ((_c = r.Pet) == null ? void 0 : _c.name) || "",
            petBreed: ((_d = r.Pet) == null ? void 0 : _d.breed) || "",
            time: replyTime,
            avatar: ((_e = r.User) == null ? void 0 : _e.avatarUrl) || "/static/logo.png",
            content: r.content,
            likes: 0,
            isLiked: false,
            replyToUser: r.replyToUser || (replyingToReply.value ? replyingToReply.value.user : replyingToComment.value ? replyingToComment.value.user : ""),
            showReplies: false,
            expandedReplies: 3
          };
          const comment = comments.find((c) => c.id === replyingToComment.value.id);
          if (comment) {
            comment.replies.unshift(newReply);
            comment.showReplies = true;
            comment.expandedReplies = Math.min(Math.max(comment.expandedReplies || 0, 3) + 1, comment.replies.length);
            try {
              common_vendor.index.setStorageSync("lastRepliedCommentId", comment.id);
            } catch (_) {
            }
          }
          commentText.value = "";
          replyingToComment.value = null;
          replyingToReply.value = null;
          common_vendor.index.showToast({ title: "回复提交成功", icon: "success" });
        } else {
          const commentData = {
            text: commentText.value.trim(),
            petId: ((_f = currentUserPet.value) == null ? void 0 : _f.id) || null
          };
          const c = await utils_api.api.createComment(post.id, commentData);
          let commentTime = "刚刚";
          if (c.createdAt) {
            const created = new Date(c.createdAt);
            const now = /* @__PURE__ */ new Date();
            const timeDiff = now.getTime() - created.getTime();
            const minutesDiff = Math.floor(timeDiff / (1e3 * 60));
            if (minutesDiff < 1) {
              commentTime = "刚刚";
            } else if (minutesDiff < 60) {
              commentTime = `${minutesDiff}分钟前`;
            } else if (minutesDiff < 1440) {
              const hoursDiff = Math.floor(minutesDiff / 60);
              commentTime = `${hoursDiff}小时前`;
            } else {
              commentTime = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
            }
          }
          const newComment = {
            id: c.id,
            user: ((_g = c.User) == null ? void 0 : _g.nickname) || "我",
            petName: ((_h = c.Pet) == null ? void 0 : _h.name) || "",
            petBreed: ((_i = c.Pet) == null ? void 0 : _i.breed) || "",
            time: commentTime,
            avatar: ((_j = c.User) == null ? void 0 : _j.avatarUrl) || "/static/logo.png",
            text: c.text,
            likes: 0,
            isLiked: false,
            replies: [],
            showReplies: false,
            expandedReplies: 3
          };
          comments.push(newComment);
          commentText.value = "";
          common_vendor.index.showToast({ title: "评论提交成功", icon: "success" });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: "提交失败", icon: "none" });
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
        common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:654", "点赞评论失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function likeCommentReply(reply) {
      try {
        const result = await utils_api.api.likeCommentReply(reply.id);
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
        common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:695", "点赞回复失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function confirmDeleteReply(comment, reply) {
      try {
        await new Promise((resolve, reject) => {
          common_vendor.index.showModal({
            title: "删除确认",
            content: "确定要删除这条回复吗？",
            confirmText: "删除",
            confirmColor: "#e64340",
            success: async (res) => {
              if (res.confirm) {
                try {
                  await utils_api.api.deleteCommentReply(reply.id);
                  const idx = comment.replies.findIndex((r) => r.id === reply.id);
                  if (idx !== -1)
                    comment.replies.splice(idx, 1);
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
    function toggleReplies(comment) {
      comment.showReplies = true;
      comment.expandedReplies = Math.min(3, comment.replies.length);
    }
    function expandMoreReplies(comment) {
      comment.expandedReplies = Math.min((comment.expandedReplies || 0) + 10, comment.replies.length);
    }
    function collapseReplies(comment) {
      comment.showReplies = false;
      comment.expandedReplies = 0;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: post.avatar,
        b: common_vendor.t(post.user),
        c: common_vendor.t(post.pet),
        d: common_vendor.t(post.breed),
        e: common_vendor.t(post.time),
        f: post.title
      }, post.title ? {
        g: common_vendor.t(post.title)
      } : {}, {
        h: common_vendor.t(post.text),
        i: post.images && post.images.length
      }, post.images && post.images.length ? {
        j: common_vendor.f(post.images, (img, i, i0) => {
          return {
            a: i,
            b: img
          };
        })
      } : {}, {
        k: common_assets._imports_0$6,
        l: common_vendor.t(post.shares),
        m: common_assets._imports_1$1,
        n: common_vendor.t(comments.length),
        o: post.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
        p: common_vendor.t(post.likes),
        q: common_vendor.o(likePost),
        r: common_vendor.t(totalComments.value),
        s: common_vendor.f(comments, (comment, k0, i0) => {
          return common_vendor.e({
            a: comment.avatar,
            b: common_vendor.t(comment.user),
            c: comment.petName
          }, comment.petName ? {
            d: common_vendor.t(comment.petName),
            e: common_vendor.t(comment.petBreed)
          } : {}, {
            f: common_vendor.t(comment.text),
            g: common_vendor.t(comment.time),
            h: common_vendor.o(($event) => startReply(comment), comment.id),
            i: comment.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            j: comment.likes > 0
          }, comment.likes > 0 ? {
            k: common_vendor.t(comment.likes)
          } : {}, {
            l: common_vendor.o(($event) => likeComment(comment), comment.id),
            m: comment.isSelf
          }, comment.isSelf ? {
            n: common_assets._imports_0$4,
            o: common_vendor.o(($event) => confirmDeleteComment(comment), comment.id)
          } : {}, {
            p: comment.showReplies && comment.replies && comment.replies.length > 0
          }, comment.showReplies && comment.replies && comment.replies.length > 0 ? {
            q: common_vendor.f(comment.replies.slice(0, comment.expandedReplies || 0), (reply, k1, i1) => {
              return common_vendor.e({
                a: reply.avatar,
                b: common_vendor.t(reply.user),
                c: reply.replyToUser
              }, reply.replyToUser ? {
                d: common_vendor.t(reply.replyToUser)
              } : {}, {
                e: reply.petName
              }, reply.petName ? {
                f: common_vendor.t(reply.petName),
                g: common_vendor.t(reply.petBreed)
              } : {}, {
                h: common_vendor.t(reply.content),
                i: common_vendor.t(reply.time),
                j: common_vendor.o(($event) => startReplyToReply(comment, reply), reply.id),
                k: reply.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
                l: reply.likes > 0
              }, reply.likes > 0 ? {
                m: common_vendor.t(reply.likes)
              } : {}, {
                n: common_vendor.o(($event) => likeCommentReply(reply), reply.id),
                o: reply.userId === currentUserId.value
              }, reply.userId === currentUserId.value ? {
                p: common_assets._imports_0$4,
                q: common_vendor.o(($event) => confirmDeleteReply(comment, reply), reply.id)
              } : {}, {
                r: reply.id
              });
            })
          } : {}, {
            r: comment.replies && comment.replies.length > 0
          }, comment.replies && comment.replies.length > 0 ? common_vendor.e({
            s: !comment.showReplies
          }, !comment.showReplies ? {
            t: common_vendor.t(comment.replies.length),
            v: common_vendor.o(($event) => toggleReplies(comment), comment.id)
          } : common_vendor.e({
            w: (comment.expandedReplies || 0) < comment.replies.length
          }, (comment.expandedReplies || 0) < comment.replies.length ? {
            x: common_vendor.o(($event) => expandMoreReplies(comment), comment.id)
          } : {}, {
            y: common_vendor.o(($event) => collapseReplies(comment), comment.id)
          })) : {}, {
            z: comment.id
          });
        }),
        t: common_assets._imports_0$6,
        v: common_vendor.o(sharePost),
        w: post.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
        x: common_vendor.o(likePost),
        y: getInputPlaceholder(),
        z: replyingToComment.value !== null || replyingToReply.value !== null,
        A: common_vendor.o(submitComment),
        B: commentText.value,
        C: common_vendor.o(($event) => commentText.value = $event.detail.value),
        D: common_vendor.o(() => {
        }),
        E: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6818b03b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/communityDetail/communityDetail.js.map
