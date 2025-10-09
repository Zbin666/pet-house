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
				<view class="ft-item">
					<image class="ft-icon" src="/static/community/good.png" mode="widthFix" />
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
										<text class="c-name">{{ c.user }}</text>
										<text class="c-role" v-if="c.role">｜{{ c.role }}</text>
										<text class="c-time">{{ c.time }}</text>
									</view>
								</view>
							</view>
							<text class="c-text">{{ c.text }}</text>
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

const post = reactive({ id: '', user: '昵称', text: '这是一条圈子动态内容。', cover: '/static/logo.png', likes: 0, avatar: '/static/logo.png', pet: '', breed: '', images: [], shares: 0, isLiked: false })
const commentText = ref('')
const comments = reactive([
	{
		id: 'c1', user: '刘医生', role: '专业宠物医生', time: '刚刚', avatar: '/static/logo.png', text: '好可爱啊～～～～ 想养一只',
		replies: [
			{ user: 'iU我以为', text: '找个好看的麻袋，带走' },
			{ user: '7issue', text: '啊啊啊，看起来好高贵呀' },
			{ user: 'iU我以为', text: '对对，好想养一只呀' }
		]
	},
	{ id: 'c2', user: '刘医生', role: '专业宠物医生', time: '刚刚', avatar: '/static/logo.png', text: '1.避免高温遛狗 夏季天气炎热，狗狗汗腺不发达，很难快速调节体温，容易出现中暑...' }
])

onLoad(() => {
	const eventChannel = getCurrentPages().pop()?.getOpenerEventChannel?.()
	try {
		eventChannel && eventChannel.on('post', (data) => {
			if (data) {
				post.id = data.id || ''
				post.user = data.user || '昵称'
				post.text = data.text || ''
				post.avatar = data.avatar || '/static/logo.png'
				post.pet = data.pet || ''
				post.breed = data.breed || ''
				post.images = Array.isArray(data.images) ? data.images : []
				post.cover = post.images[0] ? post.images[0] : (data.cover || '/static/logo.png')
				post.likes = data.likes || 0
				post.shares = data.shares || 0
			}
		})
	} catch (e) { }
})

// 分享动态
function sharePost() {
	uni.showToast({
		title: '分享功能开发中',
		icon: 'none'
	})
}

// 点赞动态
function likePost() {
	post.isLiked = !post.isLiked
	post.likes = post.isLiked ? post.likes + 1 : Math.max(post.likes - 1, 0)
	uni.showToast({
		title: post.isLiked ? '已点赞' : '取消点赞',
		icon: 'none'
	})
}

// 提交评论
function submitComment() {
	if (!commentText.value.trim()) {
		uni.showToast({
			title: '请输入评论内容',
			icon: 'none'
		})
		return
	}
	
	// 添加新评论
	const newComment = {
		id: 'c' + Date.now(),
		user: '我',
		role: '',
		time: '刚刚',
		avatar: '/static/logo.png',
		text: commentText.value,
		replies: []
	}
	comments.push(newComment)
	
	uni.showToast({
		title: '评论提交成功',
		icon: 'success'
	})
	commentText.value = ''
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

.c-name {
	font-weight: 700;
	color: #1a1aa1;
	font-size: 28rpx;
}

.c-role {
	color: #666;
	font-size: 24rpx;
}

.c-time {
	margin-left: auto;
	color: #777;
	font-size: 24rpx;
}

.c-text {
	display: block;
	margin-bottom: 20rpx;
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
