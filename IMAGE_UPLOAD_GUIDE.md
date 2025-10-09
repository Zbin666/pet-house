# 图片上传功能使用指南

## 功能概述

已为创建宠物页面实现了完整的图片上传功能，包括：

- **头像上传**：单张图片，压缩质量 0.8
- **照片上传**：最多9张图片，压缩质量 0.7
- **自动压缩**：使用 uni.compressImage API
- **批量上传**：支持多张图片同时上传
- **进度提示**：显示上传进度和结果

## 文件结构

```
pet-house/
├── utils/
│   ├── upload.js          # 图片上传工具函数
│   └── api.js            # API接口（已添加媒体相关方法）
└── pages/createPet/
    └── createPet.vue     # 创建宠物页面（已集成上传功能）

pet-house-backend/
├── src/controllers/
│   └── mediaController.ts # 媒体控制器（已添加createMedia方法）
└── src/routes/
    └── media.ts          # 媒体路由（已添加createMedia路由）
```

## 使用方法

### 1. 头像上传

```javascript
// 在创建宠物页面中
async function pickAvatar() {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    
    // 压缩图片
    const compressedPath = await compressImage(res.tempFilePaths[0], 0.8)
    
    // 上传头像
    const avatarUrl = await uploadImage(compressedPath, 'avatar')
    
    form.avatar = avatarUrl
  } catch (error) {
    console.error('头像上传失败:', error)
  }
}
```

### 2. 照片上传

```javascript
// 批量上传照片
async function pickPhotos() {
  try {
    const res = await uni.chooseImage({
      count: remainingCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })
    
    // 批量压缩和上传
    const uploadPromises = res.tempFilePaths.map(async (filePath) => {
      const compressedPath = await compressImage(filePath, 0.7)
      return await uploadImage(compressedPath, 'gallery')
    })
    
    const uploadedUrls = await Promise.all(uploadPromises)
    form.gallery = form.gallery.concat(uploadedUrls)
  } catch (error) {
    console.error('照片上传失败:', error)
  }
}
```

## 开发环境配置

当前实现为开发环境简化版本：

- **本地文件路径**：直接使用 `uni.chooseImage` 返回的临时文件路径
- **无需对象存储**：开发阶段不需要配置阿里云OSS等云存储服务
- **自动压缩**：仍然会压缩图片以优化性能

## 生产环境配置

要启用真实的对象存储上传，需要：

### 1. 配置环境变量

```bash
# .env
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_BUCKET=your_bucket_name
OSS_REGION=your_region
```

### 2. 修改上传逻辑

在 `utils/upload.js` 中取消注释生产环境代码：

```javascript
export async function uploadImage(filePath, type = 'gallery') {
  try {
    // 1. 获取上传策略
    const policyRes = await api.getUploadPolicy(type)
    const { uploadUrl, formData, key } = policyRes.data
    
    // 2. 上传到对象存储
    const uploadRes = await uploadToOSS(filePath, uploadUrl, formData, key)
    
    // 3. 确认上传完成
    const completeRes = await api.completeUpload({
      url: `${uploadUrl}${key}`,
      fileKey: key,
      type: type
    })
    
    return completeRes.data.url
  } catch (error) {
    console.error('图片上传失败:', error)
    throw error
  }
}
```

### 3. 实现对象存储集成

在 `pet-house-backend/src/controllers/mediaController.ts` 中实现真实的对象存储逻辑：

```javascript
export const getUploadPolicy = async (req: Request, res: Response) => {
  try {
    // 集成阿里云OSS、腾讯云COS等对象存储服务
    // 生成上传策略和签名
    const policy = {
      uploadUrl: 'https://your-bucket.oss-region.aliyuncs.com/',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      policy: 'base64-encoded-policy',
      signature: 'signature',
      key: `uploads/${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      expires: Date.now() + 3600000
    };
    
    res.json(policy);
  } catch (error) {
    console.error('Get upload policy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## API接口

### 媒体相关接口

- `POST /api/media/policy` - 获取上传策略
- `POST /api/media/complete` - 确认上传完成
- `POST /api/media` - 创建媒体记录
- `GET /api/media` - 获取媒体列表
- `DELETE /api/media/:id` - 删除媒体

### 创建宠物接口

- `POST /api/pets` - 创建宠物（包含头像URL）

## 注意事项

1. **图片压缩**：所有图片都会自动压缩以优化上传速度和存储空间
2. **错误处理**：上传失败时会显示错误提示，但不会阻止宠物创建
3. **权限验证**：所有上传操作都需要用户登录（JWT token）
4. **文件类型**：目前只支持图片文件（jpg, png等）
5. **文件大小**：建议单张图片不超过5MB

## 测试方法

1. 启动后端服务：`cd pet-house-backend && npm run dev`
2. 启动前端项目：在HBuilderX中运行到微信小程序
3. 进入创建宠物页面
4. 点击"添加头像"或"添加照片"按钮
5. 选择图片，观察压缩和上传过程
6. 填写宠物信息并保存，检查数据库中是否正确创建了宠物和媒体记录
