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
			<view class="rich-content">
				<rich-text v-if="isRichContent(article.content)" :nodes="article.content" />
				<text v-else>{{ article.content }}</text>
			</view>
			
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
import { api } from '@/utils/api.js'

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
	id: '',
	title: '加载中...',
	reads: 0,
	content: '正在加载文章内容...',
	images: [],
	author: {
		name: '科普官',
		avatar: '/static/logo.png'
	},
	createdAt: '',
	updatedAt: ''
})

// 判断是否为富文本内容
function isRichContent(content: string): boolean {
	if (!content || typeof content !== 'string') return false
	// 检查是否包含HTML标签
	return /<[^>]+>/.test(content)
}

// 加载文章详情
async function loadArticleDetail(articleId: string) {
	try {
		console.log('🔍 开始加载文章详情，ID:', articleId)
		const res = await api.getArticle(articleId)
		console.log('📡 文章详情API返回:', res)
		
		// 处理content为null的情况
		let content = res.content
		if (!content || content === null) {
			content = res.title || '暂无内容'
			console.log('⚠️ 文章content为null，使用title作为内容:', content)
		}
		
		// 更新文章数据
		Object.assign(article, {
			id: res.id || articleId,
			title: res.title || '无标题',
			reads: res.reads || 0,
			content: content,
			cover: res.cover || '/static/logo.png',
			images: res.images || [],
			author: {
				name: res.author?.name || '科普官',
				avatar: res.author?.avatar || '/static/logo.png'
			},
			createdAt: res.createdAt || '',
			updatedAt: res.updatedAt || ''
		})
		
		console.log('✅ 文章详情加载完成:', article)
	} catch (error) {
		console.error('❌ 加载文章详情失败:', error)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	}
}

// 图片预览功能
function previewImage(current: string, urls: string[]) {
	uni.previewImage({
		current,
		urls
	})
}

// 设置顶部导航标题与背景色
onLoad((options) => {
	try {
		uni.setNavigationBarTitle({ title: '科普详情' })
		uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
		
		// 从URL参数获取文章ID
		if (options.id) {
			loadArticleDetail(options.id)
		} else {
			// 尝试从事件通道获取文章数据
			try {
				const ec = getCurrentPages().pop()?.getOpenerEventChannel?.()
				ec && ec.on('science', (data: Partial<Article>) => {
					Object.assign(article, data)
					// 如果有ID，重新加载详情
					if (data.id) {
						loadArticleDetail(data.id)
					}
				})
			} catch (e) {
				console.error('获取文章数据失败:', e)
			}
		}
	} catch (e) {
		console.error('页面加载失败:', e)
	}
})
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
