"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "scienceDetail",
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
    const article = common_vendor.reactive({
      id: "",
      title: "加载中...",
      reads: 0,
      content: "正在加载文章内容...",
      images: [],
      author: {
        name: "科普官",
        avatar: "/static/logo.png"
      },
      createdAt: "",
      updatedAt: ""
    });
    function isRichContent(content) {
      if (!content || typeof content !== "string")
        return false;
      return /<[^>]+>/.test(content);
    }
    async function loadArticleDetail(articleId) {
      var _a, _b;
      try {
        common_vendor.index.__f__("log", "at pages/scienceDetail/scienceDetail.vue:92", "🔍 开始加载文章详情，ID:", articleId);
        const res = await utils_api.api.getArticle(articleId);
        common_vendor.index.__f__("log", "at pages/scienceDetail/scienceDetail.vue:94", "📡 文章详情API返回:", res);
        let content = res.content;
        if (!content || content === null) {
          content = res.title || "暂无内容";
          common_vendor.index.__f__("log", "at pages/scienceDetail/scienceDetail.vue:100", "⚠️ 文章content为null，使用title作为内容:", content);
        }
        Object.assign(article, {
          id: res.id || articleId,
          title: res.title || "无标题",
          reads: res.reads || 0,
          content,
          cover: res.cover || "/static/logo.png",
          images: res.images || [],
          author: {
            name: ((_a = res.author) == null ? void 0 : _a.name) || "科普官",
            avatar: ((_b = res.author) == null ? void 0 : _b.avatar) || "/static/logo.png"
          },
          createdAt: res.createdAt || "",
          updatedAt: res.updatedAt || ""
        });
        common_vendor.index.__f__("log", "at pages/scienceDetail/scienceDetail.vue:119", "✅ 文章详情加载完成:", article);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/scienceDetail/scienceDetail.vue:121", "❌ 加载文章详情失败:", error);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      }
    }
    function previewImage(current, urls) {
      common_vendor.index.previewImage({
        current,
        urls
      });
    }
    common_vendor.onLoad((options) => {
      var _a, _b;
      try {
        common_vendor.index.setNavigationBarTitle({ title: "科普详情" });
        common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
        if (options.id) {
          loadArticleDetail(options.id);
        } else {
          try {
            const ec = (_b = (_a = getCurrentPages().pop()) == null ? void 0 : _a.getOpenerEventChannel) == null ? void 0 : _b.call(_a);
            ec && ec.on("science", (data) => {
              Object.assign(article, data);
              if (data.id) {
                loadArticleDetail(data.id);
              }
            });
          } catch (e) {
            common_vendor.index.__f__("error", "at pages/scienceDetail/scienceDetail.vue:158", "获取文章数据失败:", e);
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/scienceDetail/scienceDetail.vue:162", "页面加载失败:", e);
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(article.title),
        b: common_vendor.t(article.reads),
        c: isRichContent(article.content)
      }, isRichContent(article.content) ? {
        d: article.content
      } : {
        e: common_vendor.t(article.content)
      }, {
        f: article.images && article.images.length
      }, article.images && article.images.length ? {
        g: common_vendor.f(article.images, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImage(img, article.images), index)
          };
        })
      } : {}, {
        h: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5fde78b4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/scienceDetail/scienceDetail.js.map
