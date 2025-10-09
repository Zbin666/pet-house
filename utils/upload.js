import { api } from './api.js'

/**
 * 压缩图片
 * @param {string} filePath 图片路径
 * @param {number} quality 压缩质量 0-1
 * @returns {Promise<string>} 压缩后的图片路径
 */
export function compressImage(filePath, quality = 0.8) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality: Math.floor(quality * 100),
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (error) => {
        console.error('图片压缩失败:', error)
        reject(error)
      }
    })
  })
}

/**
 * 上传单张图片
 * @param {string} filePath 图片路径
 * @param {string} type 图片类型 (avatar, gallery, etc.)
 * @returns {Promise<string>} 上传后的图片URL
 */
export async function uploadImage(filePath, type = 'gallery') {
  try {
    // 开发环境：直接返回本地文件路径作为URL
    // 生产环境：需要集成真实的对象存储服务
    console.log('开发环境：使用本地文件路径作为图片URL')
    return filePath
    
    // 生产环境代码（需要配置对象存储）：
    // 1. 获取上传策略
    // const policyRes = await api.getUploadPolicy(type)
    // const { uploadUrl, formData, key } = policyRes.data
    // 
    // 2. 上传到对象存储
    // const uploadRes = await uploadToOSS(filePath, uploadUrl, formData, key)
    // 
    // 3. 确认上传完成
    // const completeRes = await api.completeUpload({
    //   url: `${uploadUrl}${key}`,
    //   fileKey: key,
    //   type: type
    // })
    // 
    // return completeRes.data.url
  } catch (error) {
    console.error('图片上传失败:', error)
    throw error
  }
}

/**
 * 批量上传图片
 * @param {Array<string>} filePaths 图片路径数组
 * @param {string} type 图片类型
 * @param {string} petId 宠物ID（可选）
 * @returns {Promise<Array<string>>} 上传后的图片URL数组
 */
export async function uploadImages(filePaths, type = 'gallery', petId = null) {
  try {
    uni.showLoading({ title: `上传${filePaths.length}张图片中...` })
    
    // 批量压缩
    const compressedPaths = await Promise.all(
      filePaths.map(filePath => compressImage(filePath, 0.7))
    )
    
    // 批量上传
    const uploadPromises = compressedPaths.map(filePath => uploadImage(filePath, type))
    const urls = await Promise.all(uploadPromises)
    
    // 如果有宠物ID，创建媒体记录
    if (petId && urls.length > 0) {
      try {
        await api.createMedia({
          petId,
          type: 'image',
          urls: urls,
          description: '宠物照片'
        })
      } catch (error) {
        console.warn('创建媒体记录失败:', error)
      }
    }
    
    uni.hideLoading()
    return urls
  } catch (error) {
    uni.hideLoading()
    throw error
  }
}

/**
 * 上传到对象存储
 * @param {string} filePath 本地文件路径
 * @param {string} uploadUrl 上传URL
 * @param {Object} formData 表单数据
 * @param {string} fileKey 文件key
 * @returns {Promise<Object>} 上传结果
 */
function uploadToOSS(filePath, uploadUrl, formData, fileKey) {
  return new Promise((resolve, reject) => {
    const uploadTask = uni.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file',
      formData: {
        ...formData,
        key: fileKey
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          resolve(res)
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
    
    // 监听上传进度
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度:', res.progress + '%')
    })
  })
}

/**
 * 选择并上传头像
 * @returns {Promise<string>} 上传后的头像URL
 */
export async function pickAndUploadAvatar() {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    
    const filePath = res.tempFilePaths[0]
    
    // 压缩图片
    const compressedPath = await compressImage(filePath, 0.8)
    
    // 显示上传进度
    uni.showLoading({ title: '上传头像中...' })
    
    // 上传头像
    const avatarUrl = await uploadImage(compressedPath, 'avatar')
    
    uni.hideLoading()
    uni.showToast({ title: '头像上传成功', icon: 'success' })
    
    return avatarUrl
  } catch (error) {
    uni.hideLoading()
    console.error('选择头像失败:', error)
    uni.showToast({ title: '头像上传失败', icon: 'none' })
    throw error
  }
}

/**
 * 选择并上传照片
 * @param {number} maxCount 最大选择数量
 * @returns {Promise<Array<string>>} 上传后的照片URL数组
 */
export async function pickAndUploadPhotos(maxCount = 9) {
  try {
    const res = await uni.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    
    const filePaths = res.tempFilePaths
    
    // 显示上传进度
    uni.showLoading({ title: `上传${filePaths.length}张照片中...` })
    
    // 批量上传
    const urls = await uploadImages(filePaths, 'gallery')
    
    uni.hideLoading()
    uni.showToast({ title: `成功上传${urls.length}张照片`, icon: 'success' })
    
    return urls
  } catch (error) {
    uni.hideLoading()
    console.error('选择照片失败:', error)
    uni.showToast({ title: '照片上传失败', icon: 'none' })
    throw error
  }
}
