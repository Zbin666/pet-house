# 后端方案文档（宠物屋 · 面向前端）

本方案围绕当前前端已实现的页面与交互（首页、记录、宠物圈、宠物档案、相册、设置），提供可落地的后端架构、数据模型、API 设计、权限与部署策略。

实现路径（采纳）：Node.js + Express + MySQL（使用 Sequelize/Prisma），对象存储（COS/OSS/七牛）。

## 1. 关键功能
- 登录与用户体系（微信登录）
- 宠物档案 CRUD
- 日常记录 CRUD + 日历聚合 + 统计
- 媒体直传与结果回写
- 宠物圈（Feed、评论、点赞）
- 订阅消息提醒

## 2. 技术栈
- Node.js 18+、Express 4+、TypeScript（推荐）
- ORM：Prisma（推荐）或 Sequelize
- 数据库：MySQL 8（InnoDB）
- 存储：对象存储（COS/OSS）
- 认证：微信 code2Session + JWT

## 3. 关系型数据模型（MySQL）
Prisma schema（片段）：
```prisma
model User {
  id           String   @id @default(cuid())
  openId       String   @unique
  nickname     String?
  avatarUrl    String?
  createdAt    DateTime @default(now())
  lastLoginAt  DateTime?
  Pets         Pet[]
  Records      Record[]
  Feeds        Feed[]
  Comments     Comment[]
}

model Pet {
  id        String   @id @default(cuid())
  userId    String
  name      String
  birthday  DateTime?
  gender    String?
  breed     String?
  neutered  Boolean? @default(false)
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  User      User     @relation(fields: [userId], references: [id])
  Records   Record[]
}

model Record {
  id        String   @id @default(cuid())
  userId    String
  petId     String
  type      String   // feed|water|clean|weight|medicine|vaccine|diary|photo
  payload   Json
  time      DateTime
  remindAt  DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  User      User     @relation(fields: [userId], references: [id])
  Pet       Pet      @relation(fields: [petId], references: [id])
}

model Media {
  id        String   @id @default(cuid())
  userId    String
  petId     String?
  recordId  String?
  url       String
  thumbUrl  String?
  size      Int?
  width     Int?
  height    Int?
  createdAt DateTime @default(now())
}

model Feed {
  id             String   @id @default(cuid())
  userId         String
  text           String?
  images         Json
  tags           Json
  likes          Int      @default(0)
  commentsCount  Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  User           User     @relation(fields: [userId], references: [id])
  Comments       Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  feedId    String
  userId    String
  text      String
  createdAt DateTime @default(now())
  Feed      Feed     @relation(fields: [feedId], references: [id])
  User      User     @relation(fields: [userId], references: [id])
}

model Subscription {
  id        String   @id @default(cuid())
  userId    String
  petId     String
  recordId  String?
  type      String   // medicine|vaccine|custom
  fireAt    DateTime
  state     String   @default("pending")
  createdAt DateTime @default(now())
}

@@index([userId])
@@index([petId])
@@index([time])
```

关键查询 SQL 示例：
```sql
-- 当月每日计数（日历）
SELECT DAY(time) AS day, COUNT(*) AS cnt
FROM `Record`
WHERE petId = ? AND time >= ? AND time < ?
GROUP BY DAY(time);

-- 近 7 天统计
SELECT type, COUNT(*) AS cnt
FROM `Record`
WHERE petId = ? AND time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY type;

-- 最新体重
SELECT payload->'$.value' AS weight
FROM `Record`
WHERE petId = ? AND type = 'weight'
ORDER BY time DESC
LIMIT 1;
```

## 4. API 设计（与前端一致）
- 认证：POST /api/auth/login、GET /api/auth/profile
- 宠物：GET/POST/PATCH/DELETE /api/pets*
- 记录：GET/POST/PATCH/DELETE /api/records*
- 聚合：GET /api/records/calendar、GET /api/records/stats
- 媒体：POST /api/media/policy、POST /api/media/complete
- 宠物圈：GET/POST /api/feeds、GET/POST /api/feeds/:id/comments、POST /api/feeds/:id/like
- 提醒：POST/DELETE /api/subscriptions

## 5. 认证与权限
- 微信登录换取 openId，用户不存在则创建；签发 JWT（7 天），支持刷新。
- 资源级权限：`userId` 必须与 token 中一致；管理员保留。

## 6. 项目结构（Express + TypeScript）
```
pet-house-backend/
  src/
    app.ts
    routes/ (auth, pets, records, media, feeds, comments, subscriptions)
    controllers/
    services/
    prisma/ (schema.prisma)
    middlewares/ (auth, error)
    utils/
  .env (DATABASE_URL, JWT_SECRET, COS_*)
  prisma/
    schema.prisma
```

## 7. 部署
- MySQL：RDS/自建，UTF8MB4，启用备份
- 应用：Docker + PM2；Nginx 反代；HTTPS
- 对象存储：私有写、公开读；回写缩略图
- 任务：定时器（node-cron）发送提醒

## 8. 与前端对接点
与 `docs/design.md` 与页面实现保持一致：记录（日历/列表/统计）、档案、相册（或照片记录）、宠物圈、提醒。

## 9. 里程碑
1) Auth + User + Pet + Record 基础 CRUD
2) Calendar/Stats 聚合查询
3) 媒体直传
4) Feed/Comment/Like
5) 订阅消息与定时任务
