"use strict";
const common_vendor = require("../../common/vendor.js");
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
      id: "1",
      title: "猫咪行为超详解",
      reads: 50,
      content: `
		<div style="font-size: 28rpx; line-height: 1.8; color: #333;">
			<h3 style="font-size: 32rpx; font-weight: 700; color: #2c2c2c; margin: 24rpx 0 16rpx 0;">防御行为语言</h3>
			<ul style="margin: 0; padding-left: 20rpx;">
				<li style="margin-bottom: 12rpx; color: #333;">嘶声:威胁,别过来!</li>
				<li style="margin-bottom: 12rpx; color: #333;">嗷声:激动或害怕</li>
				<li style="margin-bottom: 12rpx; color: #333;">呜呜:保护重要东西,别过来</li>
				<li style="margin-bottom: 12rpx; color: #333;">提起一只爪子:准备防御</li>
				<li style="margin-bottom: 12rpx; color: #333;">胡须向上竖起:提出抗议,但不想激化矛盾</li>
				<li style="margin-bottom: 12rpx; color: #333;">胡须向后平伏:接受条件,愿意服从</li>
				<li style="margin-bottom: 12rpx; color: #333;">全身蜷缩,瞳孔放大,发"喵"声:我认怂还不行吗?别打我!</li>
			</ul>
			
			<h3 style="font-size: 32rpx; font-weight: 700; color: #2c2c2c; margin: 32rpx 0 16rpx 0;">攻击行为语言</h3>
			<ul style="margin: 0; padding-left: 20rpx;">
				<li style="margin-bottom: 12rpx; color: #333;">嘴向后咧:示威、炫耀、虚张声势,我很牛的!</li>
				<li style="margin-bottom: 12rpx; color: #333;">竖毛:打架前的招牌动作,警告的意思。</li>
			</ul>
		</div>
	`,
      images: [
        "/static/logo.png",
        "/static/logo.png",
        "/static/logo.png",
        "/static/logo.png",
        "/static/logo.png",
        "/static/logo.png"
      ],
      author: {
        name: "科普官",
        avatar: "/static/logo.png"
      },
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01"
    });
    function previewImage(current, urls) {
      common_vendor.index.previewImage({
        current,
        urls
      });
    }
    common_vendor.onLoad(() => {
      try {
        common_vendor.index.setNavigationBarTitle({ title: "详情" });
        common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      } catch (e) {
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(article.title),
        b: common_vendor.t(article.reads),
        c: article.content,
        d: article.images && article.images.length
      }, article.images && article.images.length ? {
        e: common_vendor.f(article.images, (img, index, i0) => {
          return {
            a: index,
            b: img,
            c: common_vendor.o(($event) => previewImage(img, article.images), index)
          };
        })
      } : {}, {
        f: common_vendor.s(dynamicTopPadding.value)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5fde78b4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/scienceDetail/scienceDetail.js.map
