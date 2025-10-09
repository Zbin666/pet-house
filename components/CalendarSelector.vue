<template>
    <view class="cal card">
        <view class="cal-header">
            <text class="cal-nav" @tap="changeMonth(-1)">←</text>
            <text class="cal-month">{{ year }}年{{ month + 1 }}月</text>
            <text class="cal-nav" @tap="changeMonth(1)">→</text>
        </view>
        <view class="cal-week">
            <text v-for="w in weeks" :key="w" class="w">{{ w }}</text>
        </view>
        <view class="cal-grid">
            <view v-for="(d, i) in days" :key="i"
                :class="['cell', d.inMonth ? 'in' : 'out', d.isToday ? 'today' : '', isSelected(d) ? 'selected' : '']"
                @tap="toggle(d)">
                <text class="num">{{ d.day }}</text>
                <image v-if="isSelected(d)" class="sel-icon" src="/static/record/isChoosed.png" mode="widthFix" />
            </view>
        </view>
        <!-- actions removed; handled by parent modal -->
    </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    start: { type: String, default: '2020-01-01' },
    end: { type: String, default: '2035-12-31' },
    multiple: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'save'])

const today = new Date()
const current = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const year = computed(() => current.value.getFullYear())
const month = computed(() => current.value.getMonth())

const weeks = ref(['一', '二', '三', '四', '五', '六', '日'])

const internal = ref(new Set(props.modelValue))
watch(() => props.modelValue, (val) => {
    internal.value = new Set(val || [])
})

const days = computed(() => {
    const y = year.value, m = month.value
    const first = new Date(y, m, 1)
    const startWeek = (first.getDay() + 6) % 7
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const daysPrevMonth = new Date(y, m, 0).getDate()
    const res = []
    for (let i = 0; i < 42; i++) {
        let day, inMonth
        if (i < startWeek) { day = daysPrevMonth - startWeek + i + 1; inMonth = false }
        else if (i < startWeek + daysInMonth) { day = i - startWeek + 1; inMonth = true }
        else { day = i - startWeek - daysInMonth + 1; inMonth = false }
        const isToday = inMonth && day === today.getDate() && m === today.getMonth() && y === today.getFullYear()
        res.push({ y, m, day, inMonth, isToday })
    }
    return res
})

function pad(n) { return String(n).padStart(2, '0') }
function keyFrom(d) { return `${d.y}-${pad(d.m + 1)}-${pad(d.day)}` }

function isSelected(d) { return d.inMonth && internal.value.has(keyFrom(d)) }

function toggle(d) {
    if (!d.inMonth) return
    const key = keyFrom(d)
    if (props.multiple) {
        if (internal.value.has(key)) internal.value.delete(key)
        else internal.value.add(key)
    } else {
        internal.value = new Set([key])
    }
    emit('update:modelValue', Array.from(internal.value))
}

function changeMonth(delta) {
    const y = current.value.getFullYear()
    const m = current.value.getMonth() + delta
    current.value = new Date(y, m, 1)
}

// save removed; parent controls
</script>

<style scoped>
.card {
    background: #fff;
    border-radius: 24rpx;
    border: 4rpx solid #2c2c2c;
    padding: 16rpx;
}

.cal-header {
    font-size: 34rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
}

.cal-nav {
    color: #555;
    font-weight: 700;
    padding: 0 8rpx;
}

.cal-month {
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
    color: #bbb;
    opacity: .6;
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

.num {
    font-size: 28rpx;
    color: inherit;
}

/* selected icon */
.sel-icon {
    position: absolute;
    top: 0rpx;
    width: 92rpx;
    height: 92rpx;
    z-index: 2;
}

.cell.selected .num {
    opacity: 0;
}

</style>
