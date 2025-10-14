<template>
	<view class="page" :style="dynamicTopPadding">
		<!-- 问题卡片 -->
		<view class="qa-card">
			<view class="qa-header">
				<view class="urgent-tag" v-if="qa.isUrgent"><text class="urgent-text">急</text></view>
				<text class="qa-title">{{ qa.title }}</text>
				<button 
					class="follow-btn" 
					:class="{ 'followed': qa.isFollowed }"
					type="default" 
					size="mini"
					@tap="followQuestion"
				>
					{{ qa.isFollowed ? '已关注' : '关注问题' }}
				</button>
			</view>
			<view class="qa-divider"></view>
			<view class="qa-desc">
				<text class="p">{{ qa.content }}</text>
			</view>

			<view class="qa-user-info">
				<image class="qa-user-avatar" :src="qa.user.avatarUrl || '/static/logo.png'" mode="aspectFill" />
				<text class="qa-user-name">{{ qa.user.nickname || '用户' }}</text>
				<text class="qa-time">{{ qa.time }}</text>
			</view>
		</view>

		<!-- 答案区域（叠卡容器） -->
		<view class="answers-section" @tap="cancelReply">
			<view class="answers-card">
				<view class="answers-card-bg bg1"></view>
				<view class="answers-card-body">
					<view class="answers-ribbon"><text>全部回答</text></view>
					<view class="answer-list">
						<view class="answer-card" v-for="answer in qa.answers" :key="answer.id">
							<view class="doctor-info">
								<image class="avatar" :src="answer.user.avatarUrl || '/static/logo.png'"
									mode="aspectFill" />
								<view class="d-meta">
									<text class="d-name">{{ answer.user.nickname }}</text>
									<text class="d-title" v-if="answer.pet && answer.pet.name">{{ answer.pet.name }}｜{{ answer.pet.breed }}</text>
								</view>
							</view>
							<text class="answer-text">{{ answer.content }}</text>
							<view class="answer-actions">
								<text class="answer-time">{{ answer.time }}</text>
								<text class="answer-reply" @tap.stop="startReplyToAnswer(answer)">回复</text>
								<view class="like-btn" @tap="likeAnswer(answer)">
									<image class="like-icon" :src="answer.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
									<text class="like-count">{{ answer.likes }}</text>
								</view>
								<view v-if="answer.user?.id === currentUserId" class="answer-delete-btn" @tap.stop="confirmDeleteAnswer(answer)">
									<image class="delete-icon" src="/static/user/delete.png" mode="widthFix" />
								</view>
							</view>
							
							<!-- 该回答的评论列表 -->
							<view class="answer-comments" v-if="answer.showComments && answer.comments && answer.comments.length" @tap.stop>
								<view class="comment-item" v-for="comment in answer.comments.slice(0, answer.expandedComments)" :key="comment.id">
									<view class="comment-user">
										<image class="c-avatar" :src="comment.user.avatarUrl || '/static/logo.png'" mode="aspectFill" />
										<view class="c-info">
											<view class="c-row">
												<view class="c-column">
										<text class="c-name">
											{{ comment.user.nickname }}
											<text v-if="comment.replyTo && comment.replyTo.nickname" style="color:#999; font-size:24rpx; margin-left:8rpx;">
												▶ {{ comment.replyTo.nickname }}
											</text>
										</text>
													<text class="c-role" v-if="comment.pet && comment.pet.name">{{ comment.pet.name }}｜{{ comment.pet.breed }}</text>
												</view>
											</view>
										</view>
									</view>
									<text class="c-text">{{ comment.content }}</text>
									<view class="c-actions">
										<text class="c-time">{{ comment.time }}</text>
										<text class="c-reply" @tap.stop="startReply(comment, answer)">回复</text>
										<view class="c-like-btn" @tap.stop="likeComment(comment)">
											<image class="c-like-icon" :src="comment.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
											<text class="c-like-count" v-if="comment.likes > 0">{{ comment.likes }}</text>
										</view>
							<view v-if="comment.user?.id === currentUserId" class="c-delete-btn" @tap.stop="confirmDeleteAnswerComment(answer, comment)">
								<image class="delete-icon" src="/static/user/delete.png" mode="widthFix" />
							</view>
									</view>
									
									<!-- 此处不再显示评论内的回复展开/列表 -->
								</view>
							</view>
							<!-- 回答的评论展开/收起按钮（放在回答+评论整体底部） -->
							<view class="answer-reply-expand" v-if="answer.comments && answer.comments.length > 0">
								<!-- 初始状态：显示展开按钮 -->
								<view v-if="!answer.showComments" @tap.stop="toggleAnswerComments(answer)">
									<text class="expand-text">展开{{ answer.comments.length }}条回复</text>
									<text class="expand-arrow">↓</text>
								</view>
								
								<!-- 展开状态：同时显示展开更多和收起按钮 -->
								<view v-else class="expand-buttons">
									<view v-if="answer.expandedComments < answer.comments.length" @tap.stop="expandMoreComments(answer)" class="expand-more-btn">
										<text class="expand-text">展开更多</text>
										<text class="expand-arrow">↓</text>
									</view>
									<view @tap.stop="collapseComments(answer)" class="collapse-btn">
										<text class="expand-text">收起</text>
										<text class="expand-arrow">↑</text>
									</view>
								</view>
							</view>
						</view>
						<view class="answer-card empty" v-if="qa.answers.length === 0">
							<text class="empty-text">暂时还没有人回答，去抢第一个回答吧～</text>
						</view>
					</view>
				</view>
			</view>
		</view>


		<!-- 占位高度，避免内容被底部栏遮挡（与广场详情一致） -->
		<view class="bottom-safe-spacer"></view>

		<!-- 底部输入 -->
		<view class="bottom-input-bar" @tap.stop>
			<input 
				ref="inputRef"
				class="input-field" 
				v-model="currentAnswer"
				:placeholder="replyingToComment ? `回复 ${replyingToComment.user.nickname}：` : replyingToAnswerDirect ? `回复 ${replyingToAnswerDirect.user.nickname}：` : '输入你的回答'" 
				:disabled="isSubmitting"
				:focus="replyingToComment !== null || replyingToAnswerDirect !== null"
				@confirm="replyingToComment ? submitReply() : replyingToAnswerDirect ? submitReplyToAnswer() : submitAnswer()"
				@tap.stop
			/>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from 'vue'
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
		
		// 加载当前用户的宠物信息
		try {
			const pets = await api.getPets()
			const petsList = Array.isArray(pets) ? pets : (pets.data || [])
			if (petsList.length > 0) {
				currentUserPet.value = petsList[0] // 使用第一个宠物
			}
		} catch (e) {
			console.error('获取宠物信息失败:', e)
		}

		// 获取当前用户信息
		try {
			const profile = await api.getProfile()
			currentUserId.value = profile?.id || profile?.userId || ''
		} catch (e) {}
	} catch (e) {
		dynamicTopPadding.value = ''
	}
})

type Doctor = { name: string; title: string; avatar: string }
type Answer = {
	id: string
	content: string
	isExpert: boolean
	likes: number
	isLiked: boolean
	createdAt: string
	user: {
		id: string
		nickname: string
		avatarUrl: string
	}
	pet?: {
		name: string
		breed: string
	} | null
	comments: Comment[]
	newComment: string
	showComments: boolean
	expandedComments: number
}

type Comment = {
	id: string
	content: string
	likes: number
	isLiked: boolean
	time: string
	user: {
		id: string
		nickname: string
		avatarUrl: string
	}
	pet?: {
		name: string
		breed: string
	} | null
    replyTo?: {
        commentId: string
        userId: string | null
        nickname: string | null
    } | null
    // 已移除评论内的回复展开逻辑
}


type QA = {
	id: string
	title: string
	content: string
	isUrgent: boolean
	hasAnswer: boolean
	doctor?: Doctor | null
	answerPreview: string | null
	answerCount: number
	readCount: number
	followCount: number
	time: string
	user: {
		id: string
		nickname: string
		avatarUrl: string
	}
	pet?: {
		name: string
		breed: string
	} | null
	answers: Answer[]
	isOwner: boolean
	isFollowed: boolean
}

const qa = reactive<QA>({
	id: '',
	title: '问题标题',
	content: '',
	isUrgent: false,
	hasAnswer: false,
	doctor: null,
	answerPreview: '',
	answerCount: 0,
	readCount: 0,
	followCount: 0,
	time: '',
	user: {
		id: '',
		nickname: '',
		avatarUrl: ''
	},
	pet: null,
	answers: [],
	isOwner: false,
	isFollowed: false
})

const currentAnswer = ref('')
const isSubmitting = ref(false)
const isSubmittingComment = ref(false)
const currentUserPet = ref<any>(null)
const replyingToComment = ref<Comment | null>(null)
const replyingToAnswer = ref<Answer | null>(null)
const replyingToAnswerDirect = ref<Answer | null>(null)
const inputRef = ref<any>(null)
const currentUserId = ref('')

// 加载问答详情
async function loadQuestionDetail(questionId: string) {
	try {
		const data = await api.getQuestion(questionId)
		
		// 时间格式化
		let time = '刚刚'
		if (data.createdAt) {
			const created = new Date(data.createdAt)
			const month = created.getUTCMonth() + 1
			const date = created.getUTCDate()
			const hours = created.getUTCHours().toString().padStart(2, '0')
			const minutes = created.getUTCMinutes().toString().padStart(2, '0')
			time = `${month}/${date} ${hours}:${minutes}`
		}
		
		// 处理回答数据
		const processedAnswers = data.answers.map((answer: any) => {
			let answerTime = '刚刚'
			if (answer.createdAt) {
				const created = new Date(answer.createdAt)
				const now = new Date()
				const timeDiff = now.getTime() - created.getTime()
				const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
				
				if (daysDiff === 0) {
					// 今天
					const hours = created.getHours().toString().padStart(2, '0')
					const minutes = created.getMinutes().toString().padStart(2, '0')
					answerTime = `今天 ${hours}:${minutes}`
				} else if (daysDiff === 1) {
					// 昨天
					const hours = created.getHours().toString().padStart(2, '0')
					const minutes = created.getMinutes().toString().padStart(2, '0')
					answerTime = `昨天 ${hours}:${minutes}`
				} else if (daysDiff < 7) {
					// 一周内
					const hours = created.getHours().toString().padStart(2, '0')
					const minutes = created.getMinutes().toString().padStart(2, '0')
					answerTime = `${daysDiff}天前 ${hours}:${minutes}`
				} else {
					// 超过一周
					const month = created.getMonth() + 1
					const date = created.getDate()
					const hours = created.getHours().toString().padStart(2, '0')
					const minutes = created.getMinutes().toString().padStart(2, '0')
					answerTime = `${month}/${date} ${hours}:${minutes}`
				}
			}
			
			return {
				...answer,
				time: answerTime,
				comments: [],
				newComment: '',
				showComments: false,
				expandedComments: 0
			}
		})
		
		Object.assign(qa, {
			...data,
			time,
			answers: processedAnswers,
			readCount: data.views || 0  // 确保阅读数正确映射
		})
		
		// 为每个回答加载评论
		for (const answer of qa.answers) {
			await loadAnswerComments(answer.id)
		}
	} catch (error) {
		console.error('加载问答详情失败:', error)
		uni.showToast({
			title: '加载失败',
			icon: 'none'
		})
	}
}

// 提交回答
async function submitAnswer() {
	if (!currentAnswer.value.trim()) {
		uni.showToast({
			title: '请输入回答内容',
			icon: 'none'
		})
		return
	}
	
	if (isSubmitting.value) return
	
	try {
		isSubmitting.value = true
		
		await api.createAnswer(qa.id, {
			content: currentAnswer.value.trim(),
			petId: qa.pet?.id || null
		})
		
		uni.showToast({
			title: '回答成功',
			icon: 'success'
		})
		
		// 清空输入框
		currentAnswer.value = ''
		
		// 重新加载问答详情
		await loadQuestionDetail(qa.id)
		
		// 触发问答列表刷新事件
		try {
			uni.$emit('qa:refresh')
		} catch (e) {}
		
	} catch (error) {
		console.error('提交回答失败:', error)
		uni.showToast({
			title: '提交失败',
			icon: 'none'
		})
	} finally {
		isSubmitting.value = false
	}
}

// 点赞回答
async function likeAnswer(answer: Answer) {
	try {
		const result = await api.likeAnswer(answer.id)
		if (result) {
			// 更新点赞数量和状态
			answer.likes = result.likes
			answer.isLiked = result.isLiked
			
			uni.showToast({
				title: answer.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none',
				duration: 1000
			})
			
			// 触发问答列表刷新事件
			try {
				uni.$emit('qa:refresh')
			} catch (e) {}
		}
	} catch (error) {
		console.error('点赞操作失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 关注/取消关注问题
async function followQuestion() {
	try {
		const result = await api.followQuestion(qa.id)
		if (result) {
			// 更新关注数量和状态
			qa.followCount = result.followCount
			qa.isFollowed = result.isFollowed
			
			uni.showToast({
				title: qa.isFollowed ? '已关注' : '已取消关注',
				icon: 'none',
				duration: 1000
			})
			
			// 触发问答列表刷新事件
			try {
				uni.$emit('qa:refresh')
			} catch (e) {}
		}
	} catch (error) {
		console.error('关注操作失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 加载评论列表
// 加载回答的评论
async function loadAnswerComments(answerId: string) {
	try {
		const data = await api.getAnswerComments(answerId)
		console.log('加载评论数据:', data)
		const answer = qa.answers.find(a => a.id === answerId)
		if (answer) {
			answer.comments = data.map((comment: any, index: number) => ({
				...comment,
				time: formatCommentTime(comment.createdAt),
				replies: [],
				replyCount: comment.replyCount || (index % 2 === 0 ? 5 : 0), // 临时测试：偶数索引的评论有5条回复
				showReplies: false,
				expandedReplies: 0
			}))
			console.log('更新后的回答评论:', answer.comments)
		}
	} catch (error) {
		console.error('加载评论失败:', error)
	}
}

// 格式化评论时间
function formatCommentTime(createdAt: string) {
	const created = new Date(createdAt)
	const now = new Date()
	const timeDiff = now.getTime() - created.getTime()
	const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
	
	if (daysDiff === 0) {
		// 今天
		const hours = created.getHours().toString().padStart(2, '0')
		const minutes = created.getMinutes().toString().padStart(2, '0')
		return `今天 ${hours}:${minutes}`
	} else if (daysDiff === 1) {
		// 昨天
		const hours = created.getHours().toString().padStart(2, '0')
		const minutes = created.getMinutes().toString().padStart(2, '0')
		return `昨天 ${hours}:${minutes}`
	} else if (daysDiff < 7) {
		// 一周内
		const hours = created.getHours().toString().padStart(2, '0')
		const minutes = created.getMinutes().toString().padStart(2, '0')
		return `${daysDiff}天前 ${hours}:${minutes}`
	} else {
		// 超过一周
		const month = created.getMonth() + 1
		const date = created.getDate()
		const hours = created.getHours().toString().padStart(2, '0')
		const minutes = created.getMinutes().toString().padStart(2, '0')
		return `${month}/${date} ${hours}:${minutes}`
	}
}

// 开始回复评论
function startReply(comment: Comment, answer: Answer) {
	replyingToComment.value = comment
	replyingToAnswer.value = answer
	replyingToAnswerDirect.value = null
	currentAnswer.value = ''
}

// 开始回复回答
function startReplyToAnswer(answer: Answer) {
	replyingToAnswerDirect.value = answer
	replyingToComment.value = null
	replyingToAnswer.value = null
	currentAnswer.value = ''
}

// 取消回复（点击输入框外部时调用）
function cancelReply() {
	replyingToComment.value = null
	replyingToAnswer.value = null
	replyingToAnswerDirect.value = null
	currentAnswer.value = ''
	
	// 失焦输入框以隐藏键盘
	if (inputRef.value) {
		inputRef.value.blur()
	}
}

// 提交回复
async function submitReply() {
	if (!currentAnswer.value.trim()) {
		uni.showToast({
			title: '请输入回复内容',
			icon: 'none'
		})
		return
	}
	
	if (!replyingToComment.value || !replyingToAnswer.value) return
	
	if (isSubmitting.value) return
	
	try {
		isSubmitting.value = true
		
        const result = await api.createAnswerComment(replyingToAnswer.value.id, {
            content: currentAnswer.value.trim(),
            petId: currentUserPet.value?.id || null,
            replyToCommentId: replyingToComment.value?.id || null
        })
		
		// 添加到该回答的评论列表
        replyingToAnswer.value.comments.unshift({
			...result,
			time: formatCommentTime(result.createdAt)
		})
		// 提交后自动展开并确保新评论可见
		replyingToAnswer.value.showComments = true
		replyingToAnswer.value.expandedComments = Math.min(
			replyingToAnswer.value.comments.length,
			Math.max(replyingToAnswer.value.expandedComments + 1, 3)
		)
		
		// 清空回复状态
		replyingToComment.value = null
		replyingToAnswer.value = null
		currentAnswer.value = ''
		
		uni.showToast({
			title: '回复成功',
			icon: 'success'
		})
	} catch (error) {
		console.error('提交回复失败:', error)
		uni.showToast({
			title: '回复失败',
			icon: 'none'
		})
	} finally {
		isSubmitting.value = false
	}
}

// 提交对回答的回复
async function submitReplyToAnswer() {
	if (!currentAnswer.value.trim()) {
		uni.showToast({
			title: '请输入回复内容',
			icon: 'none'
		})
		return
	}
	
	if (!replyingToAnswerDirect.value) return
	
	if (isSubmitting.value) return
	
	try {
		isSubmitting.value = true
		
		const result = await api.createAnswerComment(replyingToAnswerDirect.value.id, {
			content: currentAnswer.value.trim(),
			petId: currentUserPet.value?.id || null
		})
		
		// 添加到该回答的评论列表
		replyingToAnswerDirect.value.comments.unshift({
			...result,
			time: formatCommentTime(result.createdAt)
		})
		// 提交后自动展开并确保新评论可见
		replyingToAnswerDirect.value.showComments = true
		replyingToAnswerDirect.value.expandedComments = Math.min(
			replyingToAnswerDirect.value.comments.length,
			Math.max(replyingToAnswerDirect.value.expandedComments + 1, 3)
		)
		
		// 清空回复状态
		replyingToAnswerDirect.value = null
		currentAnswer.value = ''
		
		uni.showToast({
			title: '回复成功',
			icon: 'success'
		})
	} catch (error) {
		console.error('提交回复失败:', error)
		uni.showToast({
			title: '回复失败',
			icon: 'none'
		})
	} finally {
		isSubmitting.value = false
	}
}


// 点赞评论
async function likeComment(comment: Comment) {
	try {
		const result = await api.likeAnswerComment(comment.id)
		if (result) {
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

// 删除自己的评论
async function confirmDeleteAnswerComment(answer: Answer, comment: Comment) {
	try {
		await new Promise((resolve, reject) => {
			uni.showModal({
				title: '删除确认',
				content: '确定要删除这条评论吗？',
				confirmText: '删除',
				confirmColor: '#e64340',
				success: async (res) => {
					if (res.confirm) {
						try {
							await api.deleteAnswerComment(comment.id)
							const idx = answer.comments.findIndex(c => c.id === comment.id)
							if (idx !== -1) {
								answer.comments.splice(idx, 1)
								if (answer.expandedComments > answer.comments.length) {
									answer.expandedComments = answer.comments.length
								}
							}
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

// 删除自己的回答
async function confirmDeleteAnswer(answer: Answer) {
	try {
		await new Promise((resolve, reject) => {
			uni.showModal({
				title: '删除确认',
				content: '确定要删除这条回答吗？',
				confirmText: '删除',
				confirmColor: '#e64340',
				success: async (res) => {
					if (res.confirm) {
						try {
							await api.deleteAnswer(answer.id)
							const idx = qa.answers.findIndex(a => a.id === answer.id)
							if (idx !== -1) {
								qa.answers.splice(idx, 1)
							}
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

// 切换回复展开/收起
function toggleReplies(comment: Comment) {
    // 已移除：评论级别的展开逻辑不再使用
}

// 初始展开评论
function toggleAnswerComments(answer: Answer) {
	answer.showComments = true
	answer.expandedComments = Math.min(3, answer.comments.length) // 初始展开3条
}

// 展开更多评论
function expandMoreComments(answer: Answer) {
	answer.expandedComments = Math.min(answer.expandedComments + 10, answer.comments.length)
}

// 收起所有评论
function collapseComments(answer: Answer) {
	answer.showComments = false
	answer.expandedComments = 0
}

// 加载评论的回复
async function loadCommentReplies(comment: Comment) {
    // 已移除：不再加载评论内的回复
}


// 接收列表页传值
try {
	const ec = getCurrentPages().pop()?.getOpenerEventChannel?.()
	ec && ec.on('qa', (data: Partial<QA>) => {
		// 只设置基本信息，不设置统计数据
		Object.assign(qa, {
			id: data.id,
			title: data.title,
			content: data.content,
			isUrgent: data.isUrgent,
			user: data.user,
			pet: data.pet
		})
		// 如果有ID，加载详情（这会获取最新的统计数据）
		if (data.id) {
			loadQuestionDetail(data.id)
		}
	})
} catch (e) { }

// 设置顶部导航标题与背景色
onLoad(() => {
	try {
		uni.setNavigationBarTitle({ title: '问答详情' })
		uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
	} catch (e) { }
})
</script>

<style scoped>
.page {
    padding: 28rpx 30rpx;
    /* 动态计算顶部间距，避免真机调试时env不生效 */
    min-height: 100vh;
    background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
    padding-bottom: 36rpx; /* 具体高度由占位视图控制 */
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

.qa-card {
	position: relative;
	background: #fff;
	border-radius: 20rpx;
	border: 4rpx solid #2c2c2c;
	padding: 22rpx 24rpx;
	box-shadow: 0 6rpx 0 #2c2c2c;
	width: 100%;
	max-width: 624rpx;
}

/* 左右缺口，和虚线对齐 */
.qa-card::before,
.qa-card::after {
	content: '';
	position: absolute;
	top: 116rpx;
	width: 26rpx;
	height: 26rpx;
	background: #2c2c2c;
	border-radius: 50%;
	box-shadow: 0 0 0 8rpx #fff;
}

.qa-card::before {
	left: -13rpx;
}

.qa-card::after {
	right: -13rpx;
}

.qa-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.urgent-tag {
	width: 34rpx;
	height: 34rpx;
	background: #ff6b35;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.urgent-text {
	color: #fff;
	font-weight: 700;
	font-size: 22rpx;
}

.qa-title {
	flex: 1;
	font-size: 34rpx;
	font-weight: 700;
	color: #2c2c2c;
	padding: 12rpx 8rpx 10rpx 0;
}

.follow-btn {
	background: #fff;
	border: 2rpx solid #2c2c2c;
	border-radius: 999rpx;
	padding: 6rpx 12rpx;
	font-size: 24rpx;
	color: #2c2c2c;
	transition: all 0.3s ease;
}

.follow-btn.followed {
	background: #2c2c2c;
	color: #fff;
}

.qa-divider {
	height: 0;
	border-top: 6rpx dashed #2c2c2c;
	margin: 10rpx 0 8rpx;
}

.qa-desc {
	margin: 18rpx 10rpx 6rpx;
}

.qa-desc .p {
	display: block;
	color: #2c2c2c;
	font-size: 29rpx;
	line-height: 1.8;
}

/* 问答用户信息 */
.qa-user-info {
	display: flex;
	align-items: center;
	margin-top: 16rpx;
	gap: 12rpx;
}

.qa-user-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.qa-user-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c2c2c;
	flex: 1;
}

.qa-time {
	font-size: 24rpx;
	color: #999;
}

.answers-section {
	margin-top: 36rpx;
	position: relative;
	width: 100%;
	max-width: 704rpx;
}

.answers-card {
	position: relative;
}

.answers-card-bg {
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

.answers-card-bg.bg1 {
	top: -2rpx;
	transform: rotate(-2deg);
}

.answers-card-body {
	position: relative;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	padding: 20rpx;
	z-index: 1;
}

.answers-ribbon {
	position: absolute;
	left: 12rpx;
	top: -22rpx;
	background: #333;
	color: #fff;
	padding: 8rpx 16rpx;
	transform: rotate(-8deg);
	box-shadow: 0 6rpx 10rpx rgba(0, 0, 0, .15);
}

.answers-ribbon text {
	font-weight: 700;
	font-size: 24rpx;
}

.answer-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.answer-card {
	background: #fff;
	border: 2rpx solid #e9e9e9;
	border-radius: 16rpx;
	padding: 18rpx;
}

/* 回答的评论区域 */
.answer-comments {
	margin-top: 12rpx;
	padding-top: 12rpx;
}

/* 回答评论展开/收起按钮 */
.answer-reply-expand {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12rpx;
    padding: 8rpx 0;
    cursor: pointer;
}

/* 与圈子详情统一的展开/收起样式 */
.expand-buttons {
    display: flex;
    align-items: center;
    gap: 24rpx;
}

.expand-more-btn,
.collapse-btn {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.expand-text {
    font-size: 22rpx;
    color: #666;
    margin-right: 8rpx;
}

.expand-arrow {
    font-size: 20rpx;
    color: #666;
    transition: transform 0.3s ease;
}

/* 评论输入框 */
.comment-input {
	display: flex;
	align-items: center;
	margin-top: 20rpx;
	padding: 16rpx;
	background: #f8f8f8;
	border-radius: 12rpx;
}

.comment-input-field {
	flex: 1;
	height: 60rpx;
	padding: 0 16rpx;
	background: #fff;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.comment-submit-btn {
	width: 120rpx;
	height: 60rpx;
	margin-left: 16rpx;
	background: #4CAF50;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cancel-btn {
	width: 100rpx;
	height: 60rpx;
	background: #f5f5f5;
	color: #666;
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 16rpx;
}

.answer-card.empty {
	text-align: center;
	color: #aaa;
}

.empty-text {
	font-size: 26rpx;
}

.doctor-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 14rpx;
}

.avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
	background: #f5f5f5;
}

.d-meta {
	display: flex;
	flex-direction: column;
	margin-left: 14rpx;
}

.d-name {
	font-weight: 700;
	color: #2c2c2c;
	font-size: 28rpx;
}

.d-title {
	color: #777;
	font-size: 24rpx;
}

.answer-text {
	display: block;
	color: #333;
	font-size: 26rpx;
	line-height: 1.7;
}

.answer-actions {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-top: 8rpx;
	gap: 16rpx;
}

.answer-time {
	font-size: 22rpx;
	color: #999;
}

.answer-reply {
	font-size: 22rpx;
	color: #999;
	flex-shrink: 0;
}

.like-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 12rpx;
	background: #f5f5f5;
	border-radius: 20rpx;
	flex-shrink: 0;
	margin-left: auto;
}

.like-icon {
	width: 20rpx;
	height: 20rpx;
}

.like-count {
	font-size: 22rpx;
	color: #666;
}

/* 评论区 */
.comments-section {
	margin-top: 36rpx;
	position: relative;
	width: 100%;
	max-width: 704rpx;
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
	transform: rotate(-2deg);
}

.comments-card-body {
	position: relative;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	padding: 20rpx;
	z-index: 1;
}

.comments-ribbon {
	position: absolute;
	left: 12rpx;
	top: -22rpx;
	background: #333;
	color: #fff;
	padding: 8rpx 16rpx;
	transform: rotate(-8deg);
	box-shadow: 0 6rpx 10rpx rgba(0, 0, 0, .15);
}

.comments-ribbon text {
	font-weight: 700;
	font-size: 24rpx;
}

.comment-list {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.comment-item {
	background: #fff;
	border-radius: 16rpx;
	padding: 12rpx;
	margin-left: 20rpx;
}

.comment-item.empty {
	text-align: center;
	color: #aaa;
}

.comment-user {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 10rpx;
}

.c-avatar {
	width: 48rpx;
	height: 48rpx;
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
	margin-left: 8rpx;
}

.c-name {
	font-weight: 700;
	color: #2c2c2c;
	font-size: 24rpx;
}

.c-role {
	color: #777;
	font-size: 20rpx;
}

.c-text {
	display: block;
	color: #333;
	font-size: 26rpx;
	line-height: 1.7;
	margin-bottom: 10rpx;
}

.c-actions {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-top: 8rpx;
	gap: 16rpx;
}

.c-time {
	font-size: 22rpx;
	color: #999;
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
	flex-shrink: 0;
	margin-left: auto;
}

.c-like-icon {
	width: 20rpx;
	height: 20rpx;
}

.c-like-count {
	font-size: 22rpx;
	color: #666;
}

.c-delete-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	background: #f5f5f5;
	margin-left: 8rpx;
}

.delete-icon {
	width: 20rpx;
	height: 20rpx;
}

.answer-delete-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	background: #f5f5f5;
	margin-left: 8rpx;
}

/* 回复展开/收起按钮 */
.reply-expand {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-top: 12rpx;
	padding: 8rpx 0;
	cursor: pointer;
}

.expand-buttons {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.expand-more-btn,
.collapse-btn {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.expand-text {
	font-size: 22rpx;
    color: #666;
	margin-right: 8rpx;
}

.expand-arrow {
	font-size: 20rpx;
	color: #007AFF;
	transition: transform 0.3s ease;
}

.expand-arrow.expanded {
	transform: rotate(180deg);
}

/* 回复列表 */
.reply-list {
	margin-top: 16rpx;
	padding-left: 20rpx;
	border-left: 2rpx solid #f0f0f0;
}

.reply-item {
	background: #f8f8f8;
	border: 1rpx solid #e9e9e9;
	border-radius: 12rpx;
	padding: 16rpx;
	margin-bottom: 12rpx;
}

.reply-user {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.r-avatar {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	border: 1rpx solid #2c2c2c;
	background: #f5f5f5;
}

.r-info {
	flex: 1;
}

.r-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.r-column {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-left: 12rpx;
}

.r-name {
	font-weight: 600;
	color: #2c2c2c;
	font-size: 24rpx;
}

.r-role {
	color: #777;
	font-size: 20rpx;
}

.r-text {
	display: block;
	color: #333;
	font-size: 24rpx;
	line-height: 1.6;
	margin-bottom: 8rpx;
}

.r-actions {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 12rpx;
}

.r-time {
	font-size: 20rpx;
	color: #999;
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
	background: #f0f0f0;
	border-radius: 16rpx;
	flex-shrink: 0;
	margin-left: auto;
}

.r-like-icon {
	width: 16rpx;
	height: 16rpx;
}

.r-like-count {
	font-size: 20rpx;
	color: #666;
}


/* 底部输入条 */
.bottom-input-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 24rpx;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 4rpx solid #2c2c2c;
    z-index: 100;
}

.input-field {
	width: 100%;
	height: 60rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 999rpx;
	padding: 14rpx 22rpx;
	font-size: 26rpx;
	box-sizing: border-box;
}

/* 底部占位高度，与广场详情一致 */
.bottom-safe-spacer {
    height: calc(88rpx + env(safe-area-inset-bottom));
    height: calc(88rpx + constant(safe-area-inset-bottom));
}
</style>
