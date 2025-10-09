<template>
	<view class="page" :style="dynamicTopPadding">
		<!-- 科普内容卡片 -->
		<view class="content-card">
			<!-- 标题区域 -->
			<view class="title-section">
				<view class="title-tag">
					<text class="title-text">{{ article.title }}</text>
				</view>
				<text class="read-count">{{ article.reads }}个阅读</text>
			</view>

			<!-- 富文本内容 -->
			<rich-text :nodes="article.content" class="rich-content" />
			
			<!-- 图片网格（如果有） -->
			<view class="image-grid" v-if="article.images && article.images.length">
				<image 
					class="content-image" 
					v-for="(img, index) in article.images" 
					:key="index"
					:src="img" 
					mode="aspectFill" 
					@tap="previewImage(img, article.images)"
				/>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(() => {
	try {
		const info = uni.getSystemInfoSync()
		const statusBar = info.statusBarHeight || 0
		const screenW = info.screenWidth || 375
		const rpxToPx = (rpx) => (rpx * screenW) / 750
		const topPx = 15
		dynamicTopPadding.value = `padding-top:${topPx}px;`
	} catch (e) {
		dynamicTopPadding.value = ''
	}
})

type Article = {
	id: string
	title: string
	reads: number
	content: string
	images?: string[]
	author?: {
		name: string
		avatar: string
	}
	createdAt?: string
	updatedAt?: string
}

const article = reactive<Article>({
	id: '1',
	title: '猫咪行为超详解',
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
		'/static/logo.png',
		'/static/logo.png',
		'/static/logo.png',
		'/static/logo.png',
		'/static/logo.png',
		'/static/logo.png'
	],
	author: {
		name: '科普官',
		avatar: '/static/logo.png'
	},
	createdAt: '2025-01-01',
	updatedAt: '2025-01-01'
})

// 图片预览功能
function previewImage(current: string, urls: string[]) {
	uni.previewImage({
		current,
		urls
	})
}

// 设置顶部导航标题与背景色
onLoad(() => {
	try {
		uni.setNavigationBarTitle({ title: '详情' })
		uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
	} catch (e) {}
})

// 注释掉数据接收，使用默认标题
// try {
// 	const ec = getCurrentPages().pop()?.getOpenerEventChannel?.()
// 	ec && ec.on('science', (data: Partial<Article>) => {
// 		Object.assign(article, data)
// 	})
// } catch (e) {}
</script>

<style scoped>
.page { 
	padding: 24rpx 60rpx; 
	/* 动态计算顶部间距，避免真机调试时env不生效 */
	min-height: 100vh; 
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%); 
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
}

/* 标题区域 */
.title-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.title-tag {
	background: #2c2c2c;
	border-radius: 999rpx;
	padding: 12rpx 24rpx;
}

.title-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: 700;
}

.read-count {
	color: #999;
	font-size: 24rpx;
}

/* 内容卡片 */
.content-card {
	font-size: 28rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 24rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 0 #2c2c2c;
	margin-bottom: 24rpx;
	width: 100%;
	max-width: 704rpx;
}

/* 富文本内容 */
.rich-content {
	line-height: 1.8;
}

/* 图片网格 */
.image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16rpx;
	margin-top: 24rpx;
}

.content-image {
	width: 100%;
	height: 200rpx;
	border-radius: 12rpx;
	background: #f0f0f0;
}
</style>
