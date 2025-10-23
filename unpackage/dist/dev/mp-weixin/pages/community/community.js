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
      postImageCache.clear();
      avatarCache.clear();
      imageCache.clear();
      try {
        const userProfile = await utils_api.api.getProfile();
        currentUser.value = userProfile;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:274", "获取用户信息失败:", e);
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
      } else if (topTab.value === "science") {
        loadArticles();
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
    const feedPage = common_vendor.ref(1);
    const feedLimit = common_vendor.ref(10);
    const feedHasMore = common_vendor.ref(true);
    const feedLoading = common_vendor.ref(false);
    async function loadFeeds(params = {}, isLoadMore = false) {
      if (feedLoading.value)
        return;
      try {
        feedLoading.value = true;
        const currentPage = isLoadMore ? feedPage.value : 1;
        const res = await utils_api.api.getFeeds({
          page: currentPage,
          limit: feedLimit.value,
          ...params
        });
        const list = Array.isArray(res) ? res : res.feeds || res.data || [];
        const newPosts = list.map((f) => {
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
            avatar: user.avatarUrl || "/static/404.png",
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
          posts.value = [...posts.value, ...newPosts];
          feedPage.value++;
        } else {
          posts.value = newPosts;
          feedPage.value = 2;
        }
        feedHasMore.value = newPosts.length >= feedLimit.value;
      } catch (e) {
        if (!isLoadMore) {
          posts.value = [];
        }
      } finally {
        feedLoading.value = false;
      }
    }
    async function loadMoreFeeds() {
      if (!feedHasMore.value || feedLoading.value)
        return;
      await loadFeeds({}, true);
    }
    async function loadQuestions(params = {}, isLoadMore = false) {
      if (qaLoading.value)
        return;
      try {
        qaLoading.value = true;
        const currentPage = isLoadMore ? qaPage.value : 1;
        const res = await utils_api.api.getQuestions({
          page: currentPage,
          limit: qaLimit.value,
          ...params
        });
        const list = Array.isArray(res) ? res : res.questions || res.data || [];
        const newQaPosts = list.map((q) => {
          var _a, _b;
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
            userId: ((_a = q.user) == null ? void 0 : _a.id) || q.userId,
            // 从user对象中获取userId
            title: q.title,
            isUrgent: q.isUrgent,
            hasAnswer: q.answerCount > 0,
            topAnswer: q.topAnswerId ? {
              id: q.topAnswerId,
              content: q.topAnswerContent,
              likes: q.topAnswerLikes || 0,
              isTopLiked: true,
              user: q.topAnswerUserId ? {
                id: q.topAnswerUserId,
                nickname: q.topAnswerUserNickname,
                avatarUrl: q.topAnswerUserAvatar
              } : null,
              pet: q.topAnswerPetName ? {
                name: q.topAnswerPetName,
                breed: q.topAnswerPetBreed
              } : null
            } : null,
            answerCount: q.answerCount || 0,
            readCount: q.views || 0,
            time,
            tags,
            isOwner: currentUser.value && (((_b = q.user) == null ? void 0 : _b.id) || q.userId) === currentUser.value.id
            // 判断是否为作者
          };
          return processedQ;
        });
        for (const qa of newQaPosts) {
          if (!qa.topAnswer) {
            try {
              const detail = await utils_api.api.getQuestion(qa.id);
              if (detail && Array.isArray(detail.answers) && detail.answers.length > 0) {
                const top = [...detail.answers].sort((a, b) => b.likes - a.likes || new Date(a.createdAt) - new Date(b.createdAt))[0];
                qa.topAnswer = {
                  id: top.id,
                  content: top.content,
                  likes: top.likes || 0,
                  isTopLiked: true,
                  user: top.user || null,
                  pet: top.pet || null
                };
              } else {
              }
            } catch (err) {
            }
          }
        }
        if (isLoadMore) {
          qaPosts.value = [...qaPosts.value, ...newQaPosts];
          qaPage.value++;
        } else {
          qaPosts.value = newQaPosts;
          qaPage.value = 2;
        }
        qaHasMore.value = newQaPosts.length >= qaLimit.value;
        qaPosts.value = qaPosts.value.slice();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:528", "加载问答数据失败:", e);
        if (!isLoadMore) {
          qaPosts.value = [];
        }
      } finally {
        qaLoading.value = false;
      }
    }
    async function loadMoreQuestions() {
      if (!qaHasMore.value || qaLoading.value)
        return;
      await loadQuestions({}, true);
    }
    const qaPosts = common_vendor.ref([]);
    const qaPage = common_vendor.ref(1);
    const qaLimit = common_vendor.ref(10);
    const qaHasMore = common_vendor.ref(true);
    const qaLoading = common_vendor.ref(false);
    const sciencePosts = common_vendor.ref([]);
    const sciencePage = common_vendor.ref(1);
    const scienceLimit = common_vendor.ref(10);
    const scienceHasMore = common_vendor.ref(true);
    const scienceLoading = common_vendor.ref(false);
    async function loadArticles(params = {}, isLoadMore = false) {
      if (scienceLoading.value)
        return;
      try {
        scienceLoading.value = true;
        common_vendor.index.__f__("log", "at pages/community/community.vue:565", "开始加载科普文章，参数:", params, "是否加载更多:", isLoadMore);
        const currentPage = isLoadMore ? sciencePage.value : 1;
        const res = await utils_api.api.getArticles({
          page: currentPage,
          limit: scienceLimit.value,
          ...params
        });
        common_vendor.index.__f__("log", "at pages/community/community.vue:573", "API返回数据:", res);
        const list = Array.isArray(res) ? res : res.articles || res.data || [];
        common_vendor.index.__f__("log", "at pages/community/community.vue:576", "处理后的文章列表:", list);
        const newArticles = list.map((article) => {
          common_vendor.index.__f__("log", "at pages/community/community.vue:579", "处理文章:", article.title, "图片URL:", article.cover);
          return {
            id: article.id,
            title: article.title || "无标题",
            reads: article.reads || 0,
            cover: article.cover || "/static/404.png",
            // 添加用于下载的原始URL
            originalCover: article.cover
          };
        });
        if (isLoadMore) {
          sciencePosts.value = [...sciencePosts.value, ...newArticles];
          sciencePage.value++;
        } else {
          sciencePosts.value = newArticles;
          sciencePage.value = 2;
        }
        scienceHasMore.value = newArticles.length >= scienceLimit.value;
        common_vendor.index.__f__("log", "at pages/community/community.vue:603", "最终科普文章数据:", sciencePosts.value);
        common_vendor.index.__f__("log", "at pages/community/community.vue:604", "当前页数:", sciencePage.value, "是否还有更多:", scienceHasMore.value);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:606", "加载科普文章失败:", e);
        if (!isLoadMore) {
          sciencePosts.value = [];
        }
      } finally {
        scienceLoading.value = false;
      }
    }
    async function loadMoreArticles() {
      if (!scienceHasMore.value || scienceLoading.value)
        return;
      await loadArticles({}, true);
    }
    const imageCache = /* @__PURE__ */ new Map();
    const avatarCache = /* @__PURE__ */ new Map();
    const postImageCache = /* @__PURE__ */ new Map();
    const imageUpdateTrigger = common_vendor.ref(0);
    const qaAvatarUpdateTrigger = common_vendor.ref(0);
    function getUserAvatarSrc(url) {
      if (!url) {
        return "/static/user/user.png";
      }
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/")) {
        return normalized;
      }
      if (avatarCache.has(normalized)) {
        return avatarCache.get(normalized);
      }
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            avatarCache.set(normalized, res.tempFilePath);
            posts.value = [...posts.value];
            qaPosts.value = [...qaPosts.value];
            qaAvatarUpdateTrigger.value++;
          } else {
            avatarCache.set(normalized, "/static/user/user.png");
            posts.value = [...posts.value];
            qaPosts.value = [...qaPosts.value];
            qaAvatarUpdateTrigger.value++;
          }
        },
        fail: () => {
          avatarCache.set(normalized, "/static/user/user.png");
          posts.value = [...posts.value];
          qaPosts.value = [...qaPosts.value];
          qaAvatarUpdateTrigger.value++;
        }
      });
      return "/static/user/user.png";
    }
    function getImageSrc(article) {
      const originalUrl = article.originalCover;
      if (!originalUrl) {
        return "/static/404.png";
      }
      if (originalUrl.startsWith("/static/") || originalUrl.startsWith("wxfile://")) {
        return originalUrl;
      }
      if (imageCache.has(originalUrl)) {
        return imageCache.get(originalUrl);
      }
      common_vendor.index.downloadFile({
        url: originalUrl,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            imageCache.set(originalUrl, res.tempFilePath);
            sciencePosts.value = [...sciencePosts.value];
          } else {
            common_vendor.index.__f__("warn", "at pages/community/community.vue:716", "图片下载失败:", originalUrl, res.statusCode);
            imageCache.set(originalUrl, "/static/404.png");
            sciencePosts.value = [...sciencePosts.value];
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/community/community.vue:722", "图片下载失败:", originalUrl, err);
          imageCache.set(originalUrl, "/static/404.png");
          sciencePosts.value = [...sciencePosts.value];
        }
      });
      return "/static/404.png";
    }
    function getPostImageSrc(url) {
      if (!url) {
        return "/static/404.png";
      }
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/")) {
        return normalized;
      }
      if (postImageCache.has(normalized)) {
        return postImageCache.get(normalized);
      }
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            postImageCache.set(normalized, res.tempFilePath);
            imageUpdateTrigger.value++;
          } else {
            postImageCache.set(normalized, "/static/404.png");
            imageUpdateTrigger.value++;
          }
        },
        fail: () => {
          postImageCache.set(normalized, "/static/404.png");
          imageUpdateTrigger.value++;
        }
      });
      return "/static/404.png";
    }
    function handleImageError(e) {
      common_vendor.index.__f__("error", "at pages/community/community.vue:785", "图片加载失败:", e);
      common_vendor.index.__f__("error", "at pages/community/community.vue:786", "图片URL:", e.target.src);
      common_vendor.index.__f__("error", "at pages/community/community.vue:787", "错误详情:", e.detail);
      e.target.src = "/static/404.png";
      common_vendor.index.__f__("log", "at pages/community/community.vue:791", "已设置默认图片:", e.target.src);
    }
    function handleImageLoad(e) {
      common_vendor.index.__f__("log", "at pages/community/community.vue:796", "图片加载成功:", e.target.src);
    }
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
      } else if (tab === "science" && sciencePosts.value.length === 0) {
        loadArticles();
      }
    }
    function goDetail(post) {
      common_vendor.index.navigateTo({
        url: `/pages/communityDetail/communityDetail?id=${post.id}`,
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
    async function goScienceDetail(article) {
      try {
        common_vendor.index.__f__("log", "at pages/community/community.vue:841", "🔍 点击科普文章:", article);
        common_vendor.index.__f__("log", "at pages/community/community.vue:842", "🔍 当前阅读数:", article.reads);
        common_vendor.index.__f__("log", "at pages/community/community.vue:845", "📡 开始调用增加阅读数API...");
        const result = await utils_api.api.incrementArticleReads(article.id);
        common_vendor.index.__f__("log", "at pages/community/community.vue:847", "📡 API返回结果:", result);
        if (result && result.success) {
          common_vendor.index.__f__("log", "at pages/community/community.vue:850", "✅ 阅读数增加成功，新阅读数:", result.reads);
          const index = sciencePosts.value.findIndex((a) => a.id === article.id);
          common_vendor.index.__f__("log", "at pages/community/community.vue:853", "🔍 找到文章索引:", index);
          if (index > -1) {
            common_vendor.index.__f__("log", "at pages/community/community.vue:856", "🔄 更新前本地阅读数:", sciencePosts.value[index].reads);
            sciencePosts.value[index].reads = result.reads;
            common_vendor.index.__f__("log", "at pages/community/community.vue:858", "🔄 更新后本地阅读数:", sciencePosts.value[index].reads);
          }
          article.reads = result.reads;
          common_vendor.index.__f__("log", "at pages/community/community.vue:862", "🔄 更新传入详情页的阅读数:", article.reads);
        } else {
          common_vendor.index.__f__("warn", "at pages/community/community.vue:864", "⚠️ API返回失败或格式不正确:", result);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:867", "❌ 增加阅读数失败:", error);
      }
      common_vendor.index.__f__("log", "at pages/community/community.vue:871", "🚀 准备跳转到详情页，文章数据:", article);
      common_vendor.index.navigateTo({
        url: `/pages/scienceDetail/scienceDetail?id=${article.id}`,
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/community/community.vue:875", "✅ 页面跳转成功");
          try {
            res.eventChannel.emit("science", article);
            common_vendor.index.__f__("log", "at pages/community/community.vue:878", "📤 已发送文章数据到详情页:", article);
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/community/community.vue:880", "❌ 发送数据到详情页失败:", e);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/community/community.vue:884", "❌ 页面跳转失败:", err);
        }
      });
    }
    function goToCreate() {
      common_vendor.index.navigateTo({ url: "/pages/createCommunity/createCommunity" });
    }
    function noop() {
    }
    function previewImages(images, current) {
      if (!images || images.length === 0)
        return;
      common_vendor.index.previewImage({
        current,
        urls: images,
        success: () => {
          common_vendor.index.__f__("log", "at pages/community/community.vue:899", "图片预览成功");
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/community/community.vue:902", "图片预览失败:", err);
          common_vendor.index.showToast({
            title: "图片预览失败",
            icon: "none"
          });
        }
      });
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
        common_vendor.index.__f__("error", "at pages/community/community.vue:935", "点赞操作失败:", error);
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
                common_vendor.index.__f__("error", "at pages/community/community.vue:966", "删除动态失败:", error);
                common_vendor.index.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:976", "删除动态失败:", error);
        common_vendor.index.showToast({
          title: "删除失败",
          icon: "none"
        });
      }
    }
    async function deleteQuestion(qa) {
      try {
        common_vendor.index.showModal({
          title: "确认删除",
          content: "确定要删除这个问答吗？删除后无法恢复。",
          confirmText: "删除",
          cancelText: "取消",
          confirmColor: "#ff4757",
          success: async (res) => {
            if (res.confirm) {
              try {
                await utils_api.api.deleteQuestion(qa.id);
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                const index = qaPosts.value.findIndex((q) => q.id === qa.id);
                if (index > -1) {
                  qaPosts.value.splice(index, 1);
                }
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/community/community.vue:1007", "删除问答失败:", error);
                common_vendor.index.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:1017", "删除问答失败:", error);
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
      } else if (topTab.value === "science") {
        loadArticles({ search: searchText.value.trim() });
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
          } else if (topTab.value === "science") {
            loadArticles();
          }
          isSearching.value = false;
        }
      }, 500);
    }
    function clearSearch() {
      searchText.value = "";
      isSearching.value = false;
      if (topTab.value === "square") {
        loadFeeds();
      } else if (topTab.value === "qa") {
        loadQuestions();
      } else if (topTab.value === "science") {
        loadArticles();
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: topTab.value === "square"
      }, topTab.value === "square" ? {
        b: common_assets._imports_0$7
      } : {}, {
        c: common_vendor.n(topTab.value === "square" ? "active" : ""),
        d: common_vendor.o(($event) => switchTab("square")),
        e: topTab.value === "qa"
      }, topTab.value === "qa" ? {
        f: common_assets._imports_0$7
      } : {}, {
        g: common_vendor.n(topTab.value === "qa" ? "active" : ""),
        h: common_vendor.o(($event) => switchTab("qa")),
        i: topTab.value === "science"
      }, topTab.value === "science" ? {
        j: common_assets._imports_0$7
      } : {}, {
        k: common_vendor.n(topTab.value === "science" ? "active" : ""),
        l: common_vendor.o(($event) => switchTab("science")),
        m: common_assets._imports_1$2,
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
            a: getUserAvatarSrc(post.avatar),
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
                a: `${imageUpdateTrigger.value}-${i}`,
                b: getPostImageSrc(img),
                c: common_vendor.o(($event) => previewImages(post.images, i), `${imageUpdateTrigger.value}-${i}`)
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
            q: common_assets._imports_0$4,
            r: common_vendor.o(($event) => deletePost(post), post.id)
          } : {}, {
            s: common_vendor.o(noop, post.id),
            t: post.id,
            v: common_vendor.o(($event) => goDetail(post), post.id)
          });
        }),
        x: common_assets._imports_0$6,
        y: common_assets._imports_1$1,
        z: posts.value.length > 0
      }, posts.value.length > 0 ? common_vendor.e({
        A: feedLoading.value
      }, feedLoading.value ? {} : !feedHasMore.value ? {} : {
        C: common_vendor.o(loadMoreFeeds)
      }, {
        B: !feedHasMore.value
      }) : {}, {
        D: common_vendor.o(loadMoreFeeds),
        E: feedLoading.value,
        F: common_vendor.o(() => loadFeeds())
      }) : {}, {
        G: topTab.value === "science"
      }, topTab.value === "science" ? common_vendor.e({
        H: common_vendor.f(sciencePosts.value, (a, k0, i0) => {
          return {
            a: getImageSrc(a),
            b: common_vendor.o(handleImageError, a.id),
            c: common_vendor.o(handleImageLoad, a.id),
            d: common_vendor.t(a.title),
            e: common_vendor.t(a.reads),
            f: a.id,
            g: common_vendor.o(($event) => goScienceDetail(a), a.id)
          };
        }),
        I: sciencePosts.value.length > 0
      }, sciencePosts.value.length > 0 ? common_vendor.e({
        J: scienceLoading.value
      }, scienceLoading.value ? {} : !scienceHasMore.value ? {} : {
        L: common_vendor.o(loadMoreArticles)
      }, {
        K: !scienceHasMore.value
      }) : {}, {
        M: common_vendor.o(loadMoreArticles),
        N: scienceLoading.value,
        O: common_vendor.o(() => loadArticles())
      }) : {}, {
        P: topTab.value === "qa"
      }, topTab.value === "qa" ? common_vendor.e({
        Q: common_vendor.f(qaPosts.value, (qa, k0, i0) => {
          return common_vendor.e({
            a: qa.isOwner
          }, qa.isOwner ? {
            b: common_assets._imports_0$4,
            c: common_vendor.o(($event) => deleteQuestion(qa), qa.id)
          } : {}, {
            d: qa.isUrgent
          }, qa.isUrgent ? {} : {}, {
            e: common_vendor.t(qa.title),
            f: qa.tags && qa.tags.length > 0
          }, qa.tags && qa.tags.length > 0 ? {
            g: common_vendor.f(qa.tags, (tag, k1, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tag
              };
            })
          } : {}, {
            h: qa.hasAnswer && qa.topAnswer
          }, qa.hasAnswer && qa.topAnswer ? common_vendor.e({
            i: getUserAvatarSrc(qa.topAnswer.user.avatarUrl),
            j: `qa-avatar-${qaAvatarUpdateTrigger.value}-${qa.topAnswer.user.id || qa.id}`,
            k: common_vendor.t(qa.topAnswer.user.nickname),
            l: qa.topAnswer.pet
          }, qa.topAnswer.pet ? {
            m: common_vendor.t(qa.topAnswer.pet.name),
            n: common_vendor.t(qa.topAnswer.pet.breed)
          } : {}, {
            o: qa.topAnswer.isTopLiked
          }, qa.topAnswer.isTopLiked ? {
            p: common_assets._imports_5$1,
            q: common_vendor.t(qa.topAnswer.likes)
          } : {}, {
            r: common_vendor.t(qa.topAnswer.content.length > 50 ? qa.topAnswer.content.substring(0, 50) + "..." : qa.topAnswer.content),
            s: common_vendor.t(qa.answerCount),
            t: common_vendor.o(($event) => goQADetail(qa), qa.id),
            v: `qa-content-${qaAvatarUpdateTrigger.value}-${qa.id}`
          }) : qa.hasAnswer ? {
            x: common_vendor.t(qa.answerCount),
            y: common_vendor.o(($event) => goQADetail(qa), qa.id)
          } : {}, {
            w: qa.hasAnswer,
            z: common_vendor.t(qa.answerCount),
            A: common_vendor.t(qa.readCount),
            B: qa.id,
            C: common_vendor.o(($event) => goQADetail(qa), qa.id)
          });
        }),
        R: qaPosts.value.length > 0
      }, qaPosts.value.length > 0 ? common_vendor.e({
        S: qaLoading.value
      }, qaLoading.value ? {} : !qaHasMore.value ? {} : {
        U: common_vendor.o(loadMoreQuestions)
      }, {
        T: !qaHasMore.value
      }) : {}, {
        V: common_vendor.o(loadMoreQuestions),
        W: qaLoading.value,
        X: common_vendor.o(() => loadQuestions())
      }) : {}, {
        Y: topTab.value !== "science"
      }, topTab.value !== "science" ? {
        Z: common_assets._imports_3$1,
        aa: common_vendor.o(goToCreate)
      } : {}, {
        ab: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
