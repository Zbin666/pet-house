<template>
	<view class="page" :style="dynamicTopPadding">
		<view class="card">
			<view class="card-hd">
				<image class="avatar" :src="post.avatar" mode="aspectFill" />
				<view class="title-meta">
					<text class="nickname">{{ post.user }}</text>
					<text class="sub">{{ post.pet }}｜{{ post.breed }}</text>
				</view>
				<text class="time">{{ post.time }}</text>
			</view>
			<view class="card-bd">
				<text v-if="post.title" class="post-title">{{ post.title }}</text>
				<text class="content">{{ post.text }}</text>
				<view class="pics" v-if="post.images && post.images.length">
					<image class="pic" v-for="(img, i) in post.images" :key="i" :src="img" mode="aspectFill" />
				</view>
			</view>
			<view class="card-ft">
				<view class="ft-item">
					<image class="ft-icon" src="/static/community/share.png" mode="widthFix" />
					<text>{{ post.shares }}</text>
				</view>
				<view class="ft-item">
					<image class="ft-icon" src="/static/community/emoji.png" mode="widthFix" />
					<text>{{ comments.length }}</text>
				</view>
				<view class="ft-item" @tap.stop="likePost">
					<image class="ft-icon"
						:src="post.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'"
						mode="widthFix" />
					<text>{{ post.likes }}</text>
				</view>
			</view>
		</view>

		<!-- 评论区域 - 叠卡效果 -->
		<view class="comments-section">
			<view class="comments-card">
				<view class="comments-card-bg bg1"></view>
				<view class="comments-card-body">
					<!-- 评论标题 -->
					<view class="comment-header">
                        <view class="comment-tag">
                            <text class="comment-title">全部评论</text>
                            <text class="comment-count">{{ totalComments }}</text>
                        </view>
					</view>

					<!-- 评论列表 -->
					<view class="comment-list">
						<view class="comment-item" v-for="comment in comments" :key="comment.id">
							<view class="comment-user">
								<image class="c-avatar" :src="comment.avatar" mode="aspectFill" />
								<view class="c-info">
									<view class="c-row">
										<view class="c-column">
											<text class="c-name">{{ comment.user }}</text>
											<text class="c-role" v-if="comment.petName">{{ comment.petName }}｜{{
												comment.petBreed }}</text>
									</view>
								</view>
							</view>
								</view>
							<text class="c-text">{{ comment.text }}</text>
							<view class="c-actions">
								<view class="c-actions-left">
									<text class="c-time">{{ comment.time }}</text>
									<text class="c-reply" @tap.stop="startReply(comment)">回复</text>
							</view>
                                <view class="c-actions-right">
                                    <view class="c-like-btn" @tap.stop="likeComment(comment)">
										<image class="c-like-icon"
											:src="comment.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'"
											mode="widthFix" />
										<text class="c-like-count" v-if="comment.likes > 0">{{ comment.likes }}</text>
                                    </view>
                                    <view v-if="comment.isSelf" class="c-delete-btn" @tap.stop="confirmDeleteComment(comment)">
                                        <image class="c-delete-icon" src="/static/user/delete.png" mode="widthFix" />
                                    </view>
								</view>
							</view>

							<!-- 回复列表（按评论单独展开/收起） -->
							<view class="reply-list"
								v-if="comment.showReplies && comment.replies && comment.replies.length > 0">
								<view class="reply-item"
									v-for="reply in comment.replies.slice(0, comment.expandedReplies || 0)"
									:key="reply.id">
									<view class="reply-user">
										<image class="r-avatar" :src="reply.avatar" mode="aspectFill" />
										<view class="r-info">
											<view class="r-row">
												<view class="r-column">
													<text class="r-name">
														{{ reply.user }}
														<text v-if="reply.replyToUser"
															style="color:#999; font-size:22rpx; margin-left:8rpx;">▶ {{
																reply.replyToUser }}</text>
													</text>
													<text class="r-role" v-if="reply.petName">{{ reply.petName }}｜{{
														reply.petBreed }}</text>
												</view>
											</view>
										</view>
									</view>
									<text class="r-text">{{ reply.content }}</text>
									<view class="r-actions">
										<view class="r-actions-left">
											<text class="r-time">{{ reply.time }}</text>
											<text class="r-reply"
												@tap.stop="startReplyToReply(comment, reply)">回复</text>
                                        </view>
										<view class="r-actions-right">
											<view class="r-like-btn" @tap.stop="likeCommentReply(reply)">
												<image class="r-like-icon"
													:src="reply.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'"
													mode="widthFix" />
												<text class="r-like-count" v-if="reply.likes > 0">{{ reply.likes
													}}</text>
											</view>
                                            <view v-if="reply.userId === currentUserId" class="c-delete-btn" @tap.stop="confirmDeleteReply(comment, reply)">
                                                <image class="c-delete-icon" src="/static/user/delete.png" mode="widthFix" />
                                            </view>
										</view>
									</view>
								</view>

							</view>

							<!-- 回复展开/收起按钮（每条评论独立，放在回复列表外以便收起后仍可见） -->
							<view class="reply-expand" v-if="comment.replies && comment.replies.length > 0">
								<view v-if="!comment.showReplies" class="expand-btn" @tap="toggleReplies(comment)">
									<text class="expand-text">展开{{ comment.replies.length }}条回复</text>
									<text class="expand-arrow">↓</text>
								</view>
								<view v-else class="expand-buttons">
									<view v-if="(comment.expandedReplies || 0) < comment.replies.length"
										class="expand-more-btn" @tap="expandMoreReplies(comment)">
										<text class="expand-text">展开更多</text>
										<text class="expand-arrow">↓</text>
									</view>
									<view class="collapse-btn" @tap="collapseReplies(comment)">
										<text class="expand-text">收起</text>
										<text class="expand-arrow">↑</text>
									</view>
								</view>
							</view>
						</view>

					</view>
				</view>
			</view>
		</view>

		<!-- 占位高度，避免内容被底部栏遮挡（真机更可靠） -->
		<view class="bottom-safe-spacer"></view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar"
			style="padding: 24rpx 24rpx !important; padding-bottom: calc(24rpx + env(safe-area-inset-bottom)) !important; padding-bottom: calc(24rpx + constant(safe-area-inset-bottom)) !important;">
			<view class="action-buttons">
				<view class="action-btn" @tap="sharePost">
					<image class="action-icon" src="/static/community/share.png" mode="widthFix" />
				</view>
			<view class="action-btn" @tap="likePost">
					<image class="action-icon"
						:src="post.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'"
						mode="widthFix" />
			</view>
			</view>
			<view class="comment-input" @tap.stop>
				<input class="input-field" type="text" :placeholder="getInputPlaceholder()"
					placeholder-class="input-placeholder" v-model="commentText"
					:focus="replyingToComment !== null || replyingToReply !== null" @confirm="submitComment"
					ref="inputRef" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/utils/api.js'

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(async () => {
	try {
		const info = uni.getSystemInfoSync()
		const statusBar = info.statusBarHeight || 0
		const screenW = info.screenWidth || 375
		const rpxToPx = (rpx) => (rpx * screenW) / 750
		const topPx = 15
		dynamicTopPadding.value = `padding-top:${topPx}px;`

		// 加载当前用户信息与宠物信息
		try {
			const profile = await api.getProfile()
			if (profile && profile.id) currentUserId.value = profile.id
		} catch (e) { }
		try {
			const pets = await api.getPets()
			const petsList = Array.isArray(pets) ? pets : (pets.data || [])
			if (petsList.length > 0) {
				currentUserPet.value = petsList[0] // 使用第一个宠物
			}
		} catch (e) {
			console.error('获取宠物信息失败:', e)
		}
	} catch (e) {
		dynamicTopPadding.value = ''
	}
})

const post = reactive({ id: '', user: '昵称', text: '这是一条圈子动态内容。', cover: '/static/logo.png', likes: 0, avatar: '/static/logo.png', pet: '', breed: '', images: [], shares: 0, isLiked: false, time: '' })
const commentText = ref('')
const comments = reactive([])
const currentUserId = ref('') // 当前登录用户ID
// 顶层评论 + 各评论的回复总数
const totalComments = computed(() => {
    try {
        return comments.reduce((sum, c) => sum + 1 + ((c.replies && c.replies.length) || 0), 0)
    } catch (_) {
        return comments.length
    }
})
const currentUserPet = ref(null) // 当前用户的宠物信息
const replyingToComment = ref(null) // 正在回复的评论
const replyingToReply = ref(null) // 正在回复的回复
// 取消全局评论展开/收起，按评论单独控制
const inputRef = ref(null) // 输入框引用

async function loadDetail(id) {
	try {
		const f = await api.getFeed(id)
		const user = f.User || {}
		const pet = f.Pet || {}
		post.id = f.id
		post.user = user.nickname || '昵称'
		post.pet = pet.name || ''
		post.breed = pet.breed || ''
		post.text = f.text || ''
		post.avatar = user.avatarUrl || '/static/logo.png'
		post.images = Array.isArray(f.images) ? f.images : []
		post.cover = post.images[0] ? post.images[0] : (f.cover || '/static/logo.png')
		post.likes = f.likes || 0
		post.shares = f.shares || 0
		post.isLiked = f.isLiked || false // 添加点赞状态
		// 提取标题（从tags字段中获取第一个标签作为标题）
		let title = ''
		if (f.tags && Array.isArray(f.tags) && f.tags.length > 0) {
			title = f.tags[0]
		} else if (f.tags && typeof f.tags === 'string') {
			try {
				const parsedTags = JSON.parse(f.tags)
				if (Array.isArray(parsedTags) && parsedTags.length > 0) {
					title = parsedTags[0]
				}
			} catch (e) {
				// 如果解析失败，忽略
			}
		}
		post.title = title ? `#${title}` : ''
		// 处理时间显示
		if (f.createdAt) {
			const created = new Date(f.createdAt)
			const now = new Date()
			const timeDiff = now.getTime() - created.getTime()
			const minutesDiff = Math.floor(timeDiff / (1000 * 60))
			if (minutesDiff < 1) {
				post.time = '刚刚'
			} else if (minutesDiff < 60) {
				post.time = `${minutesDiff}分钟前`
			} else if (minutesDiff < 1440) { // 24小时
				const hoursDiff = Math.floor(minutesDiff / 60)
				post.time = `${hoursDiff}小时前`
			} else {
				// 超过24小时显示具体时间
				post.time = `${created.getHours().toString().padStart(2, '0')}:${created.getMinutes().toString().padStart(2, '0')}`
			}
		} else {
			post.time = ''
		}
		// 加载评论数据
		await loadComments(id)
	} catch (e) {
		uni.showToast({ title: '加载失败', icon: 'none' })
	}
}

onLoad((query) => {
	const eventChannel = getCurrentPages().pop()?.getOpenerEventChannel?.()
	let incoming = null
	try {
		eventChannel && eventChannel.on('post', (data) => { incoming = data })
	} catch (e) { }
	// 如果带有 id 则请求详情，否则用事件数据填充
	setTimeout(() => {
		if ((query && query.id) || (incoming && incoming.id)) {
			loadDetail((query && query.id) || incoming.id)
		} else if (incoming) {
			post.id = incoming.id || ''
			post.user = incoming.user || '昵称'
			post.pet = incoming.pet || ''
			post.breed = incoming.breed || ''
			post.text = incoming.text || ''
			post.avatar = incoming.avatar || '/static/logo.png'
			post.images = Array.isArray(incoming.images) ? incoming.images : []
			post.cover = post.images[0] ? post.images[0] : (incoming.cover || '/static/logo.png')
			post.likes = incoming.likes || 0
			post.shares = incoming.shares || 0
		}
	}, 0)
})

// 分享动态
function sharePost() {
	uni.showToast({
		title: '分享功能开发中',
		icon: 'none'
	})
}
// 删除评论
async function confirmDeleteComment(comment) {
    try {
        await new Promise((resolve, reject) => {
            uni.showModal({
                title: '删除确认',
                content: '确定要删除这条评论及其回复吗？',
                confirmText: '删除',
                confirmColor: '#e64340',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            await api.deleteComment(comment.id)
                            const idx = comments.findIndex(c => c.id === comment.id)
                            if (idx !== -1) comments.splice(idx, 1)
                            try { if (post && typeof post.shares !== 'undefined') {} } catch(_) {}
                            uni.showToast({ title: '已删除', icon: 'success' })
                            resolve(true)
                        } catch (e) {
                            uni.showToast({ title: '删除失败', icon: 'none' })
                            reject(e)
                        }
                    } else {
                        resolve(false)
                    }
                }
            })
        })
    } catch (_) {}
}

// 点赞动态
async function likePost() {
	try {
		const result = await api.likeFeed(post.id)
		if (result) {
			// 更新点赞数量和状态
			post.likes = result.likes
			post.isLiked = result.isLiked

			uni.showToast({
				title: post.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none',
				duration: 1000
			})
		}
	} catch (error) {
		console.error('点赞操作失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 加载评论数据
async function loadComments(feedId) {
	try {
		const commentsData = await api.getComments(feedId)
		comments.splice(0, comments.length, ...commentsData.map((c) => {
			// 处理评论时间显示
			let commentTime = ''
			if (c.createdAt) {
				const created = new Date(c.createdAt)
				const now = new Date()
				const timeDiff = now.getTime() - created.getTime()
				const minutesDiff = Math.floor(timeDiff / (1000 * 60))
				if (minutesDiff < 1) {
					commentTime = '刚刚'
				} else if (minutesDiff < 60) {
					commentTime = `${minutesDiff}分钟前`
				} else if (minutesDiff < 1440) { // 24小时
					const hoursDiff = Math.floor(minutesDiff / 60)
					commentTime = `${hoursDiff}小时前`
				} else {
					commentTime = `${created.getHours().toString().padStart(2, '0')}:${created.getMinutes().toString().padStart(2, '0')}`
				}
			}
			// 处理回复数据
			const replies = (c.replies || []).map((r) => {
				let replyTime = ''
				if (r.createdAt) {
					const created = new Date(r.createdAt)
					const now = new Date()
					const timeDiff = now.getTime() - created.getTime()
					const minutesDiff = Math.floor(timeDiff / (1000 * 60))
					if (minutesDiff < 1) {
						replyTime = '刚刚'
					} else if (minutesDiff < 60) {
						replyTime = `${minutesDiff}分钟前`
					} else if (minutesDiff < 1440) {
						const hoursDiff = Math.floor(minutesDiff / 60)
						replyTime = `${hoursDiff}小时前`
					} else {
						replyTime = `${created.getHours().toString().padStart(2, '0')}:${created.getMinutes().toString().padStart(2, '0')}`
					}
				}
				return {
					id: r.id,
					userId: r.userId,
					user: r.User?.nickname || '用户',
					petName: r.Pet?.name || '',
					petBreed: r.Pet?.breed || '',
					time: replyTime,
					avatar: r.User?.avatarUrl || '/static/logo.png',
					content: r.content,
					likes: r.likes || 0,
					isLiked: r.isLiked || false,
					replyToUser: r.replyToUser || '',
					showReplies: false,
					expandedReplies: 3
				}
			})
			return {
				id: c.id,
				userId: c.userId,
				user: c.User?.nickname || '用户',
				petName: c.Pet?.name || '',
				petBreed: c.Pet?.breed || '',
				time: commentTime,
				avatar: c.User?.avatarUrl || '/static/logo.png',
				text: c.text,
				likes: c.likes || 0,
				isLiked: c.isLiked || false,
				isSelf: currentUserId.value ? (c.userId === currentUserId.value) : false,
				replies: replies,
				showReplies: false,
				expandedReplies: 0
			}
		}))
		// 如果存在上次回复的评论ID，则自动展开该条评论的回复区
		try {
			const lastId = uni.getStorageSync('lastRepliedCommentId')
			if (lastId) {
				const target = comments.find(c => c.id === lastId)
				if (target) {
					target.showReplies = true
					target.expandedReplies = Math.min(Math.max(target.expandedReplies || 0, 3), target.replies.length)
				}
				uni.removeStorageSync('lastRepliedCommentId')
			}
		} catch (_) { }
	} catch (e) {
		console.error('加载评论失败:', e)
	}
}

// 开始回复评论
function startReply(comment) {
	replyingToComment.value = comment
	replyingToReply.value = null
	commentText.value = ''
	// 聚焦输入框
	nextTick(() => {
		if (inputRef.value) {
			inputRef.value.focus()
		}
	})
}

// 开始回复回复
function startReplyToReply(comment, reply) {
	replyingToComment.value = comment
	replyingToReply.value = reply
	commentText.value = ''
	// 聚焦输入框
	nextTick(() => {
		if (inputRef.value) {
			inputRef.value.focus()
		}
	})
}

// 取消回复
function cancelReply() {
	replyingToComment.value = null
	replyingToReply.value = null
	commentText.value = ''
	if (inputRef.value) {
		inputRef.value.blur()
	}
}

// 获取输入框占位符
function getInputPlaceholder() {
	if (replyingToReply.value) {
		return `回复 ${replyingToReply.value.user}：`
	} else if (replyingToComment.value) {
		return `回复 ${replyingToComment.value.user}：`
	} else {
		return '输入你的评论'
	}
}

// 提交评论
async function submitComment() {
	if (!commentText.value.trim()) {
		uni.showToast({ title: '请输入评论内容', icon: 'none' })
		return
	}
	try {
		// 如果是回复评论或回复回复，创建回复
		if (replyingToComment.value) {
			const replyData = {
				text: commentText.value.trim(),
				petId: currentUserPet.value?.id || null,
				replyToUserId: replyingToReply.value ? replyingToReply.value.userId : (replyingToComment.value ? replyingToComment.value.userId : null)
			}

			const r = await api.createCommentReply(replyingToComment.value.id, replyData)

			// 处理新回复的时间格式
			let replyTime = '刚刚'
			if (r.createdAt) {
				const created = new Date(r.createdAt)
				const now = new Date()
				const timeDiff = now.getTime() - created.getTime()
				const minutesDiff = Math.floor(timeDiff / (1000 * 60))

				if (minutesDiff < 1) {
					replyTime = '刚刚'
				} else if (minutesDiff < 60) {
					replyTime = `${minutesDiff}分钟前`
				} else if (minutesDiff < 1440) {
					const hoursDiff = Math.floor(minutesDiff / 60)
					replyTime = `${hoursDiff}小时前`
				} else {
					replyTime = `${created.getHours().toString().padStart(2, '0')}:${created.getMinutes().toString().padStart(2, '0')}`
				}
			}

			const newReply = {
				id: r.id,
				user: r.User?.nickname || '我',
				petName: r.Pet?.name || '',
				petBreed: r.Pet?.breed || '',
				time: replyTime,
				avatar: r.User?.avatarUrl || '/static/logo.png',
				content: r.content,
				likes: 0,
				isLiked: false,
				replyToUser: r.replyToUser || (replyingToReply.value ? replyingToReply.value.user : (replyingToComment.value ? replyingToComment.value.user : '')),
				showReplies: false,
				expandedReplies: 3
			}

			// 将新回复添加到对应评论的回复列表中
			const comment = comments.find(c => c.id === replyingToComment.value.id)
			if (comment) {
				comment.replies.unshift(newReply)
				// 新回复后自动展开该评论的回复区域，并保证至少显示3条
				comment.showReplies = true
				comment.expandedReplies = Math.min(Math.max((comment.expandedReplies || 0), 3) + 1, comment.replies.length)
				try { uni.setStorageSync('lastRepliedCommentId', comment.id) } catch (_) { }
			}

			commentText.value = ''
			replyingToComment.value = null
			replyingToReply.value = null
			uni.showToast({ title: '回复提交成功', icon: 'success' })
		} else {
			// 创建主评论
			const commentData = {
				text: commentText.value.trim(),
				petId: currentUserPet.value?.id || null
			}

			const c = await api.createComment(post.id, commentData)

			// 处理新评论的时间格式
			let commentTime = '刚刚'
			if (c.createdAt) {
				const created = new Date(c.createdAt)
				const now = new Date()
				const timeDiff = now.getTime() - created.getTime()
				const minutesDiff = Math.floor(timeDiff / (1000 * 60))

				if (minutesDiff < 1) {
					commentTime = '刚刚'
				} else if (minutesDiff < 60) {
					commentTime = `${minutesDiff}分钟前`
				} else if (minutesDiff < 1440) { // 24小时
					const hoursDiff = Math.floor(minutesDiff / 60)
					commentTime = `${hoursDiff}小时前`
				} else {
					commentTime = `${created.getHours().toString().padStart(2, '0')}:${created.getMinutes().toString().padStart(2, '0')}`
				}
			}

			const newComment = {
			id: c.id,
			user: c.User?.nickname || '我',
				petName: c.Pet?.name || '',
				petBreed: c.Pet?.breed || '',
				time: commentTime,
			avatar: c.User?.avatarUrl || '/static/logo.png',
			text: c.text,
				likes: 0,
				isLiked: false,
				replies: [],
				showReplies: false,
				expandedReplies: 3
			}

			comments.push(newComment)
		commentText.value = ''
		uni.showToast({ title: '评论提交成功', icon: 'success' })
		}
	} catch (e) {
		uni.showToast({ title: '提交失败', icon: 'none' })
	}
}

// 点赞评论
async function likeComment(comment) {
	try {
		const result = await api.likeComment(comment.id)
		if (result) {
			// 更新评论的点赞数量和状态
			comment.likes = result.likes
			comment.isLiked = result.isLiked

			uni.showToast({
				title: comment.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none',
				duration: 1000
			})
		}
	} catch (error) {
		console.error('点赞评论失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 展开评论
function toggleComments() {
	showComments.value = true
	expandedComments.value = Math.min(3, comments.length)
}

// 展开更多评论
function expandMoreComments() {
	expandedComments.value = Math.min(expandedComments.value + 10, comments.length)
}

// 收起评论
function collapseComments() {
	showComments.value = false
	expandedComments.value = 0
}

// 点赞评论回复
async function likeCommentReply(reply) {
	try {
		const result = await api.likeCommentReply(reply.id)
		if (result) {
			// 更新回复的点赞数量和状态
			reply.likes = result.likes
			reply.isLiked = result.isLiked

			uni.showToast({
				title: reply.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none',
				duration: 1000
			})
		}
	} catch (error) {
		console.error('点赞回复失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 删除回复
async function confirmDeleteReply(comment, reply) {
    try {
        await new Promise((resolve, reject) => {
            uni.showModal({
                title: '删除确认',
                content: '确定要删除这条回复吗？',
                confirmText: '删除',
                confirmColor: '#e64340',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            await api.deleteCommentReply(reply.id)
                            const idx = comment.replies.findIndex(r => r.id === reply.id)
                            if (idx !== -1) comment.replies.splice(idx, 1)
                            uni.showToast({ title: '已删除', icon: 'success' })
                            resolve(true)
                        } catch (e) {
                            uni.showToast({ title: '删除失败', icon: 'none' })
                            reject(e)
                        }
                    } else {
                        resolve(false)
                    }
                }
            })
        })
    } catch (_) {}
}
// 展开回复
function toggleReplies(comment) {
	comment.showReplies = true
	comment.expandedReplies = Math.min(3, comment.replies.length)
}

// 展开更多回复
function expandMoreReplies(comment) {
	comment.expandedReplies = Math.min((comment.expandedReplies || 0) + 10, comment.replies.length)
}

// 收起回复
function collapseReplies(comment) {
	comment.showReplies = false
	comment.expandedReplies = 0
}
</script>

<style scoped>
.page {
	padding: 24rpx;
	/* 动态计算顶部间距，避免真机调试时env不生效 */
	padding-bottom: 36rpx;
	/* 改为基础内边距，具体高度由占位视图控制 */
	min-height: 100vh;
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
}

.card {
	width: 600rpx;
	background: #fff;
	border-radius: 24rpx;
	border: 4rpx solid #2c2c2c;
	padding: 25rpx 35rpx;
	box-shadow: 0 8rpx 0 #2c2c2c;
	margin: 0 auto;
}

.card-hd {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.title-meta {
	flex: 1;
	margin-left: 12rpx;
}

.nickname {
	font-size: 30rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.sub {
	display: block;
	color: #7a7a7a;
	font-size: 24rpx;
	margin-top: 4rpx;
}

.time {
	color: #7a7a7a;
	font-size: 24rpx;
}

.card-bd {
	margin-top: 10rpx;
}

.post-title {
	display: block;
	color: #82919c;
	font-size: 28rpx;
	font-weight: 600;
	margin: 16rpx 0 8rpx 0;
	line-height: 1.4;
}

.content {
	display: block;
	color: #333;
	line-height: 1.6;
	margin: 24rpx 0;
	font-size: 26rpx;
}

.pics {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
}

.pic {
	width: 100%;
	height: 200rpx;
	background: #f3f3f3;
	border-radius: 12rpx;
}

.card-ft {
	margin-top: 18rpx;
	display: flex;
	justify-content: flex-end;
	gap: 8rpx;
	color: #555;
	font-size: 28rpx;
}

.ft-item {
	background: #fff;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.ft-icon {
	width: 24rpx;
	height: 24rpx;
}

/* 评论区域 - 叠卡效果 */
.comments-section {
	margin-top: 50rpx;
	position: relative;
}

.comments-card {
	position: relative;
}

.comments-card-bg {
	position: absolute;
	left: 8rpx;
	right: 8rpx;
	height: 100%;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	background: #fff;
	z-index: 0;
	pointer-events: none;
}

.comments-card-bg.bg1 {
	top: -2rpx;
	width: 625rpx;
	left: 50%;
	transform: translateX(-50%) rotate(-2deg);
	z-index: 0;
}

.comments-card-body {
	width: 625rpx;
	position: relative;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	padding: 20rpx;
	z-index: 1;
	margin: 0 auto;
}

.comment-header {
	display: flex;
	align-items: flex-start;
	margin-bottom: 20rpx;
	padding-bottom: 0;
	border-bottom: none;
	/* top: -20rpx; */
}

.comment-tag {
	position: relative;
	display: flex;
	align-items: center;
	background: #333333;
	color: #fff;
	padding: 16rpx 24rpx;
	transform: rotate(-3deg);
	border-radius: 0;
	box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.3);
	margin-left: 8rpx;
}

.comment-tag::before {
	content: '';
	position: absolute;
	left: -10rpx;
	top: 0;
	width: 0;
	height: 0;
	border-top: 0 solid transparent;
	border-bottom: 100% solid transparent;
	border-right: 10rpx solid #333333;
}

.comment-tag::after {
	content: '';
	position: absolute;
	right: -10rpx;
	top: 0;
	width: 0;
	height: 0;
	border-top: 100% solid transparent;
	border-bottom: 0 solid transparent;
	border-left: 10rpx solid #333333;
}

.comment-title {
	font-weight: 600;
	font-size: 30rpx;
	color: #fff;
	margin-right: 12rpx;
	letter-spacing: 1rpx;
}

.comment-count {
	font-weight: 500;
	font-size: 26rpx;
	color: #fff;
	letter-spacing: 0.5rpx;
}

.comment-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.comment-item {
	width: 590rpx;
	border: 1rpx solid #e9e9e9;
	border-radius: 12rpx;
	padding: 16rpx;
	margin-bottom: 12rpx;
}

.comment-item:last-child {
	margin-bottom: 0;
}

.comment-user {
	display: flex;
	gap: 14rpx;
	margin-bottom: 18rpx;
}

.c-avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.c-info {
	flex: 1;
}

.c-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.c-column {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-left: 12rpx;
}

.c-name {
	font-weight: 700;
	color: #2c2c2c;
	font-size: 28rpx;
}

.c-role {
	display: block;
	color: #7a7a7a;
	font-size: 24rpx;
	margin-top: 4rpx;
}

.c-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 6rpx;
}

.c-actions-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.c-actions-right {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.c-reply {
	font-size: 22rpx;
	color: #999;
	flex-shrink: 0;
}

.c-like-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 12rpx;
	background: #f5f5f5;
	border-radius: 20rpx;
}

.c-delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    margin-left: 8rpx;
}

.c-delete-icon {
    width: 28rpx;
    height: 28rpx;
}

.c-like-icon {
	width: 20rpx;
	height: 20rpx;
}

.c-like-count {
	font-size: 22rpx;
	color: #666;
}

.c-time {
	color: #777;
	font-size: 24rpx;
}

.c-text {
	display: block;
	margin-bottom: 10rpx;
	color: #1a1a1a;
	line-height: 1.7;
	font-size: 26rpx;
}

.reply-box {
	background: #f8f8f8;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 28rpx 18rpx;
	margin-top: 12rpx;
}

.reply-row {
	margin-bottom: 16rpx;
	font-size: 24rpx;
}

.reply-row:last-child {
	margin-bottom: 0;
}

.r-name {
	color: #1a1a1a;
	font-weight: 600;
}

.r-text {
	color: #333;
}

.view-all {
	display: block;
	color: #6b6b6b;
	margin-top: 6rpx;
	font-size: 24rpx;
	text-align: center;
}

/* 评论展开/收起按钮 */
.comment-expand {
	margin-top: 20rpx;
	display: flex;
	justify-content: center;
}

.expand-btn,
.expand-more-btn,
.collapse-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 0;
	background: transparent;
	border: none;
	border-radius: 0;
	margin: 0 8rpx;
}

.expand-buttons {
	display: flex;
	gap: 16rpx;
}

.expand-text {
	font-size: 24rpx;
	color: #666;
}

.expand-arrow {
	font-size: 20rpx;
	color: #999;
}

/* 回复列表样式 */
.reply-list {
	margin-top: 18rpx;
	padding-left: 32rpx;
	border-left: none;
	gap: 16rpx;
}

.reply-item {
	margin-top: 12rpx;
	padding-top: 12rpx;
	padding-bottom: 0;
	border-bottom: none;
}

.reply-item:last-child {
	border-bottom: none;
	margin-bottom: 0;
	padding-bottom: 0;
}

.reply-user {
	display: flex;
	gap: 10rpx;
	margin-bottom: 8rpx;
}

.r-avatar {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.r-info {
	flex: 1;
}

.r-row {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.r-column {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-left: 8rpx;
}

.r-name {
	font-weight: 600;
	color: #2c2c2c;
	font-size: 24rpx;
}

.r-role {
	display: block;
	color: #7a7a7a;
	font-size: 20rpx;
	margin-top: 2rpx;
}

.r-text {
	display: block;
	margin-bottom: 8rpx;
	color: #1a1a1a;
	line-height: 1.6;
	font-size: 24rpx;
}

.r-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 4rpx;
}

.r-actions-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.r-actions-right {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.r-reply {
	font-size: 20rpx;
	color: #999;
	flex-shrink: 0;
}

.r-like-btn {
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 6rpx 10rpx;
	background: #f5f5f5;
	border-radius: 16rpx;
}

.r-like-icon {
	width: 18rpx;
	height: 18rpx;
}

.r-like-count {
	font-size: 20rpx;
	color: #666;
}

.r-time {
	color: #777;
	font-size: 20rpx;
}

/* 回复展开/收起按钮 */
.reply-expand {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12rpx;
    padding: 8rpx 0;
    cursor: pointer;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed !important;
	bottom: 0 !important;
	left: 0 !important;
	right: 0 !important;
	background: #fff !important;
	border-top: 4rpx solid #2c2c2c !important;
	padding: 20rpx 24rpx !important;
	padding-bottom: calc(40rpx + env(safe-area-inset-bottom)) !important;
	padding-bottom: calc(40rpx + constant(safe-area-inset-bottom)) !important;
	display: flex !important;
	align-items: center !important;
	gap: 16rpx !important;
	z-index: 100 !important;
}

.action-buttons {
	display: flex;
	gap: 12rpx;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f5f5f5;
	border: 2rpx solid #2c2c2c;
	border-radius: 50%;
}

.action-icon {
	width: 32rpx;
	height: 32rpx;
	transition: all 0.3s ease;
}


.comment-input {
	flex: 1;
	max-width: 500rpx;
}

.input-field {
	width: 100%;
	height: 60rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 30rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #333;
}

.input-placeholder {
	color: #bbb;
	font-size: 28rpx;
}

/* 底部占位高度，匹配底部栏实际高度（含安全区） */
.bottom-safe-spacer {
	height: calc(88rpx + env(safe-area-inset-bottom));
	height: calc(88rpx + constant(safe-area-inset-bottom));
}
</style>
