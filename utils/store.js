// 全局状态管理
import { checkLogin, logout } from './auth.js'

// 全局状态
const state = {
  userInfo: null,
  isLoggedIn: false,
  token: null
}

// 获取状态
export const getState = () => {
  return { ...state }
}

// 初始化状态
export const initState = () => {
  const { isLoggedIn, token, userInfo } = checkLogin()
  
  state.isLoggedIn = isLoggedIn
  state.token = token
  state.userInfo = userInfo
  
  return getState()
}

// 设置用户信息
export const setUserInfo = (userInfo) => {
  state.userInfo = userInfo
  state.isLoggedIn = true
}

// 设置token
export const setToken = (token) => {
  state.token = token
  state.isLoggedIn = true
}

// 清除状态
export const clearState = () => {
  state.userInfo = null
  state.isLoggedIn = false
  state.token = null
}

// 退出登录
export const handleLogout = () => {
  clearState()
  logout()
}

// 检查登录状态
export const checkAuth = () => {
  const { isLoggedIn } = checkLogin()
  
  if (!isLoggedIn) {
    uni.showModal({
      title: '提示',
      content: '请先登录',
      showCancel: false,
      success: () => {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    })
    return false
  }
  
  return true
}

// 路由守卫
export const routeGuard = (to, from, next) => {
  // 需要登录的页面
  const authPages = [
    '/pages/index/index',
    '/pages/user/user',
    '/pages/record/record',
    '/pages/community/community',
    '/pages/settings/setting'
  ]
  
  if (authPages.includes(to.url)) {
    if (!checkAuth()) {
      return
    }
  }
  
  next()
}
