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
		<view class="answers-section">
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
								<view class="like-btn" @tap="likeAnswer(answer)">
									<image class="like-icon" :src="answer.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
									<text class="like-count">{{ answer.likes }}</text>
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

		<!-- 评论区 -->
		<view class="comments-section">
			<view class="comments-card">
				<view class="comments-card-bg bg1"></view>
				<view class="comments-card-body">
					<view class="comments-ribbon"><text>全部评论</text></view>
					<view class="comment-list">
						<view class="comment-item" v-for="comment in comments" :key="comment.id">
							<view class="comment-user">
								<image class="c-avatar" :src="comment.user.avatarUrl || '/static/logo.png'" mode="aspectFill" />
								<view class="c-info">
									<view class="c-row">
										<view class="c-column">
											<text class="c-name">{{ comment.user.nickname }}</text>
											<text class="c-role" v-if="comment.pet && comment.pet.name">{{ comment.pet.name }}｜{{ comment.pet.breed }}</text>
										</view>
									</view>
								</view>
							</view>
							<text class="c-text">{{ comment.content }}</text>
							<view class="c-actions">
								<text class="c-time">{{ comment.time }}</text>
								<view class="c-action-buttons">
									<text class="reply-btn" @tap="startReply(comment.id)">回复</text>
									<view class="c-like-btn" @tap="likeComment(comment)">
										<image class="c-like-icon" :src="comment.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
										<text class="c-like-count" v-if="comment.likes > 0">{{ comment.likes }}</text>
									</view>
								</view>
							</view>
							
							<!-- 回复列表 -->
							<view class="reply-list" v-if="comment.replies && comment.replies.length">
								<view class="reply-item" v-for="reply in comment.replies" :key="reply.id">
									<view class="reply-user">
										<image class="r-avatar" :src="reply.user.avatarUrl || '/static/logo.png'" mode="aspectFill" />
										<view class="r-info">
											<view class="r-row">
												<view class="r-column">
													<text class="r-name">{{ reply.user.nickname }}</text>
													<text class="r-role" v-if="reply.pet && reply.pet.name">{{ reply.pet.name }}｜{{ reply.pet.breed }}</text>
												</view>
											</view>
										</view>
									</view>
									<text class="r-text">{{ reply.content }}</text>
									<view class="r-actions">
										<text class="r-time">{{ reply.time }}</text>
										<view class="r-like-btn" @tap="likeReply(reply)">
											<image class="r-like-icon" :src="reply.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
											<text class="r-like-count" v-if="reply.likes > 0">{{ reply.likes }}</text>
										</view>
									</view>
								</view>
							</view>
							
							<!-- 回复输入框 -->
							<view class="reply-input" v-if="replyingToComment === comment.id">
								<input 
									class="reply-input-field" 
									v-model="currentReply"
									placeholder="输入你的回复" 
									:disabled="isSubmittingReply"
								/>
								<view class="reply-input-actions">
									<button class="reply-cancel-btn" @tap="cancelReply">取消</button>
									<button 
										class="reply-submit-btn" 
										@tap="submitReply(comment.id)"
										:disabled="isSubmittingReply || !currentReply.trim()"
									>
										{{ isSubmittingReply ? '提交中...' : '提交' }}
									</button>
								</view>
							</view>
						</view>
						
						<view class="comment-item empty" v-if="comments.length === 0">
							<text class="empty-text">暂时还没有评论，来抢第一个评论吧～</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 占位高度，避免内容被底部栏遮挡（与广场详情一致） -->
		<view class="bottom-safe-spacer"></view>

		<!-- 底部输入 -->
		<view class="bottom-input-bar">
			<view class="input-tabs">
				<view class="tab-item" :class="{ active: !showCommentInput }" @tap="showCommentInput = false">
					<text>回答</text>
				</view>
				<view class="tab-item" :class="{ active: showCommentInput }" @tap="showCommentInput = true">
					<text>评论</text>
				</view>
			</view>
			
			<view class="input-content" v-if="!showCommentInput">
				<input 
					class="input-field" 
					v-model="currentAnswer"
					placeholder="输入你的回答" 
					:disabled="isSubmitting"
				/>
				<button 
					class="submit-btn" 
					@tap="submitAnswer"
					:disabled="isSubmitting || !currentAnswer.trim()"
				>
					{{ isSubmitting ? '提交中...' : '提交' }}
				</button>
			</view>
			
			<view class="input-content" v-else>
				<input 
					class="input-field" 
					v-model="currentComment"
					placeholder="输入你的评论" 
					:disabled="isSubmittingComment"
				/>
				<button 
					class="submit-btn" 
					@tap="submitComment"
					:disabled="isSubmittingComment || !currentComment.trim()"
				>
					{{ isSubmittingComment ? '提交中...' : '提交' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
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
}

type Comment = {
	id: string
	content: string
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
	replies: Reply[]
}

type Reply = {
	id: string
	content: string
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
const showCommentInput = ref(false)

// 评论相关数据
const comments = ref<Comment[]>([])
const currentComment = ref('')
const currentReply = ref('')
const replyingToComment = ref<string | null>(null)
const isSubmittingComment = ref(false)
const isSubmittingReply = ref(false)
const currentUserPet = ref<any>(null)

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
				time: answerTime
			}
		})
		
		Object.assign(qa, {
			...data,
			time,
			answers: processedAnswers,
			readCount: data.views || 0  // 确保阅读数正确映射
		})
		
		// 加载评论
		await loadComments()
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
async function loadComments() {
	try {
		const data = await api.getComments(qa.id)
		comments.value = data.map((comment: any) => ({
			...comment,
			time: formatCommentTime(comment.createdAt)
		}))
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

// 提交评论
async function submitComment() {
	if (!currentComment.value.trim()) {
		uni.showToast({
			title: '请输入评论内容',
			icon: 'none'
		})
		return
	}
	
	if (isSubmittingComment.value) return
	
	try {
		isSubmittingComment.value = true
		
		const result = await api.createComment(qa.id, {
			content: currentComment.value.trim(),
			petId: currentUserPet.value?.id || null
		})
		
		// 添加到评论列表
		comments.value.push({
			...result,
			time: formatCommentTime(result.createdAt)
		})
		
		currentComment.value = ''
		
		uni.showToast({
			title: '评论成功',
			icon: 'success'
		})
	} catch (error) {
		console.error('提交评论失败:', error)
		uni.showToast({
			title: '评论失败',
			icon: 'none'
		})
	} finally {
		isSubmittingComment.value = false
	}
}

// 提交回复
async function submitReply(commentId: string) {
	if (!currentReply.value.trim()) {
		uni.showToast({
			title: '请输入回复内容',
			icon: 'none'
		})
		return
	}
	
	if (isSubmittingReply.value) return
	
	try {
		isSubmittingReply.value = true
		
		const result = await api.createReply(commentId, {
			content: currentReply.value.trim(),
			petId: currentUserPet.value?.id || null
		})
		
		// 找到对应的评论并添加回复
		const commentIndex = comments.value.findIndex(c => c.id === commentId)
		if (commentIndex !== -1) {
			comments.value[commentIndex].replies.push({
				...result,
				time: formatCommentTime(result.createdAt)
			})
		}
		
		currentReply.value = ''
		replyingToComment.value = null
		
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
		isSubmittingReply.value = false
	}
}

// 点赞评论
async function likeComment(comment: Comment) {
	try {
		const result = await api.likeComment(comment.id)
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

// 点赞回复
async function likeReply(reply: Reply) {
	try {
		const result = await api.likeReply(reply.id)
		if (result) {
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

// 开始回复
function startReply(commentId: string) {
	replyingToComment.value = commentId
	currentReply.value = ''
}

// 取消回复
function cancelReply() {
	replyingToComment.value = null
	currentReply.value = ''
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
	justify-content: space-between;
	margin-top: 8rpx;
}

.answer-time {
	font-size: 22rpx;
	color: #999;
}

.like-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 12rpx;
	background: #f5f5f5;
	border-radius: 20rpx;
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
	gap: 16rpx;
}

.comment-item {
	background: #fff;
	border: 2rpx solid #e9e9e9;
	border-radius: 16rpx;
	padding: 18rpx;
}

.comment-item.empty {
	text-align: center;
	color: #aaa;
}

.comment-user {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 14rpx;
}

.c-avatar {
	width: 64rpx;
	height: 64rpx;
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
	margin-left: 14rpx;
}

.c-name {
	font-weight: 700;
	color: #2c2c2c;
	font-size: 28rpx;
}

.c-role {
	color: #777;
	font-size: 24rpx;
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
	justify-content: space-between;
	margin-top: 8rpx;
}

.c-time {
	font-size: 22rpx;
	color: #999;
}

.c-action-buttons {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.reply-btn {
	color: #666;
	font-size: 24rpx;
	padding: 4rpx 8rpx;
}

.c-like-btn {
	display: flex;
	align-items: center;
	gap: 6rpx;
	padding: 8rpx 12rpx;
	background: #f5f5f5;
	border-radius: 20rpx;
}

.c-like-icon {
	width: 20rpx;
	height: 20rpx;
}

.c-like-count {
	font-size: 22rpx;
	color: #666;
}

/* 回复列表 */
.reply-list {
	margin-top: 16rpx;
	padding-left: 76rpx; /* 与评论头像对齐 */
}

.reply-item {
	background: #f8f8f8;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
	padding: 16rpx;
	margin-bottom: 12rpx;
}

.reply-item:last-child {
	margin-bottom: 0;
}

.reply-user {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 10rpx;
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
	font-size: 22rpx;
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
	justify-content: space-between;
	margin-top: 6rpx;
}

.r-time {
	font-size: 20rpx;
	color: #999;
}

.r-like-btn {
	display: flex;
	align-items: center;
	gap: 4rpx;
	padding: 6rpx 10rpx;
	background: #f0f0f0;
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

/* 回复输入框 */
.reply-input {
	margin-top: 16rpx;
	padding: 16rpx;
	background: #f8f8f8;
	border: 2rpx solid #e0e0e0;
	border-radius: 12rpx;
}

.reply-input-field {
	width: 100%;
	height: 50rpx;
	background: #fff;
	border: 2rpx solid #2c2c2c;
	border-radius: 25rpx;
	padding: 0 16rpx;
	font-size: 24rpx;
	margin-bottom: 12rpx;
	box-sizing: border-box;
}

.reply-input-actions {
	display: flex;
	justify-content: flex-end;
	gap: 12rpx;
}

.reply-cancel-btn {
	background: #f5f5f5;
	color: #666;
	border: 2rpx solid #ddd;
	border-radius: 16rpx;
	padding: 8rpx 16rpx;
	font-size: 22rpx;
}

.reply-submit-btn {
	background: #2c2c2c;
	color: #fff;
	border: none;
	border-radius: 16rpx;
	padding: 8rpx 16rpx;
	font-size: 22rpx;
}

.reply-submit-btn:disabled {
	background: #ccc;
	color: #999;
}

/* 底部输入条 */
.bottom-input-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: env(safe-area-inset-bottom);
    bottom: calc(0rpx + env(safe-area-inset-bottom));
    padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 4rpx solid #2c2c2c;
    z-index: 100;
}

.input-tabs {
	display: flex;
	margin-bottom: 16rpx;
	gap: 8rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 12rpx;
	background: #f5f5f5;
	border: 2rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #666;
}

.tab-item.active {
	background: #2c2c2c;
	color: #fff;
	border-color: #2c2c2c;
}

.input-content {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
}

.input-field {
	display: block;
	width: 100%;
	max-width: 500rpx;
	height: 60rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 999rpx;
	padding: 14rpx 22rpx;
	font-size: 26rpx;
	box-sizing: border-box;
}

.submit-btn {
	background: #2c2c2c;
	color: #fff;
	border: none;
	border-radius: 20rpx;
	padding: 12rpx 24rpx;
	font-size: 24rpx;
	margin-left: 12rpx;
}

.submit-btn:disabled {
	background: #ccc;
	color: #999;
}

/* 底部占位高度，与广场详情一致 */
.bottom-safe-spacer {
    height: calc(88rpx + env(safe-area-inset-bottom));
    height: calc(88rpx + constant(safe-area-inset-bottom));
}
</style>
