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
			<input class="search-input" type="text" placeholder="输入你想搜索的内容" placeholder-class="ph" />
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
					<view class="ft-item">
						<image class="ft-icon" src="/static/community/good.png" mode="widthFix" />
						<text>{{ post.likes }}</text>
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
				<!-- 问题标题 -->
				<view class="qa-header">
					<view class="urgent-tag" v-if="qa.isUrgent">
						<text class="urgent-text">急</text>
					</view>
					<text class="qa-title">{{ qa.title }}</text>
				</view>

				<!-- 虚线分隔 -->
				<view class="qa-divider"></view>

				<!-- 医生信息或未回答状态 -->
				<view class="qa-content" v-if="qa.hasAnswer">
					<view class="doctor-info">
						<image class="doctor-avatar" :src="qa.doctor.avatar" mode="aspectFill" />
						<text class="doctor-text">{{ qa.doctor.name }} | {{ qa.doctor.title }}</text>
					</view>
					<text class="answer-preview">{{ qa.answerPreview }}</text>
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

const topTab = ref('square')

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(() => {
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
})
const categories = ref([
	{ key: 'rec', name: '推荐' },
	{ key: 'daily', name: '生活日常' },
	{ key: 'dress', name: '宠物穿搭' },
	{ key: 'care', name: '养护分享' },
	{ key: 'fun', name: '搞笑日常' }
])
const currentCategory = ref('rec')

const posts = ref([
	{ id: 'p1', user: '喵星人', pet: '布偶猫', breed: '呆呆', time: '刚刚', text: '布偶是一只仙女喵哦~ 💖💖 优雅的姿态太可爱啦！', avatar: '/static/logo.png', images: ['/static/logo.png', '/static/logo.png', '/static/logo.png'], likes: 2631, comments: 2631, shares: 2631 },
	{ id: 'p2', user: '汪汪大队', pet: '金毛', breed: '呼呼', time: '12:30', text: '好喜欢我的呼呼～ 事事有回应件件有着落的', avatar: '/static/logo.png', images: ['/static/logo.png', '/static/logo.png', '/static/logo.png'], likes: 102, comments: 8, shares: 5 }
])

// 问答数据
const qaPosts = ref([
	{
		id: 'qa1',
		title: '狗狗夏天要注意什么?',
		isUrgent: false,
		hasAnswer: true,
		doctor: {
			name: '刘医生',
			title: '专业宠物医生',
			avatar: '/static/logo.png'
		},
		answerPreview: '天气炎热的夏天又到了,每次到这时候都要剃毛散热了,还要避免中暑;避免高温遛狗夏季天...',
		answerCount: 10,
		readCount: 50,
		time: '2小时前'
	},
	{
		id: 'qa2',
		title: '小猫猫护食咋办?',
		isUrgent: true,
		hasAnswer: false,
		doctor: null,
		answerPreview: null,
		answerCount: 0,
		readCount: 12,
		time: '30分钟前'
	}
])

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
}

function switchTab(tab) {
	topTab.value = tab
}

function goDetail(post) {
	uni.navigateTo({
		url: '/pages/communityDetail/communityDetail',
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

.qa-divider {
	height: 0;
	border-top: 6rpx dashed #2c2c2c;
	margin: 18rpx 0;
}

.qa-content {
	margin-bottom: 16rpx;
}

.doctor-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.doctor-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	background: #f5f5f5;
}

.doctor-text {
	font-size: 24rpx;
	color: #666;
}

.answer-preview {
	font-size: 26rpx;
	color: #888;
	line-height: 1.5;
	display: block;
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
