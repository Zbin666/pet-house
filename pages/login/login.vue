<template>
    <view class="login-page">
        
		<!-- 安全注册插件 -->
		<!-- #ifdef MP-WEIXIN -->
		<!-- 注意：login 组件必须有 class="login-modal"，使用 v-show 而不是 v-if -->
		<login class="login-modal" :modal="modal" @success="loginSuccess" @fail="loginFail" @cancel="loginCancel" v-show="login_show"></login>
		<!-- #endif -->
        
		<!-- Logo -->
		<image class="logo" src="/static/login/logo.png" mode="widthFix" />

		<!-- Title -->
		<view class="title">欢迎来到萌宠小筑</view>

		<!-- Buttons -->
		<view class="btn-group">
			<button class="btn wx" :disabled="loading" @tap="handleWeChatLogin">
				<image class="icon-img" src="/static/login/WeChat.png" mode="widthFix" />
				<text>{{ loading ? '登录中...' : '微信登录' }}</text>
			</button>
		</view>

		<!-- Agreement -->
		<view class="agreement" @tap="toggleAgree">
			<view class="checkbox" :class="{ checked: agreed }"></view>
			<text>我已阅读并同意宠物屋</text>
			<text class="link" @tap.stop="openAgreement">《用户协议》</text>
			<text> 和 </text>
			<text class="link" @tap.stop="openPrivacy">《隐私政策》</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { wechatLogin } from '@/utils/wechatAuthNew.js'
import { checkLogin, isTokenValid } from '@/utils/auth.js'
import { api } from '@/utils/api.js'

const agreed = ref(false)
const loading = ref(false)
// 移除调试UI相关状态

// 安全注册插件相关
const modal = ref({
  title: '完善用户信息',
  content: '授权登录后，开始使用完整功能'
})
const login_show = ref(false)

// 初始化页面
onMounted(async () => {
  // 检查是否已同意协议
  const savedAgreed = uni.getStorageSync('agreed')
  agreed.value = savedAgreed || false

  // 若本地已有 token，尝试校验；通过则跳首页
  try {
    const local = checkLogin()
    if (local.token) {
      if (!isTokenValid(local.token)) {
        // 继续服务端校验
      }
      await api.getProfile()
      uni.switchTab({ url: '/pages/index/index' })
    }
  } catch (_e) {
    // 无效或过期，留在登录页
  }
})

function toggleAgree() { 
  agreed.value = !agreed.value
  // 保存协议同意状态
  uni.setStorageSync('agreed', agreed.value)
}

async function handleWeChatLogin() {
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none'
    })
    return
  }
  
  // #ifdef MP-WEIXIN
  // 检查用户是否已有完整的用户信息（优先使用 basicUserInfo）
  const basicUserInfo = uni.getStorageSync('basicUserInfo')
  const existingUserInfo = uni.getStorageSync('userInfo')
  
  // 优先使用 basicUserInfo，如果没有则使用 userInfo
  const userInfoToCheck = basicUserInfo || existingUserInfo
  const hasCompleteInfo = userInfoToCheck && userInfoToCheck.nickname && userInfoToCheck.avatarUrl
  
  if (hasCompleteInfo) {
    // 直接使用现有信息进行静默登录
    loading.value = true
    try {
      const result = await api.login({
        code: `silent_login_${Date.now()}`,
        nickname: userInfoToCheck.nickname,
        avatarUrl: userInfoToCheck.avatarUrl
      })
      
      if (result.token) {
        uni.setStorageSync('token', result.token)
        uni.setStorageSync('userInfo', result.user)
        // 清除 basicUserInfo，因为已经重新保存了完整的 userInfo
        uni.removeStorageSync('basicUserInfo')
      }
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' })
      }, 1500)
    } catch (error) {
      // 静默登录失败，显示插件让用户重新选择
      login_show.value = true
      
      uni.showToast({
        title: '登录失败，请重新选择',
        icon: 'none'
      })
    } finally {
      loading.value = false
    }
  } else {
    // 用户信息不完整，显示安全注册插件
    login_show.value = true
  }
  // #endif
  
  // #ifndef MP-WEIXIN
  // 非微信环境，暂不支持登录
  uni.showToast({ title: '请在微信小程序中登录', icon: 'none' })
  // #endif
}

// 安全注册插件成功回调
async function loginSuccess(e) {
  login_show.value = false
  loading.value = true
  
  try {
    // 插件只返回头像和昵称，需要调用后端登录接口获取 token
    let nickname = ''
    let avatarUrl = ''
    
    if (e.target && e.target.res) {
      nickname = e.target.res.nickName || ''
      avatarUrl = e.target.res.avatarUrl || ''
    }
    
    // 调用后端登录接口
    const result = await api.login({
      code: `plugin_login_${Date.now()}`, // 插件登录用特殊的 code
      nickname: nickname,
      avatarUrl: avatarUrl
    })
    
    // 保存用户信息
    if (result.token) {
      uni.setStorageSync('token', result.token)
    }
    
    if (result.user) {
      uni.setStorageSync('userInfo', result.user)
      // 清除 basicUserInfo，因为已经重新保存了完整的 userInfo
      uni.removeStorageSync('basicUserInfo')
    }
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error) {
    uni.showToast({
      title: '登录失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 安全注册插件失败回调
function loginFail(e) {
  login_show.value = false
  
  uni.showToast({
    title: '登录失败',
    icon: 'error'
  })
}

// 安全注册插件取消回调
function loginCancel(e) {
  login_show.value = false
}

function openAgreement() { 
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议的内容...',
    showCancel: false
  })
}

function openPrivacy() { 
  uni.showModal({
    title: '隐私政策',
    content: '这里是隐私政策的内容...',
    showCancel: false
  })
}
</script>

<style scoped>
    .login-page {
		height: 100vh;
		padding: 96rpx 48rpx 48rpx;
		box-sizing: border-box;
        background: url('/static/login/login-bg.png') center/cover no-repeat fixed,
                    linear-gradient(180deg, #ffe082 0%, #fff6cc 28%, #fff9e6 60%, #fffcee 100%);
		position: relative;
	}


    .logo {
        width: 308rpx;
        display: block;
        margin: 200rpx auto 24rpx; /* 往下移动 */
    }

    .title {
        text-align: center;
        color: #1a1a1a; /* 调深标题颜色 */
        font-size: 40rpx;
		font-weight: 550;
        margin-bottom: 80rpx;
    }

    .btn-group {
        display: flex;
        flex-direction: column;
        gap: 28rpx;
        align-items: center;
        margin: 0 16rpx;
    }

    .btn {
		border-radius: 999rpx;
		line-height: 96rpx;
		height: 96rpx;
        font-size: 34rpx;
		text-align: center;
        border: 4rpx solid #2c2c2c; /* 深色描边 */
		background-color: #ffd54f;
        color: #0e0e0e; /* 进一步加深按钮文字 */
        width: 620rpx; /* 增加并统一按钮长度 */
        box-shadow: 0 2rpx 0 rgba(0,0,0,0.06);
	}

    /* 确保小程序端文字颜色不被默认样式覆盖 */
    .btn text { color: #0e0e0e; }

	.btn.wx {
		background-color: #ffd54f;
	}

	.btn:disabled {
		opacity: 0.6;
	}

	.icon {
		margin-right: 8rpx;
	}

    .icon-img {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
        vertical-align: middle;
    }

	.agreement {
		margin-top: 36rpx;
		font-size: 22rpx;
		color: #888;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 4rpx;
	}

	.checkbox {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		border: 2rpx solid #bbb;
		margin-right: 12rpx;
		position: relative;
	}

	.checkbox.checked {
		background-color: #ffd54f;
		border-color: #f1c40f;
	}

	/* 勾选可视化 */
	.checkbox::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: 12rpx;
		height: 20rpx;
		border-right: 4rpx solid #f8f7f7;
		border-bottom: 4rpx solid #f8f7f7;
		transform: translate(-50%, -60%) rotate(45deg);
		display: none;
	}

	.checkbox.checked::after {
		display: block;
	}

	.link {
		color: #f1a400;
	}

	/* 测试相关样式 */
	/* 安全注册插件样式 */
	.login-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
	}
</style>


