<template>
	<view class="page" :style="dynamicTopPadding">
		<!-- 顶部资料卡片 -->
		<view class="profile-card">
			<image class="decor" src="/static/user/icon.png"></image>
			<view class="profile-main" @tap="openSetting">
				<image class="avatar" :src="userInfo?.avatarUrl || '/static/logo.png'" mode="aspectFill"></image>
				<view class="meta">
					<view class="row1">
						<text class="uname">{{ userInfo?.nickname || '用户' }}</text>
						<image class="gender" :src="genderIcon"></image>
					</view>
					<view class="stats">
						<view class="stat"><text class="num">{{ stats.feeds || 0 }}</text><text class="label">动态</text></view>
						<view class="divider"></view>
						<view class="stat"><text class="num">{{ stats.likes || 0 }}</text><text class="label">点赞</text></view>
					</view>
				</view>
				<text class="arrow">›</text>
			</view>
		</view>

		<!-- 在一起天数条幅 -->
		<view class="ribbon">
			<image class="ribbon-left" src="/static/user/dog.jpg"></image>
			<text class="ribbon-text">在一起已经 90 天了</text>
		</view>

		<!-- 我的宠物 -->
		<view class="section pets">
			<view class="title-wrap"><text class="title">我的宠物</text></view>
			<view class="pet-grid">
				<view class="pet-card" v-for="p in pets" :key="p.id" @tap="goPetDetail(p)">
					<view class="pet-avatar-container">
						<image class="pet-avatar" :src="p.avatarUrl || '/static/logo.png'" mode="aspectFill"></image>
					</view>
					<view class="pet-information">
						<view class="pet-name">
							<text>{{ p.name }}</text>
							<image class="gender sm" :src="p.gender === 'male' ? '/static/user/male.png' : '/static/user/female.png'"></image>
						</view>
						<text class="pet-sub">{{ formatMeta(p) }}</text>
					</view>
				</view>
			</view>
			<view class="add-pet" @tap="goEdit">
				<!-- <text class="plus">＋</text> -->
				<image class="plus" src="/static/user/addPet.png" mode=""></image>
				<text class="add-text">添加宠物</text>
			</view>
		</view>

		<!-- 菜单列表 -->
		<view class="menu">
			<view class="menu-item" @tap="openSetting">
				<image class="micon" src="/static/user/setting.png"></image>
				<text class="mtext">设置</text>
				<text class="arrow">›</text>
			</view>
			<view class="menu-item" @tap="openPrivacy">
				<image class="micon" src="/static/user/private.png"></image>
				<text class="mtext">隐私中心</text>
				<text class="arrow">›</text>
			</view>
			<view class="menu-item" @tap="openFeedback">
				<image class="micon" src="/static/user/question.png"></image>
				<text class="mtext">问题反馈</text>
				<text class="arrow">›</text>
			</view>
			<view class="menu-item" @tap="logoutAction">
				<image class="micon" src="/static/user/setting.png"></image>
				<text class="mtext">退出登录</text>
				<text class="arrow">›</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { initState, checkAuth, handleLogout } from '@/utils/store.js'
import { api } from '@/utils/api.js'

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(async () => {
	try {
		const info = uni.getSystemInfoSync()
		const statusBar = info.statusBarHeight || 0
		const screenW = info.screenWidth || 375
		const rpxToPx = (rpx) => (rpx * screenW) / 750
		const topPx = Math.round(rpxToPx(120) + statusBar)
		dynamicTopPadding.value = `padding-top:${topPx}px;`
	} catch (e) {
		dynamicTopPadding.value = ''
	}
	
	// 检查登录状态
	if (!checkAuth()) {
		return
	}
	
	// 初始化状态
	const state = initState()
	userInfo.value = state.userInfo
	
	// 加载数据
	await loadData()
})

// 返回到用户页时自动刷新数据
onShow(async () => {
	if (!checkAuth()) return
	await loadData()
})

// 用户信息
const userInfo = ref(null)
const pets = ref([])
const stats = ref({
	feeds: 0,
	likes: 0
})

// 页面用户性别：'male' | 'female'
const gender = ref('female')
const genderIcon = computed(() => gender.value === 'male' ? '/static/user/male.png' : '/static/user/female.png')

// 加载数据
async function loadData() {
	try {
		// 加载宠物数据（兼容数组或 {data: []}）
		const petsResult = await api.getPets()
		pets.value = Array.isArray(petsResult) ? petsResult : (petsResult.data || [])
		
		// 加载统计数据
		const feedsResult = await api.getFeeds({ page: 1, limit: 1 })
		stats.value.feeds = feedsResult.pagination?.total || 0
		
		// 计算在一起天数（优先 startTogether，其次 createdAt）
		if (pets.value.length > 0) {
			const firstPet = pets.value[0]
			const start = firstPet.startTogether || firstPet.createdAt
			if (start) {
				const days = Math.floor((Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
				stats.value.days = days
			}
		}
	} catch (error) {
		console.error('加载数据失败:', error)
	}
}

function goEdit() { uni.navigateTo({ url: '/pages/createPet/createPet' }) }
function openSetting() { uni.navigateTo({ url: '/pages/settings/setting' }) }
function openPrivacy() { uni.showToast({ title: '打开隐私中心', icon: 'none' }) }
function openFeedback() { uni.showToast({ title: '打开问题反馈', icon: 'none' }) }
function goPetDetail(p) {
    const payload = encodeURIComponent(JSON.stringify(p))
    uni.navigateTo({ url: `/pages/petDetail/petDetail?pet=${payload}` })
}

function logoutAction() {
    uni.showModal({
        title: '退出登录',
        content: '确认退出当前账号吗？',
        success: (res) => {
            if (res.confirm) {
                handleLogout()
            }
        }
    })
}

// 元信息格式化："X个月 | Ykg"
function formatMeta(p) {
    const months = p?.months ? `${p.months}个月` : ''
    const weight = p?.weight ? `${p.weight}kg` : ''
    return [months, weight].filter(Boolean).join(' | ')
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 24rpx 40rpx;
	/* 动态计算顶部间距，避免真机调试时env不生效 */
	min-height: 100vh;
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
	display: flex;
	flex-direction: column;
	align-items: center;
	box-sizing: border-box;
}

/* 顶部资料卡 */
.profile-card {
	position: relative;
	margin-top: 8rpx;
	width: 100%;
	max-width: 704rpx;
}

.decor {
	position: absolute;
	left: 50%;
	top: -105rpx;
	transform: translateX(-50%);
	width: 120rpx;
	height: 120rpx;
}

.profile-main {
	height: 232rpx;
	background: #fff;
	border-radius: 44rpx;
	border: 4rpx solid #2c2c2c;
	padding: 20rpx;
	display: flex;
	align-items: center;
	position: relative;
}

.avatar {
	margin-left: 15rpx;
	width: 160rpx;
	height: 160rpx;
	border-radius: 999rpx;
	background: #f5f5f5;
}

.meta {
	margin-left: 16rpx;
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.row1 {
	display: flex;
	align-items: center;
	gap: 15rpx;
}

.uname {
	padding-left: 20rpx;
	font-weight: 700;
	font-size: 34rpx;
}

.gender {
	width: 32rpx;
	height: 32rpx;
}

.gender.sm {
	width: 26rpx;
	height: 26rpx;
}

.stats {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	margin-top: 12rpx;
}

.stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 120rpx;
}

.num {
	font-weight: 800;
	font-size: 33rpx;
}

.label {
	color: #666;
	font-size: 24rpx;
}

.divider {
	width: 4rpx;
	height: 56rpx;
	background: #727171;
}

.profile-main>.arrow {
	position: absolute;
	right: 20rpx;
	top: 12rpx;
	font-size: 40rpx;
	font-weight: 700;
	color: #2c2c2c;
}

/* 天数条幅 */
.ribbon {
    position: relative;
    margin: 20rpx 0 22rpx;
    height: 84rpx;
    display: flex;
    align-items: center;
    background: #fff;
    border: 4rpx solid #2c2c2c;
    border-radius: 999rpx;
    overflow: hidden;
    width: 100%;
    max-width: 704rpx;
}

.ribbon-left {
    width: 160rpx;
    height: 100%;
    object-fit: cover;
}

.ribbon-text {
    flex: 1;
    text-align: center;
    font-weight: 650;
    font-size: 30rpx;
    color: #2c2c2c;
}

/* 我的宠物 */
.section.pets {
	background: #fff;
	border-radius: 24rpx;
	border: 4rpx solid #2c2c2c;
	padding: 16rpx;
	width: 100%;
	max-width: 640rpx;
}

.title-wrap {
	padding: 8rpx 6rpx 16rpx;
}

.title {
	font-weight: 750;
	font-size: 32rpx;
	background: linear-gradient(0deg, #ffe68c, #ffe68c);
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
}

.pet-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
	margin-top: 12rpx;
	width: 100%;
}

.pet-card {
	width: 100%;
	height: 140rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	padding: 12rpx;
	display: flex;
	box-sizing: border-box;
}

.pet-avatar-container {
	display: flex;
	justify-content: center;
	align-items: center;
}

.pet-avatar {
	width: 94rpx;
	height: 94rpx;
	border-radius: 12rpx;
	background: #f5f5f5;
}

.pet-information {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	margin-left: 20rpx;
}

.pet-name {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-top: 8rpx;
	font-weight: 700;
	font-size: 28rpx;
}

.pet-sub {
	color: #343434;
	font-size: 26rpx;
}

.add-pet {
	margin-top: 18rpx;
	border: 4rpx dashed #2c2c2c;
	border-radius: 24rpx;
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.plus {
	margin-top: 5rpx;
	height: 35rpx;
	width: 35rpx;
}

.add-text {
	font-size: 30rpx;
	font-weight: 580;
}

/* 菜单 */
.menu {
	margin-top: 16rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	width: 100%;
	max-width: 704rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 18rpx;
}

.micon {
	width: 78rpx;
	height: 78rpx;
	margin-right: 10rpx;
}

.mtext {
	font-size: 30rpx;
	font-weight: 580;
	color: #1a1a1a;
}

.menu-item>.arrow {
	margin-left: auto;
	font-size: 58rpx;
}
</style>
