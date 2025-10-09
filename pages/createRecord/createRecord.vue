<template>
    <view class="page">

        <view class="card textarea-card">
            <textarea class="textarea" v-model="content" placeholder="请输入内容" placeholder-class="ph" :maxlength="200" />
        </view>

        <picker :range="types" :value="typeIndex" @change="onTypeChange">
            <view class="card row">
                <text class="row-label">类型</text>
                <view class="row-right">
                    <text class="row-value">{{ currentType }}</text>
                    <text class="row-arrow">›</text>
                </view>
            </view>
        </picker>

        <view class="card row">
            <text class="row-label">日期</text>
            <view class="row-right">
                <text class="row-value">{{ dateDisplay }}</text>
                <text class="row-arrow">›</text>
            </view>
            <view class="tap-picker" @tap="openCalendar"></view>
        </view>

        <picker mode="time" :value="time" @change="onTimeChange">
            <view class="card row">
                <text class="row-label">时间</text>
                <view class="row-right">
                    <text class="row-value">{{ timeDisplay }}</text>
                    <text class="row-arrow">›</text>
                </view>
            </view>
        </picker>

        <!-- 日历弹窗 -->
        <view v-if="showCal" class="modal-mask" @tap="closeCalendar">
            <view class="modal-center" @tap.stop>
                <CalendarSelector v-model="tempDates" :multiple="false" />
                <view class="modal-actions">
                    <button class="btn ghost" @tap="closeCalendar">取消</button>
                    <button class="btn" @tap="confirmCalendar">保存</button>
                </view>
            </view>
        </view>



        <button class="save-btn" @tap="submit">保存</button>

        <!-- no visible native pickers; rows use full-area transparent pickers above -->
    </view>

</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import CalendarSelector from '@/components/CalendarSelector.vue'

const now = new Date()
const yyyy = now.getFullYear()
const mm = String(now.getMonth() + 1).padStart(2, '0')
const dd = String(now.getDate()).padStart(2, '0')
const hh = String(now.getHours()).padStart(2, '0')
const mi = String(now.getMinutes()).padStart(2, '0')

const content = ref('')
const types = ref(['日常提醒', '洗护提醒', '清洁提醒', '用药提醒'])
const typeIndex = ref(0)
const time = ref(`${hh}:${mi}`)
const selectedDates = ref([`${yyyy}-${mm}-${dd}`])
const showCal = ref(false)
const tempDates = ref([])

onLoad(() => {
    uni.setNavigationBarTitle({ title: '添加提醒' })
    uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
})

const currentType = computed(() => types.value[typeIndex.value])
const timeDisplay = computed(() => time.value)
const dateDisplay = computed(() => {
    if (!selectedDates.value || selectedDates.value.length === 0) return '请选择日期'
    if (selectedDates.value.length === 1) return selectedDates.value[0]
    return `${selectedDates.value[0]} 等${selectedDates.value.length}天`
})

function onTypeChange(e) { typeIndex.value = Number(e.detail?.value || 0) }
function onTimeChange(e) { time.value = e.detail.value }
function openCalendar() { tempDates.value = [...selectedDates.value]; showCal.value = true }
function closeCalendar() { showCal.value = false }
function confirmCalendar() { selectedDates.value = [...tempDates.value]; showCal.value = false }
function submit() {
    try {
        uni.setStorageSync('lastReminderDraft', {
            content: content.value,
            type: currentType.value,
            time: time.value,
            dates: selectedDates.value
        })
    } catch (e) { }
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => { uni.navigateBack() }, 300)
}
</script>

<style scoped>
.page {
    min-height: 100vh;
    padding: 24rpx;
    background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
}

.card {
    background: #fff;
    border-radius: 24rpx;
    border: 4rpx solid #2c2c2c;
    margin-bottom: 20rpx;
}

.textarea-card {
    padding: 28rpx 28rpx 28rpx 16rpx;
    font-size: 32rpx;
}

.textarea {
    width: 100%;
    min-height: 420rpx;
    font-size: 28rpx;
    color: #1a1a1a;
}

.ph {
    color: #bdbdbd;
}

.row {
    height: 112rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    position: relative;
}

.row-label {
    font-size: 28rpx;
    color: #1a1a1a;
}

.row-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.row-value {
    color: #3b3b3b;
    font-size: 28rpx;
}

.row-arrow {
    font-weight: 700;
    color: #2c2c2c;
}

.save-btn {
    margin-top: 30rpx;
    background: #ffe046;
    color: #1a1a1a;
    border: 4rpx solid #2c2c2c;
    border-radius: 999rpx;
    height: 100rpx;
    line-height: 100rpx;
    font-weight: 700;
}

/* full-row transparent pickers to capture taps */
.tap-picker {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    z-index: 10;
}

.tap-picker.half.left {
    right: 50%;
}

.tap-picker.half.right {
    left: 50%;
}

/* modal */
.modal-mask {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 999;
}

.modal-sheet {
    width: 92%;
    margin-bottom: 32rpx;
    background: transparent;
}

.modal-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 92%;
}

.modal-actions {
    margin-top: 16rpx;
    display: flex;
    gap: 16rpx;
    justify-content: flex-end;
}

.btn.ghost {
    background: #fff;
}
</style>
