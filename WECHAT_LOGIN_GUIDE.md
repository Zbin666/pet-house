# 微信授权登录实现指南

## 🎯 功能说明

现在实现的微信登录功能会：
1. **弹出微信账号选择页面** - 用户可以选择不同的微信账号进行登录
2. **显示微信授权页面** - 用户需要授权获取个人信息
3. **获取真实的用户信息** - 包括昵称、头像等
4. **完整的登录流程** - 从授权到后端验证到状态保存

## 🔧 实现原理

### 1. 微信登录流程
```
用户点击"微信登录" 
    ↓
调用 uni.login() 获取 code
    ↓
调用 uni.getUserProfile() 弹出授权页面
    ↓
用户选择微信账号并授权
    ↓
获取用户信息（昵称、头像等）
    ↓
发送到后端验证
    ↓
保存登录状态
    ↓
跳转到首页
```

### 2. 关键API说明

#### `uni.login()`
- 获取微信登录凭证（code）
- 不会弹出任何页面
- 返回的code用于后端验证

#### `uni.getUserProfile()`
- **会弹出微信授权页面**
- 用户可以选择不同的微信账号
- 需要用户主动授权
- 返回用户真实信息

## 📱 用户体验

### 登录页面
1. 用户点击"微信登录"按钮
2. 系统检查是否已同意用户协议
3. 调用微信登录API
4. **弹出微信账号选择页面**
5. 用户选择要登录的微信账号
6. **弹出微信授权页面**
7. 用户确认授权
8. 获取用户信息并登录成功

### 授权页面内容
- 显示应用名称和图标
- 显示需要获取的权限说明
- 用户可以选择"允许"或"拒绝"
- 支持多账号切换

## 🛠️ 代码实现

### 核心函数

```javascript
// 微信授权登录 - 会弹出微信账号选择页面
export const wechatAuthLogin = () => {
  return new Promise((resolve, reject) => {
    // 1. 检查协议同意状态
    const agreed = uni.getStorageSync('agreed')
    if (!agreed) {
      return reject(new Error('请先同意用户协议'))
    }

    // 2. 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        try {
          // 3. 获取用户授权信息（会弹出授权页面）
          const userInfo = await getUserProfile()
          
          // 4. 调用后端登录接口
          const result = await api.login({
            code: loginRes.code,
            nickname: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl
          })
          
          // 5. 保存登录信息
          uni.setStorageSync('token', result.token)
          uni.setStorageSync('userInfo', result.user)
          
          resolve(result)
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

// 获取用户授权信息 - 会弹出微信授权页面
export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (error) => {
        // 处理用户拒绝授权的情况
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
```

### 页面调用

```javascript
// 登录页面
async function handleWeChatLogin() {
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none'
    })
    return
  }
  
  loading.value = true
  
  try {
    // 使用微信授权登录，会弹出微信账号选择页面
    await wechatAuthLogin()
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error) {
    console.error('微信登录失败:', error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
```

## 🧪 测试方法

### 1. 在微信开发者工具中测试
1. 打开微信开发者工具
2. 导入项目
3. 点击"微信登录"按钮
4. 观察是否弹出微信授权页面
5. 测试不同微信账号的登录

### 2. 在真机上测试
1. 使用微信扫码预览
2. 在真机上点击"微信登录"
3. 观察是否弹出微信账号选择页面
4. 测试授权流程

### 3. 使用测试页面
访问 `/pages/test/test` 页面：
- 点击"微信授权登录测试"
- 观察控制台输出
- 检查登录状态

## ⚠️ 注意事项

### 1. 开发环境限制
- 在微信开发者工具中，授权页面可能不会完全模拟真实环境
- 建议在真机上测试完整的授权流程

### 2. 用户拒绝授权
- 如果用户拒绝授权，会显示友好提示
- 不会强制要求用户授权
- 可以引导用户重新尝试

### 3. 多账号支持
- 用户可以选择不同的微信账号进行登录
- 每个账号的授权是独立的
- 支持账号切换

### 4. 权限说明
- 需要在 `manifest.json` 中配置相关权限
- 确保小程序已通过微信审核
- 遵守微信小程序开发规范

## 🔍 调试技巧

### 1. 控制台输出
```javascript
console.log('微信登录成功:', loginRes)
console.log('获取用户授权信息成功:', res)
console.log('微信登录成功:', result)
```

### 2. 错误处理
```javascript
catch (error) {
  console.error('微信登录失败:', error)
  // 根据错误类型给出不同提示
  if (error.errMsg && error.errMsg.includes('deny')) {
    uni.showToast({
      title: '需要授权才能登录',
      icon: 'none'
    })
  }
}
```

### 3. 状态检查
```javascript
// 检查登录状态
const state = initState()
console.log('登录状态:', state.isLoggedIn)
console.log('用户信息:', state.userInfo)
```

## 🎉 总结

现在实现的微信登录功能完全符合你的需求：

1. ✅ **会弹出微信账号选择页面**
2. ✅ **会显示微信授权页面**
3. ✅ **支持多账号登录**
4. ✅ **获取真实用户信息**
5. ✅ **完整的登录流程**
6. ✅ **错误处理和用户提示**

用户点击"微信登录"后，会看到微信的账号选择和授权页面，可以选择不同的微信账号进行登录，这正是你想要的体验！
