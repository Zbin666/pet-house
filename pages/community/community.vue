<template>
	<view class="page" :style="dynamicTopPadding">


		<!-- 吊牌标签 -->
		<view class="hanger">
			<view class="rope"></view>
			<view class="signs">
				<view :class="['sign', topTab === 'square' ? 'active' : '']" @tap="switchTab('square')">
					<image v-if="topTab === 'square'" class="sign-badge" src="/static/community/ischoose.png" mode="widthFix" />
					<text>广场</text>
				</view>
				<view :class="['sign', topTab === 'qa' ? 'active' : '']" @tap="switchTab('qa')">
					<image v-if="topTab === 'qa'" class="sign-badge" src="/static/community/ischoose.png" mode="widthFix" />
					<text>问答</text>
				</view>
				<view :class="['sign', topTab === 'science' ? 'active' : '']" @tap="switchTab('science')">
					<image v-if="topTab === 'science'" class="sign-badge" src="/static/community/ischoose.png" mode="widthFix" />
					<text>科普</text>
				</view>
			</view>
		</view>

		<!-- 搜索框 -->
		<view class="search">
			<image class="search-ico-img" src="/static/community/search.png" mode="widthFix" />
			<input 
				class="search-input" 
				type="text" 
				placeholder="输入你想搜索的内容" 
				placeholder-class="ph"
				v-model="searchText"
				@confirm="handleSearch"
				@input="handleSearchInput"
			/>
			<view v-if="searchText" class="search-clear" @tap.stop="clearSearch">
				<text>✕</text>
			</view>
		</view>

		<!-- 类目 tabs -->
		<scroll-view class="categories" scroll-x v-if="topTab === 'square'">
			<view v-for="c in categories" :key="c.key" :class="['cat', currentCategory === c.key ? 'on' : '']"
				@tap="selectCategory(c.key)">{{ c.name }}</view>
		</scroll-view>

		<!-- 动态列表（广场） -->
		<view class="feed" v-if="topTab === 'square'">
			<view class="card" v-for="post in posts" :key="post.id" @tap="goDetail(post)">
				<view class="card-hd">
					<image class="avatar" :src="post.avatar" mode="aspectFill" />
					<view class="title-meta">
						<text class="nickname">{{ post.user }}</text>
						<text class="sub">{{ post.pet }}｜{{ post.breed }}</text>
					</view>
					<text class="time">{{ post.time }}</text>
				</view>
				<view class="card-bd">
					<text v-if="post.title" class="post-title">{{ post.title }}</text>
					<text class="content">{{ post.text }}</text>
					<view class="pics" v-if="post.images && post.images.length">
						<image class="pic" v-for="(img, i) in post.images" :key="i" :src="img" mode="aspectFill" />
					</view>
				</view>
				<view class="card-ft" @tap.stop="noop">
					<view class="ft-item">
						<image class="ft-icon" src="/static/community/share.png" mode="widthFix" />
						<text>{{ post.shares }}</text>
					</view>
					<view class="ft-item">
						<image class="ft-icon" src="/static/community/emoji.png" mode="widthFix" />
						<text>{{ post.comments }}</text>
					</view>
					<view class="ft-item" @tap.stop="toggleLike(post)">
						<image class="ft-icon" :src="post.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
						<text>{{ post.likes }}</text>
					</view>
					<view v-if="post.isOwner" class="ft-item delete-item" @tap.stop="deletePost(post)">
						<image class="ft-icon" src="/static/user/delete.png" mode="widthFix" />
					</view>
				</view>
			</view>
		</view>

		<!-- 科普列表 -->
		<view class="science-feed" v-if="topTab === 'science'">
			<view class="science-item" v-for="a in sciencePosts" :key="a.id" @tap="goScienceDetail(a)">
				<view class="s-card">
					<view class="s-thumb">
						<image class="s-thumb-img" :src="a.cover" mode="aspectFill" />
					</view>
					<view class="s-content">
						<text class="s-title">{{ a.title }}</text>
						<text class="s-reads">{{ a.reads }}个阅读</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 问答列表 -->
		<view class="qa-feed" v-if="topTab === 'qa'">
			<view class="qa-card" v-for="qa in qaPosts" :key="qa.id" @tap="goQADetail(qa)">
				<!-- 删除按钮 -->
				<view v-if="qa.isOwner" class="qa-delete-btn" @tap.stop="deleteQuestion(qa)">
					<image class="qa-delete-icon" src="/static/user/delete.png" mode="widthFix" />
				</view>
				
				<!-- 问题标题 -->
				<view class="qa-header">
					<view class="urgent-tag" v-if="qa.isUrgent">
						<text class="urgent-text">急</text>
					</view>
					<text class="qa-title">{{ qa.title }}</text>
				</view>

				<!-- 标签 -->
				<view class="qa-tags" v-if="qa.tags && qa.tags.length > 0">
					<text class="qa-tag" v-for="tag in qa.tags" :key="tag">#{{ tag }}</text>
				</view>

				<!-- 虚线分隔 -->
				<view class="qa-divider"></view>

				<!-- 最高点赞评论或最早评论或未回答状态 -->
				<view class="qa-content" v-if="qa.hasAnswer && qa.topAnswer">
					<view class="top-answer-info">
						<image class="top-answer-avatar" :src="qa.topAnswer.user.avatarUrl || '/static/logo.png'" mode="aspectFill" />
						<view class="top-answer-meta">
							<text class="top-answer-user">{{ qa.topAnswer.user.nickname }}</text>
							<text class="top-answer-pet" v-if="qa.topAnswer.pet">{{ qa.topAnswer.pet.name }}｜{{ qa.topAnswer.pet.breed }}</text>
						</view>
						<view class="top-answer-likes" v-if="qa.topAnswer.isTopLiked">
							<image class="like-icon" src="/static/community/good-active.png" mode="widthFix" />
							<text class="like-count">{{ qa.topAnswer.likes }}</text>
						</view>
						<view class="top-answer-badge" v-else>
							<text class="badge-text">最早</text>
						</view>
					</view>
					<text class="top-answer-content">{{ qa.topAnswer.content.length > 50 ? qa.topAnswer.content.substring(0, 50) + '...' : qa.topAnswer.content }}</text>
					<view class="view-all-answers" @tap.stop="goQADetail(qa)">
						<text class="view-all-text">查看所有{{ qa.answerCount }}条回答</text>
						<text class="arrow">→</text>
					</view>
				</view>
				<view class="qa-content" v-else-if="qa.hasAnswer">
					<view class="view-all-answers" @tap.stop="goQADetail(qa)">
						<text class="view-all-text">查看所有{{ qa.answerCount }}条回答</text>
						<text class="arrow">→</text>
					</view>
				</view>
				<view class="qa-content" v-else>
					<text class="no-answer">暂时还没有人回答</text>
				</view>

				<!-- 统计信息 -->
				<view class="qa-stats">
					<text class="stat-text">{{ qa.answerCount }}个回答</text>
					<text class="stat-text">{{ qa.readCount }}个阅读</text>
				</view>
			</view>
		</view>

		<!-- 浮动添加按钮 -->
		<view class="floating-add-btn" v-if="topTab !== 'science'" @tap="goToCreate">
			<image class="add-icon" src="/static/record/add.png" mode="widthFix" />
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api } from '@/utils/api.js'

const topTab = ref('square')
const currentUser = ref(null)
const searchText = ref('')
const isSearching = ref(false)

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(async () => {
	try {
		const info = uni.getSystemInfoSync()
		const statusBar = info.statusBarHeight || 0
		const screenW = info.screenWidth || 375
		const rpxToPx = (rpx) => (rpx * screenW) / 750
		const topPx = Math.round(statusBar * 0.35)
		dynamicTopPadding.value = `padding-top:${topPx}px;`
	} catch (e) {
		dynamicTopPadding.value = ''
	}
	
	// 获取当前用户信息
	try {
		const userProfile = await api.getProfile()
		currentUser.value = userProfile
	} catch (e) {
		console.error('获取用户信息失败:', e)
	}
	
	// 初次进入加载广场数据
	loadFeeds()
	// 加载问答数据（在用户信息加载完成后）
	loadQuestions()
	// 监听刷新事件
	try { uni.$on('feeds:refresh', () => { if (topTab.value === 'square') loadFeeds() }) } catch (e) {}
	// 监听问答刷新事件
	try { uni.$on('qa:refresh', () => { if (topTab.value === 'qa') loadQuestions() }) } catch (e) {}
})

// 页面显示时刷新数据
onShow(() => {
	// 如果当前在问答标签页，刷新问答数据
	if (topTab.value === 'qa') {
		loadQuestions()
	}
	// 如果当前在广场标签页，刷新动态数据
	else if (topTab.value === 'square') {
		loadFeeds()
	}
})
const categories = ref([
	{ key: 'rec', name: '推荐' },
	{ key: 'daily', name: '生活日常' },
	{ key: 'dress', name: '宠物穿搭' },
	{ key: 'care', name: '养护分享' },
	{ key: 'fun', name: '搞笑日常' }
])
const currentCategory = ref('rec')

const posts = ref([])

async function loadFeeds(params = {}) {
	try {
		const res = await api.getFeeds({ page: 1, limit: 20, ...params })
		const list = Array.isArray(res) ? res : (res.feeds || res.data || [])
		
		posts.value = list.map((f) => {
			const user = f.User || {}
			const pet = f.Pet || {}
			const imgs = Array.isArray(f.images) ? f.images : []
			const created = f.createdAt ? new Date(f.createdAt) : null
			// 获取本地时间，确保时区正确
			const now = new Date()
			const timeDiff = now.getTime() - created.getTime()
			const minutesDiff = Math.floor(timeDiff / (1000 * 60))
			
			let time = '刚刚'
			if (minutesDiff < 1) {
				time = '刚刚'
			} else if (minutesDiff < 60) {
				time = `${minutesDiff}分钟前`
			} else if (minutesDiff < 1440) { // 24小时
				const hoursDiff = Math.floor(minutesDiff / 60)
				time = `${hoursDiff}小时前`
			} else {
				// 超过24小时显示具体时间
				time = `${created.getHours().toString().padStart(2,'0')}:${created.getMinutes().toString().padStart(2,'0')}`
			}
			
			// 提取标题（从tags字段中获取第一个标签作为标题）
			let title = ''
			if (f.tags && Array.isArray(f.tags) && f.tags.length > 0) {
				title = f.tags[0]
			} else if (f.tags && typeof f.tags === 'string') {
				try {
					const parsedTags = JSON.parse(f.tags)
					if (Array.isArray(parsedTags) && parsedTags.length > 0) {
						title = parsedTags[0]
					}
				} catch (e) {
					// 如果解析失败，忽略
				}
			}
			
			return {
				id: f.id,
				userId: f.userId, // 添加动态作者ID
				user: user.nickname || '用户',
				pet: pet.name || '',
				breed: pet.breed || '',
				time,
				title: title ? `#${title}` : '',
				text: f.text || '',
				avatar: user.avatarUrl || '/static/logo.png',
				images: imgs,
				likes: f.likes || 0,
				comments: typeof f.commentsCount === 'number' ? f.commentsCount : (Array.isArray(f.Comments) ? f.Comments.length : 0),
				shares: f.shares || 0,
				isOwner: currentUser.value && f.userId === currentUser.value.id, // 判断是否为作者
				isLiked: f.isLiked || false // 添加点赞状态
			}
		})
	} catch (e) {
		posts.value = []
	}
}

// 加载问答数据
async function loadQuestions(params = {}) {
	try {
		const res = await api.getQuestions({ page: 1, limit: 20, ...params })
		const list = Array.isArray(res) ? res : (res.questions || res.data || [])
		
		// 处理问答数据
		qaPosts.value = list.map(q => {
			
			// 时间格式化
			let time = '刚刚'
			if (q.createdAt) {
				const created = new Date(q.createdAt)
				const month = created.getUTCMonth() + 1
				const date = created.getUTCDate()
				const hours = created.getUTCHours().toString().padStart(2, '0')
				const minutes = created.getUTCMinutes().toString().padStart(2, '0')
				time = `${month}/${date} ${hours}:${minutes}`
			}
			
			// 处理标签
			let tags = []
			if (q.tags) {
				try {
					tags = typeof q.tags === 'string' ? JSON.parse(q.tags) : q.tags
					if (!Array.isArray(tags)) {
						tags = []
					}
				} catch (e) {
					tags = []
				}
			}
			
			const processedQ = {
				id: q.id,
				userId: q.user?.id || q.userId, // 从user对象中获取userId
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
				time: time,
				tags: tags,
				isOwner: currentUser.value && (q.user?.id || q.userId) === currentUser.value.id // 判断是否为作者
			}
			
			return processedQ
		})

		// 懒加载补齐：有回答但缺少置顶回答详情时，拉取问题详情填充
		for (const qa of qaPosts.value) {
			if (!qa.topAnswer) {
				try {
					const detail = await api.getQuestion(qa.id)
					if (detail && Array.isArray(detail.answers) && detail.answers.length > 0) {
						const top = [...detail.answers].sort((a, b) => (b.likes - a.likes) || (new Date(a.createdAt) - new Date(b.createdAt)))[0]
						qa.topAnswer = {
							id: top.id,
							content: top.content,
							likes: top.likes || 0,
							isTopLiked: true,
							user: top.user || null,
							pet: top.pet || null
						}
					} else {
						// 无回答，不进行填充
					}
				} catch (err) {
					// 忽略填充错误，保持原数据
				}
			}
		}
		// 触发视图更新
		qaPosts.value = qaPosts.value.slice()
	} catch (e) {
		console.error('加载问答数据失败:', e)
		qaPosts.value = []
	}
}

// 问答数据
const qaPosts = ref([])

// 科普数据
const sciencePosts = ref([
	{ id: 's1', title: '猫咪的20种肢体语言～快来速查🔎 终于知道猫猫心里在想什么了', reads: 50, cover: '/static/logo.png' },
	{ id: 's2', title: '狗狗防暑保命清单', reads: 36, cover: '/static/logo.png' },
	{ id: 's3', title: '如何训练猫咪使用猫砂盆？新手铲屎官必看指南', reads: 28, cover: '/static/logo.png' },
	{ id: 's4', title: '狗狗疫苗时间表：从幼犬到成年的完整接种计划', reads: 42, cover: '/static/logo.png' },
	{ id: 's5', title: '猫咪发情期护理：如何安全度过发情季节', reads: 33, cover: '/static/logo.png' },
	{ id: 's6', title: '狗狗皮肤病预防与治疗：常见皮肤病识别手册', reads: 67, cover: '/static/logo.png' },
	{ id: 's7', title: '猫咪营养需求分析：不同年龄阶段的饮食搭配', reads: 45, cover: '/static/logo.png' },
	{ id: 's8', title: '狗狗行为训练：从基础指令到高级技巧', reads: 39, cover: '/static/logo.png' }
])

function selectCategory(key) { 
	currentCategory.value = key 
	// 如果需要按类目过滤，将 key 作为标签传给后端
	if (topTab.value === 'square') {
		const categoryParam = key === 'rec' ? undefined : key
		loadFeeds(categoryParam ? { category: categoryParam } : {})
	}
}

function switchTab(tab) {
	topTab.value = tab
	if (tab === 'square' && posts.value.length === 0) {
		loadFeeds()
	} else if (tab === 'qa' && qaPosts.value.length === 0) {
		loadQuestions()
	}
}

function goDetail(post) {
    uni.navigateTo({
        url: `/pages/communityDetail/communityDetail?id=${post.id}`,
        success: (res) => {
            try {
                res.eventChannel.emit('post', post)
            } catch (e) { }
        }
    })
}
function goQADetail(qa) {
	uni.navigateTo({
		url: '/pages/questionDetail/questionDetail',
		success: (res) => {
			try {
				res.eventChannel.emit('qa', qa)
			} catch (e) { }
		}
	})
}
function goScienceDetail(article) {
	uni.navigateTo({
		url: '/pages/scienceDetail/scienceDetail',
		success: (res) => {
			try {
				res.eventChannel.emit('science', article)
			} catch (e) { }
		}
	})
}
function goToCreate() { uni.navigateTo({ url: '/pages/createCommunity/createCommunity' }) }
function noop() { }

// 切换点赞状态
async function toggleLike(post) {
	if (!currentUser.value) {
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		return
	}
	
	try {
		const result = await api.likeFeed(post.id)
		if (result) {
			// 更新点赞数量和状态
			post.likes = result.likes
			post.isLiked = result.isLiked
			
			uni.showToast({
				title: post.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none',
				duration: 1000
			})
		}
	} catch (error) {
		console.error('点赞操作失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 删除动态
async function deletePost(post) {
	try {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这条动态吗？删除后无法恢复。',
			confirmText: '删除',
			cancelText: '取消',
			confirmColor: '#ff4757',
			success: async (res) => {
				if (res.confirm) {
					try {
						await api.deleteFeed(post.id)
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 从列表中移除已删除的动态
						const index = posts.value.findIndex(p => p.id === post.id)
						if (index > -1) {
							posts.value.splice(index, 1)
						}
					} catch (error) {
						console.error('删除动态失败:', error)
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} catch (error) {
		console.error('删除动态失败:', error)
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		})
	}
}

// 删除问答
async function deleteQuestion(qa) {
	try {
		uni.showModal({
			title: '确认删除',
			content: '确定要删除这个问答吗？删除后无法恢复。',
			confirmText: '删除',
			cancelText: '取消',
			confirmColor: '#ff4757',
			success: async (res) => {
				if (res.confirm) {
					try {
						await api.deleteQuestion(qa.id)
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 从列表中移除已删除的问答
						const index = qaPosts.value.findIndex(q => q.id === qa.id)
						if (index > -1) {
							qaPosts.value.splice(index, 1)
						}
					} catch (error) {
						console.error('删除问答失败:', error)
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	} catch (error) {
		console.error('删除问答失败:', error)
		uni.showToast({
			title: '删除失败',
			icon: 'none'
		})
	}
}

// 搜索处理
function handleSearch() {
	if (!searchText.value.trim()) return
	
	isSearching.value = true
	if (topTab.value === 'square') {
		loadFeeds({ search: searchText.value.trim() })
	} else if (topTab.value === 'qa') {
		loadQuestions({ search: searchText.value.trim() })
	}
}

// 搜索输入处理（防抖）
let searchTimeout = null
function handleSearchInput() {
	if (searchTimeout) {
		clearTimeout(searchTimeout)
	}
	
	searchTimeout = setTimeout(() => {
		if (searchText.value.trim()) {
			handleSearch()
		} else {
			// 如果搜索框为空，重新加载数据
			if (topTab.value === 'square') {
				loadFeeds()
			} else if (topTab.value === 'qa') {
				loadQuestions()
			}
			isSearching.value = false
		}
	}, 500) // 500ms 防抖
}

// 清除搜索
function clearSearch() {
	searchText.value = ''
	isSearching.value = false
	if (topTab.value === 'square') {
		loadFeeds()
	} else if (topTab.value === 'qa') {
		loadQuestions()
	}
}
</script>

<style scoped>
.page {
	padding: 24rpx 32rpx;
	/* 动态计算顶部间距，避免真机调试时env不生效 */
	min-height: 100vh;
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
}

/* 顶部 */
.topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.left {
	display: flex;
	align-items: center;
	gap: 8rpx;
	color: #2c2c2c;
}

.brand {
	font-size: 36rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.right {
	display: flex;
	align-items: center;
	gap: 12rpx;
	color: #2c2c2c;
}

/* 吊牌 */
.hanger {
	position: relative;
	margin: 8rpx 0 10rpx;
}

.rope {
	height: 8rpx;
	background: linear-gradient(90deg, #2c2c2c 0%, #4a4a4a 50%, #2c2c2c 100%);
	border-radius: 8rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
	position: relative;
}

.rope::before {
	content: '';
	position: absolute;
	top: -2rpx;
	left: 0;
	right: 0;
	height: 4rpx;
	background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
	border-radius: 4rpx;
}

.signs {
	display: flex;
	justify-content: space-around;
	margin-top: -5rpx;
	gap: 8rpx;
}

.sign {
	position: relative;
	width: 160rpx;
	height: 90rpx;
	background: #fffbea;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx 16rpx 20rpx 20rpx;
	box-shadow: 0 8rpx 0 #2c2c2c, 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	transform: rotate(-8deg);
	transition: all 0.3s ease;
}

.sign-badge {
	position: absolute;
	top: -38rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 62rpx;
	height: 62rpx;
	z-index: 2;
	pointer-events: none;
}

.sign::before {
	content: '';
	position: absolute;
	top: -8rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 24rpx;
	height: 16rpx;
	background: #2c2c2c;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.sign::after {
	content: '';
	position: absolute;
	top: -4rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 16rpx;
	height: 12rpx;
	background: #fffbea;
	border-radius: 8rpx;
	border: 2rpx solid #2c2c2c;
}

.sign.active {
	background: #ffe48a;
	transform: rotate(-8deg) scale(1.05);
	box-shadow: 0 10rpx 0 #2c2c2c, 0 6rpx 12rpx rgba(0, 0, 0, 0.3);
}

.sign.active::after {
	background: #ffe48a;
	border-color: #2c2c2c;
}

.sign text {
	font-weight: 600;
	font-size: 28rpx;
	color: #2c2c2c;
	text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

/* 搜索 */
.search {
	margin: 45rpx 0 10rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx;
}

.search-ico {
	display: none;
}

.search-ico-img {
	width: 32rpx;
	height: 32rpx;
	margin-right: 12rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
}

.ph {
	color: #bbb;
}

.search-clear {
	width: 42rpx;
	height: 42rpx;
	background: #ddd;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 12rpx;
}

.search-clear text {
	color: #666;
	font-size: 28rpx;
	font-weight: bold;
}

/* 类目 */
.categories {
	white-space: nowrap;
	display: flex;
	margin: 30rpx 0 30rpx;
}

.cat {
	display: inline-flex;
	padding: 10rpx 18rpx;
	background: #fff7d6;
	color: #2c2c2c;
	border-radius: 999rpx;
	margin-right: 16rpx;
	font-size: 24rpx;
}

.cat.on {
	background: #ffec99;
	font-weight: 600;
}

/* 动态卡片 */
.feed {
	display: flex;
	flex-direction: column;
	gap: 35rpx;
}

.card {
	background: #fff;
	border-radius: 24rpx;
	border: 4rpx solid #2c2c2c;
	padding: 25rpx 35rpx;
	box-shadow: 0 8rpx 0 #2c2c2c;
}

.card-hd {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.title-meta {
	flex: 1;
	margin-left: 12rpx;
}

.nickname {
	font-size: 30rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.sub {
	display: block;
	color: #7a7a7a;
	font-size: 24rpx;
	margin-top: 4rpx;
}

.time {
	color: #7a7a7a;
	font-size: 24rpx;
}

.card-bd {
	margin-top: 10rpx;
}

.post-title {
	display: block;
	color: #82919c;
	font-size: 28rpx;
	font-weight: 600;
	margin: 16rpx 0 0rpx 0;
	line-height: 1.4;
}

.content {
	display: block;
	color: #333;
	line-height: 1.6;
	margin: 24rpx 0;
	font-size: 26rpx;
}

.pics {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
}

.pic {
	width: 100%;
	height: 200rpx;
	background: #f3f3f3;
	border-radius: 12rpx;
}

.card-ft {
	margin-top: 18rpx;
	display: flex;
	justify-content: flex-end;
	gap: 8rpx;
	color: #555;
	font-size: 28rpx;
}

.ft-item {
	background: #fff;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.ft-icon {
	width: 24rpx;
	height: 24rpx;
}

.delete-item {
	background: #ffebee !important;
	border: 2rpx solid #ffcdd2 !important;
}

.delete-item .ft-icon {
	filter: hue-rotate(0deg) saturate(1.5) brightness(0.8);
}

.floating-add-btn {
	position: fixed;
	right: -2rpx;
	bottom: 120rpx;
	width: 120rpx;
	height: 60rpx;
	z-index: 10;
}

.add-icon {
	width: 80%;
	height: 80%;
	transform: rotate(-30deg);
	transform-origin: center center;
}

/* 问答样式 */
.qa-feed {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	margin-top: 20rpx;
}

.qa-card {
	position: relative;
	background: #fff;
	border-radius: 20rpx;
	border: 4rpx solid #2c2c2c;
	padding: 24rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.qa-delete-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 48rpx;
	height: 48rpx;
	background: #ffebee;
	border: 2rpx solid #ffcdd2;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.qa-delete-icon {
	width: 20rpx;
	height: 20rpx;
}

/* 左右装饰圆点（与分隔线对齐） */
.qa-card::before,
.qa-card::after {
	content: '';
	position: absolute;
	top: 120rpx;
	/* 与标题区高度匹配，必要时微调 */
	width: 22rpx;
	height: 22rpx;
	background: #2c2c2c;
	border-radius: 50%;
	box-shadow: 0 0 0 6rpx #fff;
	/* 白色描边，营造镂空效果 */
}

.qa-card::before {
	left: -12rpx;
}

.qa-card::after {
	right: -12rpx;
}

.qa-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 16rpx;
}

.urgent-tag {
	width: 32rpx;
	height: 32rpx;
	background: #ff6b35;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.urgent-text {
	color: #fff;
	font-size: 20rpx;
	font-weight: 600;
}

.qa-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c2c2c;
	line-height: 1.4;
	flex: 1;
	padding: 12rpx 8rpx 10rpx 0;
}

.qa-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin: 12rpx 0;
}

.qa-tag {
	background: #f0f8ff;
	color: #4a90e2;
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	border: 1rpx solid #d0e7ff;
}

.qa-divider {
	height: 0;
	border-top: 6rpx dashed #2c2c2c;
	margin: 18rpx 0;
}

.qa-content {
	margin-bottom: 16rpx;
}

.top-answer-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.top-answer-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: #f5f5f5;
	border: 2rpx solid #2c2c2c;
}

.top-answer-meta {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.top-answer-user {
	font-size: 24rpx;
	font-weight: 600;
	color: #2c2c2c;
}

.top-answer-pet {
	font-size: 20rpx;
	color: #7a7a7a;
	margin-top: 2rpx;
}

.top-answer-likes {
	display: flex;
	align-items: center;
	gap: 4rpx;
	background: #f0f8ff;
	padding: 6rpx 12rpx;
	border-radius: 16rpx;
	border: 1rpx solid #d0e7ff;
}

.like-icon {
	width: 16rpx;
	height: 16rpx;
}

.like-count {
	font-size: 20rpx;
	color: #4a90e2;
	font-weight: 600;
}

.top-answer-badge {
	background: #f0f9ff;
	padding: 6rpx 12rpx;
	border-radius: 16rpx;
	border: 1rpx solid #bae6fd;
}

.badge-text {
	font-size: 20rpx;
	color: #0ea5e9;
	font-weight: 600;
}

.top-answer-content {
	font-size: 26rpx;
	color: #333;
	line-height: 1.5;
	display: block;
	margin-bottom: 12rpx;
}

.view-all-answers {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #f8f9fa;
	padding: 12rpx 16rpx;
	border-radius: 12rpx;
	border: 1rpx solid #e9ecef;
}

.view-all-text {
	font-size: 24rpx;
	color: #4a90e2;
	font-weight: 500;
}

.arrow {
	font-size: 24rpx;
	color: #4a90e2;
	font-weight: bold;
	line-height: 1;
}

.no-answer {
	font-size: 26rpx;
	color: #bbb;
	text-align: center;
	padding: 20rpx 0;
}

.qa-stats {
	display: flex;
	justify-content: flex-end;
	gap: 20rpx;
}

.stat-text {
	font-size: 22rpx;
	color: #999;
}

/* 科普卡片样式 */
.science-feed {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.science-item {
	display: flex;
}

.s-card {
	position: relative;
	width: 420rpx;
	margin-left: 40rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
	padding: 20rpx 20rpx 20rpx 200rpx;
	min-height: 160rpx;
	margin-top: 28rpx;
}

.s-thumb {
	position: absolute;
	left: -30rpx;
	top: -24rpx;
	width: 180rpx;
	height: 180rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	overflow: hidden;
	background: #8ce1ff;
	box-shadow: 0 4rpx 0 #2c2c2c;
	z-index: 10;
}

.s-thumb-img {
	width: 100%;
	height: 100%;
}

.s-content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 100%;
	width: 416rpx;
}

.s-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #2c2c2c;
	line-height: 1.6;
	margin-bottom: 12rpx;
}

.s-reads {
	color: #7a7a7a;
	font-size: 24rpx;
}
</style>
