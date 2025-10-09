# 微信登录错误修复说明

## 🐛 问题描述

错误信息：
```
getUserProfile:fail can only be invoked by user TAP gesture.
```

## 🔍 问题原因

这个错误是因为 `uni.getUserProfile()` 必须在用户**直接点击事件**中调用，不能在以下情况中调用：

1. ❌ 在异步函数中调用
2. ❌ 在 setTimeout 中调用  
3. ❌ 在 Promise.then() 中调用
4. ❌ 在 async/await 中调用

## ✅ 解决方案

### 1. 重新设计登录流程

**原来的错误流程：**
```javascript
// ❌ 错误：在异步函数中调用 getUserProfile
uni.login({
  success: async (loginRes) => {
    const userInfo = await getUserProfile() // 这里会报错
  }
})
```

**修复后的正确流程：**
```javascript
// ✅ 正确：在用户直接点击事件中调用
uni.login({
  success: (loginRes) => {
    getUserProfile() // 直接调用，不使用 async/await
      .then((userInfo) => {
        // 处理用户信息
      })
  }
})
```

### 2. 新的实现方式

创建了 `utils/wechatLogin.js` 文件，包含：

```javascript
/**
 * 微信登录 - 第一步：获取登录凭证
 * 这个函数必须在用户直接点击事件中调用
 */
export const startWechatLogin = () => {
  return new Promise((resolve, reject) => {
    // 检查协议同意状态
    const agreed = uni.getStorageSync('agreed')
    if (!agreed) {
      return reject(new Error('请先同意用户协议'))
    }

    // 获取微信登录凭证
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        console.log('微信登录凭证获取成功:', loginRes)
        
        // 立即获取用户授权信息（不使用 async/await）
        getUserProfile()
          .then((userInfo) => {
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
              resolve(result)
            })
            .catch((error) => {
              reject(error)
            })
          })
          .catch((error) => {
            reject(error)
          })
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}
```

### 3. 页面调用方式

**登录页面：**
```javascript
// ✅ 正确：在用户直接点击事件中调用
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
    // 注意：这个函数必须在用户直接点击事件中调用
    await startWechatLogin()
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

## 🎯 关键要点

### 1. 调用时机
- ✅ 必须在用户直接点击事件中调用
- ✅ 不能在异步函数中调用
- ✅ 不能在 Promise.then() 中调用

### 2. 调用方式
- ✅ 使用 `.then()` 而不是 `async/await`
- ✅ 直接调用，不使用异步包装
- ✅ 在用户点击事件的同步上下文中调用

### 3. 错误处理
- ✅ 处理用户拒绝授权的情况
- ✅ 给出友好的错误提示
- ✅ 记录详细的错误信息

## 🧪 测试方法

### 1. 在微信开发者工具中测试
1. 点击"微信登录"按钮
2. 观察控制台输出
3. 检查是否弹出授权页面

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

## 📋 文件更新

### 新增文件
- `utils/wechatLogin.js` - 新的微信登录实现

### 更新文件
- `pages/login/login.vue` - 使用新的登录函数
- `pages/test/test.vue` - 更新测试页面

### 废弃文件
- `utils/wechatAuth.js` - 旧的实现（有错误）

## 🎉 修复结果

现在微信登录功能应该可以正常工作：

1. ✅ 不会出现 "can only be invoked by user TAP gesture" 错误
2. ✅ 会弹出微信账号选择页面
3. ✅ 会弹出微信授权页面
4. ✅ 可以获取用户真实信息
5. ✅ 完整的登录流程

## 🔧 如果还有问题

如果仍然遇到问题，请检查：

1. **确保在用户直接点击事件中调用**
2. **不要使用 async/await 包装 getUserProfile**
3. **确保在微信小程序环境中测试**
4. **检查微信开发者工具版本**

现在应该可以正常使用微信登录功能了！
