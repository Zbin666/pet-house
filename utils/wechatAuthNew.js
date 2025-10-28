// 微信授权登录 - 新的实现方式
import { api } from './api.js'

/**
 * 微信登录 - 2024新版（使用静默登录）
 * 注意：getUserProfile已废弃，直接使用静默登录
 * 用户信息可通过插件或后续设置获取
 */
export const wechatLogin = () => {
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

    // 直接使用静默登录（不再使用getUserProfile）
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        try {
          console.log('微信登录凭证获取成功:', loginRes)
          
          // 调用后端登录接口
          const result = await api.login({
            code: loginRes.code,
            nickname: '微信用户',  // 默认昵称，用户可在设置中修改
            avatarUrl: ''           // 默认头像，用户可在设置中上传
          })
          
          // 保存登录信息
          uni.setStorageSync('token', result.token)
          uni.setStorageSync('userInfo', result.user)
          
          console.log('微信登录成功:', result)
          resolve(result)
        } catch (error) {
          console.error('后端登录失败:', error)
          reject(error)
        }
      },
      fail: (error) => {
        console.error('获取微信登录凭证失败:', error)
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
