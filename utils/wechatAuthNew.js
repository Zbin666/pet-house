// 微信授权登录 - 新的实现方式
import { api } from './api.js'

/**
 * 微信登录 - 第一步：获取用户授权信息
 * 这个函数必须在用户直接点击事件中调用
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

    // 第一步：获取用户授权信息（会弹出微信授权页面）
    uni.getUserProfile({
      desc: '用于完善用户资料',
      success: async (userRes) => {
        try {
          console.log('获取用户授权信息成功:', userRes)
          
          // 第二步：获取微信登录凭证
          uni.login({
            provider: 'weixin',
            success: async (loginRes) => {
              try {
                console.log('微信登录凭证获取成功:', loginRes)
                
                // 第三步：调用后端登录接口
                const result = await api.login({
                  code: loginRes.code,
                  nickname: userRes.userInfo.nickName,
                  avatarUrl: userRes.userInfo.avatarUrl
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
        } catch (error) {
          console.error('处理用户信息失败:', error)
          reject(error)
        }
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
