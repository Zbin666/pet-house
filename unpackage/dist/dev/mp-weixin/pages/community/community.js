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
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const isLoading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const isRefreshing = common_vendor.ref(false);
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
        common_vendor.index.__f__("error", "at pages/community/community.vue:201", "获取用户信息失败:", e);
      }
      loadFeeds();
      try {
        common_vendor.index.$on("feeds:refresh", () => {
          if (topTab.value === "square")
            loadFeeds();
        });
      } catch (e) {
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
    async function loadFeeds(params = {}, isLoadMore = false) {
      var _a;
      if (isLoading.value)
        return;
      try {
        isLoading.value = true;
        const page = isLoadMore ? currentPage.value : 1;
        const res = await utils_api.api.getFeeds({
          page,
          limit: pageSize.value,
          ...params
        });
        const list = Array.isArray(res) ? res : res.feeds || res.data || [];
        const total = ((_a = res.pagination) == null ? void 0 : _a.total) || res.total || list.length;
        common_vendor.index.__f__("log", "at pages/community/community.vue:238", "=== 数据处理 ===");
        common_vendor.index.__f__("log", "at pages/community/community.vue:239", "当前页:", page);
        common_vendor.index.__f__("log", "at pages/community/community.vue:240", "每页大小:", pageSize.value);
        common_vendor.index.__f__("log", "at pages/community/community.vue:241", "返回数据量:", list.length);
        common_vendor.index.__f__("log", "at pages/community/community.vue:242", "总数据量:", total);
        common_vendor.index.__f__("log", "at pages/community/community.vue:243", "是否加载更多:", isLoadMore);
        hasMore.value = page * pageSize.value < total;
        common_vendor.index.__f__("log", "at pages/community/community.vue:247", "计算hasMore:", hasMore.value, "(", page * pageSize.value, "<", total, ")");
        const processedList = list.map((f) => {
          const user = f.User || {};
          const pet = f.Pet || {};
          const imgs = Array.isArray(f.images) ? f.images : [];
          let time = "刚刚";
          if (f.createdAt) {
            const created = new Date(f.createdAt);
            const month = created.getUTCMonth() + 1;
            const date = created.getUTCDate();
            const hours = created.getUTCHours().toString().padStart(2, "0");
            const minutes = created.getUTCMinutes().toString().padStart(2, "0");
            time = `${month}/${date} ${hours}:${minutes}`;
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
        if (isLoadMore) {
          common_vendor.index.__f__("log", "at pages/community/community.vue:305", "追加数据：", processedList.length, "条");
          posts.value = [...posts.value, ...processedList];
          currentPage.value += 1;
          common_vendor.index.__f__("log", "at pages/community/community.vue:308", "追加后总数：", posts.value.length, "条");
        } else {
          common_vendor.index.__f__("log", "at pages/community/community.vue:310", "替换数据：", processedList.length, "条");
          posts.value = processedList;
          currentPage.value = 2;
          common_vendor.index.__f__("log", "at pages/community/community.vue:313", "替换后总数：", posts.value.length, "条");
        }
        common_vendor.index.__f__("log", "at pages/community/community.vue:316", "最终状态：", {
          currentPage: currentPage.value,
          hasMore: hasMore.value,
          totalPosts: posts.value.length
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:323", "加载动态失败:", e);
        if (!isLoadMore) {
          posts.value = [];
        }
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
      }
    }
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
      if (topTab.value === "square") {
        currentPage.value = 1;
        hasMore.value = true;
        const categoryParam = key === "rec" ? void 0 : key;
        loadFeeds(categoryParam ? { category: categoryParam } : {});
      }
    }
    function handleSearch() {
      if (searchText.value.trim()) {
        isSearching.value = true;
        currentPage.value = 1;
        hasMore.value = true;
        loadFeeds({ search: searchText.value.trim() });
      }
    }
    function handleSearchInput() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        if (searchText.value.trim()) {
          isSearching.value = true;
          currentPage.value = 1;
          hasMore.value = true;
          loadFeeds({ search: searchText.value.trim() });
        } else if (isSearching.value) {
          isSearching.value = false;
          currentPage.value = 1;
          hasMore.value = true;
          loadFeeds();
        }
      }, 500);
    }
    function clearSearch() {
      searchText.value = "";
      isSearching.value = false;
      currentPage.value = 1;
      hasMore.value = true;
      loadFeeds();
    }
    async function loadMoreFeeds() {
      common_vendor.index.__f__("log", "at pages/community/community.vue:434", "=== 触发加载更多 ===");
      common_vendor.index.__f__("log", "at pages/community/community.vue:435", "hasMore:", hasMore.value);
      common_vendor.index.__f__("log", "at pages/community/community.vue:436", "isLoading:", isLoading.value);
      common_vendor.index.__f__("log", "at pages/community/community.vue:437", "currentPage:", currentPage.value);
      common_vendor.index.__f__("log", "at pages/community/community.vue:438", "posts.length:", posts.value.length);
      if (!hasMore.value || isLoading.value) {
        common_vendor.index.__f__("log", "at pages/community/community.vue:441", "跳过加载：hasMore=", hasMore.value, "isLoading=", isLoading.value);
        return;
      }
      const params = {};
      if (searchText.value.trim()) {
        params.search = searchText.value.trim();
      }
      if (currentCategory.value !== "rec") {
        params.category = currentCategory.value;
      }
      common_vendor.index.__f__("log", "at pages/community/community.vue:453", "开始加载更多，参数:", params);
      await loadFeeds(params, true);
    }
    async function onRefresh() {
      isRefreshing.value = true;
      currentPage.value = 1;
      hasMore.value = true;
      const params = {};
      if (searchText.value.trim()) {
        params.search = searchText.value.trim();
      }
      if (currentCategory.value !== "rec") {
        params.category = currentCategory.value;
      }
      await loadFeeds(params, false);
      setTimeout(() => {
        isRefreshing.value = false;
      }, 500);
    }
    let searchTimeout = null;
    function switchTab(tab) {
      topTab.value = tab;
      if (tab === "square" && posts.value.length === 0) {
        loadFeeds();
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
        common_vendor.index.__f__("error", "at pages/community/community.vue:546", "点赞操作失败:", error);
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
                common_vendor.index.__f__("error", "at pages/community/community.vue:577", "删除动态失败:", error);
                common_vendor.index.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:587", "删除动态失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
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
      }, topTab.value === "square" ? common_vendor.e({
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
        y: common_assets._imports_1$2,
        z: isLoading.value && posts.value.length > 0
      }, isLoading.value && posts.value.length > 0 ? {} : {}, {
        A: posts.value.length === 0 && !isLoading.value
      }, posts.value.length === 0 && !isLoading.value ? {
        B: common_assets._imports_5$1
      } : {}, {
        C: common_vendor.o(loadMoreFeeds),
        D: isRefreshing.value,
        E: common_vendor.o(onRefresh)
      }) : {}, {
        F: topTab.value === "science"
      }, topTab.value === "science" ? {
        G: common_vendor.f(sciencePosts.value, (a, k0, i0) => {
          return {
            a: a.cover,
            b: common_vendor.t(a.title),
            c: common_vendor.t(a.reads),
            d: a.id,
            e: common_vendor.o(($event) => goScienceDetail(a), a.id)
          };
        })
      } : {}, {
        H: topTab.value === "qa"
      }, topTab.value === "qa" ? {
        I: common_vendor.f(qaPosts.value, (qa, k0, i0) => {
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
        J: topTab.value !== "science"
      }, topTab.value !== "science" ? {
        K: common_assets._imports_3$1,
        L: common_vendor.o(goToCreate)
      } : {}, {
        M: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
