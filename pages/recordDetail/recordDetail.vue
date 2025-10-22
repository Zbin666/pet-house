<template>
	<view class="page">
		<!-- 轮播图容器 -->
		<view class="carousel-container">
			<!-- 加载状态 -->
			<view v-if="isLoading" class="loading">
				<image class="loading-img" src="/static/record/nothing-cat.png" mode="widthFix" />
				<text class="loading-text">加载中...</text>
			</view>
			<!-- 有记录时显示轮播 -->
			<scroll-view v-else-if="recordList.length > 0" class="record-scroll" scroll-x="true" 
				:scroll-left="scrollLeft" @scroll="onScrollChange" 
				:style="{ height: swiperHeight + 'px' }" :scroll-with-animation="true">
				<view class="scroll-content" :style="{ '--item-count': recordList.length }">
					<view v-for="(record, index) in recordList" :key="index" class="scroll-item" :id="`slide-${index}`">
						<view class="slide-content">
							<!-- 顶部装饰区域 - 固定高度容器 -->
							<view class="top-decoration">
								<image class="decor" :class="{ 'decor--dog-ccw': isDogTop(index) }"
									:src="getTopImage(index)"></image>
							</view>

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
											<image class="pet-avatar" :src="getPetAvatarSrc(record.data.petAvatar)"
												mode="aspectFill" />
											<text class="pet-name">{{ record.data.petName }}</text>
										</template>
										<view v-else class="pet-selector">
											<scroll-view class="pet-scroll" scroll-x="true" show-scrollbar="false">
												<view class="pet-option" v-for="pet in petList" :key="pet.id"
													:class="{ active: form.petId === pet.id }" @tap="selectPet(pet)">
													<image class="pet-avatar"
														:src="getPetAvatarSrc(pet.avatarUrl || pet.avatar)"
														mode="aspectFill" />
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
												<text class="value">{{ record.data.weight ? record.data.weight + 'g' :
													'未填写'
													}}</text>
											</template>
											<view v-else class="input-group">
												<input class="input" type="number" v-model.number="form.weight"
													placeholder="重量" />
												<text class="unit">g</text>
											</view>
										</view>
										<view class="form-row">
											<text class="label">备注：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.note || '无' }}</text>
											</template>
											<textarea v-else class="textarea" v-model="form.note"
												placeholder="记录饮食情况..." />
										</view>
									</view>

									<!-- 饮水记录 -->
									<view v-else-if="record.type.key === 'drinking'" class="form-section">
										<view class="form-row">
											<text class="label">饮水量：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.amount ? record.data.amount + 'ml' :
													'未填写' }}</text>
											</template>
											<view v-else class="input-group">
												<input class="input" type="number" v-model.number="form.amount"
													placeholder="饮水量" />
												<text class="unit">ml</text>
											</view>
										</view>
										<view class="form-row">
											<text class="label">饮水方式：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.method || '未填写' }}</text>
											</template>
											<input v-else class="input" v-model="form.method"
												placeholder="如：水碗、自动饮水机" />
										</view>
										<view class="form-row">
											<text class="label">备注：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.note || '无' }}</text>
											</template>
											<textarea v-else class="textarea" v-model="form.note"
												placeholder="记录饮水情况..." />
										</view>
									</view>

									<!-- 体重记录 -->
									<view v-else-if="record.type.key === 'weight'" class="form-section">
										<view class="form-row">
											<text class="label">体重：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.weight ? record.data.weight + 'kg' :
													'未填写' }}</text>
											</template>
											<view v-else class="input-group">
												<input class="input" type="number" step="0.1"
													v-model.number="form.weight" placeholder="体重" />
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
											<textarea v-else class="textarea" v-model="form.note"
												placeholder="记录体重变化..." />
										</view>
									</view>

									<!-- 洗护记录 -->
									<view v-else-if="record.type.key === 'washing'" class="form-section">
										<view class="form-row">
											<text class="label">洗护类型：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.washType || '未填写' }}</text>
											</template>
											<input v-else class="input" v-model="form.washType"
												placeholder="如：洗澡、梳毛、剪指甲" />
										</view>
										<view class="form-row">
											<text class="label">使用产品：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.product || '未填写' }}</text>
											</template>
											<input v-else class="input" v-model="form.product"
												placeholder="如：宠物专用洗发水" />
										</view>
										<view class="form-row">
											<text class="label">备注：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.note || '无' }}</text>
											</template>
											<textarea v-else class="textarea" v-model="form.note"
												placeholder="记录洗护情况..." />
										</view>
									</view>

									<!-- 便便记录 -->
									<view v-else-if="record.type.key === 'shit'" class="form-section">
										<view class="form-row">
											<text class="label">便便状态：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.status || '未填写' }}</text>
											</template>
											<input v-else class="input" v-model="form.status"
												placeholder="如：正常、偏软、偏硬" />
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
											<textarea v-else class="textarea" v-model="form.note"
												placeholder="记录便便情况..." />
										</view>
									</view>

									<!-- 记事记录 -->
									<view v-else-if="record.type.key === 'noting'" class="form-section">
										<view class="form-row">
											<text class="label">记事内容：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.content || '无内容' }}</text>
											</template>
											<textarea v-else class="textarea" v-model="form.content"
												placeholder="记录今天发生的有趣事情..." />
										</view>
										<view class="form-row"
											v-if="editMode || (record.data.photos && record.data.photos.length)">
											<text class="label">相关照片：</text>
											<view v-if="!editMode" class="photo-gallery">
												<image v-for="(photo, i) in record.data.photos"
													:key="`photo-${i}-${photoUpdateTrigger}`" class="photo"
													:src="getPhotoSrc(photo)" mode="aspectFill"
													@tap="previewPhoto(record.data.photos, i)" />
											</view>
											<!-- 编辑模式：可删除/新增 -->
											<view v-else>
												<view class="photo-uploader">
													<view class="photo-thumb" v-for="(p, i) in (form.photos || [])"
														:key="`edit-photo-${i}-${photoUpdateTrigger}`"
														@tap="previewPhoto((form.photos || []), i)">
														<image class="photo-thumb-img" :src="getPhotoSrc(p)"
															mode="aspectFill" />
														<view class="photo-remove" @tap.stop="removeEditNotePhoto(i)">×
														</view>
													</view>
													<view class="photo-add" @tap="selectEditNotePhotos">
														<text>＋</text>
													</view>
												</view>
												<text class="uploader-hint">最多选择9张，开发环境会直接使用本地路径</text>
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
											<input v-else class="input" v-model="form.abnormalType"
												placeholder="如：食欲不振、呕吐、腹泻" />
										</view>
										<view class="form-row">
											<text class="label">严重程度：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.severity || '未填写' }}</text>
											</template>
											<input v-else class="input" v-model="form.severity"
												placeholder="如：轻微、中等、严重" />
										</view>
										<view class="form-row">
											<text class="label">详细描述：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.description || '无' }}</text>
											</template>
											<textarea v-else class="textarea" v-model="form.description"
												placeholder="详细描述异常情况..." />
										</view>
									</view>

									<!-- 用药记录 -->
									<view v-else-if="record.type.key === 'medicine'" class="form-section">
										<view class="form-row">
											<text class="label">药品名称：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.medicineName || '未填写' }}</text>
											</template>
											<input v-else class="input" v-model="form.medicineName"
												placeholder="如：驱虫药、维生素" />
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
											<input v-else class="input" v-model="form.medicineTime"
												placeholder="如：饭后30分钟" />
										</view>
										<view class="form-row">
											<text class="label">备注：</text>
											<template v-if="!editMode">
												<text class="value">{{ record.data.note || '无' }}</text>
											</template>
											<textarea v-else class="textarea" v-model="form.note"
												placeholder="记录用药情况..." />
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

							<!-- 底部装饰区域 - 固定高度容器（随轮播项滑动） -->
							<view class="bottom-decoration">
								<image class="bottom-decor" :class="{ 'bottom-decor--dog': isDogBottom(index) }"
									:src="getBottomImage(index)" mode="widthFix" />
							</view>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 轮播指示器 -->
			<view v-if="!isLoading && recordList.length > 0" class="carousel-indicators">
				<view v-for="(record, index) in recordList" :key="index"
					:class="['indicator', { active: index === currentIndex }]" @tap="goToSlide(index)"></view>
			</view>

			<!-- 空状态 -->
			<view v-else-if="!isLoading" class="empty">
				<image class="empty-img" src="/static/record/nothing-cat.png" mode="widthFix" />
				<text class="empty-text">这个类型还没有记录哦～</text>
			</view>
		</view>

		<!-- 浮动添加按钮 -->
		<view class="fab" @tap="showAddModal">
			<image class="fab-icon" src="/static/record/add.png" mode="widthFix" />
		</view>

		<!-- 添加记录弹窗 -->
		<view v-if="showModal" class="modal-overlay" @tap="hideAddModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-header">
					<text class="modal-title">添加{{ currentRecord.title }}记录</text>
					<view class="modal-close" @tap="hideAddModal">×</view>
				</view>
				<view class="modal-body">
					<!-- 宠物选择（横向滚动，与编辑模式一致） -->
					<view class="form-row">
						<text class="label">选择宠物：</text>
						<scroll-view class="pet-scroll" scroll-x="true" show-scrollbar="false">
							<view class="pet-option" v-for="(pet, index) in petList" :key="index"
								:class="{ selected: selectedPets.includes(index) }" @tap="togglePet(index)">
								<image class="pet-avatar" :src="getPetAvatarSrc(pet.avatarUrl || pet.avatar)"
									mode="aspectFill" />
								<text class="pet-name">{{ pet.name }}</text>
								<view v-if="selectedPets.includes(index)" class="check-mark">✓</view>
							</view>
						</scroll-view>
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
								<input class="input" type="number" v-model.number="newRecord.amount"
									placeholder="饮水量" />
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
								<input class="input" type="number" step="0.1" v-model.number="newRecord.weight"
									placeholder="体重" />
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
						<view class="form-row">
							<text class="label">添加图片：</text>
							<view>
								<view class="photo-uploader">
									<view class="photo-thumb" v-for="(p, i) in (newRecord.photos || [])"
										:key="`new-photo-${i}-${photoUpdateTrigger}`"
										@tap="previewPhoto((newRecord.photos || []), i)">
										<image class="photo-thumb-img" :src="getPhotoSrc(p)" mode="aspectFill" />
										<view class="photo-remove" @tap.stop="removeNotePhoto(i)">×</view>
									</view>
									<view class="photo-add" @tap="selectNotePhotos">
										<text>＋</text>
									</view>
								</view>
								<text class="uploader-hint">最多选择9张，开发环境会直接使用本地路径</text>
							</view>
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
import { ref, reactive, computed, onUnmounted } from 'vue'
import { uploadImages } from '@/utils/upload.js'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { api } from '@/utils/api.js'

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
// 进入页面的前端类型（eating/drinking/...），用于弹窗默认表单
const currentFrontType = ref('eating')
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
// 宠物列表（从后端加载）
const petList = ref([])
const selectedPets = ref([])
// 展开状态
const showAllPets = ref(false)

// 轮播图相关
const currentIndex = ref(0)
const recordList = ref([])
// 动态计算 swiper 高度，使页面整体可滚动
const swiperHeight = ref(0)
// 滚动位置控制
const scrollLeft = ref(0)
// 加载状态，避免闪烁
const isLoading = ref(true)

// 宠物头像缓存
const petAvatarCache = new Map()
// 照片缓存
const photoCache = new Map()
const photoUpdateTrigger = ref(0)

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

// 获取宠物头像源
function getPetAvatarSrc(url) {
	if (!url) {
		return '/static/index/add.png'
	}
	if (url.startsWith('/static/') || url.startsWith('wxfile://')) {
		return url
	}
	if (petAvatarCache.has(url)) {
		return petAvatarCache.get(url)
	}
	uni.downloadFile({
		url: url,
		success: (res) => {
			if (res.statusCode === 200 && res.tempFilePath) {
				petAvatarCache.set(url, res.tempFilePath)
				// 触发响应式更新
				recordList.value = [...recordList.value]
				petList.value = [...petList.value]
			} else {
				console.warn('宠物头像下载失败:', url, res.statusCode)
				petAvatarCache.set(url, '/static/index/add.png')
				recordList.value = [...recordList.value]
				petList.value = [...petList.value]
			}
		},
		fail: (err) => {
			console.error('宠物头像下载失败:', url, err)
			petAvatarCache.set(url, '/static/index/add.png')
			recordList.value = [...recordList.value]
			petList.value = [...petList.value]
		}
	})
	return '/static/index/add.png'
}

// 获取照片源
function getPhotoSrc(url) {
	if (!url) {
		return '/static/index/add.png'
	}

	// 本地路径直接返回
	if (url.startsWith('/static/') || url.startsWith('wxfile://')) {
		return url
	}

	// 检查缓存
	if (photoCache.has(url)) {
		return photoCache.get(url)
	}

	// URL 规范化
	let normalized = url
	if (normalized.startsWith('/uploads/')) {
		normalized = `https://pet-api.zbinli.cn${normalized}`
	}
	if (normalized.startsWith('http://pet-api.zbinli.cn')) {
		normalized = normalized.replace('http://pet-api.zbinli.cn', 'https://pet-api.zbinli.cn')
	}
	normalized = normalized.replace('://pet-api.zbinli.cn:80', '://pet-api.zbinli.cn')

	// 下载网络图片到本地
	uni.downloadFile({
		url: normalized,
		success: (res) => {
			if (res.statusCode === 200 && res.tempFilePath) {
				photoCache.set(url, res.tempFilePath)
				photoUpdateTrigger.value++
			} else {
				console.warn('照片下载失败:', url, res.statusCode)
				photoCache.set(url, '/static/index/add.png')
				photoUpdateTrigger.value++
			}
		},
		fail: (err) => {
			console.error('照片下载失败:', url, err)
			photoCache.set(url, '/static/index/add.png')
			photoUpdateTrigger.value++
		}
	})

	return '/static/index/add.png'
}

onLoad(async (query) => {
	uni.setNavigationBarTitle({ title: '记录详情' })
	uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#fff1a8' })
	// 加载宠物，再加载记录
	await loadPets()
	await initRecordList(query)
})

// 返回本页或从其他页面回到当前页时，自动刷新记录
onShow(async () => {
	// 清理宠物头像缓存，确保显示最新头像
	petAvatarCache.clear()
	// 清理照片缓存，确保显示最新照片
	photoCache.clear()
	// 只有在没有记录数据时才重新加载，避免闪烁
	if (recordList.value.length === 0) {
		const currentType = currentFrontType.value
		await initRecordList({ type: currentType }, false) // 不显示加载状态
	}
})

// 监听全局事件，兼容从其它页面新建记录的情况
const onRecordsChanged = async () => {
	// 使用当前记录的类型来刷新，而不是固定的 currentFrontType
	const currentType = recordList.value.length > 0 ? recordList.value[currentIndex.value]?.type?.key : currentFrontType.value
	await initRecordList({ type: currentType }, false) // 不显示加载状态
}
uni.$on && uni.$on('records:changed', onRecordsChanged)
onUnmounted(() => {
	uni.$off && uni.$off('records:changed', onRecordsChanged)
})

// 初始化记录列表
async function initRecordList(query, showLoading = true) {
	const targetType = query.type || 'eating'
	currentFrontType.value = targetType
	const typeMap = { eating: 'feed', drinking: 'water', weight: 'weight', washing: 'clean', noting: 'diary', shit: 'diary', abnormal: 'diary', medicine: 'medicine' }
	const backendType = typeMap[targetType] || 'diary'
	
	// 只在需要时设置加载状态
	if (showLoading) {
		isLoading.value = true
	}
	
	try {
		const params = { type: backendType, page: 1, limit: 20 }
		if (query.startDate && query.endDate) {
			params.startDate = query.startDate
			params.endDate = query.endDate
		}
		const res = await api.getRecords(params)
		const list = Array.isArray(res) ? res : (res.records || res.data || res.list || [])
		// 将后端数据映射为前端展示结构
		let mapped = list.map(r => {
			const pet = petList.value.find(p => p.id === r.petId)
			// 解析 payload：后端可能返回对象或字符串
			const rawPayload = r?.payload
			let payloadObj = {}
			if (rawPayload && typeof rawPayload === 'string') {
				try {
					payloadObj = JSON.parse(rawPayload)
				} catch (err) {
					console.warn('记录 payload 解析失败(字符串非 JSON):', r?.id, rawPayload)
					payloadObj = {}
				}
			} else if (rawPayload && typeof rawPayload === 'object') {
				payloadObj = rawPayload
			}
			const frontType = determineFrontType({ ...r, payload: payloadObj }, targetType)
			const typeConf = recordTypes[frontType] || recordTypes.noting
			return {
				id: r.id,
				type: typeConf,
				data: {
					time: r.time,
					petName: pet?.name || '',
					petAvatar: pet?.avatarUrl || '/static/index/add.png',
					// 透传后端 payload（已保证为对象）
					...payloadObj
				}
			}
		})
		// 当请求的是 diary（便便/异常/记事混合）时，仅保留当前前端类型的记录
		if (backendType === 'diary') {
			mapped = mapped.filter(item => item.type?.key === targetType)
		}
		recordList.value = mapped
		currentIndex.value = 0
		if (recordList.value.length > 0) {
			const currentRecordData = recordList.value[currentIndex.value]
			currentRecord.value = currentRecordData.type
			recordData.value = currentRecordData.data
		} else {
			// 无记录时，默认使用"饮食"类型，确保弹窗内有可填写表单
			currentRecord.value = recordTypes[currentFrontType.value] || recordTypes.eating
			recordData.value = {}
		}
		// 列表渲染后测量高度
		setTimeout(() => {
			measureCurrentSlideHeight()
		}, 100) // 增加延迟确保DOM完全渲染
	} catch (e) {
		console.warn('加载记录失败:', e)
		recordList.value = []
		// 出错也给一个默认类型，避免弹窗没有可选内容
		currentRecord.value = recordTypes[currentFrontType.value] || recordTypes.eating
		recordData.value = {}
	} finally {
		// 无论成功还是失败，都要结束加载状态
		if (showLoading) {
			isLoading.value = false
		}
	}
}

// 根据后端记录推断前端展示类型
function determineFrontType(r, fallbackFrontType) {
	// 后端使用统一的 diary 类型承载多个前端子类型
	if (r?.type === 'diary') {
		const p = r?.payload || {}
		if (p.status || p.color) return 'shit'
		if (p.abnormalType || p.severity) return 'abnormal'
		return 'noting'
	}
	// 其它类型做反向映射
	const reverse = {
		feed: 'eating',
		water: 'drinking',
		weight: 'weight',
		clean: 'washing',
		medicine: 'medicine'
	}
	return reverse[r?.type] || fallbackFrontType || 'noting'
}

async function loadPets() {
	try {
		const res = await api.getPets()
		const list = Array.isArray(res) ? res : (res.data || [])
		petList.value = list.map(p => ({ id: p.id, name: p.name, avatar: p.avatarUrl || '/static/index/add.png', avatarUrl: p.avatarUrl }))
	} catch (e) {
		petList.value = []
	}
}

// 格式化时间
function formatTime(time) {
	const date = new Date(time)
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 滚动视图事件处理 - 修复自动跳转问题
function onScrollChange(e) {
	const currentScrollLeft = e.detail.scrollLeft
	const itemWidth = 750 // 每个项目的宽度（rpx）
	
	// 计算当前应该显示的索引
	let newIndex = Math.round(currentScrollLeft / itemWidth)
	
	// 确保索引在有效范围内
	newIndex = Math.max(0, Math.min(newIndex, recordList.value.length - 1))
	
	
	// 只有索引真正改变时才更新，但不更新 scrollLeft 避免循环触发
	if (newIndex !== currentIndex.value) {
		currentIndex.value = newIndex
		
		// 更新当前记录数据
		if (recordList.value.length > 0) {
			const currentRecordData = recordList.value[currentIndex.value]
			currentRecord.value = currentRecordData.type
			recordData.value = currentRecordData.data
		}
		// 重新测量当前 slide 高度
		measureCurrentSlideHeight()
	}
}

// 跳转到指定轮播项
function goToSlide(index) {
	currentIndex.value = index
	scrollLeft.value = index * 750 // 设置滚动位置
	// 更新当前记录数据
	if (recordList.value.length > 0) {
		const currentRecordData = recordList.value[currentIndex.value]
		currentRecord.value = currentRecordData.type
		recordData.value = currentRecordData.data
	}
	// 重新测量当前 slide 高度
	measureCurrentSlideHeight()
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
	// 初始化记事图片数组，确保编辑态可显示"添加图片"
	if (!Array.isArray(form.photos)) {
		form.photos = Array.isArray(recordData.value.photos) ? [...recordData.value.photos] : []
	}
	// 重新测量高度，确保编辑模式下swiper能完整显示
	setTimeout(() => {
		measureCurrentSlideHeight()
	}, 100)
}

function cancelEdit() {
	editMode.value = false
	// 重新测量高度，确保退出编辑模式后swiper能完整显示
	setTimeout(() => {
		measureCurrentSlideHeight()
	}, 100)
}

function selectPet(pet) {
	form.petId = pet.id
	form.petName = pet.name
	form.petAvatar = pet.avatar
}

// 编辑模式：选择/删除记事图片
async function selectEditNotePhotos() {
	try {
		const chosen = await new Promise((resolve, reject) => {
			uni.chooseImage({ count: 9, sizeType: ['compressed'], success: resolve, fail: reject })
		})
		const tempPaths = chosen?.tempFilePaths || []
		const urls = await uploadImages(tempPaths)
		if (!form.photos) form.photos = []
		form.photos = [...form.photos, ...urls].slice(0, 9)
	} catch (e) {
		uni.showToast({ title: '选择图片失败', icon: 'none' })
	}
}

function removeEditNotePhoto(index) {
	if (!form.photos) return
	uni.showModal({
		title: '删除照片',
		content: '确定要删除这张照片吗？',
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4757',
		success: (res) => {
			if (res.confirm) {
				form.photos.splice(index, 1)
			}
		}
	})
}

function togglePetList() {
	showAllPets.value = !showAllPets.value
}

function saveEdit() {
	// 更新当前轮播项的数据并同步到后端
	if (recordList.value.length > 0) {
		Object.assign(recordList.value[currentIndex.value].data, form)
		recordData.value = recordList.value[currentIndex.value].data
		const current = recordList.value[currentIndex.value]
		// 仅当后端有记录ID时尝试更新
		if (current.id) {
			try {
				// 仅提交该类型相关的 payload 字段
				const key = current.type.key
				const payload = (() => {
					if (key === 'noting') return { content: recordData.value.content, photos: recordData.value.photos || [] }
					if (key === 'eating') return { foodType: recordData.value.foodType, weight: recordData.value.weight, note: recordData.value.note }
					if (key === 'drinking') return { amount: recordData.value.amount, method: recordData.value.method, note: recordData.value.note }
					if (key === 'weight') return { weight: recordData.value.weight, method: recordData.value.method, note: recordData.value.note }
					if (key === 'washing') return { washType: recordData.value.washType, product: recordData.value.product, note: recordData.value.note }
					if (key === 'shit') return { status: recordData.value.status, color: recordData.value.color, note: recordData.value.note }
					if (key === 'abnormal') return { abnormalType: recordData.value.abnormalType, severity: recordData.value.severity, description: recordData.value.description }
					if (key === 'medicine') return { medicineName: recordData.value.medicineName, dosage: recordData.value.dosage, medicineTime: recordData.value.medicineTime, note: recordData.value.note }
					return {}
				})()
				api.updateRecord(current.id, { payload })
			} catch (e) {
				// 忽略失败，前端仍保持编辑结果
			}
		}
	}
	editMode.value = false
	uni.showToast({ title: '保存成功', icon: 'success' })
}

// 删除记录
async function deleteRecord() {
	uni.showModal({
		title: '确认删除',
		content: `确定要删除这条${currentRecord.value.title}记录吗？`,
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4757',
		success: async (res) => {
			if (res.confirm) {
				try {
					// 获取当前记录的ID
					const currentRecordData = recordList.value[currentIndex.value]
					if (currentRecordData && currentRecordData.id) {
						// 调用后端API删除记录
						await api.deleteRecord(currentRecordData.id)
					}

					// 从轮播图中删除当前记录
					recordList.value.splice(currentIndex.value, 1)

					// 如果删除后没有记录了，显示空状态
					if (recordList.value.length === 0) {
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						// 重置当前记录数据为空状态
						currentRecord.value = recordTypes[currentFrontType.value] || recordTypes.eating
						recordData.value = {}
						return
					}

					// 调整当前索引
					if (currentIndex.value >= recordList.value.length) {
						currentIndex.value = recordList.value.length - 1
					}

					// 更新当前记录数据
					const newCurrentRecordData = recordList.value[currentIndex.value]
					currentRecord.value = newCurrentRecordData.type
					recordData.value = newCurrentRecordData.data

					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
				} catch (error) {
					console.error('删除记录失败:', error)
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					})
				}
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
	// 当前卡片类型优先；没有则使用进入页的类型作为默认表单
	if (!currentRecord.value || !currentRecord.value.key) {
		const slideType = recordList.value[currentIndex.value]?.type?.key
		currentRecord.value = recordTypes[slideType] || recordTypes[currentFrontType.value] || recordTypes.eating
	}
	showModal.value = true
}

// 隐藏添加弹窗
function hideAddModal() {
	showModal.value = false
}

// 选择记事图片
async function selectNotePhotos() {
	try {
		const chosen = await new Promise((resolve, reject) => {
			uni.chooseImage({
				count: 9,
				sizeType: ['compressed'],
				success: resolve,
				fail: reject
			})
		})
		const tempPaths = chosen?.tempFilePaths || []
		// 开发环境：uploadImages 会直接返回本地路径；生产可替换为对象存储后的 URL
		const urls = await uploadImages(tempPaths)
		if (!newRecord.photos) newRecord.photos = []
		newRecord.photos = [...newRecord.photos, ...urls].slice(0, 9)
	} catch (e) {
		uni.showToast({ title: '选择图片失败', icon: 'none' })
	}
}

function removeNotePhoto(index) {
	if (!newRecord.photos) return
	uni.showModal({
		title: '删除照片',
		content: '确定要删除这张照片吗？',
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4757',
		success: (res) => {
			if (res.confirm) {
				newRecord.photos.splice(index, 1)
			}
		}
	})
}

function previewPhoto(list, index) {
	if (!Array.isArray(list) || list.length === 0) return
	uni.previewImage({
		current: index,
		urls: list
	})
}

// 保存新记录
async function saveNewRecord() {
	if (selectedPets.value.length === 0) {
		uni.showToast({ title: '请选择宠物', icon: 'none' })
		return
	}
	const typeMap = { eating: 'feed', drinking: 'water', weight: 'weight', washing: 'clean', noting: 'diary', shit: 'diary', abnormal: 'diary', medicine: 'medicine' }
	const payloadBuilder = {
		eating: () => ({ foodType: newRecord.foodType, weight: newRecord.weight, note: newRecord.note }),
		drinking: () => ({ amount: newRecord.amount, method: newRecord.method, note: newRecord.note }),
		weight: () => ({ weight: newRecord.weight, method: newRecord.method, note: newRecord.note }),
		washing: () => ({ washType: newRecord.washType, product: newRecord.product, note: newRecord.note }),
		noting: () => ({ content: newRecord.content, photos: newRecord.photos || [] }),
		shit: () => ({ status: newRecord.status, color: newRecord.color, note: newRecord.note }),
		abnormal: () => ({ abnormalType: newRecord.abnormalType, severity: newRecord.severity, description: newRecord.description }),
		medicine: () => ({ medicineName: newRecord.medicineName, dosage: newRecord.dosage, medicineTime: newRecord.medicineTime, note: newRecord.note })
	}
	const frontKey = currentRecord.value.key
	const backendType = typeMap[frontKey] || 'diary'
	const payload = (payloadBuilder[frontKey] ? payloadBuilder[frontKey]() : payloadBuilder['noting']())
	try {
		const createdDisplayItems = []
		for (const idx of selectedPets.value) {
			const pet = petList.value[idx]
			const created = await api.createRecord({ petId: pet.id, type: backendType, payload, time: new Date().toISOString() })
			// 本地立即插入一条，提升"实时刷新"的观感
			createdDisplayItems.push({
				type: recordTypes[frontKey] || recordTypes.noting,
				data: {
					time: created?.time || new Date().toISOString(),
					petName: pet.name,
					petAvatar: pet.avatarUrl || pet.avatar || '/static/index/add.png',
					...(payload || {})
				}
			})
		}
		if (createdDisplayItems.length > 0) {
			recordList.value = [...createdDisplayItems, ...recordList.value]
			currentIndex.value = 0
			currentRecord.value = createdDisplayItems[0].type
			recordData.value = createdDisplayItems[0].data
		}
		uni.showToast({ title: '记录已保存', icon: 'success' })
		hideAddModal()
		// 重新加载列表
		await initRecordList({ type: frontKey })
	} catch (e) {
		uni.showToast({ title: '保存失败', icon: 'none' })
	}
}

// 测量当前 slide 的高度，设定给 swiper
function measureCurrentSlideHeight() {
	const id = `#slide-${currentIndex.value}`
	uni.createSelectorQuery()
		.select(id)
		.boundingClientRect(rect => {
			if (rect && rect.height) {
				// 给底部装饰预留更多空间，确保完全显示，并设置最小高度
				swiperHeight.value = Math.max(rect.height + 120, 900)
			} else {
				// 如果测量失败，给一个默认高度
				swiperHeight.value = 900
			}
		})
		.exec()
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
	overflow-y: auto;
}

/* 顶部装饰区域 - 固定高度容器 */
.top-decoration {
	position: relative;
	width: 100%;
	height: 180rpx;
	min-height: 180rpx;
	flex: 0 0 120rpx;
	flex-shrink: 0;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	margin-bottom: 20rpx;
	z-index: 10;
}

.decor {
	width: 200rpx;
	height: 200rpx;
	position: absolute;
	top: 2rpx;
	left: 50%;
	transform: translateX(-50%);
	z-index: 10;
	pointer-events: none;
}

.decor--dog-ccw {
	top: -5rpx;
	left: 50%;
	transform: translateX(-50%) rotate(-5deg);
	transform-origin: center center;
}

/* 轮播图容器 */
.carousel-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 20rpx 20rpx 0 20rpx;
	box-sizing: border-box;
	overflow: visible;
	position: relative;
}

.record-scroll {
	width: 100%;
	/* 高度通过内联样式绑定 swiperHeight */
	min-height: 600rpx;
	/* 确保最小高度 */
}

.scroll-content {
	display: flex;
	width: calc(100% * var(--item-count, 1));
}

.scroll-item {
	width: 750rpx;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	padding: 0 0rpx;
	box-sizing: border-box;
	overflow: visible;
	position: relative;
	min-height: 100%;
}

/* 编辑模式下的轮播图调整 */
/* 编辑模式下的 swiper 高度由 swiperHeight 控制，无需额外样式覆盖 */

/* 旧的 swiper-item 样式已移除，使用 scroll-item 替代 */

/* 每页实际内容容器：用于测量高度 */
.slide-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
}

.sheet {
	position: relative;
	width: 100%;
	min-width: 640rpx;
	max-width: 640rpx;
	/* 确保卡片在编辑模式下从当前位置向下展开 */
	align-self: flex-start;
}

/* 编辑模式和浏览模式保持相同宽度 */
.sheet--edit {
	min-width: 640rpx;
	max-width: 640rpx;
	/* 与浏览模式保持一致 */
}

/* 编辑模式下的卡片内容区域 */
.sheet--edit .sheet-body {
	/* max-height: calc(100vh - 300rpx); */
	/* overflow-y: auto; */
	/* 确保编辑模式下卡片从当前位置向下展开 */
	position: relative;
	z-index: 2;
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
	/* max-height: calc(100vh - 200rpx); */
	box-sizing: border-box;
	/* overflow-y: auto; */
	/* 内容过多时可滚动 */
}

/* 轮播指示器 */
.carousel-indicators {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 16rpx;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 12rpx;
	z-index: 3;
}

/* 加载状态 */
.loading {
	width: 100%;
	min-height: 60vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
}

.loading-img {
	width: 380rpx;
	opacity: 0.6;
}

.loading-text {
	color: #999;
	font-size: 28rpx;
}

/* 空状态 */
.empty {
	width: 100%;
	min-height: 60vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
}

.empty-img {
	width: 380rpx;
}

.empty-text {
	color: #666;
	font-size: 28rpx;
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

/* 记事-图片上传样式 */
.photo-uploader {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

/* 编辑模式下的照片上传区域优化 */
.sheet--edit .photo-uploader {
	max-height: 300rpx;
	overflow-y: auto;
	padding: 8rpx;
	border: 2rpx dashed #ddd;
	border-radius: 8rpx;
	background: #fafafa;
}

.photo-thumb {
	position: relative;
	width: 140rpx;
	height: 140rpx;
	border: 4rpx solid #2c2c2c;
	border-radius: 12rpx;
	overflow: hidden;
	background: #f6f6f6;
}

.photo-thumb-img {
	width: 100%;
	height: 100%;
}

.photo-remove {
	position: absolute;
	top: 4rpx;
	right: 4rpx;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: rgba(0, 0, 0, 0.6);
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
}

.photo-add {
	width: 140rpx;
	height: 140rpx;
	border: 4rpx dashed #2c2c2c;
	border-radius: 12rpx;
	color: #666;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	background: #fff;
}

.uploader-hint {
	display: block;
	margin-top: 8rpx;
	color: #999;
	font-size: 22rpx;
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
	display: none;
}

.bottom-cat.bottom-cat--dog {
	display: none;
}

/* 底部装饰区域 - 固定高度容器（随轮播项滑动） */
.bottom-decoration {
	position: relative;
	width: 100%;
	height: 300rpx;
	min-height: 300rpx;
	flex: 0 0 300rpx;
	flex-shrink: 0;
	display: flex;
	justify-content: center;
	align-items: flex-end;
	margin-top: 40rpx;
	/* 与卡片拉开间距，避免覆盖 */
	margin-bottom: 56rpx;
	/* 为底部圆点预留空间，避免重叠 */
	z-index: 0;
}

.bottom-decor {
	width: 300rpx;
	max-height: 260rpx;
	/* 增加高度以适配更大的容器 */
	margin-top: 20rpx;
	/* 图片在容器内下移，避免被截断 */
	margin-bottom: 20rpx;
	object-fit: contain;
	opacity: 0.9;
	pointer-events: none;
}

.bottom-decor.bottom-decor--dog {
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
	max-height: 60vh;
	overflow-y: auto;
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
