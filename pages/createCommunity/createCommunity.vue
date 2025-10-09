<template>
	<view class="page">
		<!-- 内容区域 -->
		<view class="content">
			<!-- 用户信息 -->
			<view class="user-info">
				<image class="user-avatar" src="/static/logo.png" mode="aspectFill" />
				<view class="user-details">
					<text class="username">喵星人</text>
					<text class="user-desc">布偶猫｜呆呆</text>
				</view>
			</view>

			<!-- 文本输入区域 -->
			<view class="text-input-area">
				<textarea 
					class="content-input" 
					v-model="content" 
					placeholder="分享你的宠物日常..." 
					placeholder-class="placeholder"
					:maxlength="500"
					auto-height
				></textarea>
				<view class="char-count">{{ content.length }}/500</view>
			</view>

			<!-- 图片上传区域 -->
			<view class="image-upload-area">
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
				<view class="topic-input-wrapper">
					<input 
						class="topic-input" 
						v-model="topic" 
						placeholder="# 输入话题标签" 
						placeholder-class="topic-placeholder"
					/>
				</view>
			</view>

			<!-- 位置信息（按需开启） -->
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const content = ref('')
const images = ref([])
const topic = ref('')
const location = ref('')

function publish() {
	if (!content.value.trim()) {
		uni.showToast({
			title: '请输入内容',
			icon: 'none'
		})
		return
	}
	
	// 这里可以调用发布API
	uni.showToast({
		title: '发布成功',
		icon: 'success'
	})
	
	setTimeout(() => {
		uni.navigateBack()
	}, 1500)
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
</style>