// 微信登录工具 - 解决 getUserProfile 调用限制
import { api } from './api.js'

// 存储登录状态
let loginCallback = null
let loginCode = null

/**
 * 微信登录 - 第一步：获取登录凭证
 * 这个函数必须在用户直接点击事件中调用
 */
export const startWechatLogin = () => {
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

    // 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        console.log('微信登录凭证获取成功:', loginRes)
        loginCode = loginRes.code
        
        // 立即获取用户授权信息
        getUserProfile()
          .then((userInfo) => {
            console.log('获取用户授权信息成功:', userInfo)
            
            // 调用后端登录接口
            api.login({
              code: loginRes.code,
              nickname: userInfo.nickName,
              avatarUrl: userInfo.avatarUrl
            })
            .then((result) => {
              // 保存登录信息
              uni.setStorageSync('token', result.token)
              uni.setStorageSync('userInfo', result.user)
              
              console.log('微信登录成功:', result)
              resolve(result)
            })
            .catch((error) => {
              console.error('后端登录失败:', error)
              reject(error)
            })
          })
          .catch((error) => {
            console.error('获取用户授权信息失败:', error)
            reject(error)
          })
      },
      fail: (error) => {
        console.error('获取微信登录凭证失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * 获取用户授权信息 - 会弹出微信授权页面
 * 这个函数必须在用户直接点击事件中调用
 */
export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        console.log('获取用户授权信息成功:', res)
        resolve(res.userInfo)
      },
      fail: (error) => {
        console.error('获取用户授权信息失败:', error)
        // 如果用户拒绝授权，给出友好提示
        if (error.errMsg && error.errMsg.includes('deny')) {
          uni.showToast({
            title: '需要授权才能登录',
            icon: 'none'
          })
        }
        reject(error)
      }
    })
  })
}

/**
 * 微信静默登录 - 不弹出授权页面
 * 适用于已经授权过的用户
 */
export const wechatSilentLogin = () => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        try {
          console.log('微信静默登录成功:', loginRes)
          
          // 调用后端登录接口
          const result = await api.login({
            code: loginRes.code,
            nickname: '微信用户',
            avatarUrl: ''
          })
          
          // 保存登录信息
          uni.setStorageSync('token', result.token)
          uni.setStorageSync('userInfo', result.user)
          
          resolve(result)
        } catch (error) {
          console.error('微信静默登录失败:', error)
          reject(error)
        }
      },
      fail: (error) => {
        console.error('微信静默登录失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * 检查微信登录状态
 */
export const checkWechatLoginStatus = () => {
  return new Promise((resolve, reject) => {
    uni.checkSession({
      success: () => {
        console.log('微信登录状态有效')
        resolve(true)
      },
      fail: () => {
        console.log('微信登录状态已失效')
        resolve(false)
      }
    })
  })
}

/**
 * 微信登录状态失效处理
 */
export const handleWechatSessionExpired = () => {
  uni.showModal({
    title: '登录状态已失效',
    content: '请重新登录',
    showCancel: false,
    success: () => {
      // 清除本地存储
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/login'
      })
    }
  })
}
