<template>
	<view class="page">
		<!-- 叠纸卡片背景 -->
		<view class="sheet">
			<view class="sheet-bg bg1"></view>
			<view class="sheet-body">
				<!-- 头部标题 -->
				<view class="header">
					<view class="title-section">
						<text class="main-title">创建我的宠物</text>
						<text class="sub-title">记录小宝贝的基本信息</text>
					</view>
				</view>

				<!-- 宠物头像 -->
				<view class="avatar-section">
					<view class="avatar-wrap" @tap="pickAvatar">
						<image v-if="form.avatar" class="avatar" :src="form.avatar" mode="aspectFill" />
						<view v-else class="avatar-placeholder">
							<image class="add-icon" src="/static/index/add.png" mode="widthFix" />
							<text class="add-text">添加头像</text>
						</view>
					</view>
				</view>

				<!-- 基本信息表单 -->
				<view class="form-section">
					<view class="form-group">
						<text class="label">宠物昵称 *</text>
						<input class="input" v-model="form.name" placeholder="请输入宠物的昵称" />
					</view>

					<view class="form-row">
						<view class="form-group half">
							<text class="label">年龄</text>
							<input class="input" type="number" v-model.number="form.months" placeholder="月龄" />
						</view>
						<view class="form-group half">
							<text class="label">体重</text>
							<input class="input" type="digit" v-model="form.weight" placeholder="kg" />
						</view>
					</view>

					<view class="form-row">
						<view class="form-group half">
							<text class="label">性别</text>
							<picker :range="genders" :value="genderIndex" @change="onGenderChange">
								<view class="picker">{{ genders[genderIndex] }}</view>
							</picker>
						</view>
						<view class="form-group half">
							<text class="label">种类</text>
							<input class="input" v-model="form.breed" placeholder="如 布偶猫" />
						</view>
					</view>

					<view class="form-group">
						<text class="label">毛色</text>
						<input class="input" v-model="form.color" placeholder="如 白橘色" />
					</view>

					<view class="form-group">
						<text class="label">生日</text>
						<picker mode="date" :value="form.birthday" @change="onBirthdayChange">
							<view class="picker">{{ form.birthday || '选择生日' }}</view>
						</picker>
					</view>

					<view class="form-group">
						<text class="label">开始一起生活</text>
						<picker mode="date" :value="form.startTogether" @change="onStartTogetherChange">
							<view class="picker">{{ form.startTogether || '选择日期' }}</view>
						</picker>
					</view>
				</view>

				<!-- 特征选择 -->
				<view class="features-section">
					<view class="section-title">
						<image class="bullet" src="/static/user/fish.png" />
						<text>宠物特征</text>
					</view>

					<view class="feature-item">
						<text class="feature-label">是否绝育</text>
						<switch :checked="form.neutered" @change="e => form.neutered = e.detail.value" />
					</view>

					<view class="feature-item">
						<text class="feature-label">接种疫苗</text>
						<view class="vaccine-options">
							<checkbox-group @change="onVaccinesChange">
								<label v-for="option in vaccineOptions" :key="option" class="checkbox-item">
									<checkbox :value="option" :checked="form.vaccines.includes(option)" />
									<text>{{ option }}</text>
								</label>
							</checkbox-group>
						</view>
					</view>

					<view class="feature-item">
						<text class="feature-label">性格特点</text>
						<textarea class="textarea" v-model="form.temperament" placeholder="例如：慵懒，不爱动，还有点小傲娇" />
					</view>
				</view>

				<!-- 照片上传 -->
				<view class="photos-section">
					<view class="section-title">
						<image class="bullet" src="/static/user/fish.png" />
						<text>日常照片</text>
					</view>
					<view class="gallery">
						<view v-for="(photo, index) in form.gallery" :key="index" class="photo-item">
							<image class="photo" :src="photo" mode="aspectFill" />
							<view class="delete-btn" @tap="deletePhoto(index)">×</view>
						</view>
						<view class="add-photo" @tap="pickPhotos">
							<image class="add-icon" src="/static/index/add.png" mode="widthFix" />
							<text class="add-text">添加照片</text>
						</view>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="actions">
					<button class="btn cancel-btn" @tap="cancel">取消</button>
					<button class="btn save-btn" @tap="savePet">保存</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { api } from '@/utils/api.js'
import { uploadImage, uploadImages, compressImage } from '@/utils/upload.js'
import { onLoad } from '@dcloudio/uni-app'

// 表单数据
const form = reactive({
	name: '',
	months: '',
	weight: '',
	gender: 'female',
	breed: '',
	color: '',
	birthday: '',
	startTogether: '',
	neutered: false,
	vaccines: [],
	temperament: '',
	avatar: '',
	gallery: []
})

// 选择器数据
const genders = ref(['女生', '男生'])
const genderIndex = ref(0)
const vaccineOptions = ref(['已接种猫三联疫苗', '已接种狂犬疫苗', '已接种其他疫苗'])

onLoad(() => {
	// 设置导航栏样式
	uni.setNavigationBarColor({ 
		frontColor: '#000000', 
		backgroundColor: '#fff1a8' 
	})
})

// 性别选择
function onGenderChange(e: any) {
	genderIndex.value = Number(e.detail.value)
	form.gender = genderIndex.value === 1 ? 'male' : 'female'
}

// 生日选择
function onBirthdayChange(e: any) {
	form.birthday = e.detail.value
}

// 开始一起生活日期选择
function onStartTogetherChange(e: any) {
	form.startTogether = e.detail.value
}

// 疫苗选择
function onVaccinesChange(e: any) {
	form.vaccines = e.detail.value || []
}

// 选择头像
async function pickAvatar() {
	try {
		const res = await uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera']
		})
		
		// 压缩图片
		const compressedPath = await compressImage(res.tempFilePaths[0], 0.8)
		
		// 显示上传进度
		uni.showLoading({ title: '上传头像中...' })
		
		// 上传头像
		const avatarUrl = await uploadImage(compressedPath, 'avatar')
		
		form.avatar = avatarUrl
		uni.hideLoading()
		uni.showToast({ title: '头像上传成功', icon: 'success' })
	} catch (error) {
		uni.hideLoading()
		console.error('选择头像失败:', error)
		uni.showToast({ title: '头像上传失败', icon: 'none' })
	}
}

// 选择照片
async function pickPhotos() {
	const remainingCount = 9 - form.gallery.length
	if (remainingCount <= 0) {
		uni.showToast({
			title: '最多只能上传9张照片',
			icon: 'none'
		})
		return
	}
	
	try {
		const res = await uni.chooseImage({
			count: remainingCount,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera']
		})
		
		// 显示上传进度
		uni.showLoading({ title: '上传照片中...' })
		
		// 批量压缩和上传
		const uploadPromises = res.tempFilePaths.map(async (filePath) => {
			const compressedPath = await compressImage(filePath, 0.7)
			return await uploadImage(compressedPath, 'gallery')
		})
		
		const uploadedUrls = await Promise.all(uploadPromises)
		form.gallery = form.gallery.concat(uploadedUrls)
		
		uni.hideLoading()
		uni.showToast({ title: `成功上传${uploadedUrls.length}张照片`, icon: 'success' })
	} catch (error) {
		uni.hideLoading()
		console.error('选择照片失败:', error)
		uni.showToast({ title: '照片上传失败', icon: 'none' })
	}
}

// 删除照片
function deletePhoto(index: number) {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这张照片吗？',
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4757',
		success: (res) => {
			if (res.confirm) {
				form.gallery.splice(index, 1)
			}
		}
	})
}

// 表单验证
function validateForm() {
	if (!form.name.trim()) {
		uni.showToast({
			title: '请输入宠物昵称',
			icon: 'none'
		})
		return false
	}
	return true
}

// 保存宠物信息
async function savePet() {
	if (!validateForm()) return
	
	try {
		uni.showLoading({ title: '保存中...' })
		
		// 将表单数据映射到后端需要的字段
		const payload: any = {
			name: form.name,
			gender: form.gender,
			breed: form.breed || '',
			neutered: !!form.neutered,
		}
		
		// 添加所有新字段
		if (form.birthday) payload.birthday = form.birthday
		if (form.startTogether) payload.startTogether = form.startTogether
		if (form.months) payload.months = parseInt(form.months)
		if (form.weight) payload.weight = parseFloat(form.weight)
		if (form.color) payload.color = form.color
		if (form.temperament) payload.temperament = form.temperament
		if (form.vaccines && form.vaccines.length > 0) payload.vaccines = form.vaccines
		
		// 使用已上传的头像URL（开发环境也提交本地路径）
		if (form.avatar) {
			payload.avatarUrl = form.avatar
		}
		
		// 创建宠物
		console.log('提交宠物数据:', payload)
		const pet = await api.createPet(payload)
		console.log('宠物创建成功:', pet)
		
		// 如果有照片，创建媒体记录
		if (form.gallery && form.gallery.length > 0) {
			// 开发环境：直接使用本地路径
			const uploadedUrls = form.gallery.filter(url => url && url.trim())
			
			if (uploadedUrls.length > 0) {
				try {
					await api.createMedia({
						petId: pet.id,
						type: 'image',
						urls: uploadedUrls,
						description: '宠物照片'
					})
					console.log('成功创建媒体记录:', uploadedUrls.length, '张照片')
				} catch (error) {
					console.warn('照片上传失败，但宠物已创建:', error)
				}
			} else {
				console.log('没有照片，跳过媒体记录创建')
			}
		}
		
		uni.hideLoading()
		
		// 检查是否有图片上传
		const hasUploadedImages = form.gallery && form.gallery.length > 0
		const hasUploadedAvatar = !!form.avatar
		
		let message = '宠物创建成功'
		if (hasUploadedAvatar || hasUploadedImages) {
			message += '，图片已上传'
		}
		
		uni.showToast({ title: message, icon: 'success' })
		
		setTimeout(() => {
			uni.navigateBack()
		}, 800)
	} catch (e) {
		uni.hideLoading()
		console.error('创建宠物失败:', e)
		
		// 根据错误类型显示不同的提示
		let errorMessage = '创建失败'
		if (e.message) {
			if (e.message.includes('Unauthorized')) {
				errorMessage = '登录已过期，请重新登录'
			} else if (e.message.includes('Network')) {
				errorMessage = '网络连接失败，请检查网络'
			} else {
				errorMessage = `创建失败: ${e.message}`
			}
		}
		
		uni.showToast({ title: errorMessage, icon: 'none' })
	}
}

// 取消创建
function cancel() {
	uni.showModal({
		title: '确认取消',
		content: '确定要取消创建宠物吗？已填写的信息将丢失。',
		confirmText: '确定',
		cancelText: '继续编辑',
		confirmColor: '#ff4757',
		success: (res) => {
			if (res.confirm) {
				uni.navigateBack()
			}
		}
	})
}
</script>

<style lang="scss" scoped>
.page {
	min-height: 100vh;
	padding: 24rpx;
	padding-top: calc(110rpx + env(safe-area-inset-top));
	padding-top: calc(110rpx + constant(safe-area-inset-top));
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
}

.sheet {
	position: relative;
	padding-top: 30rpx;
	padding-bottom: 45rpx;
}

.sheet-bg {
	position: absolute;
	left: 12rpx;
	right: 12rpx;
	height: 96%;
	border: 4rpx solid #2c2c2c;
	border-radius: 32rpx;
	background: #fff;
	z-index: 0;
	pointer-events: none;
}

.sheet-bg.bg1 {
	top: 24rpx;
    bottom: 0; /* 跟随主卡片内容高度变化 */
    height: 90%; /* 动态高度由 top/bottom 约束 */
    width: 648rpx; /* 略小于主体宽度 600rpx，形成叠纸边缘 */
    left: 50%;
    right: auto;
    transform: translateX(-50%) rotate(-2.2deg);
}

.sheet-body {
	width: 625rpx;
	margin: 0 auto;
	position: relative;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 32rpx;
	padding: 32rpx 28rpx 120rpx 28rpx;
	z-index: 1;
}

// 头部标题
.header {
	margin-bottom: 32rpx;
	text-align: center;
}

.title-section {
	.main-title {
		display: block;
		font-size: 36rpx;
		font-weight: 700;
		color: #1a1a1a;
		margin-bottom: 8rpx;
	}
	
	.sub-title {
		display: block;
		font-size: 24rpx;
		color: #6b6b6b;
	}
}

// 头像区域
.avatar-section {
	display: flex;
	justify-content: center;
	margin-bottom: 32rpx;
}

.avatar-wrap {
	width: 200rpx;
	height: 200rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	background: #f5f5f5;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar {
	width: 200rpx;
	height: 200rpx;
}

.avatar-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.add-icon {
	width: 60rpx;
	height: 60rpx;
}

.add-text {
	font-size: 24rpx;
	color: #888;
}

// 表单区域
.form-section {
	margin-bottom: 32rpx;
}

.form-group {
	margin-bottom: 24rpx;
}

.form-row {
	display: flex;
	gap: 16rpx;
}

.form-group.half {
	flex: 1;
}

.label {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	color: #1a1a1a;
	margin-bottom: 12rpx;
}

.input {
	width: 100%;
	height: 80rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	padding: 0 16rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.picker {
	width: 100%;
	height: 80rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	padding: 0 16rpx;
	font-size: 28rpx;
	line-height: 80rpx;
	box-sizing: border-box;
}

// 特征区域
.features-section {
	margin-bottom: 32rpx;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 24rpx;
	
	.bullet {
		width: 44rpx;
		height: 44rpx;
	}
	
	text {
		font-size: 32rpx;
		font-weight: 700;
		color: #1a1a1a;
	}
}

.feature-item {
	margin-bottom: 24rpx;
}

.feature-label {
	display: block;
	font-size: 28rpx;
	font-weight: 700;
	color: #1a1a1a;
	margin-bottom: 12rpx;
}

.vaccine-options {
	.checkbox-item {
		display: inline-flex;
		align-items: center;
		gap: 8rpx;
		margin-right: 16rpx;
		margin-bottom: 8rpx;
		font-size: 26rpx;
	}
}

.textarea {
	width: 100%;
	min-height: 120rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	padding: 12rpx 16rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

// 照片区域
.photos-section {
	margin-bottom: 32rpx;
}

.gallery {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
}

.photo-item {
	position: relative;
	width: 100%;
	height: 180rpx;
}

.photo {
	width: 100%;
	height: 180rpx;
	border-radius: 12rpx;
	border: 4rpx solid #2c2c2c;
	box-sizing: border-box;
}

.delete-btn {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	width: 32rpx;
	height: 32rpx;
	background: #ff4757;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	font-weight: bold;
	border: 2rpx solid #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	z-index: 10;
}

.add-photo {
	width: 100%;
	height: 180rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	
	.add-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	.add-text {
		font-size: 24rpx;
		color: #888;
	}
}

// 操作按钮
.actions {
	position: absolute;
	left: 28rpx;
	right: 28rpx;
	bottom: 28rpx;
	display: flex;
	gap: 16rpx;
	z-index: 2;
}

.btn {
	flex: 1;
	height: 80rpx;
	border-radius: 999rpx;
	font-size: 28rpx;
	font-weight: 700;
	border: 4rpx solid #2c2c2c;
}

.cancel-btn {
	background: #fff;
	color: #1a1a1a;
}

.save-btn {
	background: #ffe046;
	color: #1a1a1a;
}
</style>
