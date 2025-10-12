<template>
	<view class="page" :style="dynamicTopPadding">
		<!-- 问题卡片 -->
		<view class="qa-card">
			<view class="qa-header">
				<view class="urgent-tag" v-if="qa.isUrgent"><text class="urgent-text">急</text></view>
				<text class="qa-title">{{ qa.title }}</text>
				<button class="follow-btn" type="default" size="mini">关注问题</button>
			</view>
			<view class="qa-divider"></view>
			<view class="qa-desc">
				<text class="p">{{ qa.content }}</text>
			</view>

			<view class="meta-row">
				<text class="meta">{{ qa.time }}</text>
				<text class="meta">{{ qa.answerCount }}个回答</text>
				<text class="meta">{{ qa.readCount }}个阅读</text>
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
									<text class="d-title" v-if="answer.pet">{{ answer.pet.name }}｜{{ answer.pet.breed }}</text>
									<text class="d-title" v-else>用户</text>
								</view>
								<view class="answer-actions">
									<view class="like-btn" @tap="likeAnswer(answer)">
										<image class="like-icon" :src="answer.isLiked ? '/static/community/good-active.png' : '/static/community/good.png'" mode="widthFix" />
										<text class="like-count">{{ answer.likes }}</text>
									</view>
									<text class="answer-time">{{ answer.time }}</text>
								</view>
							</view>
							<text class="answer-text">{{ answer.content }}</text>
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
		<view class="answer-input-bar">
			<input 
				class="answer-input" 
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
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/utils/api.js'

// 动态顶部内边距
const dynamicTopPadding = ref('')
onMounted(() => {
	try {
		const info = uni.getSystemInfoSync()
		const statusBar = info.statusBarHeight || 0
		const screenW = info.screenWidth || 375
		const rpxToPx = (rpx) => (rpx * screenW) / 750
		const topPx = 15
		dynamicTopPadding.value = `padding-top:${topPx}px;`
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
	time: '',
	user: {
		id: '',
		nickname: '',
		avatarUrl: ''
	},
	pet: null,
	answers: [],
	isOwner: false
})

const currentAnswer = ref('')
const isSubmitting = ref(false)

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
				const month = created.getUTCMonth() + 1
				const date = created.getUTCDate()
				const hours = created.getUTCHours().toString().padStart(2, '0')
				const minutes = created.getUTCMinutes().toString().padStart(2, '0')
				answerTime = `${month}/${date} ${hours}:${minutes}`
			}
			
			return {
				...answer,
				time: answerTime
			}
		})
		
		Object.assign(qa, {
			...data,
			time,
			answers: processedAnswers
		})
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
			content: currentAnswer.value.trim()
		})
		
		uni.showToast({
			title: '回答成功',
			icon: 'success'
		})
		
		// 清空输入框
		currentAnswer.value = ''
		
		// 重新加载问答详情
		await loadQuestionDetail(qa.id)
		
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
		}
	} catch (error) {
		console.error('点赞操作失败:', error)
		uni.showToast({
			title: '操作失败',
			icon: 'none'
		})
	}
}

// 接收列表页传值
try {
	const ec = getCurrentPages().pop()?.getOpenerEventChannel?.()
	ec && ec.on('qa', (data: Partial<QA>) => {
		Object.assign(qa, data)
		// 如果有ID，加载详情
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
	padding: 6rpx 16rpx;
	font-size: 24rpx;
}

.qa-divider {
	height: 0;
	border-top: 6rpx dashed #2c2c2c;
	margin: 10rpx 0 8rpx;
}

.qa-desc {
	margin: 8rpx 0 4rpx;
}

.qa-desc .p {
	display: block;
	color: #2c2c2c;
	font-size: 28rpx;
	line-height: 1.8;
}

.meta-row {
	display: flex;
	gap: 16rpx;
	color: #7a7a7a;
	font-size: 24rpx;
}

.meta {}

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
	top: -18rpx;
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
	margin-bottom: 10rpx;
	position: relative;
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
	position: absolute;
	right: 0;
	top: 0;
	display: flex;
	align-items: center;
	gap: 12rpx;
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

.answer-time {
	font-size: 22rpx;
	color: #999;
}

/* 底部输入条 */
.answer-input-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: env(safe-area-inset-bottom);
    bottom: calc(0rpx + env(safe-area-inset-bottom));
    padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 4rpx solid #2c2c2c;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    z-index: 100;
}

.answer-input {
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
