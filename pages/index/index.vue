<template>
	<view class="home-page">
		<!-- Header -->
		<view class="header">
			<view class="greet">
				<text class="hi">Hi {{ userInfo?.nickname || '用户' }}</text>
				<text class="sub">{{ getGreeting() }}</text>
			</view>
		</view>

		<!-- Pet card -->
		<view class="pet-card">
			<view class="pet-top-decoration">
				<image class="decoration-img" src="/static/index/longCircle.svg" mode="widthFix" />
			</view>
			<view v-if="hasPet" class="pet-content">
				<view class="pet-left">
					<view class="pet-avatar">
						<image v-if="currentPet?.avatarUrl" :src="currentPet.avatarUrl" class="pet-avatar-inner" mode="aspectFill" />
						<view v-else class="pet-avatar-inner"></view>
					</view>
				</view>
				<view class="pet-right">
					<view class="pet-title-row">
						<text class="pet-name">{{ currentPet?.name || '我的宠物' }}</text>
						<text class="pet-edit">✎</text>
					</view>
					<text class="pet-meta">{{ petMeta }}</text>
					<view class="pet-tags" v-if="petTags.length">
						<text v-for="(tag, i) in petTags" :key="i" class="tag">{{ tag }}</text>
					</view>
				</view>
			</view>
			<view v-else class="pet-empty" @tap="goAddPet">
				<image class="add-icon" src="/static/index/add.png" mode="widthFix" />
				<text class="add-text">添加我的宠物</text>
			</view>
		</view>

		<!-- Quick list + small cards -->
		<view class="row">
			<view class="todo-card">
				<view class="todo-item">
					<view class="bullet"></view><text>给火火打疫苗</text>
				</view>
				<view class="todo-item">
					<view class="bullet"></view><text>清理猫砂</text>
				</view>
				<view class="todo-item">
					<view class="bullet"></view><text>购买火火吃的小零食</text>
				</view>
				<view class="todo-item">
					<view class="bullet"></view><text>给火火清理耳朵</text>
				</view>
				<view class="todo-item">
					<view class="bullet"></view><text>给火火剪指甲</text>
				</view>
			</view>
			<view class="side-cards">
				<view class="side-card" @tap="goToRecord('calendar')">
					<view class="side-texts">
						<text class="side-title">记录</text>
						<text class="side-sub">更好的照顾小宠</text>
					</view>
					<image class="side-icon" src="/static/index/record.png" mode="widthFix" />
				</view>
				<view class="side-card" @tap="goToRecord('stats')">
					<view class="side-texts">
						<text class="side-title">提醒</text>
						<text class="side-sub">防止忘记</text>
					</view>
					<image class="side-icon" src="/static/index/note.png" mode="widthFix" />
				</view>
			</view>
		</view>

		<!-- Popular science -->
		<view class="science">
			<view class="science-hd">
				<view class="science-title">
					<text>今日科普</text>
					<view class="title-notch"></view>
				</view>
				<text class="science-sub">【长出蒜瓣毛】</text>
			</view>
			<view class="science-text">当你看到自家猫的毛发分层了，那是它的蒜瓣毛—猫咪体表新陈代谢时产生的产物。毛发蓬松，说明平时吃的很好很有营养，是被养的很好的表现哦～</view>
			<image class="science-illust" src="/static/index/popular-science.png" mode="widthFix" />
			<view class="science-icons">
				<image class="fish" src="/static/index/fish.png" mode="widthFix" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { initState, getState } from '@/utils/store.js'
import { api } from '@/utils/api.js'

defineOptions({ name: 'HomeIndex' })

const hasPet = ref(false)
const userInfo = ref(null)
const pets = ref([])
const currentPet = computed(() => pets.value?.[0] || null)
const petMeta = computed(() => {
  if (!currentPet.value) return ''
  const months = currentPet.value.months ? `${currentPet.value.months}个月` : ''
  const weight = currentPet.value.weight ? `${currentPet.value.weight}kg` : ''
  return [months, weight].filter(Boolean).join(' | ')
})
const petTags = computed(() => {
  if (!currentPet.value) return []
  const temperament = currentPet.value.temperament || ''
  // temperament 可能是以逗号分隔的字符串，或一个简单字符串
  if (!temperament) return []
  if (Array.isArray(temperament)) return temperament
  return String(temperament).split(/[，,\s]+/).filter(Boolean).slice(0, 3)
})

// 初始化页面
onMounted(async () => {
  // 初始化状态
  const state = initState()
  userInfo.value = state.userInfo
  
  // 检查登录状态
  if (!state.isLoggedIn) {
    uni.reLaunch({
      url: '/pages/login/login'
    })
    return
  }
  
  // 加载宠物数据
  await loadPets()
})

// 返回到首页时自动刷新宠物数据
onShow(async () => {
  // 如果从详情返回且收到全局事件，或直接返回页面，都刷新一次
  await loadPets()
})

// 加载宠物数据
async function loadPets() {
  try {
    const result = await api.getPets()
    // 兼容后端直接返回数组 或 包在 data 里
    pets.value = Array.isArray(result) ? result : (result.data || [])
    hasPet.value = pets.value.length > 0
  } catch (error) {
    console.error('加载宠物数据失败:', error)
  }
}

// 获取问候语
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'Good Morning!'
  } else if (hour < 18) {
    return 'Good Afternoon!'
  } else {
    return 'Good Evening!'
  }
}

function goAddPet() {
	uni.navigateTo({ url: '/pages/createPet/createPet' })
}

function goToRecord(tab) {
	// 将 tab 参数存储到全局状态
	uni.setStorageSync('recordTab', tab)
	// 跳转到 tabBar 页面
	uni.switchTab({ url: '/pages/record/record' })
}
</script>

<style>
.home-page {
	padding: 24rpx;
	padding-top: calc(80rpx + env(safe-area-inset-top));
	/* iOS 兼容 */
	padding-top: calc(80rpx + constant(safe-area-inset-top));
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
	min-height: 100vh;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* Header */
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	width: 100%;
	max-width: 704rpx;
}

.greet .hi {
	display: block;
	font-size: 36rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.greet .sub {
	display: block;
	margin-top: 8rpx;
	color: #6b6b6b;
	font-size: 24rpx;
}

/* Pet card */
.pet-card {
	width: 100%;
	max-width: 704rpx;
	height: 320rpx;
	display: flex;
	flex-direction: column;
	background: #ffffff;
	border-radius: 32rpx;
	padding: 20rpx;
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.06);
	margin-bottom: 32rpx;
	position: relative;
	border: 4rpx solid #2c2c2c;
	box-sizing: border-box;
}

.pet-empty {
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background: url('/static/index/add-bg.png') center/cover no-repeat;
	border-radius: 24rpx;
}

.add-icon {
	width: 100rpx;
	height: 100rpx;
}

.add-text {
	font-size: 36rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.pet-top-decoration {
	position: relative;
	top: 3rpx;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	justify-content: center;
	z-index: 0;
	pointer-events: none;
}

.decoration-oval {
	width: 120rpx;
	height: 20rpx;
	background: linear-gradient(90deg, #ffeb3b 0%, #fff9c4 100%);
	border-radius: 40%;
	border: 2rpx solid #2c2c2c;
}

.decoration-img {
	width: 160rpx;
	height: 24rpx;
	display: block;
	border-radius: 40rpx;
}

/* svg not supported on mp-weixin; use CSS capsule instead */

.pet-content {
	display: flex;
	padding-top: 28rpx;
}

.pet-left {
	margin-right: 16rpx;
}

.pet-avatar {
	width: 220rpx;
	height: 180rpx;
	border-radius: 20rpx;
	background: #fff7d6;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #2c2c2c;
}

.pet-avatar-inner {
	width: 160rpx;
	height: 120rpx;
	background: linear-gradient(180deg, #ffd280, #ffeab1);
	border-radius: 12rpx;
}

.pet-right {
	flex: 1;
}

.pet-title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.pet-name {
	font-size: 32rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.pet-edit {
	color: #888;
	font-size: 28rpx;
}

.pet-meta {
	display: block;
	margin-top: 8rpx;
	color: #6b6b6b;
}

.pet-tags {
	display: flex;
	gap: 12rpx;
	margin-top: 16rpx;
}

.tag {
	padding: 6rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
	border: 2rpx solid #2c2c2c;
	color: #1a1a1a;
	background: #ffe082;
}

.tag-cute {
	background: #ffecb3;
}

.tag-stick {
	background: #fff2cc;
}

/* Row */
.row {
	display: flex;
	flex-direction: row;
	gap: 24rpx;
	margin-bottom: 24rpx;
	width: 100%;
	max-width: 704rpx;
	justify-content: space-between;
	align-items: stretch;
	height: 358rpx;
}

.todo-card {
	width: 284rpx;
	height: 100%;
	background: #ffffff;
	border-radius: 32rpx;
	padding: 20rpx;
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.06);
	border: 4rpx solid #2c2c2c;
	box-sizing: border-box;
	flex-shrink: 0;
	order: 1;
}

.todo-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 0;
	font-size: 26rpx;
	color: #1a1a1a;
}

.bullet {
	width: 16rpx;
	height: 16rpx;
	background: #2c2c2c;
	border-radius: 50%;
}

.side-cards {
	width: 340rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	flex-shrink: 0;
	order: 2;
}

.side-card {
	background: #ffffff;
	border-radius: 40rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.06);
	display: flex;
	align-items: center;
	gap: 20rpx;
	border: 4rpx solid #2c2c2c;
	justify-content: space-between;
	height: 115rpx;
	/* 统一两个卡片高度 */
}

.side-icon {
	width: 86rpx;
	height: 86rpx;
}

.side-texts {
	display: flex;
	flex-direction: column;
	flex: 1;
	/* 文本区自适应填充，保证两卡片同高 */
	min-width: 0;
}

.side-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.side-sub {
	color: #6b6b6b;
	margin-top: 8rpx;
	font-size: 22rpx;
}

/* Science */
.science {
    width: 704rpx;
	height: 416rpx;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 26rpx 20rpx 12rpx;
	/* 减小上边距与整体竖向间隙 */
	box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.06);
	margin-bottom: 40rpx;
	/* 更贴近顶部内容 */
	position: relative;
	overflow: hidden;
	border: 4rpx solid #2c2c2c;
	box-sizing: border-box;
}

.science-hd {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 8rpx;
	/* 收紧标题与正文的距离 */
}

.science-title {
	position: relative;
	display: inline-flex;
	align-items: center;
	background: #ffeb3b;
	padding: 10rpx 24rpx 10rpx 28rpx;
	border-radius: 16rpx;
	border: 4rpx solid #2c2c2c;
}

.science-title text {
	font-weight: 700;
	color: #1a1a1a;
}

.title-notch {
	position: absolute;
	left: 12rpx;
	top: -10rpx;
	width: 40rpx;
	height: 12rpx;
	background: #2c2c2c;
	border-radius: 999rpx;
}

.science-sub {
	color: #1a1a1a;
	margin-left: 8rpx;
	font-weight: 700;
}

.science-text {
	font-size: 24rpx;
	font-weight: normal;
	display: block;
	color: #000000;
	line-height: 1.8;
	margin: 12rpx 0 16rpx;
	width: 60%;
	/* 文本占左侧60%宽度 */
}

.science-illust {
	position: absolute;
	right: 5rpx;
	bottom: 10rpx;
	width: 280rpx;
}

.science-icons {
	position: absolute;
	left: 16rpx;
	bottom: 10rpx;
	display: flex;
	gap: 12rpx;
	align-items: center;
}

.fish {
	width: 165rpx;
	height: 24rpx;
}

/* 真机调试适配 */
@media screen and (max-width: 750px) {
	.home-page {
		padding-top: calc(110rpx + 20px);
	}
}

/* 小屏幕设备适配 */
@media screen and (max-width: 600px) {
	.home-page {
		padding-left: 12rpx;
		padding-right: 12rpx;
	}
	
	.pet-card,
	.science {
		width: calc(100vw - 24rpx);
		max-width: 704rpx;
	}
	
	.row {
		flex-direction: row;
		gap: 12rpx;
		width: 100%;
	}
	
	.todo-card {
		width: 50%;
		max-width: 320rpx;
	}
	
	.side-cards {
		width: 50%;
		max-width: 384rpx;
	}
}
</style>
