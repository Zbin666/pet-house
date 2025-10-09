# 软件设计文档（宠物屋）

## 1. 架构概览
- 前端：uni-app 小程序端，MVVM 模式，页面驱动；状态用 Pinia/简单全局 store；请求封装 `@/utils/request`。
- 后端（可选）：Node.js + Express + MongoDB（或微信云开发）。
- 存储：记录走 DB；媒体走对象存储；CDN 分发；本地 IndexedDB/Storage 作为缓存。

## 2. 目录与路由（建议）
```
pet-house/
  pages/
    index/index.vue           # 首页总览
    record/
      index.vue               # 记录主页（含日历与统计分段/切换）
      create.vue              # 新增记录（多类型）
    pet/
      list.vue                # 宠物列表/切换
      detail.vue              # 档案详情
      edit.vue                # 编辑档案
    community/
      index.vue               # 宠物圈（列表/瀑布流）
      detail.vue              # 圈内动态详情
    album/
      index.vue               # 相册
    settings/
      index.vue               # 设置/隐私
  components/                 # 通用组件（卡片/表单/空状态/上传等）
  utils/                      # 请求、日期、存储、校验
  static/                     # 图标与占位图
```

`pages.json` 示例（片段，按“首页 / 记录 / 宠物圈 / 宠物档案”的底部导航）：
```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "宠物屋" } },
    { "path": "pages/record/index", "style": { "navigationBarTitleText": "记录" } },
    { "path": "pages/record/create", "style": { "navigationBarTitleText": "新增记录" } },
    { "path": "pages/community/index", "style": { "navigationBarTitleText": "宠物圈" } },
    { "path": "pages/community/detail", "style": { "navigationBarTitleText": "圈子详情" } },
    { "path": "pages/pet/detail", "style": { "navigationBarTitleText": "宠物档案" } },
    { "path": "pages/album/index", "style": { "navigationBarTitleText": "相册" } },
    { "path": "pages/settings/index", "style": { "navigationBarTitleText": "设置" } }
  ],
  "tabBar": {
    "color": "#666",
    "selectedColor": "#333",
    "backgroundColor": "#fff8e1",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页", "iconPath": "static/logo.png", "selectedIconPath": "static/logo.png" },
      { "pagePath": "pages/record/index", "text": "记录", "iconPath": "static/logo.png", "selectedIconPath": "static/logo.png" },
      { "pagePath": "pages/community/index", "text": "宠物圈", "iconPath": "static/logo.png", "selectedIconPath": "static/logo.png" },
      { "pagePath": "pages/pet/detail", "text": "宠物档案", "iconPath": "static/logo.png", "selectedIconPath": "static/logo.png" }
    ]
  }
}
```

## 3. 关键用例与界面流
- 首页 → 快捷打卡 → 成功 toast → 刷新今日概览。
- 日历 → 点选日期 → 查看当日记录列表 → 进入记录详情/编辑。
- 档案 → 编辑基础信息 → 保存同步 → 体重曲线随记录变化更新。

## 4. 数据设计
### 4.1 记录类型与载荷（示例）
```ts
type RecordType = 'feed' | 'water' | 'clean' | 'weight' | 'medicine' | 'vaccine' | 'diary' | 'photo'

interface RecordEntity {
  id: string
  userId: string
  petId: string
  type: RecordType
  payload: any
  time: string // ISO
  remindAt?: string // ISO
  createdAt: string
}
```
payload 例：
- weight: { value: number, unit: 'kg'|'g' }
- medicine: { name: string, dose: string }
- photo: { urls: string[], thumbUrls: string[] }

### 4.2 API 设计（REST 示例）
- POST `/api/auth/login` → 登录
- GET `/api/pets` / POST `/api/pets` / PATCH `/api/pets/:id`
- GET `/api/records?petId&dateRange&type`
- POST `/api/records` / PATCH `/api/records/:id` / DELETE `/api/records/:id`
- POST `/api/media/upload` （返回 url 与 thumbUrl）

## 5. 技术设计要点
- 状态管理：按业务域划分 store（user、pet、record、album）。
- 网络：统一请求拦截与错误处理，重试策略，节流防抖。
- 性能：骨架屏、懒加载、列表虚拟化（长列表）、图片压缩与 webp。
- 可观测性：埋点（页面曝光/点击/错误），日志上报（仅摘要）。
- 国际化（可选）：中英双语。

## 6. 安全与合规设计
- 权限弹窗：拍照/相册/订阅消息按需申请，明确用途。
- 数据最小化：仅保存记录所需字段；允许用户删除与导出。
- 注销：后端执行软删除与延迟清除；媒体对象同步清理。

## 7. 上线与配置
- 不同环境配置文件（dev/prod），域名白名单，CDN 与缓存策略，错误监控接入。


