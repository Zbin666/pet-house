// 用户认证相关工具函数
import { api } from './api.js'

// 检查登录状态
export const checkLogin = () => {
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  
  return {
    isLoggedIn: !!token,
    token,
    userInfo
  }
}

// 解析 JWT 并校验是否过期（客户端快速判断）
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 3) return false
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(parts[1]))))
    if (!payload || !payload.exp) return false
    const nowSec = Math.floor(Date.now() / 1000)
    // 预留 60 秒容错
    return payload.exp > (nowSec + 60)
  } catch (_e) {
    return false
  }
}

// 微信登录 - 弹出微信账号选择页面
export const loginWithWeChat = () => {
  return new Promise((resolve, reject) => {
    // 检查是否已同意协议
    const agreed = uni.getStorageSync('agreed')
    if (!agreed) {
      uni.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return reject(new Error('请先同意用户协议'))
    }
    
    // 使用微信授权登录，会弹出微信账号选择页面
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        try {
          console.log('微信登录成功:', loginRes)
          
          // 获取用户信息 - 这里会弹出微信授权页面
          const userInfoRes = await getUserProfile()
          
          // 调用后端登录接口
          const result = await api.login({
            code: loginRes.code,
            nickname: userInfoRes.nickName,
            avatarUrl: userInfoRes.avatarUrl
          })
          
          // 保存登录信息
          uni.setStorageSync('token', result.token)
          uni.setStorageSync('userInfo', result.user)
          
          resolve(result)
        } catch (error) {
          console.error('微信登录失败:', error)
          reject(error)
        }
      },
      fail: (error) => {
        console.error('微信登录失败:', error)
        reject(error)
      }
    })
  })
}

// 手机号登录
// 手机号登录（通用：非微信端或无法使用 getPhoneNumber 时，使用模拟登录）
export const loginWithPhone = () => {
  return new Promise(async (resolve, reject) => {
    const agreed = uni.getStorageSync('agreed')
    if (!agreed) {
      uni.showToast({ title: '请先同意用户协议', icon: 'none' })
      return reject(new Error('请先同意用户协议'))
    }

    try {
      // 开发期模拟：实际项目应通过 getPhoneNumber 事件或短信验证码完成
      const result = await api.login({
        code: `phone_${Date.now()}`,
        nickname: '手机用户',
        avatarUrl: ''
      })
      uni.setStorageSync('token', result.token)
      uni.setStorageSync('userInfo', result.user)
      resolve(result)
    } catch (error) {
      console.error('手机号登录失败:', error)
      reject(error)
    }
  })
}

// 微信小程序：通过按钮 open-type="getPhoneNumber" 触发的事件进行登录
export const loginWithPhoneByEvent = (evt) => {
  return new Promise(async (resolve, reject) => {
    const agreed = uni.getStorageSync('agreed')
    if (!agreed) {
      uni.showToast({ title: '请先同意用户协议', icon: 'none' })
      return reject(new Error('请先同意用户协议'))
    }

    try {
      const detail = evt?.detail || {}
      if (detail.errMsg && !detail.errMsg.includes('ok')) {
        return reject(new Error('用户未授权获取手机号'))
      }
      // 开发阶段：不做解密与绑定，直接走模拟后端登录
      const result = await api.login({
        code: `phone_${Date.now()}`,
        nickname: '手机用户',
        avatarUrl: ''
      })
      uni.setStorageSync('token', result.token)
      uni.setStorageSync('userInfo', result.user)
      resolve(result)
    } catch (error) {
      console.error('手机号登录失败:', error)
      reject(error)
    }
  })
}

// 获取用户信息 - 会弹出微信授权页面
export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        console.log('获取用户信息成功:', res)
        resolve(res.userInfo)
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error)
        reject(error)
      }
    })
  })
}

// 获取用户信息 - 旧版本API（兼容性）
export const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    uni.getUserInfo({
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

// 退出登录
export const logout = () => {
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  uni.removeStorageSync('agreed')
  
  // 跳转到登录页
  uni.reLaunch({
    url: '/pages/login/login'
  })
}

// 更新用户信息
export const updateUserInfo = async (userInfo) => {
  try {
    const result = await api.updateProfile(userInfo)
    
    // 更新本地存储
    const currentUserInfo = uni.getStorageSync('userInfo')
    uni.setStorageSync('userInfo', { ...currentUserInfo, ...result })
    
    return result
  } catch (error) {
    console.error('更新用户信息失败:', error)
    throw error
  }
}

// 获取用户设置
export const getUserSettings = async () => {
  try {
    return await api.getSettings()
  } catch (error) {
    console.error('获取用户设置失败:', error)
    throw error
  }
}

// 更新用户设置
export const updateUserSettings = async (settings) => {
  try {
    return await api.updateSettings(settings)
  } catch (error) {
    console.error('更新用户设置失败:', error)
    throw error
  }
}
