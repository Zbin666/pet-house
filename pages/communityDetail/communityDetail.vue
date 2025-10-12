<template>
	<view class="page" :style="dynamicTopPadding">
		<view class="card">
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
			<view class="card-ft">
				<view class="ft-item">
					<image class="ft-icon" src="/static/community/share.png" mode="widthFix" />
					<text>{{ post.shares }}</text>
				</view>
				<view class="ft-item">
					<image class="ft-icon" src="/static/community/emoji.png" mode="widthFix" />
					<text>{{ comments.length }}</text>
				</view>
				<view class="ft-item" @tap.stop="likePost">
					<image class="ft-icon" :src="post.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
					<text>{{ post.likes }}</text>
				</view>
			</view>
		</view>

		<!-- 评论区域 - 叠卡效果 -->
		<view class="comments-section">
			<view class="comments-card">
				<view class="comments-card-bg bg1"></view>
				<view class="comments-card-body">
					<!-- 评论标题 -->
					<view class="comment-header">
						<view class="comment-tag">
							<text class="comment-title">全部评论</text>
							<text class="comment-count">{{ comments.length }}</text>
						</view>
					</view>

					<!-- 评论列表 -->
					<view class="comment-list">
						<view class="comment-item" v-for="c in comments" :key="c.id">
							<view class="comment-user">
								<image class="c-avatar" :src="c.avatar" mode="aspectFill" />
								<view class="c-info">
									<view class="c-row">
										<view class="c-column">
											<text class="c-name">{{ c.user }}</text>
											<text class="c-role" v-if="c.petName">{{ c.petName }}｜{{ c.petBreed }}</text>
										</view>
									</view>
								</view>
							</view>
							<text class="c-text">{{ c.text }}</text>
							<view class="c-actions">
								<text class="c-time">{{ c.time }}</text>
								<view class="c-like-btn" @tap.stop="likeComment(c)">
									<image class="c-like-icon" :src="c.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
									<text class="c-like-count" v-if="c.likes > 0">{{ c.likes }}</text>
								</view>
							</view>
							<view class="reply-box" v-if="c.replies && c.replies.length">
								<view class="reply-row" v-for="(r, ri) in c.replies" :key="ri">
									<text class="r-name">{{ r.user }}：</text>
									<text class="r-text">{{ r.text }}</text>
								</view>
								<text class="view-all">查看全部回复</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 占位高度，避免内容被底部栏遮挡（真机更可靠） -->
		<view class="bottom-safe-spacer"></view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar" style="padding: 24rpx 24rpx !important; padding-bottom: calc(24rpx + env(safe-area-inset-bottom)) !important; padding-bottom: calc(24rpx + constant(safe-area-inset-bottom)) !important;">
			<view class="action-buttons">
				<view class="action-btn" @tap="sharePost">
					<image class="action-icon" src="/static/community/share.png" mode="widthFix" />
				</view>
			<view class="action-btn" @tap="likePost">
				<image class="action-icon" :src="post.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
			</view>
			</view>
			<view class="comment-input">
				<input 
					class="input-field" 
					type="text" 
					placeholder="输入你的回答" 
					placeholder-class="input-placeholder"
					v-model="commentText"
					@confirm="submitComment"
				/>
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/utils/api.js'

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(async () => {
	try {
		const info = uni.getSystemInfoSync()
		const statusBar = info.statusBarHeight || 0
		const screenW = info.screenWidth || 375
		const rpxToPx = (rpx) => (rpx * screenW) / 750
		const topPx = 15
		dynamicTopPadding.value = `padding-top:${topPx}px;`
		
		// 加载当前用户的宠物信息
		try {
			const pets = await api.getPets()
			const petsList = Array.isArray(pets) ? pets : (pets.data || [])
			if (petsList.length > 0) {
				currentUserPet.value = petsList[0] // 使用第一个宠物
			}
		} catch (e) {
			console.error('获取宠物信息失败:', e)
		}
	} catch (e) {
		dynamicTopPadding.value = ''
	}
})

const post = reactive({ id: '', user: '昵称', text: '这是一条圈子动态内容。', cover: '/static/logo.png', likes: 0, avatar: '/static/logo.png', pet: '', breed: '', images: [], shares: 0, isLiked: false, time: '' })
const commentText = ref('')
const comments = reactive([])
const currentUserPet = ref(null) // 当前用户的宠物信息

async function loadDetail(id) {
	try {
		const f = await api.getFeed(id)
		const user = f.User || {}
		const pet = f.Pet || {}
		post.id = f.id
		post.user = user.nickname || '昵称'
		post.pet = pet.name || ''
		post.breed = pet.breed || ''
		post.text = f.text || ''
		post.avatar = user.avatarUrl || '/static/logo.png'
		post.images = Array.isArray(f.images) ? f.images : []
		post.cover = post.images[0] ? post.images[0] : (f.cover || '/static/logo.png')
		post.likes = f.likes || 0
		post.shares = f.shares || 0
		post.isLiked = f.isLiked || false // 添加点赞状态
		
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
		post.title = title ? `#${title}` : ''
		// 处理时间显示
		if (f.createdAt) {
			const created = new Date(f.createdAt)
			const now = new Date()
			const timeDiff = now.getTime() - created.getTime()
			const minutesDiff = Math.floor(timeDiff / (1000 * 60))
			
			if (minutesDiff < 1) {
				post.time = '刚刚'
			} else if (minutesDiff < 60) {
				post.time = `${minutesDiff}分钟前`
			} else if (minutesDiff < 1440) { // 24小时
				const hoursDiff = Math.floor(minutesDiff / 60)
				post.time = `${hoursDiff}小时前`
			} else {
				// 超过24小时显示具体时间
				post.time = `${created.getHours().toString().padStart(2,'0')}:${created.getMinutes().toString().padStart(2,'0')}`
			}
		} else {
			post.time = ''
		}
		comments.splice(0, comments.length, ...((f.Comments || []).map((c) => {
			// 处理评论时间显示
			let commentTime = ''
			if (c.createdAt) {
				const created = new Date(c.createdAt)
				const now = new Date()
				const timeDiff = now.getTime() - created.getTime()
				const minutesDiff = Math.floor(timeDiff / (1000 * 60))
				
				if (minutesDiff < 1) {
					commentTime = '刚刚'
				} else if (minutesDiff < 60) {
					commentTime = `${minutesDiff}分钟前`
				} else if (minutesDiff < 1440) { // 24小时
					const hoursDiff = Math.floor(minutesDiff / 60)
					commentTime = `${hoursDiff}小时前`
				} else {
					commentTime = `${created.getHours().toString().padStart(2,'0')}:${created.getMinutes().toString().padStart(2,'0')}`
				}
			}
			
			return {
				id: c.id,
				user: c.User?.nickname || '用户',
				petName: c.Pet?.name || '',
				petBreed: c.Pet?.breed || '',
				time: commentTime,
				avatar: c.User?.avatarUrl || '/static/logo.png',
				text: c.text,
				likes: c.likes || 0,
				isLiked: c.isLiked || false,
				replies: []
			}
		})))
	} catch (e) {
		uni.showToast({ title: '加载失败', icon: 'none' })
	}
}

onLoad(() => {
	const eventChannel = getCurrentPages().pop()?.getOpenerEventChannel?.()
	let incoming = null
	try {
		eventChannel && eventChannel.on('post', (data) => { incoming = data })
	} catch (e) { }
	// 如果带有 id 则请求详情，否则用事件数据填充
	setTimeout(() => {
		if (incoming && incoming.id) {
			loadDetail(incoming.id)
		} else if (incoming) {
			post.id = incoming.id || ''
			post.user = incoming.user || '昵称'
			post.pet = incoming.pet || ''
			post.breed = incoming.breed || ''
			post.text = incoming.text || ''
			post.avatar = incoming.avatar || '/static/logo.png'
			post.images = Array.isArray(incoming.images) ? incoming.images : []
			post.cover = post.images[0] ? post.images[0] : (incoming.cover || '/static/logo.png')
			post.likes = incoming.likes || 0
			post.shares = incoming.shares || 0
		}
	}, 0)
})

// 分享动态
function sharePost() {
	uni.showToast({
		title: '分享功能开发中',
		icon: 'none'
	})
}

// 点赞动态
async function likePost() {
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

// 提交评论
async function submitComment() {
	if (!commentText.value.trim()) {
		uni.showToast({ title: '请输入评论内容', icon: 'none' })
		return
	}
	try {
		const c = await api.createComment(post.id, { text: commentText.value.trim() })
		// 处理新评论的时间格式，与动态时间格式保持一致
		let commentTime = '刚刚'
		if (c.createdAt) {
			const created = new Date(c.createdAt)
			const now = new Date()
			const timeDiff = now.getTime() - created.getTime()
			const minutesDiff = Math.floor(timeDiff / (1000 * 60))
			
			if (minutesDiff < 1) {
				commentTime = '刚刚'
			} else if (minutesDiff < 60) {
				commentTime = `${minutesDiff}分钟前`
			} else if (minutesDiff < 1440) { // 24小时
				const hoursDiff = Math.floor(minutesDiff / 60)
				commentTime = `${hoursDiff}小时前`
			} else {
				// 超过24小时显示具体时间
				commentTime = `${created.getHours().toString().padStart(2,'0')}:${created.getMinutes().toString().padStart(2,'0')}`
			}
		}
		
		comments.push({
			id: c.id,
			user: c.User?.nickname || '我',
			petName: currentUserPet.value?.name || '',
			petBreed: currentUserPet.value?.breed || '',
			time: commentTime,
			avatar: c.User?.avatarUrl || '/static/logo.png',
			text: c.text,
			likes: 0,
			isLiked: false,
			replies: []
		})
		commentText.value = ''
		uni.showToast({ title: '评论提交成功', icon: 'success' })
	} catch (e) {
		uni.showToast({ title: '评论失败', icon: 'none' })
	}
}

// 点赞评论
async function likeComment(comment) {
	try {
		const result = await api.likeComment(comment.id)
		if (result) {
			// 更新评论的点赞数量和状态
			comment.likes = result.likes
			comment.isLiked = result.isLiked
			
			uni.showToast({
				title: comment.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none',
				duration: 1000
			})
		}
	} catch (error) {
		console.error('点赞评论失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}
</script>

<style scoped>
.page {
	padding: 24rpx;
	/* 动态计算顶部间距，避免真机调试时env不生效 */
	padding-bottom: 36rpx; /* 改为基础内边距，具体高度由占位视图控制 */
	min-height: 100vh;
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
}

.card {
	width: 600rpx;
	background: #fff;
	border-radius: 24rpx;
	border: 4rpx solid #2c2c2c;
	padding: 25rpx 35rpx;
	box-shadow: 0 8rpx 0 #2c2c2c;
	margin: 0 auto;
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
	margin: 16rpx 0 8rpx 0;
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

/* 评论区域 - 叠卡效果 */
.comments-section {
	margin-top: 50rpx;
	position: relative;
}

.comments-card {
	position: relative;
}

.comments-card-bg {
	position: absolute;
	left: 8rpx;
	right: 8rpx;
	height: 100%;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	background: #fff;
	z-index: 0;
	pointer-events: none;
}

.comments-card-bg.bg1 {
	top: -2rpx;
	width: 625rpx;
	left: 50%;
	transform: translateX(-50%) rotate(-2deg);
	z-index: 0;
}

.comments-card-body {
	width: 625rpx;
	position: relative;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	padding: 20rpx;
	z-index: 1;
	margin: 0 auto;
}

.comment-header {
	display: flex;
	align-items: flex-start;
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #e9e9e9;
}

.comment-tag {
	position: relative;
	display: flex;
	align-items: center;
	background: #333333;
	color: #fff;
	padding: 16rpx 24rpx;
	transform: rotate(-3deg);
	border-radius: 0;
	box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.3);
	margin-left: 8rpx;
}

.comment-tag::before {
	content: '';
	position: absolute;
	left: -10rpx;
	top: 0;
	width: 0;
	height: 0;
	border-top: 0 solid transparent;
	border-bottom: 100% solid transparent;
	border-right: 10rpx solid #333333;
}

.comment-tag::after {
	content: '';
	position: absolute;
	right: -10rpx;
	top: 0;
	width: 0;
	height: 0;
	border-top: 100% solid transparent;
	border-bottom: 0 solid transparent;
	border-left: 10rpx solid #333333;
}

.comment-title {
	font-weight: 600;
	font-size: 30rpx;
	color: #fff;
	margin-right: 12rpx;
	letter-spacing: 1rpx;
}

.comment-count {
	font-weight: 500;
	font-size: 26rpx;
	color: #fff;
	letter-spacing: 0.5rpx;
}

.comment-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	padding: 0 20rpx;
}

.comment-item {
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.comment-item:last-child {
	border-bottom: none;
	padding-bottom: 0;
}

.comment-user {
	display: flex;
	gap: 14rpx;
	margin-bottom: 18rpx;
}

.c-avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.c-info {
	flex: 1;
}

.c-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.c-column {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-left: 12rpx;
}

.c-name {
	font-weight: 700;
	color: #2c2c2c;
	font-size: 28rpx;
}

.c-role {
	display: block;
	color: #7a7a7a;
	font-size: 24rpx;
	margin-top: 4rpx;
}

.c-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6rpx;
}

.c-like-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 12rpx;
	background: #f5f5f5;
	border-radius: 20rpx;
}

.c-like-icon {
	width: 20rpx;
	height: 20rpx;
}

.c-like-count {
	font-size: 22rpx;
	color: #666;
}

.c-time {
	color: #777;
	font-size: 24rpx;
}

.c-text {
	display: block;
	margin-bottom: 10rpx;
	color: #1a1a1a;
	line-height: 1.7;
	font-size: 26rpx;
}

.reply-box {
	background: #f8f8f8;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 28rpx 18rpx;
	margin-top: 12rpx;
}

.reply-row {
	margin-bottom: 16rpx;
	font-size: 24rpx;
}

.reply-row:last-child {
	margin-bottom: 0;
}

.r-name {
	color: #1a1a1a;
	font-weight: 600;
}

.r-text {
	color: #333;
}

.view-all {
	display: block;
	color: #6b6b6b;
	margin-top: 6rpx;
	font-size: 24rpx;
	text-align: center;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed !important;
	bottom: 0 !important;
	left: 0 !important;
	right: 0 !important;
	background: #fff !important;
	border-top: 4rpx solid #2c2c2c !important;
	padding: 20rpx 24rpx !important;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom)) !important;
	padding-bottom: calc(40rpx + constant(safe-area-inset-bottom)) !important;
	display: flex !important;
	align-items: center !important;
	gap: 16rpx !important;
	z-index: 100 !important;
}

.action-buttons {
	display: flex;
	gap: 12rpx;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f5f5;
	border: 2rpx solid #2c2c2c;
	border-radius: 50%;
}

.action-icon {
	width: 32rpx;
	height: 32rpx;
	transition: all 0.3s ease;
}


.comment-input {
	flex: 1;
	max-width: 500rpx;
}

.input-field {
	width: 100%;
	height: 60rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 30rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
}

.input-placeholder {
	color: #bbb;
	font-size: 28rpx;
}

/* 底部占位高度，匹配底部栏实际高度（含安全区） */
.bottom-safe-spacer {
	height: calc(88rpx + env(safe-area-inset-bottom));
	height: calc(88rpx + constant(safe-area-inset-bottom));
}
</style>
