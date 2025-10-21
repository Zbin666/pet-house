<template>
	<view class="page">
		<!-- 叠纸卡片背景 -->
		<view class="sheet">
			<view class="sheet-bg bg1"></view>
			<view class="sheet-body">
				<!-- 用户头像和基本信息 -->
				<view class="header">
					<view class="avatar-wrap" @tap="pickAvatar">
						<image class="avatar" :src="getUserAvatarSrc(userInfo.avatar)" mode="aspectFill" @error="onAvatarError" @load="onAvatarLoad" />
						<view class="avatar-edit">编辑</view>
					</view>
					<view class="user-info">
						<text class="username">{{ userInfo.name }}</text>
						<text class="user-desc">{{ userInfo.desc }}</text>
					</view>
				</view>

				<!-- 编辑按钮 -->
				<view class="edit-row">
					<button v-if="!editMode" class="btn ghost with-icon" @tap="startEdit">
						<image class="btn-icon" src="/static/tarBar/index-active.png" mode="widthFix" />
						<text>编辑资料</text>
					</button>
					<view v-else class="edit-actions">
						<button class="btn ghost" @tap="cancelEdit">取消</button>
						<button class="btn" @tap="saveEdit">保存</button>
					</view>
				</view>

				<view class="divider-h"></view>

				<!-- 用户信息表单 -->
				<view class="form-section">
					<view class="form-row">
						<text class="label">昵称：</text>
						<template v-if="!editMode">
							<text class="value">{{ userInfo.name }}</text>
						</template>
						<input v-else class="input" v-model="form.name" placeholder="请输入昵称" />
					</view>

					<view class="form-row">
						<text class="label">个人简介：</text>
						<template v-if="!editMode">
							<text class="value">{{ userInfo.desc || '暂无简介' }}</text>
						</template>
						<textarea v-else class="textarea" v-model="form.desc" placeholder="介绍一下自己吧～" />
					</view>

					<view class="form-row">
						<text class="label">手机号：</text>
						<template v-if="!editMode">
							<text class="value">{{ userInfo.phone || '未绑定' }}</text>
						</template>
						<input v-else class="input" v-model="form.phone" placeholder="请输入手机号" />
					</view>

					<view class="form-row">
						<text class="label">邮箱：</text>
						<template v-if="!editMode">
							<text class="value">{{ userInfo.email || '未绑定' }}</text>
						</template>
						<input v-else class="input" v-model="form.email" placeholder="请输入邮箱" />
					</view>

					<view class="form-row">
						<text class="label">注册时间：</text>
						<text class="value">{{ userInfo.registerTime }}</text>
					</view>
				</view>

				<view class="divider-h"></view>

				<!-- 其他设置 -->
				<view class="settings-section">
					<view class="setting-item">
						<text class="setting-label">消息通知</text>
						<switch :checked="settings.notifications" @change="e => settings.notifications = e.detail.value" />
					</view>
					<view class="setting-item">
						<text class="setting-label">隐私模式</text>
						<switch :checked="settings.privacy" @change="e => settings.privacy = e.detail.value" />
					</view>
					<view class="setting-item" @tap="clearCache">
						<text class="setting-label">清除缓存</text>
						<text class="setting-value">{{ cacheSize }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/utils/api.js'
import { pickAndUploadAvatar } from '@/utils/upload.js'

// 头像下载缓存，避免重复下载
const avatarCache = new Map()

defineOptions({ name: 'SettingsIndex' })

// 用户信息（由后端填充）
const userInfo = ref({
    id: '',
    name: '',
    desc: '', // 映射到用户设置中的 bio
    phone: '',
    email: '',
    avatar: '/static/user/user.png',
    registerTime: ''
})

// 编辑模式
const editMode = ref(false)
const form = reactive({
	name: '',
	desc: '',
	phone: '',
	email: '',
	avatar: ''
})

// 设置项
const settings = reactive({
	notifications: true,
	privacy: false
})

const cacheSize = ref('—')

// 获取用户头像的可显示 src（与 user.vue 保持一致）
function getUserAvatarSrc(url) {
    if (!url) return '/static/user/user.png'

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
                userInfo.value = { ...(userInfo.value || {}) }
            } else {
                avatarCache.set(normalized, '/static/user/user.png')
                userInfo.value = { ...(userInfo.value || {}) }
            }
        },
        fail: () => {
            avatarCache.set(normalized, '/static/user/user.png')
            userInfo.value = { ...(userInfo.value || {}) }
        }
    })

    // 下载中返回占位
    return '/static/user/user.png'
}

function onAvatarError(e) {
    try {
        e && e.target && (e.target.src = '/static/user/user.png')
    } catch {}
}

function onAvatarLoad(_) {
    // 可按需添加埋点/日志
}

onLoad(() => {
	uni.setNavigationBarTitle({ title: '个人设置' })
	uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
	// 估算缓存体积（简化示例）
	try {
		const keys = uni.getStorageInfoSync().keys || []
		cacheSize.value = `${keys.length} 项`
	} catch (e) { cacheSize.value = '—' }
    // 加载用户资料与设置
    loadProfileAndSettings()
})

// 编辑功能
function startEdit() {
	editMode.value = true
	Object.assign(form, {
		name: userInfo.value.name,
		desc: userInfo.value.desc,
		phone: userInfo.value.phone,
		email: userInfo.value.email,
		avatar: userInfo.value.avatar
	})
}

function cancelEdit() {
	editMode.value = false
}

async function saveEdit() {
    try {
        // 更新用户基本资料（昵称/邮箱/手机/头像/简介bio）
        const profilePayload = {
            nickname: form.name,
            email: form.email,
            phone: form.phone,
            bio: form.desc,
            avatarUrl: form.avatar && form.avatar.startsWith('http') ? form.avatar : undefined
        }
        // 过滤空值，避免覆盖
        Object.keys(profilePayload).forEach((k) => profilePayload[k] === undefined && delete profilePayload[k])

        await api.updateProfile(profilePayload)

        // 本地同步
        userInfo.value = {
            ...userInfo.value,
            name: form.name,
            desc: form.desc,
            phone: form.phone,
            email: form.email,
            avatar: form.avatar || userInfo.value.avatar
        }
        editMode.value = false
        uni.showToast({ title: '保存成功', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
    }
}

async function pickAvatar() {
    try {
        // 选择并上传头像，返回完整可访问的URL（HTTPS/白名单域名）
        const url = await pickAndUploadAvatar()
        
        // 立即保存到后端用户资料
        await api.updateProfile({ avatarUrl: url })
        
        // 同步到本地UI
        if (editMode.value) {
            form.avatar = url
        }
        userInfo.value.avatar = url
        userInfo.value.avatarUrl = url
        
        uni.showToast({ title: '头像已更新', icon: 'success' })
    } catch (e) {
        uni.showToast({ title: '头像更新失败', icon: 'none' })
    }
}

function clearCache() {
	uni.showModal({
		title: '确认清除',
		content: '确定要清除所有缓存吗？',
		success: (res) => {
			if (res.confirm) {
				try {
					uni.clearStorageSync()
					cacheSize.value = '0 项'
					uni.showToast({ title: '已清除', icon: 'success' })
				} catch (e) {}
			}
		}
	})
}

// 工具与数据加载
function formatRegisterTime(iso) {
    if (!iso) return ''
    try {
        const d = new Date(iso)
        const y = d.getFullYear()
        const m = `${d.getMonth() + 1}`.padStart(2, '0')
        const day = `${d.getDate()}`.padStart(2, '0')
        return `${y}-${m}-${day}`
    } catch (_) { return '' }
}

async function loadProfileAndSettings() {
    try {
        const [profile, userSettings] = await Promise.all([
            api.getProfile(),
            api.getSettings().catch(() => ({}))
        ])

        userInfo.value = {
            id: profile?.id || '',
            name: profile?.nickname || '新用户',
            desc: profile?.bio || '',
            phone: profile?.phone || '',
            email: profile?.email || '',
            avatar: profile?.avatarUrl || '/static/user/user.png',
            registerTime: formatRegisterTime(profile?.createdAt)
        }
    } catch (e) {
        // 降级为默认占位
        userInfo.value = {
            id: '',
            name: '新用户',
            desc: '',
            phone: '',
            email: '',
            avatar: '/static/user/user.png',
            registerTime: ''
        }
    }
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    padding: 24rpx 40rpx; /* 增大左右留白 */
    padding-top: calc(110rpx + env(safe-area-inset-top)); /* 与宠物详情一致的顶部距离 */
    padding-top: calc(110rpx + constant(safe-area-inset-top));
    background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
}

.sheet {
    position: relative;
    padding-top: 30rpx; /* 下移卡片 */
    padding-bottom: 45rpx; /* 底部留白 */
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
    width: 658rpx; /* 略小于主体宽度 600rpx，形成叠纸边缘 */
    left: 50%;
    right: auto;
    transform: translateX(-50%) rotate(-3deg);
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

.header {
	margin-top: 15rpx;
	display: flex;
	gap: 24rpx;
	align-items: center;
}

.avatar-wrap {
	position: relative;
	width: 100rpx;
	height: 100rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	background: #f5f5f5;
	overflow: hidden;
}

.avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 16rpx;
	background: #f5f5f5;
}

.avatar-edit {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(0, 0, 0, 0.6);
	color: #fff;
	text-align: center;
	font-size: 24rpx;
	padding: 8rpx;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.username {
	font-size: 36rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.user-desc {
	font-size: 28rpx;
	color: #666;
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

.divider-h {
	height: 2rpx;
	background: #e9e9e9;
	margin: 28rpx 0;
}

.form-section {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.form-row {
	display: grid;
	grid-template-columns: 160rpx 1fr;
	align-items: center;
	column-gap: 12rpx;
}

.label {
	font-weight: 700;
	font-size: 30rpx;
	color: #2c2c2c;
}

.value {
	font-size: 30rpx;
	color: #666;
}

.input {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	padding: 10rpx 14rpx;
	font-size: 30rpx;
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
	font-size: 30rpx;
}

.settings-section {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
}

.setting-label {
	font-size: 30rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.setting-value {
	font-size: 28rpx;
	color: #666;
}
</style>
