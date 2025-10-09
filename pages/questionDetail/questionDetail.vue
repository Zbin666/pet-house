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
				<text class="p">夏季来了，天气越来越炎热了</text>
				<text class="p">这个温度对狗狗来说太不友好啦</text>
				<text class="p">对家长们来说也是很大的挑战，夏天要注意什么呀？求助</text>
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
						<view class="answer-card" v-if="qa.hasAnswer">
							<view class="doctor-info">
								<image class="avatar" :src="qa.doctor?.avatar || '/static/logo.png'"
									mode="aspectFill" />
								<view class="d-meta">
									<text class="d-name">{{ qa.doctor?.name }}</text>
									<text class="d-title">{{ qa.doctor?.title }}</text>
								</view>
							</view>
							<text class="answer-text">{{ qa.answerPreview }}</text>
						<text class="answer-text">夏季遛狗建议选择清晨或傍晚，避开高温时段，尤其是正午前后。外出时尽量选择阴凉路线，避免长时间在柏油路或砂石地面停留，以免脚垫被灼伤。</text>
						<text class="answer-text">饮水要充足，随身携带便携式水壶与碗，少量多次补水。若出现剧烈喘息、步伐无力、流口水增多等中暑先兆，应立即转移到阴凉通风处，使用湿毛巾为颈部、腹部、四肢内侧物理降温，必要时尽快就医。</text>
						<text class="answer-text">饮食上可适当添加电解质与高水分食材，但要避免冰水与大量冷食，防止胃肠不适。长毛或双层被毛犬建议在专业人士指导下进行梳理与少量修剪，切勿“剃光”，以免失去对紫外线与温度变化的保护。</text>
						<text class="answer-text">居家环境保持通风与适宜温度，准备凉感垫、降温背心等辅助用品。频繁洗澡并不能降温，反而容易破坏皮脂屏障；每周1-2次即可，外出回家后清洁脚垫与腹部即可。</text>
						</view>
						<view class="answer-card empty" v-else>
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
			<input class="answer-input" placeholder="输入你的回答" />
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

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
type QA = {
	id: string
	title: string
	isUrgent: boolean
	hasAnswer: boolean
	doctor?: Doctor | null
	answerPreview: string | null
	answerCount: number
	readCount: number
	time: string
}

const qa = reactive<QA>({
	id: '',
	title: '问题标题',
	isUrgent: false,
	hasAnswer: false,
	doctor: null,
	answerPreview: '',
	answerCount: 0,
	readCount: 0,
	time: ''
})

// 接收列表页传值
try {
	const ec = getCurrentPages().pop()?.getOpenerEventChannel?.()
	ec && ec.on('qa', (data: Partial<QA>) => {
		Object.assign(qa, data)
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
    max-width: 640rpx;
    height: 60rpx; /* 输入框高度略增 */
    margin: 0 auto;
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
