"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "community",
  setup(__props) {
    const topTab = common_vendor.ref("square");
    const currentUser = common_vendor.ref(null);
    const searchText = common_vendor.ref("");
    const isSearching = common_vendor.ref(false);
    const dynamicTopPadding = common_vendor.ref("");
    common_vendor.onMounted(async () => {
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
      try {
        const userProfile = await utils_api.api.getProfile();
        currentUser.value = userProfile;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:195", "获取用户信息失败:", e);
      }
      loadFeeds();
      loadQuestions();
      try {
        common_vendor.index.$on("feeds:refresh", () => {
          if (topTab.value === "square")
            loadFeeds();
        });
      } catch (e) {
      }
      try {
        common_vendor.index.$on("qa:refresh", () => {
          if (topTab.value === "qa")
            loadQuestions();
        });
      } catch (e) {
      }
    });
    common_vendor.onShow(() => {
      if (topTab.value === "qa") {
        loadQuestions();
      } else if (topTab.value === "square") {
        loadFeeds();
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
    const posts = common_vendor.ref([]);
    async function loadFeeds(params = {}) {
      try {
        const res = await utils_api.api.getFeeds({ page: 1, limit: 20, ...params });
        const list = Array.isArray(res) ? res : res.feeds || res.data || [];
        posts.value = list.map((f) => {
          const user = f.User || {};
          const pet = f.Pet || {};
          const imgs = Array.isArray(f.images) ? f.images : [];
          const created = f.createdAt ? new Date(f.createdAt) : null;
          const now = /* @__PURE__ */ new Date();
          const timeDiff = now.getTime() - created.getTime();
          const minutesDiff = Math.floor(timeDiff / (1e3 * 60));
          let time = "刚刚";
          if (minutesDiff < 1) {
            time = "刚刚";
          } else if (minutesDiff < 60) {
            time = `${minutesDiff}分钟前`;
          } else if (minutesDiff < 1440) {
            const hoursDiff = Math.floor(minutesDiff / 60);
            time = `${hoursDiff}小时前`;
          } else {
            time = `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}`;
          }
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
          return {
            id: f.id,
            userId: f.userId,
            // 添加动态作者ID
            user: user.nickname || "用户",
            pet: pet.name || "",
            breed: pet.breed || "",
            time,
            title: title ? `#${title}` : "",
            text: f.text || "",
            avatar: user.avatarUrl || "/static/logo.png",
            images: imgs,
            likes: f.likes || 0,
            comments: typeof f.commentsCount === "number" ? f.commentsCount : Array.isArray(f.Comments) ? f.Comments.length : 0,
            shares: f.shares || 0,
            isOwner: currentUser.value && f.userId === currentUser.value.id,
            // 判断是否为作者
            isLiked: f.isLiked || false
            // 添加点赞状态
          };
        });
      } catch (e) {
        posts.value = [];
      }
    }
    async function loadQuestions(params = {}) {
      try {
        const res = await utils_api.api.getQuestions({ page: 1, limit: 20, ...params });
        const list = Array.isArray(res) ? res : res.questions || res.data || [];
        qaPosts.value = list.map((q) => {
          common_vendor.index.__f__("log", "at pages/community/community.vue:304", "处理问答数据:", q);
          common_vendor.index.__f__("log", "at pages/community/community.vue:305", "topAnswer数据:", q.topAnswer);
          let time = "刚刚";
          if (q.createdAt) {
            const created = new Date(q.createdAt);
            const month = created.getUTCMonth() + 1;
            const date = created.getUTCDate();
            const hours = created.getUTCHours().toString().padStart(2, "0");
            const minutes = created.getUTCMinutes().toString().padStart(2, "0");
            time = `${month}/${date} ${hours}:${minutes}`;
          }
          let tags = [];
          if (q.tags) {
            try {
              tags = typeof q.tags === "string" ? JSON.parse(q.tags) : q.tags;
              if (!Array.isArray(tags)) {
                tags = [];
              }
            } catch (e) {
              tags = [];
            }
          }
          const processedQ = {
            id: q.id,
            title: q.title,
            isUrgent: q.isUrgent,
            hasAnswer: q.answerCount > 0,
            topAnswer: q.topAnswer || null,
            answerCount: q.answerCount || 0,
            readCount: q.views || 0,
            time,
            tags
          };
          common_vendor.index.__f__("log", "at pages/community/community.vue:343", "处理后的问答数据:", processedQ);
          return processedQ;
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:347", "加载问答数据失败:", e);
        qaPosts.value = [];
      }
    }
    const qaPosts = common_vendor.ref([]);
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
      if (topTab.value === "square") {
        const categoryParam = key === "rec" ? void 0 : key;
        loadFeeds(categoryParam ? { category: categoryParam } : {});
      }
    }
    function switchTab(tab) {
      topTab.value = tab;
      if (tab === "square" && posts.value.length === 0) {
        loadFeeds();
      } else if (tab === "qa" && qaPosts.value.length === 0) {
        loadQuestions();
      }
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
    async function toggleLike(post) {
      if (!currentUser.value) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
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
        common_vendor.index.__f__("error", "at pages/community/community.vue:442", "点赞操作失败:", error);
        common_vendor.index.showToast({
          title: "操作失败",
          icon: "none"
        });
      }
    }
    async function deletePost(post) {
      try {
        common_vendor.index.showModal({
          title: "确认删除",
          content: "确定要删除这条动态吗？删除后无法恢复。",
          confirmText: "删除",
          cancelText: "取消",
          confirmColor: "#ff4757",
          success: async (res) => {
            if (res.confirm) {
              try {
                await utils_api.api.deleteFeed(post.id);
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                const index = posts.value.findIndex((p) => p.id === post.id);
                if (index > -1) {
                  posts.value.splice(index, 1);
                }
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/community/community.vue:473", "删除动态失败:", error);
                common_vendor.index.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:483", "删除动态失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    }
    function handleSearch() {
      if (!searchText.value.trim())
        return;
      isSearching.value = true;
      if (topTab.value === "square") {
        loadFeeds({ search: searchText.value.trim() });
      } else if (topTab.value === "qa") {
        loadQuestions({ search: searchText.value.trim() });
      }
    }
    let searchTimeout = null;
    function handleSearchInput() {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      searchTimeout = setTimeout(() => {
        if (searchText.value.trim()) {
          handleSearch();
        } else {
          if (topTab.value === "square") {
            loadFeeds();
          } else if (topTab.value === "qa") {
            loadQuestions();
          }
          isSearching.value = false;
        }
      }, 500);
    }
    function clearSearch() {
      common_vendor.index.__f__("log", "at pages/community/community.vue:527", "清除搜索被调用");
      searchText.value = "";
      isSearching.value = false;
      if (topTab.value === "square") {
        loadFeeds();
      } else if (topTab.value === "qa") {
        loadQuestions();
      }
      common_vendor.index.__f__("log", "at pages/community/community.vue:535", "搜索文本已清除:", searchText.value);
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
        n: common_vendor.o(handleSearch),
        o: common_vendor.o([($event) => searchText.value = $event.detail.value, handleSearchInput]),
        p: searchText.value,
        q: searchText.value
      }, searchText.value ? {
        r: common_vendor.o(clearSearch)
      } : {}, {
        s: topTab.value === "square"
      }, topTab.value === "square" ? {
        t: common_vendor.f(categories.value, (c, k0, i0) => {
          return {
            a: common_vendor.t(c.name),
            b: c.key,
            c: common_vendor.n(currentCategory.value === c.key ? "on" : ""),
            d: common_vendor.o(($event) => selectCategory(c.key), c.key)
          };
        })
      } : {}, {
        v: topTab.value === "square"
      }, topTab.value === "square" ? {
        w: common_vendor.f(posts.value, (post, k0, i0) => {
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
            j: common_vendor.f(post.images, (img, i, i1) => {
              return {
                a: i,
                b: img
              };
            })
          } : {}, {
            k: common_vendor.t(post.shares),
            l: common_vendor.t(post.comments),
            m: post.isLiked ? "/static/community/good-active.png" : "/static/community/good.png",
            n: common_vendor.t(post.likes),
            o: common_vendor.o(($event) => toggleLike(post), post.id),
            p: post.isOwner
          }, post.isOwner ? {
            q: common_assets._imports_1$1,
            r: common_vendor.o(($event) => deletePost(post), post.id)
          } : {}, {
            s: common_vendor.o(noop, post.id),
            t: post.id,
            v: common_vendor.o(($event) => goDetail(post), post.id)
          });
        }),
        x: common_assets._imports_0$5,
        y: common_assets._imports_1$2
      } : {}, {
        z: topTab.value === "science"
      }, topTab.value === "science" ? {
        A: common_vendor.f(sciencePosts.value, (a, k0, i0) => {
          return {
            a: a.cover,
            b: common_vendor.t(a.title),
            c: common_vendor.t(a.reads),
            d: a.id,
            e: common_vendor.o(($event) => goScienceDetail(a), a.id)
          };
        })
      } : {}, {
        B: topTab.value === "qa"
      }, topTab.value === "qa" ? {
        C: common_vendor.f(qaPosts.value, (qa, k0, i0) => {
          return common_vendor.e({
            a: qa.isUrgent
          }, qa.isUrgent ? {} : {}, {
            b: common_vendor.t(qa.title),
            c: qa.tags && qa.tags.length > 0
          }, qa.tags && qa.tags.length > 0 ? {
            d: common_vendor.f(qa.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            })
          } : {}, {
            e: qa.hasAnswer && qa.topAnswer
          }, qa.hasAnswer && qa.topAnswer ? common_vendor.e({
            f: qa.topAnswer.user.avatarUrl || "/static/logo.png",
            g: common_vendor.t(qa.topAnswer.user.nickname),
            h: qa.topAnswer.pet
          }, qa.topAnswer.pet ? {
            i: common_vendor.t(qa.topAnswer.pet.name),
            j: common_vendor.t(qa.topAnswer.pet.breed)
          } : {}, {
            k: qa.topAnswer.isTopLiked
          }, qa.topAnswer.isTopLiked ? {
            l: common_assets._imports_5$1,
            m: common_vendor.t(qa.topAnswer.likes)
          } : {}, {
            n: common_vendor.t(qa.topAnswer.content.length > 50 ? qa.topAnswer.content.substring(0, 50) + "..." : qa.topAnswer.content),
            o: common_vendor.t(qa.answerCount),
            p: common_vendor.o(($event) => goQADetail(qa), qa.id)
          }) : qa.hasAnswer ? {
            r: common_vendor.t(qa.answerCount),
            s: common_vendor.o(($event) => goQADetail(qa), qa.id)
          } : {}, {
            q: qa.hasAnswer,
            t: common_vendor.t(qa.answerCount),
            v: common_vendor.t(qa.readCount),
            w: qa.id,
            x: common_vendor.o(($event) => goQADetail(qa), qa.id)
          });
        })
      } : {}, {
        D: topTab.value !== "science"
      }, topTab.value !== "science" ? {
        E: common_assets._imports_3$1,
        F: common_vendor.o(goToCreate)
      } : {}, {
        G: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
