"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "communityDetail",
  setup(__props) {
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
    const post = common_vendor.reactive({ id: "", user: "昵称", text: "这是一条圈子动态内容。", cover: "/static/logo.png", likes: 0, avatar: "/static/logo.png", pet: "", breed: "", images: [], shares: 0, isLiked: false });
    const commentText = common_vendor.ref("");
    const comments = common_vendor.reactive([
      {
        id: "c1",
        user: "刘医生",
        role: "专业宠物医生",
        time: "刚刚",
        avatar: "/static/logo.png",
        text: "好可爱啊～～～～ 想养一只",
        replies: [
          { user: "iU我以为", text: "找个好看的麻袋，带走" },
          { user: "7issue", text: "啊啊啊，看起来好高贵呀" },
          { user: "iU我以为", text: "对对，好想养一只呀" }
        ]
      },
      { id: "c2", user: "刘医生", role: "专业宠物医生", time: "刚刚", avatar: "/static/logo.png", text: "1.避免高温遛狗 夏季天气炎热，狗狗汗腺不发达，很难快速调节体温，容易出现中暑..." }
    ]);
    common_vendor.onLoad(() => {
      var _a, _b;
      const eventChannel = (_b = (_a = getCurrentPages().pop()) == null ? void 0 : _a.getOpenerEventChannel) == null ? void 0 : _b.call(_a);
      try {
        eventChannel && eventChannel.on("post", (data) => {
          if (data) {
            post.id = data.id || "";
            post.user = data.user || "昵称";
            post.text = data.text || "";
            post.avatar = data.avatar || "/static/logo.png";
            post.pet = data.pet || "";
            post.breed = data.breed || "";
            post.images = Array.isArray(data.images) ? data.images : [];
            post.cover = post.images[0] ? post.images[0] : data.cover || "/static/logo.png";
            post.likes = data.likes || 0;
            post.shares = data.shares || 0;
          }
        });
      } catch (e) {
      }
    });
    function sharePost() {
      common_vendor.index.showToast({
        title: "分享功能开发中",
        icon: "none"
      });
    }
    function likePost() {
      post.isLiked = !post.isLiked;
      post.likes = post.isLiked ? post.likes + 1 : Math.max(post.likes - 1, 0);
      common_vendor.index.showToast({
        title: post.isLiked ? "已点赞" : "取消点赞",
        icon: "none"
      });
    }
    function submitComment() {
      if (!commentText.value.trim()) {
        common_vendor.index.showToast({
          title: "请输入评论内容",
          icon: "none"
        });
        return;
      }
      const newComment = {
        id: "c" + Date.now(),
        user: "我",
        role: "",
        time: "刚刚",
        avatar: "/static/logo.png",
        text: commentText.value,
        replies: []
      };
      comments.push(newComment);
      common_vendor.index.showToast({
        title: "评论提交成功",
        icon: "success"
      });
      commentText.value = "";
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: post.avatar,
        b: common_vendor.t(post.user),
        c: common_vendor.t(post.pet),
        d: common_vendor.t(post.breed),
        e: common_vendor.t(post.time),
        f: common_vendor.t(post.text),
        g: post.images && post.images.length
      }, post.images && post.images.length ? {
        h: common_vendor.f(post.images, (img, i, i0) => {
          return {
            a: i,
            b: img
          };
        })
      } : {}, {
        i: common_assets._imports_0$5,
        j: common_vendor.t(post.shares),
        k: common_assets._imports_1$2,
        l: common_vendor.t(comments.length),
        m: common_assets._imports_2$4,
        n: common_vendor.t(post.likes),
        o: common_vendor.t(comments.length),
        p: common_vendor.f(comments, (c, k0, i0) => {
          return common_vendor.e({
            a: c.avatar,
            b: common_vendor.t(c.user),
            c: c.role
          }, c.role ? {
            d: common_vendor.t(c.role)
          } : {}, {
            e: common_vendor.t(c.time),
            f: common_vendor.t(c.text),
            g: c.replies && c.replies.length
          }, c.replies && c.replies.length ? {
            h: common_vendor.f(c.replies, (r, ri, i1) => {
              return {
                a: common_vendor.t(r.user),
                b: common_vendor.t(r.text),
                c: ri
              };
            })
          } : {}, {
            i: c.id
          });
        }),
        q: common_assets._imports_0$5,
        r: common_vendor.o(sharePost),
        s: post.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
        t: common_vendor.o(likePost),
        v: common_vendor.o(submitComment),
        w: commentText.value,
        x: common_vendor.o(($event) => commentText.value = $event.detail.value),
        y: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6818b03b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/communityDetail/communityDetail.js.map
