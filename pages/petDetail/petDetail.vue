<template>
	<view class="page">
		<!-- 叠纸卡片背景 -->
		<view class="sheet">
			<view class="sheet-bg bg1"></view>

			<view class="sheet-body">
				<!-- 头部：头像 + 基本信息列表 -->
				<view class="header">
					<view class="avatar-wrap" @tap="editMode ? pickAvatar() : null">
						<image class="avatar"
							:src="getPetAvatarSrc(editMode && form.avatarUrl ? form.avatarUrl : pet.avatarUrl)"
							mode="aspectFill" @load="onAvatarLoad" @error="onAvatarError" />
					</view>
					<view class="kv">
						<view class="kv-row"><text class="k">姓名：</text>
							<template v-if="!editMode"><text class="v">{{ pet.name }}</text></template>
							<input v-else class="v input" v-model="form.name" placeholder="请输入昵称" />
						</view>
						<view class="kv-row"><text class="k">年龄：</text>
							<template v-if="!editMode"><text class="v">{{ pet.months || 0 }}个月</text></template>
							<input v-else class="v input" type="number" v-model.number="form.months" placeholder="月龄" />
						</view>
						<view class="kv-row"><text class="k">体重：</text>
							<template v-if="!editMode"><text class="v">{{ pet.weight || 0 }}kg</text></template>
							<input v-else class="v input" type="digit" v-model="form.weight" placeholder="kg" />
						</view>
						<view class="kv-row"><text class="k">性别：</text>
							<template v-if="!editMode"><text class="v">{{ pet.gender === 'male' ? '男生' : '女生'
							}}</text></template>
							<picker v-else :range="genders" :value="genderIndex" @change="onGenderChange">
								<view class="picker v">{{ genders[genderIndex] }}</view>
							</picker>
						</view>
						<view class="kv-row"><text class="k">种类：</text>
							<template v-if="!editMode"><text class="v">{{ pet.breed }}</text></template>
							<input v-else class="v input" v-model="form.breed" placeholder="如 布偶猫" />
						</view>
					</view>
				</view>

				<view class="edit-row">
					<view v-if="!editMode" class="edit-actions">
						<button class="btn ghost with-icon" @tap="startEdit">
							<image class="btn-icon" src="/static/tarBar/index-active.png" mode="widthFix" />
							<text>编辑</text>
						</button>
						<button class="btn delete-btn with-icon" @tap="deletePet">
							<image class="btn-icon" src="/static/user/delete.png" mode="widthFix" />
							<text>删除</text>
						</button>
					</view>
					<view v-else class="edit-actions">
						<button class="btn ghost" @tap="cancelEdit">取消</button>
						<button class="btn" @tap="saveEdit">保存</button>
					</view>
				</view>

				<view class="divider-h"></view>

				<!-- 绝育 -->
				<view class="row icon-row">
					<image class="bullet" src="/static/user/fish.png" />
					<text class="k big">是否绝育：</text>
					<template v-if="!editMode">
						<text class="v big">{{ pet.neutered ? '已绝育' : '未绝育' }}
						</text>
					</template>
					<switch v-else class="v" :checked="form.neutered" @change="e => form.neutered = e.detail.value" />
				</view>

				<view class="divider-h"></view>

				<!-- 疫苗 -->
				<view class="row icon-row">
					<image class="bullet" src="/static/user/fish.png" />
					<text class="k big">接种疫苗：</text>
					<view class="vaccines" v-if="!editMode">
						<text v-for="(v, i) in vaccines" :key="i" class="v-item">{{ v }}</text>
					</view>
					<view class="vaccines" v-else>
						<checkbox-group @change="onVaccinesChange">
							<label v-for="opt in vaccineOptions" :key="opt" class="ck">
								<checkbox :value="opt" :checked="form.vaccines.includes(opt)" /><text>{{ opt }}</text>
							</label>
						</checkbox-group>
					</view>
				</view>


				<view class="divider-h"></view>

				<!-- 性格 -->
				<view class="row icon-row">
					<image class="bullet" src="/static/user/fish.png" />
					<text class="k big">性格：</text>
					<template v-if="!editMode"><text class="v big">{{ temperament }}</text></template>
					<textarea v-else class="v textarea" v-model="form.temperament" placeholder="例如：慵懒，不爱动，还有点小傲娇" />
				</view>

				<view class="divider-h"></view>

				<!-- 日常照片 -->
				<view class="photos">
					<view class="photos-title">
						<image class="bullet" src="/static/user/fish.png" />
						<text class="k big">日常照片：</text>
					</view>
					<view class="gallery">
						<view v-for="(g, i) in editMode ? form.gallery : gallery"
							:key="`photo-${i}-${photoUpdateTrigger}`" class="g-wrapper">
							<image class="g" :src="getPhotoSrc(g)" mode="aspectFill" @tap="preview(i)" />
							<view v-if="editMode" class="g-delete" @tap="deletePhoto(i)">×</view>
						</view>
						<view v-if="editMode" class="g add" @tap="pickGallery">+</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		reactive,
		watch,
		nextTick
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		api
	} from '@/utils/api.js'
	import {
		uploadImage,
		compressImage
	} from '@/utils/upload.js'

	// 头像下载缓存，避免重复下载
	const avatarCache = new Map()

	// 照片缓存
	const photoCache = new Map()
	const photoUpdateTrigger = ref(0)

	const pet = ref({})

	// 规范化后端返回的疫苗数据为数组
	function normalizeVaccines(val) {
		if (Array.isArray(val)) {
			return val
		}
		if (typeof val === 'string') {
			try {
				const parsed = JSON.parse(val)
				if (Array.isArray(parsed)) {
					return parsed
				}
			} catch (e) {
				// 可能是逗号分隔的字符串
			}
			return val
				.split(',')
				.map(s => s.trim())
				.filter(Boolean)
		}
		return []
	}

	// 获取宠物头像的可显示 src（与 user.vue 保持一致）
	function getPetAvatarSrc(url) {
		if (!url) return '/static/logo.png'

		// 统一规范化：
		// 1) /uploads/ 相对路径 → 拼接静态域名
		// 2) 强制 http → https，去掉 :80
		let normalized = url
		if (normalized.startsWith('/uploads/')) {
			normalized = `https://pet-api.zbinli.cn${normalized}`
		}
		if (normalized.startsWith('http://pet-api.zbinli.cn')) {
			normalized = normalized.replace('http://pet-api.zbinli.cn', 'https://pet-api.zbinli.cn')
		}
		normalized = normalized.replace('://pet-api.zbinli.cn:80', '://pet-api.zbinli.cn')

		// 本地或静态路径直接返回
		if (normalized.startsWith('wxfile://') || normalized.startsWith('/static/')) {
			return normalized
		}

		// 命中缓存
		if (avatarCache.has(normalized)) {
			return avatarCache.get(normalized)
		}

		// 下载网络图片到本地临时文件
		uni.downloadFile({
			url: normalized,
			success: (res) => {
				if (res.statusCode === 200 && res.tempFilePath) {
					avatarCache.set(normalized, res.tempFilePath)
					pet.value = {
						...(pet.value || {})
					}
				} else {
					avatarCache.set(normalized, '/static/logo.png')
					pet.value = {
						...(pet.value || {})
					}
				}
			},
			fail: () => {
				avatarCache.set(normalized, '/static/logo.png')
				pet.value = {
					...(pet.value || {})
				}
			}
		})

		// 下载中返回占位
		return '/static/logo.png'
	}

	// 获取照片的可显示 src
	function getPhotoSrc(url) {
		if (!url) return '/static/index/add.png'

		// 统一规范化：
		// 1) /uploads/ 相对路径 → 拼接静态域名
		// 2) 强制 http → https，去掉 :80
		let normalized = url
		if (normalized.startsWith('/uploads/')) {
			normalized = `https://pet-api.zbinli.cn${normalized}`
		}
		if (normalized.startsWith('http://pet-api.zbinli.cn')) {
			normalized = normalized.replace('http://pet-api.zbinli.cn', 'https://pet-api.zbinli.cn')
		}
		normalized = normalized.replace('://pet-api.zbinli.cn:80', '://pet-api.zbinli.cn')

		// 本地或静态路径直接返回
		if (normalized.startsWith('wxfile://') || normalized.startsWith('/static/')) {
			return normalized
		}

		// 命中缓存
		if (photoCache.has(normalized)) {
			return photoCache.get(normalized)
		}

		// 下载网络图片到本地临时文件
		uni.downloadFile({
			url: normalized,
			success: (res) => {
				if (res.statusCode === 200 && res.tempFilePath) {
					photoCache.set(normalized, res.tempFilePath)
					photoUpdateTrigger.value++
				} else {
					console.warn('照片下载失败:', normalized, res.statusCode)
					photoCache.set(normalized, '/static/index/add.png')
					photoUpdateTrigger.value++
				}
			},
			fail: (err) => {
				console.error('照片下载失败:', normalized, err)
				photoCache.set(normalized, '/static/index/add.png')
				photoUpdateTrigger.value++
			}
		})

		return '/static/index/add.png'
	}

	onLoad(async (query) => {
				// 设置导航栏背景色与页面背景顶部颜色一致
				uni.setNavigationBarColor({
					frontColor: '#000000',
					backgroundColor: '#fff1a8'
				})

		if (query?.pet) {
			try {
				const data = JSON.parse(decodeURIComponent(query.pet))
				Object.assign(pet.value, data)
				// 同步显示用的疫苗与性格等字段
				vaccines.value = normalizeVaccines(data.vaccines)
				temperament.value = data.temperament || ''
					// 如果路由里带来的数据里疫苗为空，尝试再从后端拉一次最新数据
					if (!data.vaccines || (Array.isArray(data.vaccines) && data.vaccines.length === 0)) {
					try {
							const fresh = await api.getPet(pet.value.id)
						vaccines.value = normalizeVaccines(fresh && fresh.vaccines)
						temperament.value = (fresh && fresh.temperament) || temperament.value
					} catch (refreshErr) {
							// ignore
					}
				}
					nextTick(() => {})
				console.log('赋值后的pet.value:', pet.value);

					// 测试逻辑移除
			} catch (e) {
					// ignore
			}
		}
		// 拉取该宠物的媒体图片
		if (pet.value?.id) {
			try {
				const res = await api.getMedia({
					petId: pet.value.id
				})
				const mediaList = Array.isArray(res) ? res : (res.media || res.data || [])

				// 按照创建时间排序（最早到最晚）
				const sortedMediaList = mediaList.sort((a, b) => {
					const timeA = new Date(a.createdAt || a.created_at || 0).getTime()
					const timeB = new Date(b.createdAt || b.created_at || 0).getTime()
					return timeA - timeB // 升序：最早的在前面
				})

					gallery.value = sortedMediaList.map(m => m.url).filter(Boolean)
			} catch (err) {
					// ignore
			}
		}
	})

	const recent = ref([{
			id: 'r1',
			time: '今天 08:00',
			type: '喂食',
			desc: '猫粮 60g'
		},
		{
			id: 'r2',
			time: '昨天 21:10',
			type: '清洁',
			desc: '铲砂'
		}
	])

	const vaccines = ref([])
	const temperament = ref('')
	const gallery = ref([])

	// 编辑模式
	const editMode = ref(false)
	const genders = ref(['女生', '男生'])
	const genderIndex = ref(1)
	const vaccineOptions = ref([
		// 猫类常见疫苗
		'已接种猫三联疫苗',
		'已接种猫三联第二针/加强',
		'已接种猫白血病疫苗(FeLV)',
		'已接种狂犬疫苗',
		// 犬类常见疫苗
		'已接种犬五联疫苗',
		'已接种犬六联疫苗',
		'已接种犬七联疫苗',
		'已接种小犬细小疫苗',
		'已接种犬瘟热疫苗',
		'已接种博德特氏支气管炎疫苗',
		'已接种钩端螺旋体疫苗',
		// 其他
		'已接种其他疫苗'
	])
	const form = reactive({
		name: '',
		months: '',
		weight: '',
		gender: 'male',
		breed: '',
		color: '',
		neutered: false,
		birthday: '',
		startTogether: '',
		avatar: '',
		vaccines: [],
		temperament: '',
		gallery: []
	})
	const originalGallery = ref([]) // 保存编辑前的原始照片

	function startEdit() {
		editMode.value = true
		Object.assign(form, {
			...pet.value,
			vaccines: [...vaccines.value],
			temperament: temperament.value,
			avatarUrl: pet.value.avatarUrl,
			gallery: [...gallery.value]
		})
		originalGallery.value = [...gallery.value] // 保存原始照片
		genderIndex.value = form.gender === 'male' ? 1 : 0
	}

	function cancelEdit() {
		editMode.value = false
		gallery.value = [...originalGallery.value] // 恢复原始照片
	}
	async function saveEdit() {
		try {
			uni.showLoading({
				title: '保存中...'
			})

			// 准备更新数据
			const updateData = {
				name: form.name,
				months: form.months,
				weight: form.weight,
				gender: form.gender,
				breed: form.breed,
				color: form.color,
				neutered: form.neutered,
				birthday: form.birthday,
				startTogether: form.startTogether,
				temperament: form.temperament,
				vaccines: form.vaccines
			}

			// 如果有新头像，需要先上传
			if (form.avatar && form.avatar.startsWith('wxfile://')) {
				try {
					const {
						uploadImage,
						compressImage
					} = await import('@/utils/upload.js')
					const compressedPath = await compressImage(form.avatar, 0.8)
					const avatarUrl = await uploadImage(compressedPath, 'avatar')
					updateData.avatarUrl = avatarUrl
				} catch (error) {
					console.warn('头像上传失败:', error)
					uni.showToast({
						title: '头像上传失败，其他信息已保存',
						icon: 'none'
					})
				}
			} else if (form.avatarUrl) {
				updateData.avatarUrl = form.avatarUrl
			}

			// 更新宠物基本信息
			await api.updatePet(pet.value.id, updateData)

			// 处理照片更新
			console.log('🔍 检查照片更新...')
			console.log('form.gallery:', form.gallery)
			console.log('gallery.value:', gallery.value)

			if (form.gallery && form.gallery.length > 0) {
				// 检查是否有新添加的照片（本地路径）
				const newPhotos = form.gallery.filter(photo => photo.startsWith('wxfile://'))
				console.log('新照片数量:', newPhotos.length)
				console.log('新照片路径:', newPhotos)

				if (newPhotos.length > 0) {
					try {
						console.log('开始上传照片...')

						// 压缩并上传新照片
						const uploadPromises = newPhotos.map(async (photoPath) => {
							console.log('压缩照片:', photoPath)
							const compressedPath = await compressImage(photoPath, 0.7)
							console.log('压缩后路径:', compressedPath)
							const uploadedUrl = await uploadImage(compressedPath, 'gallery')
							console.log('上传成功，URL:', uploadedUrl)
							return uploadedUrl
						})

						const uploadedUrls = await Promise.all(uploadPromises)
						console.log('所有照片上传完成:', uploadedUrls)

						// 创建媒体记录
						console.log('创建媒体记录...')
						console.log('petId:', pet.value.id)
						console.log('urls:', uploadedUrls)

						const mediaResult = await api.createMedia({
							petId: pet.value.id,
							type: 'image',
							urls: uploadedUrls,
							description: '宠物照片'
						})

						console.log('媒体记录创建结果:', mediaResult)
						console.log('成功上传照片:', uploadedUrls.length, '张')

						// 重新从服务器获取排序后的照片列表
						try {
							const res = await api.getMedia({
								petId: pet.value.id
							})
							const mediaList = Array.isArray(res) ? res : (res.media || res.data || [])

							// 按照创建时间排序（最早到最晚）
							const sortedMediaList = mediaList.sort((a, b) => {
								const timeA = new Date(a.createdAt || a.created_at || 0).getTime()
								const timeB = new Date(b.createdAt || b.created_at || 0).getTime()
								return timeA - timeB // 升序：最早的在前面
							})

							gallery.value = sortedMediaList.map(m => m.url).filter(Boolean)
							console.log('保存后重新加载照片，按时间排序:', sortedMediaList.map(m => ({
								url: m.url,
								createdAt: m.createdAt || m.created_at
							})))
						} catch (err) {
							console.warn('重新加载照片失败，使用本地更新:', err)
							// 如果重新加载失败，使用本地更新
							const existingPhotos = form.gallery.filter(photo => !photo.startsWith('wxfile://'))
							gallery.value = [...existingPhotos, ...uploadedUrls]
						}

					} catch (error) {
						console.error('照片上传失败:', error)
						uni.showToast({
							title: '照片上传失败，其他信息已保存',
							icon: 'none'
						})
					}
				} else {
					console.log('没有新照片需要上传')
				}
			} else {
				console.log('没有照片需要处理')
			}

			// 更新本地数据
			pet.value = {
				...pet.value,
				...updateData
			}
			vaccines.value = [...form.vaccines]
			temperament.value = form.temperament
			gallery.value = [...form.gallery]
			editMode.value = false

			uni.hideLoading()
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})

		} catch (error) {
			uni.hideLoading()
			console.error('保存失败:', error)
			uni.showToast({
				title: '保存失败',
				icon: 'none'
			})
		}
	}

	function onGenderChange(e) {
		genderIndex.value = Number(e.detail.value || 0);
		form.gender = genderIndex.value === 1 ? 'male' : 'female'
	}

	function onVaccinesChange(e) {
		form.vaccines = e.detail.value || []
	}

	function pickAvatar() {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			success: res => {
				form.avatar = res.tempFilePaths[0]
			}
		})
	}

	function pickGallery() {
		uni.chooseImage({
			count: 9,
			sizeType: ['compressed'],
			success: res => {
				form.gallery = form.gallery.concat(res.tempFilePaths)
			}
		})
	}

	function deletePhoto(index) {
		if (editMode.value) {
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
	}

	function preview(index) {
		const list = editMode.value ? form.gallery : gallery.value
		if (!Array.isArray(list) || list.length === 0) return
		uni.previewImage({
			current: index,
			urls: list
		})
	}

	async function deletePet() {
		uni.showModal({
			title: '确认删除',
			content: `确定要删除宠物"${pet.value.name}"吗？此操作不可恢复！`,
			confirmText: '删除',
			cancelText: '取消',
			confirmColor: '#ff4757',
			success: async (res) => {
				if (!res.confirm) return
				try {
					await api.deletePet(pet.value.id)
					uni.showToast({
						title: '宠物已删除',
						icon: 'success'
					})
					// 通知其他页面刷新
					uni.$emit && uni.$emit('pets:changed')
					setTimeout(() => {
						uni.navigateBack()
					}, 600)
				} catch (e) {
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				}
			}
		})
	}

	const togetherDays = computed(() => {
		const start = new Date(pet.value.startTogether).getTime()
		const today = new Date().setHours(0, 0, 0, 0)
		return Math.max(1, Math.floor((today - start) / 86400000) + 1)
	})

	function goEdit() {
		uni.navigateTo({
			url: '/pages/editPet/editPet'
		})
	}

	function goAlbum() {
		uni.navigateTo({
			url: '/pages/album/album'
		})
	}

	// 图片加载事件
	function onAvatarLoad(e) {}

	function onAvatarError(e) {
		try {
			e && e.target && (e.target.src = '/static/logo.png')
		} catch {}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		padding: 24rpx;
		padding-top: calc(110rpx + env(safe-area-inset-top));
		padding-top: calc(110rpx + constant(safe-area-inset-top));
		min-height: 100vh;
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
		top: 20rpx;
		bottom: 0;
		/* 跟随主卡片内容高度变化 */
		height: 90%;
		/* 动态高度由 top/bottom 约束 */
		width: 630rpx;
		/* 略小于主体宽度 600rpx，形成叠纸边缘 */
		left: 50%;
		right: auto;
		transform: translateX(-50%) rotate(-2.5deg);
	}

	.sheet-body {
		width: 600rpx;
		margin: 0 auto 40rpx;
		/* 底部留白，真机可见 */
		position: relative;
		background: #fff;
		border: 4rpx solid #2c2c2c;
		border-radius: 32rpx;
		padding: 32rpx 28rpx 120rpx 28rpx;
		z-index: 1;
	}

	.header {
		margin-top: 15rpx;
		display: flex;
		gap: 24rpx;
	}

	.avatar-wrap {
		width: 272rpx;
		height: 334rpx;
		border: 4rpx solid #2c2c2c;
		border-radius: 16rpx;
		background: #f5f5f5;
		overflow: hidden;
	}

	.avatar {
		width: 272rpx;
		height: 334rpx;
		border-radius: 16rpx;
		background: #f5f5f5;
	}

	.kv {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		justify-content: center;
		margin-left: 8rpx;
	}

	.kv-row {
		display: grid;
		grid-template-columns: 160rpx 1fr;
		align-items: center;
		column-gap: 12rpx;
	}

	.k {
		font-weight: 700;
		font-size: 30rpx;
	}

	.v {
		font-size: 30rpx;
	}

	.big {
		font-size: 30rpx;
	}

	.input {
		background: #fff;
		border: 4rpx solid #2c2c2c;
		border-radius: 12rpx;
		padding: 10rpx 14rpx;
	}

	.picker {
		background: #fff;
		border: 4rpx solid #2c2c2c;
		border-radius: 12rpx;
		padding: 10rpx 14rpx;
	}

	.textarea {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		min-height: 120rpx;
		border: 4rpx solid #2c2c2c;
		border-radius: 12rpx;
		padding: 12rpx 16rpx;
		background: #fff;
	}

	.edit-row {
		position: absolute;
		left: 28rpx;
		right: 28rpx;
		bottom: 28rpx;
		display: flex;
		justify-content: center;
		z-index: 2;
	}

	.edit-actions {
		display: flex;
		gap: 28rpx;
	}

	.btn {
		background: #ffe046;
		color: #1a1a1a;
		border: 4rpx solid #2c2c2c;
		border-radius: 999rpx;
		height: 72rpx;
		line-height: 72rpx;
		padding: 0 24rpx;
		font-weight: 700;
	}

	.btn.ghost {
		background: #fff;
	}

	.btn.with-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 0 28rpx;
	}

	.btn-icon {
		width: 38rpx;
		height: 38rpx;
	}

	.btn.delete-btn {
		background: #fff;
		color: #ff4757;
		border: 4rpx solid #ff4757;
		border-radius: 999rpx;
		height: 72rpx;
		line-height: 72rpx;
		padding: 0 24rpx;
		font-weight: 700;
	}

	.divider-h {
		height: 2rpx;
		background: #e9e9e9;
		margin: 28rpx 0;
	}

	.row {
		display: flex;
		align-items: center;
	}

	.row.stack {
		flex-direction: column;
		align-items: flex-start;
	}

	/* 使用三列网格：图标 / 固定宽度标题 / 值区域 */
	.icon-row {
		display: grid;
		grid-template-columns: 44rpx var(--label-w, 200rpx) 1fr;
		column-gap: 12rpx;
		align-items: start;
	}

	.title {
		display: contents;
	}

	.icon-row .title {
		display: contents;
	}

	.icon-row .bullet {
		width: 44rpx;
		height: 44rpx;
		margin-right: 12rpx;
	}

	.photos-title .bullet {
		width: 44rpx;
		height: 44rpx;
	}

	.vaccines {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.vaccines .ck {
		display: inline-flex;
		align-items: center;
		gap: 8rpx;
		margin-right: 16rpx;
		margin-bottom: 8rpx;
		font-size: 26rpx;
	}

	.v-item {
		font-size: 30rpx;
	}

	.photos {
		height: 434rpx;
		margin-top: 12rpx;
		border: 4rpx solid #2c2c2c;
		border-radius: 16rpx;
		padding: 18rpx 34rpx;
		background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
		overflow: hidden;
	}

	.photos-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 12rpx;
	}

	.gallery {
		padding-left: 0;
		display: grid;
		grid-template-columns: repeat(3, 176rpx);
		column-gap: 8rpx;
		row-gap: 8rpx;
		margin-top: 0;
		justify-content: start;
		justify-items: start;
		max-height: calc(2 * 176rpx + 1 * 8rpx);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.g-wrapper {
		position: relative;
		width: 176rpx;
		height: 176rpx;
	}

	.g {
		width: 176rpx;
		height: 176rpx;
		border-radius: 12rpx;
		background: transparent;
		border: 4rpx solid #2c2c2c;
		box-sizing: border-box;
	}

	.g.add {
		background: #fff;
		color: #888;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 64rpx;
		border: 4rpx solid #2c2c2c;
		border-radius: 12rpx;
	}

	.g-delete {
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
</style>