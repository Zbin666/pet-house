<template>
    <view class="page">
		<!-- top switch -->
		<view class="switch-row">
			<view :class="['switch-btn', activeTab === 'calendar' ? 'active yellow' : '']"
				@tap="activeTab = 'calendar'">
				<view class="dot left"></view>
				<text>记录</text>
				<view class="dot right"></view>
			</view>
			<view :class="['switch-btn', activeTab === 'stats' ? 'active yellow' : '']" @tap="activeTab = 'stats'">
				<view class="dot left"></view>
				<text>提醒</text>
				<view class="dot right"></view>
			</view>
		</view>

		<!-- connectors between switch dots and below section -->
		<view class="connectors">
			<image v-if="activeTab === 'calendar'" class="connector record" src="/static/record/connect.png"
				mode="widthFix" />
			<image v-else-if="activeTab === 'stats'" class="connector stats" src="/static/record/connect.png"
				mode="widthFix" />
		</view>

		<!-- calendar card (visible in both tabs) -->
		<view class="section card">
			<view class="card-dots">
				<view class="card-dot record-left"></view>
				<view class="card-dot record-right"></view>
				<view class="card-dot stats-left"></view>
				<view class="card-dot stats-right"></view>
			</view>
			<view class="cal-header">
				<text class="nav" @tap="changeMonth(-1)">←</text>
				<text class="month">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
				<text class="nav" @tap="changeMonth(1)">→</text>
			</view>
			<view class="cal-week">
				<text v-for="w in weeks" :key="w" class="w">{{ w }}</text>
			</view>
			<view class="cal-grid" v-if="!collapsed">
				<view v-for="(d, idx) in calendarDays" :key="idx"
					:class="['cell', d.inMonth ? 'in' : 'out', d.isToday ? 'today' : '', isSelected(d) ? 'selected' : '']"
					@tap="selectDay(d)">
					<image v-if="isSelected(d)" class="sel-icon" src="/static/record/isChoosed.png" mode="widthFix" />
					<text class="num">{{ d.day }}</text>
				</view>
			</view>
			<!-- week-only grid when collapsed -->
			<view class="cal-grid week" v-else>
				<view v-for="(d, idx) in weekDays" :key="'w' + idx"
					:class="['cell', d.inMonth ? 'in' : 'out', d.isToday ? 'today' : '', isSelected(d) ? 'selected' : '']"
					@tap="selectDay(d)">
					<image v-if="isSelected(d)" class="sel-icon" src="/static/record/isChoosed.png" mode="widthFix" />
					<text class="num">{{ d.day }}</text>
				</view>
			</view>
			<view class="collapse-row">
				<view class="collapse-btn" @tap="toggleCollapse">
					<image class="collapse-icon" :src="collapsed ? '/static/record/down.png' : '/static/record/up.png'"
						mode="widthFix" />
				</view>
			</view>
		</view>

		<!-- record options list -->
		<view v-if="activeTab === 'calendar'" class="section">
			<view class="action-list">
				<view class="action-item" v-for="opt in recordOptions" :key="opt.key"
					@tap="opt.hasValue ? null : goRecordDetail(opt.key)">
					<view class="left">
						<image class="icon" :src="opt.icon" mode="aspectFit" />
						<text class="title">{{ opt.title }}</text>
					</view>
					<view class="right">
						<view v-if="opt.hasValue" class="value-section">
							<input v-if="opt.key === 'drinking'" class="value-input" type="number" :value="opt.value"
								@input="setValue(opt.key, $event.detail.value)" />
							<input v-else-if="opt.key === 'weight'" class="value-input" type="number" step="0.1"
								:value="opt.value" @input="setValue(opt.key, $event.detail.value)" />
							<text class="unit">{{ opt.unit }}</text>
						</view>
						<text v-else class="arrow">›</text>
					</view>
				</view>
			</view>
		</view>

		<!-- legend (only for 提醒 tab) -->
        <view v-if="activeTab === 'stats'" class="legend">
			<view class="lg-item">
				<view class="lg-dot d1"></view><text>日常提醒</text>
			</view>
			<view class="lg-item">
				<view class="lg-dot d2"></view><text>洗护提醒</text>
			</view>
			<view class="lg-item">
                <view class="lg-dot d3"></view><text>疫苗提醒</text>
			</view>
			<view class="lg-item">
				<view class="lg-dot d4"></view><text>用药提醒</text>
			</view>
		</view>

		<!-- stats list -->
		<view v-if="activeTab === 'stats' && reminders.length" class="section">
			<view class="rem-list">
                <view v-for="r in reminders" :key="r.id" :class="['rem-item', { done: r.done, deleting: r.deleting }]"
					@longpress="startDelete(r.id)" @tap="handleItemTap(r.id)">
                    <view :class="['rem-color', r.typeClass]"></view>
					<view class="rem-content">
						<text class="rem-title">{{ r.title }}</text>
						<text class="rem-time">{{ r.time }}</text>
					</view>
					<view class="rem-check" :class="{ done: r.done }" @tap.stop="handleIconTap(r.id)">
						<image v-if="r.deleting" class="rem-check-icon" src="/static/user/delete.png"
							mode="scaleToFill" />
						<image v-else-if="r.done" class="rem-check-icon" src="/static/record/finished.png"
							mode="scaleToFill" />
					</view>
				</view>
			</view>
		</view>

		<!-- floating add button when there are reminders -->
		<view v-if="activeTab === 'stats' && reminders.length" class="fab" @tap="goCreate()">
			<image class="fab-icon" src="/static/record/add.png" mode="widthFix" />
		</view>

		<!-- stats empty -->
        <view v-else-if="activeTab === 'stats'" class="section empty" @tap="goCreate()">
            <image class="add-icon" src="/static/record/add.png" mode="widthFix" />
            <text class="empty-text">还没有提醒哦～ 点我去创建</text>
        </view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/utils/api.js'
import { onShow } from '@dcloudio/uni-app'

const activeTab = ref('calendar')
const weeks = ref(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
const current = ref(new Date())
const selected = ref({ y: current.value.getFullYear(), m: current.value.getMonth(), d: current.value.getDate() })
const collapsed = ref(true)

// 读取存储的 tab 参数
onMounted(() => {
    // 从存储中获取 tab 参数
    const storedTab = uni.getStorageSync('recordTab')
    
    if (storedTab === 'calendar' || storedTab === 'stats') {
        activeTab.value = storedTab
        // 清除存储的参数，避免下次进入时重复使用
        uni.removeStorageSync('recordTab')
    }
    fetchRemindersForSelectedDay()
})

// 返回本页时刷新（从新增提醒返回后会触发）
onShow(() => {
    const storedTab = uni.getStorageSync('recordTab')
    if (storedTab === 'calendar' || storedTab === 'stats') {
        activeTab.value = storedTab
        uni.removeStorageSync('recordTab')
    }
    fetchRemindersForSelectedDay()
})

const mockList = ref([
	{ id: '1', type: '喂食', time: '今天 08:00', desc: '鸡胸+猫粮 50g' },
	{ id: '2', type: '饮水', time: '今天 10:30', desc: '自动饮水机补水' }
])
const stats = ref({ feed: 9, clean: 3, weight: 4.2 })

// reminders from backend
const reminders = ref([])

const currentYear = computed(() => current.value.getFullYear())
const currentMonth = computed(() => current.value.getMonth())

const calendarDays = computed(() => {
	const year = currentYear.value
	const month = currentMonth.value
	const first = new Date(year, month, 1)
	// Monday-first: convert JS Sunday(0) to 6, others -1
	const startWeek = (first.getDay() + 6) % 7
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const daysPrevMonth = new Date(year, month, 0).getDate()
	const cells = []
	for (let i = 0; i < 42; i++) {
		let day, inMonth
		if (i < startWeek) {
			day = daysPrevMonth - startWeek + i + 1; inMonth = false
		} else if (i < startWeek + daysInMonth) {
			day = i - startWeek + 1; inMonth = true
		} else {
			day = i - startWeek - daysInMonth + 1; inMonth = false
		}
		const today = new Date()
		const isToday = inMonth && (day === today.getDate()) && (month === today.getMonth()) && (year === today.getFullYear())
		const hasRecord = inMonth && (day % 2 === 0)
		cells.push({ day, inMonth, isToday, hasRecord, y: year, m: month })
	}
	return cells
})

const weekDays = computed(() => {
	const days = calendarDays.value
	const idx = days.findIndex(d => d.inMonth && d.day === selected.value.d && d.m === selected.value.m && d.y === selected.value.y)
	const start = Math.max(0, Math.floor((idx >= 0 ? idx : 0) / 7) * 7)
	return days.slice(start, start + 7)
})

function goCreate() { uni.navigateTo({ url: '/pages/createRecord/createRecord' }) }

function goRecordDetail(type) {
	const y = selected.value.y
	const m = selected.value.m
	const d = selected.value.d
	const dayStart = new Date(y, m, d, 0, 0, 0)
	const dayEnd = new Date(y, m, d, 23, 59, 59, 999)
	const startDate = dayStart.toISOString()
	const endDate = dayEnd.toISOString()
	uni.navigateTo({ url: `/pages/recordDetail/recordDetail?type=${type}&startDate=${startDate}&endDate=${endDate}` })
}

const recordOptions = ref([
	{ key: 'eating', title: '饮食', icon: '/static/record/eating.png' },
	{ key: 'drinking', title: '饮水', icon: '/static/record/drinking.png', hasValue: true, value: 300, unit: 'ml' },
	{ key: 'weight', title: '体重', icon: '/static/record/weight.png', hasValue: true, value: 2.5, unit: 'kg' },
	{ key: 'washing', title: '洗护', icon: '/static/record/washing.png' },
	{ key: 'shit', title: '便便', icon: '/static/record/shit.png' },
	{ key: 'noting', title: '记事', icon: '/static/record/noting.png' },
	{ key: 'abnormal', title: '异常', icon: '/static/record/abnormal.png' },
	{ key: 'medicine', title: '用药', icon: '/static/record/medicine.png' }
])

function changeMonth(delta) {
	const y = current.value.getFullYear()
	const m = current.value.getMonth() + delta
	current.value = new Date(y, m, 1)
	// reset selection to first day of month when switching month
	selected.value = { y: current.value.getFullYear(), m: current.value.getMonth(), d: 1 }
}

function selectDay(d) {
	if (!d.inMonth) return
	selected.value = { y: currentYear.value, m: currentMonth.value, d: d.day }
    // refresh reminders for selected day
    fetchRemindersForSelectedDay()
}

function isSelected(d) {
	return d.inMonth && d.day === selected.value.d && d.m === selected.value.m && d.y === selected.value.y
}

function toggleCollapse() {
collapsed.value = !collapsed.value
}

// Fetch reminders for selected day
async function fetchRemindersForSelectedDay() {
    try {
        const y = selected.value.y
        const m = selected.value.m
        const d = selected.value.d
        const dayStart = new Date(y, m, d, 0, 0, 0).toISOString()
        const dayEnd = new Date(y, m, d, 23, 59, 59, 999).toISOString()
        const res = await api.getSubscriptions({ startDate: dayStart, endDate: dayEnd })
        const list = Array.isArray(res) ? res : (res.subscriptions || res.data || [])
        reminders.value = list.map(s => {
            // 优先使用数据库中的 content，如果没有则使用默认分类
            const title = s.content || (s.type === 'medicine' ? '用药提醒' : (s.type === 'vaccine' ? '疫苗提醒' : (s.type === 'wash' ? '洗护提醒' : '日常提醒')))
            // 映射颜色条样式类（与 legend 一致：d2=洗护, d3=疫苗）
            const typeClass = s.type === 'medicine' ? 't4' : (s.type === 'vaccine' ? 't3' : (s.type === 'wash' ? 't2' : 't1'))
            return {
                id: s.id,
                type: s.type,
                typeClass,
                title,
                time: (new Date(s.fireAt)).toTimeString().slice(0,5),
                done: s.state === 'done',
                deleting: false
            }
        })
    } catch (e) {
        reminders.value = []
    }
}




function toggleReminder(id) {
	const idx = reminders.value.findIndex(r => r.id === id)
	if (idx !== -1) {
		reminders.value[idx].done = !reminders.value[idx].done
	}
}

// 长按开始删除模式
function startDelete(id) {
	// 设置所有提醒项为删除状态
	reminders.value.forEach(r => r.deleting = true)
}

// 处理提醒项点击
function handleItemTap(id) {
	// 检查是否处于删除模式
	const isDeletingMode = reminders.value.some(r => r.deleting)
	
	if (isDeletingMode) {
		// 如果处于删除模式，点击任意地方退出删除模式
		reminders.value.forEach(r => r.deleting = false)
	} else {
		// 否则切换完成状态
		toggleReminder(id)
	}
}

// 处理图标点击
function handleIconTap(id) {
	const reminder = reminders.value.find(r => r.id === id)
	if (reminder && reminder.deleting) {
		// 如果当前是删除状态，点击删除图标执行删除
		deleteReminder(id)
	} else {
		// 否则切换完成状态
		toggleReminder(id)
	}
}

// 删除提醒
async function deleteReminder(id) {
    const reminder = reminders.value.find(r => r.id === id)
    if (!reminder) return
    
    uni.showModal({
        title: '确认删除',
        content: `确定要删除提醒"${reminder.title}"吗？`,
        confirmText: '删除',
        cancelText: '取消',
        confirmColor: '#ff4757',
        success: async (res) => {
            if (!res.confirm) {
                // 取消删除，重置所有删除状态
                reminders.value.forEach(r => r.deleting = false)
                return
            }
            try {
                await api.deleteSubscription(id)
                // 删除成功后刷新当日提醒列表
                await fetchRemindersForSelectedDay()
                // 通知其它页面刷新
                uni.$emit && uni.$emit('reminders:changed')
                uni.showToast({ title: '删除成功', icon: 'success' })
            } catch (e) {
                uni.showToast({ title: '删除失败', icon: 'none' })
            } finally {
                // 无论成功失败都退出删除模式
                reminders.value.forEach(r => r.deleting = false)
            }
        }
    })
}

function setValue(key, value) {
	const option = recordOptions.value.find(opt => opt.key === key)
	if (option && option.hasValue) {
		option.value = parseFloat(value) || 0
	}
}
</script>

<style scoped>
.page {
    padding: 24rpx;
    /* 顶部额外间距已移除，遵循原生导航栏 */
    min-height: 100vh;
    background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

/* switch */
.switch-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    padding: 0 8rpx;
    width: 100%;
    max-width: 704rpx;
    box-sizing: border-box;
}

.switch-btn {
	position: relative;
	width: 48%;
	height: 96rpx;
	border-radius: 999rpx;
	border: 4rpx solid #2c2c2c;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	box-shadow: 0 6rpx 0 rgba(0, 0, 0, 0.06) inset;
	transition: background 160ms ease, opacity 160ms ease, transform 160ms ease;
}

.switch-btn.yellow {
	background: #ffe46a;
}

.switch-btn:not(.active) {
	opacity: .75;
}

.switch-btn.active {
	opacity: 1;
	transform: translateY(-2rpx);
}

.switch-btn text {
	font-weight: 700;
	color: #1a1a1a;
	font-size: 32rpx;
}

.switch-btn .dot {
	position: absolute;
	width: 22rpx;
	height: 22rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 50%;
	background: #fff;
	top: 50%;
	transform: translateY(-50%);
}


.switch-btn .dot.left {
	left: 30rpx;
}

.switch-btn .dot.right {
	right: 23rpx;
	left: auto;
}

/* card dots */
.card-dots {
	position: relative;
	height: 0;
}

.card-dot {
	position: absolute;
	width: 22rpx;
	height: 22rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 50%;
	background: #fff;
	top: -9rpx;
}

.card-dot.record-left {
	left: 14rpx;
}

.card-dot.record-right {
	left: calc(24% + 112rpx);
}

.card-dot.stats-left {
	left: calc(52% + 30rpx);
}

.card-dot.stats-right {
	right: 6rpx;
	left: auto;
}

/* vertical connectors (yellow pillars) */
.connectors {
    position: relative;
    height: 0rpx;
    z-index: 3;
    width: 100%;
    max-width: 704rpx;
}

.connector {
	position: absolute;
	height: 32rpx;
	z-index: 3;
}

/* each image already contains two yellow pillars */
.connector.record {
	left: 20px;
	top: -35px;
	width: calc(24% + 104rpx);
}

.connector.stats {
	left: calc(52% + 32rpx);
	top: -35px;
	width: calc(48% - 65rpx);
}


/* card */
.card {
	background: #fff;
	border-radius: 24rpx;
	padding: 18rpx 24rpx 12rpx 24rpx;
	border: 4rpx solid #2c2c2c;
	position: relative;
	z-index: 1;
}

/* main sections width constraint */
.section {
    width: 100%;
    max-width: 704rpx;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
}

/* calendar */
.cal-header {
	font-size: 34rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 32rpx;
	margin-bottom: 16rpx;
}

.nav {
	color: #555;
	font-weight: 700;
	padding: 0 8rpx;
}

.month {
	font-weight: 700;
}

.cal-week {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	text-align: center;
	color: #b0b0b0;
	margin-bottom: 8rpx;
}

.w {
	padding: 8rpx 0;
}

.cal-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	grid-auto-rows: 88rpx;
	gap: 6rpx;
}

.cal-grid.week {
	grid-auto-rows: 88rpx;
}

.collapse-row {
	display: flex;
	justify-content: center;
	margin-top: 12rpx;
}

.collapse-btn {
	padding: 14rpx 32rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 999rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.collapse-icon {
	width: 40rpx;
	height: 40rpx;
	display: block;
}

.cell {
	position: relative;
	background: #fff;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cell.out {
	background: #fff;
	/* same as in-month */
	color: #bbb;
	/* light text */
	opacity: .6;
	/* overall lighter */
}

.cell.today .num {
	font-weight: 700;
}

.cell.selected {
	background: transparent;
	color: #1a1a1a;
	border: 4rpx solid #ffe68c;
	border-radius: 18rpx;
}

.cell.selected .num {
	margin-top: 18rpx;
}

.sel-icon {
	position: absolute;
	top: 0rpx;
	width: 85rpx;
	height: 85rpx;
}

.num {
	font-size: 28rpx;
	color: inherit;
}

.dot {
	position: absolute;
	left: 8rpx;
	bottom: 8rpx;
	width: 8rpx;
	height: 8rpx;
	border-radius: 50%;
	background: #ffb300;
}

/* legend */
.legend {
	display: flex;
	gap: 28rpx;
	justify-content: space-between;
	padding: 16rpx 8rpx;
	color: #1a1a1a;
}

.lg-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.lg-dot {
	width: 24rpx;
	height: 24rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 6rpx;
}

.lg-item text {
	font-size: 24rpx;
	white-space: nowrap;
}

.d1 {
	background: #fff3a6;
}

.d2 {
	background: #cfe8ff;
}

.d3 {
	background: #ffd6cc;
}

.d4 {
	background: #e0ccff;
}

/* reminders list */
.rem-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.rem-item {
	position: relative;
	display: flex;
	align-items: center;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	padding: 20rpx;
}

.rem-color {
	position: absolute;
	left: 10rpx;
	top: 10rpx;
	bottom: 10rpx;
	width: 14rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 10rpx;
}

.rem-color.t1 {
	background: #fff3a6;
}

.rem-color.t2 {
	background: #cfe8ff;
}

.rem-color.t3 {
	background: #ffd6cc;
}

.rem-color.t4 {
	background: #e0ccff;
}

.rem-content {
	margin-left: 28rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.rem-title {
	font-size: 30rpx;
	color: #1a1a1a;
}

.rem-time {
	font-size: 24rpx;
	color: #6b6b6b;
}

.rem-check {
    margin-left: auto;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
}

.rem-check-icon {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 50%;
}

.rem-item.done .rem-title {
	text-decoration: line-through;
	color: #8c8c8c;
}

.rem-item.deleting {
	animation: iosShake 0.45s ease-in-out infinite;
}

@keyframes iosShake {
	0% {
		transform: rotate(0deg);
	}
	25% {
		transform: rotate(-1deg);
	}
	50% {
		transform: rotate(0deg);
	}
	75% {
		transform: rotate(1deg);
	}
	100% {
		transform: rotate(0deg);
	}
}


/* empty */
.empty {
	height: 520rpx;
	background: #fffef0;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 20rpx;
}

.add-icon {
	width: 100rpx;
	height: 100rpx;
}

.empty-text {
	color: #666;
}

.btn {
	background-color: #ffd54f;
	color: #333;
}

/* floating add button */
.fab {
    position: fixed;
    right: -2rpx;
    bottom: 120rpx; 
    width: 120rpx;
    height: 60rpx;
    z-index: 10;
}

.fab-icon {
    width: 80%;
    height: 80%;
    transform: rotate(-30deg);
    transform-origin: center center;
}

/* record options */
.action-list {
	margin-top: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

/* small screens - ensure side gaps */
@media screen and (max-width: 600px) {
    .switch-row,
    .connectors,
    .section {
        width: calc(100vw - 24rpx);
        max-width: 704rpx;
    }
}

.action-item {
	height: 54rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 28rpx;
	padding: 28rpx 22rpx;
}

.action-item .left {
	display: flex;
	align-items: center;
	gap: 36rpx;
}

.action-item .icon {
	padding-left: 15rpx;
	width: 56rpx;
	height: 56rpx;
}

.action-item .title {
	font-size: 30rpx;
    color: #1a1a1a;
    font-weight: 580;
}

.action-item .arrow {
	font-size: 40rpx;
	color: #666;
	font-weight: 700;
}

.value-section {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.value-input {
	width: 80rpx;
	height: 40rpx;
	text-align: center;
	font-size: 28rpx;
	color: #1a1a1a;
	background: transparent;
}

.unit {
	font-size: 24rpx;
	color: #666;
}

.camera-icon {
	width: 44rpx;
	height: 44rpx;
}
</style>
