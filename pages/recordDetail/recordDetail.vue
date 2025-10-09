<template>
	<view class="page">
		<!-- 轮播图容器 -->
		<view class="carousel-container">
			<swiper 
				class="record-swiper" 
				:current="currentIndex" 
				@change="onSwiperChange"
				:indicator-dots="false"
				:autoplay="false"
				:circular="true"
				:duration="300"
			>
				<swiper-item v-for="(record, index) in recordList" :key="index" class="swiper-item">
					<!-- 装饰图标 -->
					<image class="decor" :class="{ 'decor--dog-ccw': isDogTop(index) }" :src="getTopImage(index)"></image>
					
					<view class="sheet" :class="{ 'sheet--edit': editMode }">
						<view class="sheet-bg bg1"></view>
						<view class="sheet-body">
							<!-- 记录类型头部 -->
							<view class="header">
								<view class="type-info">
									<image class="type-icon" :src="record.type.icon" mode="aspectFit" />
									<view class="type-details">
										<text class="type-title">{{ record.type.title }}</text>
										<text class="record-time">{{ formatTime(record.data.time) }}</text>
									</view>
								</view>
								<view class="pet-info">
									<template v-if="!editMode">
										<image class="pet-avatar" :src="record.data.petAvatar" mode="aspectFill" />
										<text class="pet-name">{{ record.data.petName }}</text>
									</template>
									<view v-else class="pet-selector">
							<scroll-view class="pet-scroll" scroll-x="true" show-scrollbar="false">
								<view class="pet-option" 
									v-for="pet in petList" 
									:key="pet.id"
									:class="{ active: form.petId === pet.id }"
									@tap="selectPet(pet)"
								>
									<image class="pet-avatar" :src="pet.avatar" mode="aspectFill" />
									<text class="pet-name">{{ pet.name }}</text>
								</view>
							</scroll-view>
									</view>
								</view>
							</view>

							<view class="divider-h"></view>

							<!-- 记录内容 -->
							<view class="content-section">
								<!-- 饮食记录 -->
								<view v-if="record.type.key === 'eating'" class="form-section">
									<view class="form-row">
										<text class="label">食物类型：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.foodType || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.foodType" placeholder="如：猫粮、罐头" />
									</view>
									<view class="form-row">
										<text class="label">食物重量：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.weight ? record.data.weight + 'g' : '未填写' }}</text>
										</template>
										<view v-else class="input-group">
											<input class="input" type="number" v-model.number="form.weight" placeholder="重量" />
											<text class="unit">g</text>
										</view>
									</view>
									<view class="form-row">
										<text class="label">备注：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.note || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.note" placeholder="记录饮食情况..." />
									</view>
								</view>

								<!-- 饮水记录 -->
								<view v-else-if="record.type.key === 'drinking'" class="form-section">
									<view class="form-row">
										<text class="label">饮水量：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.amount ? record.data.amount + 'ml' : '未填写' }}</text>
										</template>
										<view v-else class="input-group">
											<input class="input" type="number" v-model.number="form.amount" placeholder="饮水量" />
											<text class="unit">ml</text>
										</view>
									</view>
									<view class="form-row">
										<text class="label">饮水方式：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.method || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.method" placeholder="如：水碗、自动饮水机" />
									</view>
									<view class="form-row">
										<text class="label">备注：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.note || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.note" placeholder="记录饮水情况..." />
									</view>
								</view>

								<!-- 体重记录 -->
								<view v-else-if="record.type.key === 'weight'" class="form-section">
									<view class="form-row">
										<text class="label">体重：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.weight ? record.data.weight + 'kg' : '未填写' }}</text>
										</template>
										<view v-else class="input-group">
											<input class="input" type="number" step="0.1" v-model.number="form.weight" placeholder="体重" />
											<text class="unit">kg</text>
										</view>
									</view>
									<view class="form-row">
										<text class="label">测量方式：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.method || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.method" placeholder="如：电子秤、体重秤" />
									</view>
									<view class="form-row">
										<text class="label">备注：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.note || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.note" placeholder="记录体重变化..." />
									</view>
								</view>

								<!-- 洗护记录 -->
								<view v-else-if="record.type.key === 'washing'" class="form-section">
									<view class="form-row">
										<text class="label">洗护类型：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.washType || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.washType" placeholder="如：洗澡、梳毛、剪指甲" />
									</view>
									<view class="form-row">
										<text class="label">使用产品：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.product || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.product" placeholder="如：宠物专用洗发水" />
									</view>
									<view class="form-row">
										<text class="label">备注：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.note || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.note" placeholder="记录洗护情况..." />
									</view>
								</view>

								<!-- 便便记录 -->
								<view v-else-if="record.type.key === 'shit'" class="form-section">
									<view class="form-row">
										<text class="label">便便状态：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.status || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.status" placeholder="如：正常、偏软、偏硬" />
									</view>
									<view class="form-row">
										<text class="label">颜色：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.color || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.color" placeholder="如：棕色、黑色" />
									</view>
									<view class="form-row">
										<text class="label">备注：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.note || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.note" placeholder="记录便便情况..." />
									</view>
								</view>

								<!-- 记事记录 -->
								<view v-else-if="record.type.key === 'noting'" class="form-section">
									<view class="form-row">
										<text class="label">记事内容：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.content || '无内容' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.content" placeholder="记录今天发生的有趣事情..." />
									</view>
									<view class="form-row" v-if="record.data.photos && record.data.photos.length">
										<text class="label">相关照片：</text>
										<view class="photo-gallery">
											<image v-for="(photo, i) in record.data.photos" :key="i" class="photo" :src="photo" mode="aspectFill" />
										</view>
									</view>
								</view>

								<!-- 异常记录 -->
								<view v-else-if="record.type.key === 'abnormal'" class="form-section">
									<view class="form-row">
										<text class="label">异常类型：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.abnormalType || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.abnormalType" placeholder="如：食欲不振、呕吐、腹泻" />
									</view>
									<view class="form-row">
										<text class="label">严重程度：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.severity || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.severity" placeholder="如：轻微、中等、严重" />
									</view>
									<view class="form-row">
										<text class="label">详细描述：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.description || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.description" placeholder="详细描述异常情况..." />
									</view>
								</view>

								<!-- 用药记录 -->
								<view v-else-if="record.type.key === 'medicine'" class="form-section">
									<view class="form-row">
										<text class="label">药品名称：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.medicineName || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.medicineName" placeholder="如：驱虫药、维生素" />
									</view>
									<view class="form-row">
										<text class="label">用药剂量：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.dosage || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.dosage" placeholder="如：1片、5ml" />
									</view>
									<view class="form-row">
										<text class="label">用药时间：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.medicineTime || '未填写' }}</text>
										</template>
										<input v-else class="input" v-model="form.medicineTime" placeholder="如：饭后30分钟" />
									</view>
									<view class="form-row">
										<text class="label">备注：</text>
										<template v-if="!editMode">
											<text class="value">{{ record.data.note || '无' }}</text>
										</template>
										<textarea v-else class="textarea" v-model="form.note" placeholder="记录用药情况..." />
									</view>
								</view>
							</view>

							<!-- 操作按钮 -->
							<view class="action-row">
								<button v-if="!editMode" class="btn ghost with-icon" @tap="startEdit">
									<image class="btn-icon" src="/static/tarBar/index-active.png" mode="widthFix" />
									<text>编辑</text>
								</button>
								<view v-else class="edit-actions">
									<button class="btn ghost" @tap="cancelEdit">取消</button>
									<button class="btn" @tap="saveEdit">保存</button>
								</view>
								<button v-if="!editMode" class="btn delete-btn with-icon" @tap="deleteRecord">
									<image class="btn-icon" src="/static/user/delete.png" mode="widthFix" />
									<text>删除</text>
								</button>
							</view>
						</view>
					</view>
				</swiper-item>
			</swiper>
			
			<!-- 轮播指示器 -->
			<view class="carousel-indicators">
				<view 
					v-for="(record, index) in recordList" 
					:key="index" 
					:class="['indicator', { active: index === currentIndex }]"
					@tap="goToSlide(index)"
				></view>
			</view>
		</view>

		<!-- 浮动添加按钮 -->
		<view class="fab" @tap="showAddModal">
			<image class="fab-icon" src="/static/record/add.png" mode="widthFix" />
		</view>

		<!-- 底部装饰 -->
		<image class="bottom-cat" :class="{ 'bottom-cat--dog': isDogBottom(currentIndex) }" :src="getBottomImage(currentIndex)" mode="widthFix" />

		<!-- 添加记录弹窗 -->
		<view v-if="showModal" class="modal-overlay" @tap="hideAddModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-header">
					<text class="modal-title">添加{{ currentRecord.title }}记录</text>
					<view class="modal-close" @tap="hideAddModal">×</view>
				</view>
				<view class="modal-body">
					<!-- 宠物选择 -->
					<view class="form-row">
						<text class="label">选择宠物：</text>
						<view class="pet-selector-wrapper">
							<view class="pet-selector">
								<!-- 默认显示前两个宠物 -->
								<view v-for="(pet, index) in (showAllPets ? petList : petList.slice(0, 2))" :key="index" 
									:class="['pet-option', { selected: selectedPets.includes(index) }]"
									@tap="togglePet(index)">
									<image class="pet-avatar" :src="pet.avatar" mode="aspectFill" />
									<text class="pet-name">{{ pet.name }}</text>
									<view v-if="selectedPets.includes(index)" class="check-mark">✓</view>
								</view>
							</view>
							<!-- 展开/收起按钮 - 在宠物列表中间下方 -->
							<view v-if="petList.length > 2" class="expand-btn-container">
								<view class="expand-btn" @tap="toggleExpand">
									<text class="expand-arrow" :class="{ expanded: showAllPets }">▼</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 饮食记录表单 -->
					<view v-if="currentRecord.key === 'eating'" class="form-section">
						<view class="form-row">
							<text class="label">食物类型：</text>
							<input class="input" v-model="newRecord.foodType" placeholder="如：猫粮、罐头" />
						</view>
						<view class="form-row">
							<text class="label">食物重量：</text>
							<view class="input-group">
								<input class="input" type="number" v-model.number="newRecord.weight" placeholder="重量" />
								<text class="unit">g</text>
							</view>
						</view>
						<view class="form-row">
							<text class="label">备注：</text>
							<textarea class="textarea" v-model="newRecord.note" placeholder="记录饮食情况..." />
						</view>
					</view>

					<!-- 饮水记录表单 -->
					<view v-else-if="currentRecord.key === 'drinking'" class="form-section">
						<view class="form-row">
							<text class="label">饮水量：</text>
							<view class="input-group">
								<input class="input" type="number" v-model.number="newRecord.amount" placeholder="饮水量" />
								<text class="unit">ml</text>
							</view>
						</view>
						<view class="form-row">
							<text class="label">饮水方式：</text>
							<input class="input" v-model="newRecord.method" placeholder="如：水碗、自动饮水机" />
						</view>
						<view class="form-row">
							<text class="label">备注：</text>
							<textarea class="textarea" v-model="newRecord.note" placeholder="记录饮水情况..." />
						</view>
					</view>

					<!-- 体重记录表单 -->
					<view v-else-if="currentRecord.key === 'weight'" class="form-section">
						<view class="form-row">
							<text class="label">体重：</text>
							<view class="input-group">
								<input class="input" type="number" step="0.1" v-model.number="newRecord.weight" placeholder="体重" />
								<text class="unit">kg</text>
							</view>
						</view>
						<view class="form-row">
							<text class="label">测量方式：</text>
							<input class="input" v-model="newRecord.method" placeholder="如：电子秤、体重秤" />
						</view>
						<view class="form-row">
							<text class="label">备注：</text>
							<textarea class="textarea" v-model="newRecord.note" placeholder="记录体重变化..." />
						</view>
					</view>

					<!-- 洗护记录表单 -->
					<view v-else-if="currentRecord.key === 'washing'" class="form-section">
						<view class="form-row">
							<text class="label">洗护类型：</text>
							<input class="input" v-model="newRecord.washType" placeholder="如：洗澡、梳毛、剪指甲" />
						</view>
						<view class="form-row">
							<text class="label">使用产品：</text>
							<input class="input" v-model="newRecord.product" placeholder="如：宠物专用洗发水" />
						</view>
						<view class="form-row">
							<text class="label">备注：</text>
							<textarea class="textarea" v-model="newRecord.note" placeholder="记录洗护情况..." />
						</view>
					</view>

					<!-- 便便记录表单 -->
					<view v-else-if="currentRecord.key === 'shit'" class="form-section">
						<view class="form-row">
							<text class="label">便便状态：</text>
							<input class="input" v-model="newRecord.status" placeholder="如：正常、偏软、偏硬" />
						</view>
						<view class="form-row">
							<text class="label">颜色：</text>
							<input class="input" v-model="newRecord.color" placeholder="如：棕色、黑色" />
						</view>
						<view class="form-row">
							<text class="label">备注：</text>
							<textarea class="textarea" v-model="newRecord.note" placeholder="记录便便情况..." />
						</view>
					</view>

					<!-- 记事记录表单 -->
					<view v-else-if="currentRecord.key === 'noting'" class="form-section">
						<view class="form-row">
							<text class="label">记事内容：</text>
							<textarea class="textarea" v-model="newRecord.content" placeholder="记录今天发生的有趣事情..." />
						</view>
					</view>

					<!-- 异常记录表单 -->
					<view v-else-if="currentRecord.key === 'abnormal'" class="form-section">
						<view class="form-row">
							<text class="label">异常类型：</text>
							<input class="input" v-model="newRecord.abnormalType" placeholder="如：食欲不振、呕吐、腹泻" />
						</view>
						<view class="form-row">
							<text class="label">严重程度：</text>
							<input class="input" v-model="newRecord.severity" placeholder="如：轻微、中等、严重" />
						</view>
						<view class="form-row">
							<text class="label">详细描述：</text>
							<textarea class="textarea" v-model="newRecord.description" placeholder="详细描述异常情况..." />
						</view>
					</view>

					<!-- 用药记录表单 -->
					<view v-else-if="currentRecord.key === 'medicine'" class="form-section">
						<view class="form-row">
							<text class="label">药品名称：</text>
							<input class="input" v-model="newRecord.medicineName" placeholder="如：驱虫药、维生素" />
						</view>
						<view class="form-row">
							<text class="label">用药剂量：</text>
							<input class="input" v-model="newRecord.dosage" placeholder="如：1片、5ml" />
						</view>
						<view class="form-row">
							<text class="label">用药时间：</text>
							<input class="input" v-model="newRecord.medicineTime" placeholder="如：饭后30分钟" />
						</view>
						<view class="form-row">
							<text class="label">备注：</text>
							<textarea class="textarea" v-model="newRecord.note" placeholder="记录用药情况..." />
						</view>
					</view>

					<!-- 弹窗按钮 -->
					<view class="modal-actions">
						<button class="btn ghost" @tap="hideAddModal">取消</button>
						<button class="btn" @tap="saveNewRecord">保存</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 记录类型配置
const recordTypes = {
	eating: { key: 'eating', title: '饮食', icon: '/static/record/eating.png' },
	drinking: { key: 'drinking', title: '饮水', icon: '/static/record/drinking.png' },
	weight: { key: 'weight', title: '体重', icon: '/static/record/weight.png' },
	washing: { key: 'washing', title: '洗护', icon: '/static/record/washing.png' },
	shit: { key: 'shit', title: '便便', icon: '/static/record/shit.png' },
	noting: { key: 'noting', title: '记事', icon: '/static/record/noting.png' },
	abnormal: { key: 'abnormal', title: '异常', icon: '/static/record/abnormal.png' },
	medicine: { key: 'medicine', title: '用药', icon: '/static/record/medicine.png' }
}

// 当前记录类型
const currentRecord = ref({})
// 记录数据
const recordData = ref({})
// 编辑模式
const editMode = ref(false)
// 表单数据
const form = reactive({})
// 弹窗状态
const showModal = ref(false)
// 新记录数据
const newRecord = reactive({})
// 宠物列表
const petList = ref([
	{ id: 1, name: '火火', avatar: '/static/logo.png' },
	{ id: 2, name: '水水', avatar: '/static/logo.png' },
	{ id: 3, name: '土土', avatar: '/static/logo.png' }
])
const selectedPets = ref([])
// 展开状态
const showAllPets = ref(false)

// 轮播图相关
const currentIndex = ref(0)
const recordList = ref([])

// 图片配置
const imageConfig = [
	{ top: '/static/record/cat.png', bottom: '/static/record/gray-cat.png' },
	{ top: '/static/record/up-cat_2.png', bottom: '/static/record/bottom-cat_2.png' },
	{ top: '/static/record/up-dog_1.png', bottom: '/static/record/bottom-dog_1.png' }
]

// 获取顶部图片
function getTopImage(index) {
	const configIndex = index % imageConfig.length
	return imageConfig[configIndex].top
}

// 获取底部图片
function getBottomImage(index) {
	const configIndex = index % imageConfig.length
	return imageConfig[configIndex].bottom
}

function isDogBottom(index) {
	const configIndex = index % imageConfig.length
	return imageConfig[configIndex].bottom === '/static/record/bottom-dog_1.png'
}

function isDogTop(index) {
	const configIndex = index % imageConfig.length
	return imageConfig[configIndex].top === '/static/record/up-dog_1.png'
}

onLoad((query) => {
	uni.setNavigationBarTitle({ title: '记录详情' })
	uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
	
	// 初始化轮播图数据
	initRecordList(query)
})

// 初始化记录列表
function initRecordList(query) {
	// 根据传入的分类参数获取对应分类的记录
	const targetType = query.type || 'eating'
	
	// 模拟该分类的多条记录数据
	const getRecordsByType = (type) => {
		const baseTime = new Date()
		const records = []
		
		switch (type) {
			case 'eating':
				records.push(
					{
						type: recordTypes.eating,
						data: {
							time: baseTime,
							petName: '火火',
							petAvatar: '/static/logo.png',
							foodType: '猫粮',
							weight: 50,
							note: '今天食欲很好'
						}
					},
					{
						type: recordTypes.eating,
						data: {
							time: new Date(baseTime.getTime() - 24 * 60 * 60 * 1000),
							petName: '火火',
							petAvatar: '/static/logo.png',
							foodType: '罐头',
							weight: 80,
							note: '特别爱吃这个口味'
						}
					},
					{
						type: recordTypes.eating,
						data: {
							time: new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1000),
							petName: '水水',
							petAvatar: '/static/logo.png',
							foodType: '湿粮',
							weight: 60,
							note: '新尝试的湿粮'
						}
					}
				)
				break
			case 'drinking':
				records.push(
					{
						type: recordTypes.drinking,
						data: {
							time: baseTime,
							petName: '水水',
							petAvatar: '/static/logo.png',
							amount: 200,
							method: '水碗',
							note: '正常饮水'
						}
					},
					{
						type: recordTypes.drinking,
						data: {
							time: new Date(baseTime.getTime() - 24 * 60 * 60 * 1000),
							petName: '火火',
							petAvatar: '/static/logo.png',
							amount: 150,
							method: '自动饮水机',
							note: '喜欢流动的水'
						}
					}
				)
				break
			case 'weight':
				records.push(
					{
						type: recordTypes.weight,
						data: {
							time: baseTime,
							petName: '土土',
							petAvatar: '/static/logo.png',
							weight: 4.2,
							method: '电子秤',
							note: '体重稳定'
						}
					},
					{
						type: recordTypes.weight,
						data: {
							time: new Date(baseTime.getTime() - 7 * 24 * 60 * 60 * 1000),
							petName: '土土',
							petAvatar: '/static/logo.png',
							weight: 4.1,
							method: '电子秤',
							note: '略有增长'
						}
					}
				)
				break
			case 'washing':
				records.push(
					{
						type: recordTypes.washing,
						data: {
							time: baseTime,
							petName: '火火',
							petAvatar: '/static/logo.png',
							washType: '洗澡',
							product: '宠物专用洗发水',
							note: '洗得很干净'
						}
					},
					{
						type: recordTypes.washing,
						data: {
							time: new Date(baseTime.getTime() - 14 * 24 * 60 * 60 * 1000),
							petName: '水水',
							petAvatar: '/static/logo.png',
							washType: '梳毛',
							product: '宠物梳子',
							note: '梳理得很顺滑'
						}
					}
				)
				break
			case 'noting':
				records.push(
					{
						type: recordTypes.noting,
						data: {
							time: baseTime,
							petName: '水水',
							petAvatar: '/static/logo.png',
							content: '今天火火特别活泼，在客厅里跑来跑去，还学会了新的小把戏！',
							photos: ['/static/logo.png', '/static/logo.png']
						}
					},
					{
						type: recordTypes.noting,
						data: {
							time: new Date(baseTime.getTime() - 24 * 60 * 60 * 1000),
							petName: '土土',
							petAvatar: '/static/logo.png',
							content: '土土今天很安静，一直在窗边晒太阳，看起来很享受。',
							photos: ['/static/logo.png']
						}
					}
				)
				break
			default:
				// 默认显示饮食记录
				records.push({
					type: recordTypes.eating,
					data: {
						time: baseTime,
						petName: '火火',
						petAvatar: '/static/logo.png',
						foodType: '猫粮',
						weight: 50,
						note: '今天食欲很好'
					}
				})
		}
		
		return records
	}
	
	recordList.value = getRecordsByType(targetType)
	currentIndex.value = 0
	
	// 设置当前记录数据
	if (recordList.value.length > 0) {
		const currentRecordData = recordList.value[currentIndex.value]
		currentRecord.value = currentRecordData.type
		recordData.value = currentRecordData.data
	}
}

// 格式化时间
function formatTime(time) {
	const date = new Date(time)
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 轮播图事件处理
function onSwiperChange(e) {
	currentIndex.value = e.detail.current
	// 更新当前记录数据
	if (recordList.value.length > 0) {
		const currentRecordData = recordList.value[currentIndex.value]
		currentRecord.value = currentRecordData.type
		recordData.value = currentRecordData.data
	}
}

// 跳转到指定轮播项
function goToSlide(index) {
	currentIndex.value = index
	// 更新当前记录数据
	if (recordList.value.length > 0) {
		const currentRecordData = recordList.value[currentIndex.value]
		currentRecord.value = currentRecordData.type
		recordData.value = currentRecordData.data
	}
}

// 编辑功能
function startEdit() {
	editMode.value = true
	Object.assign(form, recordData.value)
	// 初始化宠物ID
	const currentPet = petList.value.find(pet => pet.name === recordData.value.petName)
	if (currentPet) {
		form.petId = currentPet.id
	}
}

function cancelEdit() {
	editMode.value = false
}

function selectPet(pet) {
	form.petId = pet.id
	form.petName = pet.name
	form.petAvatar = pet.avatar
}

function togglePetList() {
	showAllPets.value = !showAllPets.value
}

function saveEdit() {
	// 更新当前轮播项的数据
	if (recordList.value.length > 0) {
		Object.assign(recordList.value[currentIndex.value].data, form)
		recordData.value = recordList.value[currentIndex.value].data
	}
	editMode.value = false
	uni.showToast({
		title: '保存成功',
		icon: 'success'
	})
}

// 删除记录
function deleteRecord() {
	uni.showModal({
		title: '确认删除',
		content: `确定要删除这条${currentRecord.value.title}记录吗？`,
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4757',
		success: (res) => {
			if (res.confirm) {
				// 从轮播图中删除当前记录
				recordList.value.splice(currentIndex.value, 1)
				
				// 如果删除后没有记录了，返回上一页
				if (recordList.value.length === 0) {
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
					return
				}
				
				// 调整当前索引
				if (currentIndex.value >= recordList.value.length) {
					currentIndex.value = recordList.value.length - 1
				}
				
				// 更新当前记录数据
				const currentRecordData = recordList.value[currentIndex.value]
				currentRecord.value = currentRecordData.type
				recordData.value = currentRecordData.data
				
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				})
			}
		}
	})
}

// 宠物选择处理
function togglePet(index) {
	const petIndex = selectedPets.value.indexOf(index)
	if (petIndex > -1) {
		// 如果已选择，则取消选择
		selectedPets.value.splice(petIndex, 1)
	} else {
		// 如果未选择，则添加选择
		selectedPets.value.push(index)
	}
	// 更新新记录中的宠物信息
	newRecord.selectedPets = selectedPets.value.map(index => petList.value[index])
}

// 展开/收起宠物列表
function toggleExpand() {
	showAllPets.value = !showAllPets.value
}

// 显示添加弹窗
function showAddModal() {
	// 重置新记录数据
	Object.keys(newRecord).forEach(key => delete newRecord[key])
	// 重置选择状态
	selectedPets.value = []
	// 重置展开状态
	showAllPets.value = false
	showModal.value = true
}

// 隐藏添加弹窗
function hideAddModal() {
	showModal.value = false
}

// 保存新记录
function saveNewRecord() {
	// 这里可以添加保存逻辑，比如调用API
	uni.showToast({
		title: '记录已保存',
		icon: 'success'
	})
	hideAddModal()
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	padding: 24rpx;
	padding-top: calc(40rpx + env(safe-area-inset-top));
	padding-top: calc(40rpx + constant(safe-area-inset-top));
	background: linear-gradient(180deg, #fff1a8 0%, #fff3c9 32%, #fff7e3 68%, #fffaf1 100%);
	position: relative;
    overflow: hidden; /* 整页不滚动 */
}

/* 装饰图标 */
.decor {
	width: 200rpx;
	height: 200rpx;
	z-index: 10;
}

.decor--dog-ccw {
	top: -5rpx;
	left: 8nrpx;
	transform: rotate(-5deg);
	transform-origin: center center;
}

/* 轮播图容器 */
.carousel-container {
	width: 100%;
	height: calc(100vh - 120rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 20rpx 30rpx 0 30rpx;
	box-sizing: border-box;
}

.record-swiper {
	width: 100%;
	height: calc(100% - 80rpx);
}

.swiper-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 10rpx;
    box-sizing: border-box;
    overflow: visible; /* 外层不滚动不裁切 */
    position: relative;
}

.sheet {
	position: relative;
	width: 100%;
	max-width: 700rpx;
}

/* 编辑模式下限制卡片最大宽度，避免视觉跳变过宽 */
.sheet--edit {
    max-width: 590rpx; /* 可按需微调 580~620rpx */
}

.sheet-bg {
	position: absolute;
	left: 12rpx;
	right: 12rpx;
	height: 96%;
	border: 4rpx solid #2c2c2c;
	border-radius: 32rpx;
	background: #fff;
	z-index: 0;
	pointer-events: none;
}

.sheet-bg.bg1 {
	top: -4rpx;
	transform: rotate(-4.5deg);
}

.sheet-body {
	width: 100%;
	position: relative;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 32rpx;
	padding: 32rpx 28rpx 120rpx 28rpx;
	z-index: 1;
	min-height: 600rpx;
	box-sizing: border-box;
    overflow: visible; /* 内容不滚动 */
}

/* 轮播指示器 */
.carousel-indicators {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 16rpx;
	margin-top: 40rpx;
}

.indicator {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #ccc;
	transition: all 0.3s ease;
}

.indicator.active {
	background: #2c2c2c;
	transform: scale(1.2);
}

.header {
	margin-top: 15rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.type-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.type-icon {
	width: 60rpx;
	height: 60rpx;
}

.type-details {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.type-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.record-time {
	font-size: 24rpx;
	color: #666;
}

.pet-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.pet-avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
}

.pet-name {
	font-size: 28rpx;
	color: #2c2c2c;
}

.action-row {
	position: absolute;
	left: 28rpx;
	right: 28rpx;
	bottom: 28rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	z-index: 2;
}

.edit-actions {
	display: flex;
	justify-content: center;
	gap: 12rpx;
	width: 100%;
}

/* 宠物选择器 */
.pet-selector {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

/* 横向滚动容器：编辑状态使用 */
.pet-scroll {
	width: 100%;
	max-width: 400rpx;
	white-space: nowrap;
	overflow: hidden;
	padding-bottom: 4rpx;
}

.pet-scroll .pet-option {
	display: inline-flex !important;
	margin-right: 12rpx;
	width: 150rpx !important;
	min-width: 150rpx;
	flex-shrink: 0;
	padding: 8rpx 6rpx;
}

.pet-option {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12rpx 8rpx;
	border: 2rpx solid #ddd;
	border-radius: 12rpx;
	background: #f8f8f8;
	transition: all 0.3s ease;
	width: 100%;
	box-sizing: border-box;
}

.pet-option.active {
	border-color: #ffe046;
	background: #fff9e6;
}

.pet-option .pet-avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	margin-bottom: 8rpx;
}

.pet-option .pet-name {
	font-size: 24rpx;
	color: #333;
}


.btn {
	background: #ffe046;
	color: #1a1a1a;
	border: 4rpx solid #2c2c2c;
	border-radius: 999rpx;
	height: 72rpx;
	line-height: 72rpx;
	padding: 0 24rpx;
	font-weight: 700;
}

.btn.ghost {
	background: #fff;
}

.btn.with-icon {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 0 28rpx;
}

.btn-icon {
	width: 38rpx;
	height: 38rpx;
}

.btn.delete-btn {
	background: #fff;
	color: #ff4757;
	border: 4rpx solid #ff4757;
	border-radius: 999rpx;
	height: 72rpx;
	line-height: 72rpx;
	padding: 0 24rpx;
	font-weight: 700;
}

.divider-h {
	height: 2rpx;
	background: #e9e9e9;
	margin: 28rpx 0;
}

.content-section {
	margin-bottom: 40rpx;
}

.form-section {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

/* 所有记录类型表单间距 */
.form-section {
	margin-top: 40rpx;
}

.form-row {
	display: grid;
	grid-template-columns: 160rpx 1fr;
	align-items: start;
	column-gap: 12rpx;
}

.label {
	font-weight: 700;
	font-size: 30rpx;
	color: #2c2c2c;
}

.value {
	font-size: 30rpx;
	color: #666;
	word-break: break-all;
}

.input {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	padding: 10rpx 14rpx;
	font-size: 30rpx;
}

.input-group {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.unit {
	font-size: 28rpx;
	color: #666;
}

.textarea {
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	min-height: 120rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	padding: 12rpx 16rpx;
	background: #fff;
	font-size: 30rpx;
}

.photo-gallery {
	display: flex;
	gap: 12rpx;
	flex-wrap: wrap;
}

.photo {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	border: 4rpx solid #2c2c2c;
}

/* 浮动添加按钮 */
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

/* 底部灰猫装饰图 */
.bottom-cat {
    position: fixed;
    left: 50%;
    bottom: 16rpx;
    transform: translateX(-50%);
    width: 300rpx;
    z-index: 5;
    opacity: 0.9;
    pointer-events: none; /* 不阻挡点击 */
}

.bottom-cat.bottom-cat--dog {
    width: 220rpx;
}

/* 弹窗样式 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.modal-content {
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 24rpx;
	width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 28rpx;
	border-bottom: 4rpx solid #2c2c2c;
	background: #fff1a8;
}

.modal-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #2c2c2c;
}

.modal-close {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40rpx;
	color: #666;
	font-weight: 700;
}

.modal-body {
	padding: 28rpx;
}

.record-type-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
}

.record-type-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	padding: 24rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 20rpx;
	transition: all 0.2s ease;
}

.record-type-item:active {
	background: #f5f5f5;
	transform: scale(0.95);
}

.record-type-item .type-icon {
	width: 60rpx;
	height: 60rpx;
}

.record-type-item .type-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c2c2c;
}

/* 宠物选择器包装器 */
.pet-selector-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
}

/* 宠物选择器 */
.pet-selector {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
	justify-content: center;
}

.pet-option {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	padding: 16rpx;
	background: #fff;
	border: 4rpx solid #2c2c2c;
	border-radius: 16rpx;
	transition: all 0.2s ease;
	min-width: 100rpx;
}

.pet-option.selected {
	background: #fff1a8;
	border-color: #ffd54f;
}

.pet-option:active {
	transform: scale(0.95);
}

.pet-avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	border: 2rpx solid #2c2c2c;
}

.pet-name {
	font-size: 24rpx;
	color: #2c2c2c;
	font-weight: 600;
}

.check-mark {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 24rpx;
	height: 24rpx;
	background: #ff4757;
	color: #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16rpx;
	font-weight: bold;
}

/* 展开按钮容器 */
.expand-btn-container {
	display: flex;
	justify-content: center;
	margin-top: 12rpx;
}

/* 展开按钮 */
.expand-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40rpx;
	height: 40rpx;
	background: #f8f9fa;
	border: 2rpx solid #2c2c2c;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.expand-btn:active {
	transform: scale(0.95);
	background: #e9ecef;
}

.expand-arrow {
	font-size: 20rpx;
	color: #666;
	transition: transform 0.2s ease;
}

.expand-arrow.expanded {
	transform: rotate(180deg);
}

/* 弹窗按钮 */
.modal-actions {
	display: flex;
	gap: 28rpx;
	justify-content: center;
	margin-top: 32rpx;
	padding-top: 24rpx;
	border-top: 2rpx solid #e9e9e9;
}
	       
</style>
