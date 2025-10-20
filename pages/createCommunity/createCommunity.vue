<template>
	<view class="page">
		<!-- 内容区域 -->
		<view class="content">
			<!-- 发布类型选择 -->
			<view class="type-selector">
				<view :class="['type-btn', !isQuestion ? 'active' : '']" @tap="isQuestion = false">
					<text>发布动态</text>
				</view>
				<view :class="['type-btn', isQuestion ? 'active' : '']" @tap="isQuestion = true">
					<text>发布问答</text>
				</view>
			</view>
			
			<!-- 用户信息 -->
			<view class="user-info">
				<image class="user-avatar" :src="userInfo.avatarUrl || '/static/logo.png'" mode="aspectFill" />
				<view class="user-details">
					<text class="username">{{ userInfo.nickname || '用户' }}</text>
					<text class="user-desc">{{ currentPet.name || '未设置宠物' }}{{ currentPet.breed ? '｜' + currentPet.breed : '' }}</text>
				</view>
			</view>

			<!-- 问答标题输入（仅问答模式） -->
			<view class="title-input-area" v-if="isQuestion">
				<input 
					class="title-input" 
					v-model="questionTitle" 
					placeholder="请输入问题标题..." 
					placeholder-class="placeholder"
					:maxlength="100"
				/>
				<view class="char-count">{{ questionTitle.length }}/100</view>
			</view>

			<!-- 文本输入区域 -->
			<view class="text-input-area">
				<textarea 
					class="content-input" 
					v-model="content" 
					:placeholder="isQuestion ? '详细描述你的问题...' : '分享你的宠物日常...'" 
					placeholder-class="placeholder"
					:maxlength="500"
					auto-height
				></textarea>
				<view class="char-count">{{ content.length }}/500</view>
			</view>

			<!-- 图片上传区域（仅动态模式） -->
			<view class="image-upload-area" v-if="!isQuestion">
				<view class="upload-title">添加图片</view>
				<view class="image-grid">
					<view 
						class="image-item" 
						v-for="(image, index) in images" 
						:key="index"
					>
						<image class="uploaded-image" :src="image" mode="aspectFill" />
						<view class="delete-btn" @tap="removeImage(index)">×</view>
					</view>
					<view 
						class="upload-btn" 
						v-if="images.length < 9" 
						@tap="chooseImage"
					>
						<text class="upload-icon">+</text>
						<text class="upload-text">添加图片</text>
					</view>
				</view>
			</view>

			<!-- 话题标签 -->
			<view class="topic-area">
				<view class="topic-title">添加话题</view>
				
				<!-- 已添加的话题标签 -->
				<view class="topic-tags" v-if="topics.length > 0">
					<view 
						class="topic-tag" 
						v-for="(tag, index) in topics" 
						:key="index"
					>
						<text class="tag-text">#{{ tag }}</text>
						<view class="tag-remove" @tap="removeTopic(index)">×</view>
					</view>
				</view>
				
				<!-- 话题输入框 -->
				<view class="topic-input-wrapper">
					<input 
						class="topic-input" 
						v-model="currentTopic" 
						placeholder="# 输入话题标签" 
						placeholder-class="topic-placeholder"
						@confirm="addTopic"
					/>
				</view>
			</view>

			<!-- 紧急标记（仅问答模式） -->
			<view class="urgent-area" v-if="isQuestion">
				<view class="urgent-title">问题类型</view>
				<view class="urgent-option" @tap="isUrgent = !isUrgent">
					<view :class="['urgent-checkbox', isUrgent ? 'checked' : '']">
						<text v-if="isUrgent">✓</text>
					</view>
					<text class="urgent-label">紧急问题</text>
				</view>
			</view>

			<!-- 位置信息（按需开启） -->
		</view>

		<!-- 发布按钮 -->
		<view class="publish-btn" @tap="publish">
			<text class="publish-text">{{ isQuestion ? '发布问题' : '发布' }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api.js'

const content = ref('')
const images = ref([])
const topics = ref([])
const currentTopic = ref('')
const location = ref('')
const userInfo = ref({})
const currentPet = ref({})

// 问答相关
const isQuestion = ref(false)
const questionTitle = ref('')
const isUrgent = ref(false)

async function publish() {
	if (isQuestion.value) {
		// 发布问答
		if (!questionTitle.value.trim() || !content.value.trim()) {
			uni.showToast({ title: '请输入问题标题和内容', icon: 'none' })
			return
		}
		
		try {
			const payload = {
				title: questionTitle.value.trim(),
				content: content.value.trim(),
				isUrgent: isUrgent.value,
				tags: topics.value,
				petId: currentPet.value.id
			}
			await api.createQuestion(payload)
			uni.showToast({ title: '问题发布成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack()
				// 通知问答列表刷新
				try { uni.$emit('questions:refresh') } catch (e) {}
			}, 800)
		} catch (e) {
			console.error('发布问答失败:', e)
			uni.showToast({ 
				title: e.message || '发布失败，请检查网络连接', 
				icon: 'none',
				duration: 3000
			})
		}
	} else {
		// 发布动态
		if (!content.value.trim() && images.value.length === 0) {
			uni.showToast({ title: '请输入内容或添加图片', icon: 'none' })
			return
		}
		try {
			const payload = {
				text: content.value.trim(),
				images: images.value,
				tags: topics.value,
				petId: currentPet.value.id
			}
			await api.createFeed(payload)
			uni.showToast({ title: '发布成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack()
				// 通知广场刷新
				try { uni.$emit('feeds:refresh') } catch (e) {}
			}, 800)
		} catch (e) {
			console.error('发布动态失败:', e)
			uni.showToast({ 
				title: e.message || '发布失败，请检查网络连接', 
				icon: 'none',
				duration: 3000
			})
		}
	}
}

function chooseImage() {
	uni.chooseImage({
		count: 9 - images.value.length,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: (res) => {
			images.value.push(...res.tempFilePaths)
		}
	})
}

function removeImage(index) {
	images.value.splice(index, 1)
}

function addTopic() {
	const topic = currentTopic.value.trim().replace(/^#+/, '')
	if (topic && !topics.value.includes(topic)) {
		topics.value.push(topic)
		currentTopic.value = ''
	}
}

function removeTopic(index) {
	topics.value.splice(index, 1)
}

async function loadUserAndPet() {
	try {
		// 获取用户信息
		const user = await api.getProfile()
		userInfo.value = user
		
		// 获取宠物列表，选择第一个作为当前宠物
		const pets = await api.getPets()
		if (pets && pets.length > 0) {
			currentPet.value = pets[0]
		}
	} catch (e) {
		console.warn('Failed to load user/pet info:', e)
	}
}

onMounted(() => {
	loadUserAndPet()
})

function chooseLocation() {
	uni.chooseLocation({
		success: (res) => {
			location.value = res.name
		}
	})
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding-bottom: 120rpx; /* 为底部按钮留出空间 */
}

/* 内容区域 */
.content {
    padding: 30rpx 56rpx; /* 增加左右留白 */
    padding-top: calc(30rpx + env(safe-area-inset-top));
    padding-top: calc(30rpx + constant(safe-area-inset-top));
    width: 100%;
    max-width: 704rpx; /* 限制内容最大宽度，增强左右留白效果 */
    box-sizing: border-box;
}

/* 发布类型选择 */
.type-selector {
    display: flex;
    background: #fff;
    border: 4rpx solid #2c2c2c;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 6rpx 0 #2c2c2c;
    overflow: hidden;
}

.type-btn {
    flex: 1;
    padding: 20rpx;
    text-align: center;
    background: #fff;
    color: #666;
    font-size: 28rpx;
    font-weight: 600;
    transition: all 0.3s ease;
}

.type-btn.active {
    background: #2c2c2c;
    color: #fff;
}

/* 用户信息 */
.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.user-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.user-details {
	margin-left: 20rpx;
}

.username {
	display: block;
	font-size: 30rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.user-desc {
	display: block;
	font-size: 24rpx;
	color: #7a7a7a;
	margin-top: 4rpx;
}

/* 标题输入区域 */
.title-input-area {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.title-input {
	width: 100%;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.4;
}

/* 文本输入区域 */
.text-input-area {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.content-input {
	width: 100%;
	min-height: 200rpx;
	font-size: 28rpx;
	line-height: 1.6;
	color: #333;
}

.placeholder {
	color: #bbb;
}

.char-count {
	text-align: right;
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

/* 图片上传区域 */
.image-upload-area {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.upload-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c2c2c;
	margin-bottom: 20rpx;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20rpx;
}

.image-item {
	position: relative;
	aspect-ratio: 1;
	border-radius: 12rpx;
	overflow: hidden;
}

.uploaded-image {
	width: 100%;
	height: 100%;
	background: #f3f3f3;
}

.delete-btn {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 40rpx;
	height: 40rpx;
	background: rgba(0, 0, 0, 0.6);
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: bold;
}

.upload-btn {
	aspect-ratio: 1;
	border: 2rpx dashed #ccc;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: #fafafa;
}

.upload-icon {
	font-size: 40rpx;
	color: #999;
	margin-bottom: 8rpx;
}

.upload-text {
	font-size: 20rpx;
	color: #999;
}

/* 话题标签 */
.topic-area {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.topic-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c2c2c;
	margin-bottom: 20rpx;
}

/* 话题标签列表 */
.topic-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.topic-tag {
	display: flex;
	align-items: center;
	background: #f0f0f0;
	border: 2rpx solid #ddd;
	border-radius: 20rpx;
	padding: 8rpx 16rpx;
	gap: 8rpx;
}

.tag-text {
	font-size: 24rpx;
	color: #333;
}

.tag-remove {
	width: 32rpx;
	height: 32rpx;
	background: #999;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	font-weight: bold;
}

.topic-input-wrapper {
	background: #f8f8f8;
	border-radius: 12rpx;
	padding: 20rpx;
}

.topic-input {
	width: 100%;
	font-size: 26rpx;
	color: #333;
}

.topic-placeholder {
	color: #bbb;
}

/* 紧急标记区域 */
.urgent-area {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.urgent-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c2c2c;
	margin-bottom: 20rpx;
}

.urgent-option {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.urgent-checkbox {
	width: 40rpx;
	height: 40rpx;
	border: 4rpx solid #ddd;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	transition: all 0.3s ease;
}

.urgent-checkbox.checked {
	background: #ff6b35;
	border-color: #ff6b35;
	color: #fff;
}

.urgent-checkbox text {
	font-size: 24rpx;
	font-weight: bold;
}

.urgent-label {
	font-size: 26rpx;
	color: #333;
}

/* 位置信息 */
.location-area {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
}

.location-item {
	display: flex;
	align-items: center;
}

.location-icon {
	font-size: 28rpx;
	margin-right: 12rpx;
}

.location-text {
	font-size: 26rpx;
	color: #333;
}

/* 发布按钮 */
.publish-btn {
	position: fixed;
	bottom: 40rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 200rpx;
	height: 80rpx;
	background: #2c2c2c;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 0 #1a1a1a;
	z-index: 100;
}

.publish-btn:active {
	transform: translateX(-50%) translateY(4rpx);
	box-shadow: 0 4rpx 0 #1a1a1a;
}

.publish-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: 600;
}
</style>