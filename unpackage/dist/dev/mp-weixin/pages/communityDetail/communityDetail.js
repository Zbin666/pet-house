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
          const pets = await utils_api.api.getPets();
          const petsList = Array.isArray(pets) ? pets : pets.data || [];
          if (petsList.length > 0) {
            currentUserPet.value = petsList[0];
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:134", "获取宠物信息失败:", e);
        }
      } catch (e) {
        dynamicTopPadding.value = "";
      }
    });
    const post = common_vendor.reactive({ id: "", user: "昵称", text: "这是一条圈子动态内容。", cover: "/static/logo.png", likes: 0, avatar: "/static/logo.png", pet: "", breed: "", images: [], shares: 0, isLiked: false, time: "" });
    const commentText = common_vendor.ref("");
    const comments = common_vendor.reactive([]);
    const currentUserPet = common_vendor.ref(null);
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
        comments.splice(0, comments.length, ...(f.Comments || []).map((c) => {
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
          return {
            id: c.id,
            user: ((_a = c.User) == null ? void 0 : _a.nickname) || "用户",
            petName: ((_b = c.Pet) == null ? void 0 : _b.name) || "",
            petBreed: ((_c = c.Pet) == null ? void 0 : _c.breed) || "",
            time: commentTime,
            avatar: ((_d = c.User) == null ? void 0 : _d.avatarUrl) || "/static/logo.png",
            text: c.text,
            likes: c.likes || 0,
            isLiked: c.isLiked || false,
            replies: []
          };
        }));
      } catch (e) {
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    }
    common_vendor.onLoad(() => {
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
        if (incoming && incoming.id) {
          loadDetail(incoming.id);
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
        common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:287", "点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function submitComment() {
      var _a, _b, _c, _d;
      if (!commentText.value.trim()) {
        common_vendor.index.showToast({ title: "请输入评论内容", icon: "none" });
        return;
      }
      try {
        const c = await utils_api.api.createComment(post.id, { text: commentText.value.trim() });
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
        comments.push({
          id: c.id,
          user: ((_a = c.User) == null ? void 0 : _a.nickname) || "我",
          petName: ((_b = currentUserPet.value) == null ? void 0 : _b.name) || "",
          petBreed: ((_c = currentUserPet.value) == null ? void 0 : _c.breed) || "",
          time: commentTime,
          avatar: ((_d = c.User) == null ? void 0 : _d.avatarUrl) || "/static/logo.png",
          text: c.text,
          likes: 0,
          isLiked: false,
          replies: []
        });
        commentText.value = "";
        common_vendor.index.showToast({ title: "评论提交成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "评论失败", icon: "none" });
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
        common_vendor.index.__f__("error", "at pages/communityDetail/communityDetail.vue:359", "点赞评论失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
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
        k: common_assets._imports_0$5,
        l: common_vendor.t(post.shares),
        m: common_assets._imports_1$2,
        n: common_vendor.t(comments.length),
        o: post.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
        p: common_vendor.t(post.likes),
        q: common_vendor.o(likePost),
        r: common_vendor.t(comments.length),
        s: common_vendor.f(comments, (c, k0, i0) => {
          return common_vendor.e({
            a: c.avatar,
            b: common_vendor.t(c.user),
            c: c.petName
          }, c.petName ? {
            d: common_vendor.t(c.petName),
            e: common_vendor.t(c.petBreed)
          } : {}, {
            f: common_vendor.t(c.text),
            g: common_vendor.t(c.time),
            h: c.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            i: c.likes > 0
          }, c.likes > 0 ? {
            j: common_vendor.t(c.likes)
          } : {}, {
            k: common_vendor.o(($event) => likeComment(c), c.id),
            l: c.replies && c.replies.length
          }, c.replies && c.replies.length ? {
            m: common_vendor.f(c.replies, (r, ri, i1) => {
              return {
                a: common_vendor.t(r.user),
                b: common_vendor.t(r.text),
                c: ri
              };
            })
          } : {}, {
            n: c.id
          });
        }),
        t: common_assets._imports_0$5,
        v: common_vendor.o(sharePost),
        w: post.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
        x: common_vendor.o(likePost),
        y: common_vendor.o(submitComment),
        z: commentText.value,
        A: common_vendor.o(($event) => commentText.value = $event.detail.value),
        B: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6818b03b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/communityDetail/communityDetail.js.map
