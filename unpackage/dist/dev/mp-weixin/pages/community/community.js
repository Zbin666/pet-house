"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  __name: "community",
  setup(__props) {
    const topTab = common_vendor.ref("square");
    const dynamicTopPadding = common_vendor.ref("");
    common_vendor.onMounted(() => {
      try {
        const info = common_vendor.index.getSystemInfoSync();
        const statusBar = info.statusBarHeight || 0;
        const screenW = info.screenWidth || 375;
        const rpxToPx = (rpx) => rpx * screenW / 750;
        const topPx = Math.round(statusBar * 0.35);
        dynamicTopPadding.value = `padding-top:${topPx}px;`;
      } catch (e) {
        dynamicTopPadding.value = "";
      }
    });
    const categories = common_vendor.ref([
      { key: "rec", name: "推荐" },
      { key: "daily", name: "生活日常" },
      { key: "dress", name: "宠物穿搭" },
      { key: "care", name: "养护分享" },
      { key: "fun", name: "搞笑日常" }
    ]);
    const currentCategory = common_vendor.ref("rec");
    const posts = common_vendor.ref([
      { id: "p1", user: "喵星人", pet: "布偶猫", breed: "呆呆", time: "刚刚", text: "布偶是一只仙女喵哦~ 💖💖 优雅的姿态太可爱啦！", avatar: "/static/logo.png", images: ["/static/logo.png", "/static/logo.png", "/static/logo.png"], likes: 2631, comments: 2631, shares: 2631 },
      { id: "p2", user: "汪汪大队", pet: "金毛", breed: "呼呼", time: "12:30", text: "好喜欢我的呼呼～ 事事有回应件件有着落的", avatar: "/static/logo.png", images: ["/static/logo.png", "/static/logo.png", "/static/logo.png"], likes: 102, comments: 8, shares: 5 }
    ]);
    const qaPosts = common_vendor.ref([
      {
        id: "qa1",
        title: "狗狗夏天要注意什么?",
        isUrgent: false,
        hasAnswer: true,
        doctor: {
          name: "刘医生",
          title: "专业宠物医生",
          avatar: "/static/logo.png"
        },
        answerPreview: "天气炎热的夏天又到了,每次到这时候都要剃毛散热了,还要避免中暑;避免高温遛狗夏季天...",
        answerCount: 10,
        readCount: 50,
        time: "2小时前"
      },
      {
        id: "qa2",
        title: "小猫猫护食咋办?",
        isUrgent: true,
        hasAnswer: false,
        doctor: null,
        answerPreview: null,
        answerCount: 0,
        readCount: 12,
        time: "30分钟前"
      }
    ]);
    const sciencePosts = common_vendor.ref([
      { id: "s1", title: "猫咪的20种肢体语言～快来速查🔎 终于知道猫猫心里在想什么了", reads: 50, cover: "/static/logo.png" },
      { id: "s2", title: "狗狗防暑保命清单", reads: 36, cover: "/static/logo.png" },
      { id: "s3", title: "如何训练猫咪使用猫砂盆？新手铲屎官必看指南", reads: 28, cover: "/static/logo.png" },
      { id: "s4", title: "狗狗疫苗时间表：从幼犬到成年的完整接种计划", reads: 42, cover: "/static/logo.png" },
      { id: "s5", title: "猫咪发情期护理：如何安全度过发情季节", reads: 33, cover: "/static/logo.png" },
      { id: "s6", title: "狗狗皮肤病预防与治疗：常见皮肤病识别手册", reads: 67, cover: "/static/logo.png" },
      { id: "s7", title: "猫咪营养需求分析：不同年龄阶段的饮食搭配", reads: 45, cover: "/static/logo.png" },
      { id: "s8", title: "狗狗行为训练：从基础指令到高级技巧", reads: 39, cover: "/static/logo.png" }
    ]);
    function selectCategory(key) {
      currentCategory.value = key;
    }
    function switchTab(tab) {
      topTab.value = tab;
    }
    function goDetail(post) {
      common_vendor.index.navigateTo({
        url: "/pages/communityDetail/communityDetail",
        success: (res) => {
          try {
            res.eventChannel.emit("post", post);
          } catch (e) {
          }
        }
      });
    }
    function goQADetail(qa) {
      common_vendor.index.navigateTo({
        url: "/pages/questionDetail/questionDetail",
        success: (res) => {
          try {
            res.eventChannel.emit("qa", qa);
          } catch (e) {
          }
        }
      });
    }
    function goScienceDetail(article) {
      common_vendor.index.navigateTo({
        url: "/pages/scienceDetail/scienceDetail",
        success: (res) => {
          try {
            res.eventChannel.emit("science", article);
          } catch (e) {
          }
        }
      });
    }
    function goToCreate() {
      common_vendor.index.navigateTo({ url: "/pages/createCommunity/createCommunity" });
    }
    function noop() {
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: topTab.value === "square"
      }, topTab.value === "square" ? {
        b: common_assets._imports_0$6
      } : {}, {
        c: common_vendor.n(topTab.value === "square" ? "active" : ""),
        d: common_vendor.o(($event) => switchTab("square")),
        e: topTab.value === "qa"
      }, topTab.value === "qa" ? {
        f: common_assets._imports_0$6
      } : {}, {
        g: common_vendor.n(topTab.value === "qa" ? "active" : ""),
        h: common_vendor.o(($event) => switchTab("qa")),
        i: topTab.value === "science"
      }, topTab.value === "science" ? {
        j: common_assets._imports_0$6
      } : {}, {
        k: common_vendor.n(topTab.value === "science" ? "active" : ""),
        l: common_vendor.o(($event) => switchTab("science")),
        m: common_assets._imports_1$3,
        n: topTab.value === "square"
      }, topTab.value === "square" ? {
        o: common_vendor.f(categories.value, (c, k0, i0) => {
          return {
            a: common_vendor.t(c.name),
            b: c.key,
            c: common_vendor.n(currentCategory.value === c.key ? "on" : ""),
            d: common_vendor.o(($event) => selectCategory(c.key), c.key)
          };
        })
      } : {}, {
        p: topTab.value === "square"
      }, topTab.value === "square" ? {
        q: common_vendor.f(posts.value, (post, k0, i0) => {
          return common_vendor.e({
            a: post.avatar,
            b: common_vendor.t(post.user),
            c: common_vendor.t(post.pet),
            d: common_vendor.t(post.breed),
            e: common_vendor.t(post.time),
            f: common_vendor.t(post.text),
            g: post.images && post.images.length
          }, post.images && post.images.length ? {
            h: common_vendor.f(post.images, (img, i, i1) => {
              return {
                a: i,
                b: img
              };
            })
          } : {}, {
            i: common_vendor.t(post.shares),
            j: common_vendor.t(post.comments),
            k: common_vendor.t(post.likes),
            l: common_vendor.o(noop, post.id),
            m: post.id,
            n: common_vendor.o(($event) => goDetail(post), post.id)
          });
        }),
        r: common_assets._imports_0$5,
        s: common_assets._imports_1$2,
        t: common_assets._imports_2$4
      } : {}, {
        v: topTab.value === "science"
      }, topTab.value === "science" ? {
        w: common_vendor.f(sciencePosts.value, (a, k0, i0) => {
          return {
            a: a.cover,
            b: common_vendor.t(a.title),
            c: common_vendor.t(a.reads),
            d: a.id,
            e: common_vendor.o(($event) => goScienceDetail(a), a.id)
          };
        })
      } : {}, {
        x: topTab.value === "qa"
      }, topTab.value === "qa" ? {
        y: common_vendor.f(qaPosts.value, (qa, k0, i0) => {
          return common_vendor.e({
            a: qa.isUrgent
          }, qa.isUrgent ? {} : {}, {
            b: common_vendor.t(qa.title),
            c: qa.hasAnswer
          }, qa.hasAnswer ? {
            d: qa.doctor.avatar,
            e: common_vendor.t(qa.doctor.name),
            f: common_vendor.t(qa.doctor.title),
            g: common_vendor.t(qa.answerPreview)
          } : {}, {
            h: common_vendor.t(qa.answerCount),
            i: common_vendor.t(qa.readCount),
            j: qa.id,
            k: common_vendor.o(($event) => goQADetail(qa), qa.id)
          });
        })
      } : {}, {
        z: topTab.value !== "science"
      }, topTab.value !== "science" ? {
        A: common_assets._imports_2$2,
        B: common_vendor.o(goToCreate)
      } : {}, {
        C: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
