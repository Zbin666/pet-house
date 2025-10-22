"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_upload = require("../../utils/upload.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "recordDetail",
  setup(__props) {
    const recordTypes = {
      eating: { key: "eating", title: "饮食", icon: "/static/record/eating.png" },
      drinking: { key: "drinking", title: "饮水", icon: "/static/record/drinking.png" },
      weight: { key: "weight", title: "体重", icon: "/static/record/weight.png" },
      washing: { key: "washing", title: "洗护", icon: "/static/record/washing.png" },
      shit: { key: "shit", title: "便便", icon: "/static/record/shit.png" },
      noting: { key: "noting", title: "记事", icon: "/static/record/noting.png" },
      abnormal: { key: "abnormal", title: "异常", icon: "/static/record/abnormal.png" },
      medicine: { key: "medicine", title: "用药", icon: "/static/record/medicine.png" }
    };
    const currentRecord = common_vendor.ref({});
    const currentFrontType = common_vendor.ref("eating");
    const recordData = common_vendor.ref({});
    const editMode = common_vendor.ref(false);
    const form = common_vendor.reactive({});
    const showModal = common_vendor.ref(false);
    const newRecord = common_vendor.reactive({});
    const petList = common_vendor.ref([]);
    const selectedPets = common_vendor.ref([]);
    const showAllPets = common_vendor.ref(false);
    const currentIndex = common_vendor.ref(0);
    const recordList = common_vendor.ref([]);
    const swiperHeight = common_vendor.ref(0);
    const scrollLeft = common_vendor.ref(0);
    const isLoading = common_vendor.ref(true);
    const petAvatarCache = /* @__PURE__ */ new Map();
    const photoCache = /* @__PURE__ */ new Map();
    const photoUpdateTrigger = common_vendor.ref(0);
    const imageConfig = [
      { top: "/static/record/cat.png", bottom: "/static/record/gray-cat.png" },
      { top: "/static/record/up-cat_2.png", bottom: "/static/record/bottom-cat_2.png" },
      { top: "/static/record/up-dog_1.png", bottom: "/static/record/bottom-dog_1.png" }
    ];
    function getTopImage(index) {
      const configIndex = index % imageConfig.length;
      return imageConfig[configIndex].top;
    }
    function getBottomImage(index) {
      const configIndex = index % imageConfig.length;
      return imageConfig[configIndex].bottom;
    }
    function isDogBottom(index) {
      const configIndex = index % imageConfig.length;
      return imageConfig[configIndex].bottom === "/static/record/bottom-dog_1.png";
    }
    function isDogTop(index) {
      const configIndex = index % imageConfig.length;
      return imageConfig[configIndex].top === "/static/record/up-dog_1.png";
    }
    function getPetAvatarSrc(url) {
      if (!url) {
        return "/static/index/add.png";
      }
      if (url.startsWith("/static/") || url.startsWith("wxfile://")) {
        return url;
      }
      if (petAvatarCache.has(url)) {
        return petAvatarCache.get(url);
      }
      common_vendor.index.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            petAvatarCache.set(url, res.tempFilePath);
            recordList.value = [...recordList.value];
            petList.value = [...petList.value];
          } else {
            common_vendor.index.__f__("warn", "at pages/recordDetail/recordDetail.vue:646", "宠物头像下载失败:", url, res.statusCode);
            petAvatarCache.set(url, "/static/index/add.png");
            recordList.value = [...recordList.value];
            petList.value = [...petList.value];
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/recordDetail/recordDetail.vue:653", "宠物头像下载失败:", url, err);
          petAvatarCache.set(url, "/static/index/add.png");
          recordList.value = [...recordList.value];
          petList.value = [...petList.value];
        }
      });
      return "/static/index/add.png";
    }
    function getPhotoSrc(url) {
      if (!url) {
        return "/static/index/add.png";
      }
      if (url.startsWith("/static/") || url.startsWith("wxfile://")) {
        return url;
      }
      if (photoCache.has(url)) {
        return photoCache.get(url);
      }
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            photoCache.set(url, res.tempFilePath);
            photoUpdateTrigger.value++;
          } else {
            common_vendor.index.__f__("warn", "at pages/recordDetail/recordDetail.vue:696", "照片下载失败:", url, res.statusCode);
            photoCache.set(url, "/static/index/add.png");
            photoUpdateTrigger.value++;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/recordDetail/recordDetail.vue:702", "照片下载失败:", url, err);
          photoCache.set(url, "/static/index/add.png");
          photoUpdateTrigger.value++;
        }
      });
      return "/static/index/add.png";
    }
    common_vendor.onLoad(async (query) => {
      common_vendor.index.setNavigationBarTitle({ title: "记录详情" });
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      await loadPets();
      await initRecordList(query);
    });
    common_vendor.onShow(async () => {
      petAvatarCache.clear();
      photoCache.clear();
      if (recordList.value.length === 0) {
        const currentType = currentFrontType.value;
        await initRecordList({ type: currentType }, false);
      }
    });
    const onRecordsChanged = async () => {
      var _a, _b;
      const currentType = recordList.value.length > 0 ? (_b = (_a = recordList.value[currentIndex.value]) == null ? void 0 : _a.type) == null ? void 0 : _b.key : currentFrontType.value;
      await initRecordList({ type: currentType }, false);
    };
    common_vendor.index.$on && common_vendor.index.$on("records:changed", onRecordsChanged);
    common_vendor.onUnmounted(() => {
      common_vendor.index.$off && common_vendor.index.$off("records:changed", onRecordsChanged);
    });
    async function initRecordList(query, showLoading = true) {
      const targetType = query.type || "eating";
      currentFrontType.value = targetType;
      const typeMap = { eating: "feed", drinking: "water", weight: "weight", washing: "clean", noting: "diary", shit: "diary", abnormal: "diary", medicine: "medicine" };
      const backendType = typeMap[targetType] || "diary";
      if (showLoading) {
        isLoading.value = true;
      }
      try {
        const params = { type: backendType, page: 1, limit: 20 };
        if (query.startDate && query.endDate) {
          params.startDate = query.startDate;
          params.endDate = query.endDate;
        }
        const res = await utils_api.api.getRecords(params);
        const list = Array.isArray(res) ? res : res.records || res.data || res.list || [];
        let mapped = list.map((r) => {
          const pet = petList.value.find((p) => p.id === r.petId);
          const rawPayload = r == null ? void 0 : r.payload;
          let payloadObj = {};
          if (rawPayload && typeof rawPayload === "string") {
            try {
              payloadObj = JSON.parse(rawPayload);
            } catch (err) {
              common_vendor.index.__f__("warn", "at pages/recordDetail/recordDetail.vue:773", "记录 payload 解析失败(字符串非 JSON):", r == null ? void 0 : r.id, rawPayload);
              payloadObj = {};
            }
          } else if (rawPayload && typeof rawPayload === "object") {
            payloadObj = rawPayload;
          }
          const frontType = determineFrontType({ ...r, payload: payloadObj }, targetType);
          const typeConf = recordTypes[frontType] || recordTypes.noting;
          return {
            id: r.id,
            type: typeConf,
            data: {
              time: r.time,
              petName: (pet == null ? void 0 : pet.name) || "",
              petAvatar: (pet == null ? void 0 : pet.avatarUrl) || "/static/index/add.png",
              // 透传后端 payload（已保证为对象）
              ...payloadObj
            }
          };
        });
        if (backendType === "diary") {
          mapped = mapped.filter((item) => {
            var _a;
            return ((_a = item.type) == null ? void 0 : _a.key) === targetType;
          });
        }
        recordList.value = mapped;
        currentIndex.value = 0;
        if (recordList.value.length > 0) {
          const currentRecordData = recordList.value[currentIndex.value];
          currentRecord.value = currentRecordData.type;
          recordData.value = currentRecordData.data;
        } else {
          currentRecord.value = recordTypes[currentFrontType.value] || recordTypes.eating;
          recordData.value = {};
        }
        setTimeout(() => {
          measureCurrentSlideHeight();
        }, 100);
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/recordDetail/recordDetail.vue:813", "加载记录失败:", e);
        recordList.value = [];
        currentRecord.value = recordTypes[currentFrontType.value] || recordTypes.eating;
        recordData.value = {};
      } finally {
        if (showLoading) {
          isLoading.value = false;
        }
      }
    }
    function determineFrontType(r, fallbackFrontType) {
      if ((r == null ? void 0 : r.type) === "diary") {
        const p = (r == null ? void 0 : r.payload) || {};
        if (p.status || p.color)
          return "shit";
        if (p.abnormalType || p.severity)
          return "abnormal";
        return "noting";
      }
      const reverse = {
        feed: "eating",
        water: "drinking",
        weight: "weight",
        clean: "washing",
        medicine: "medicine"
      };
      return reverse[r == null ? void 0 : r.type] || fallbackFrontType || "noting";
    }
    async function loadPets() {
      try {
        const res = await utils_api.api.getPets();
        const list = Array.isArray(res) ? res : res.data || [];
        petList.value = list.map((p) => ({ id: p.id, name: p.name, avatar: p.avatarUrl || "/static/index/add.png", avatarUrl: p.avatarUrl }));
      } catch (e) {
        petList.value = [];
      }
    }
    function formatTime(time) {
      const date = new Date(time);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    function onScrollChange(e) {
      const currentScrollLeft = e.detail.scrollLeft;
      const itemWidth = 750;
      let newIndex = Math.round(currentScrollLeft / itemWidth);
      newIndex = Math.max(0, Math.min(newIndex, recordList.value.length - 1));
      if (newIndex !== currentIndex.value) {
        currentIndex.value = newIndex;
        if (recordList.value.length > 0) {
          const currentRecordData = recordList.value[currentIndex.value];
          currentRecord.value = currentRecordData.type;
          recordData.value = currentRecordData.data;
        }
        measureCurrentSlideHeight();
      }
    }
    function goToSlide(index) {
      currentIndex.value = index;
      scrollLeft.value = index * 750;
      if (recordList.value.length > 0) {
        const currentRecordData = recordList.value[currentIndex.value];
        currentRecord.value = currentRecordData.type;
        recordData.value = currentRecordData.data;
      }
      measureCurrentSlideHeight();
    }
    function startEdit() {
      editMode.value = true;
      Object.assign(form, recordData.value);
      const currentPet = petList.value.find((pet) => pet.name === recordData.value.petName);
      if (currentPet) {
        form.petId = currentPet.id;
      }
      if (!Array.isArray(form.photos)) {
        form.photos = Array.isArray(recordData.value.photos) ? [...recordData.value.photos] : [];
      }
      setTimeout(() => {
        measureCurrentSlideHeight();
      }, 100);
    }
    function cancelEdit() {
      editMode.value = false;
      setTimeout(() => {
        measureCurrentSlideHeight();
      }, 100);
    }
    function selectPet(pet) {
      form.petId = pet.id;
      form.petName = pet.name;
      form.petAvatar = pet.avatar;
    }
    async function selectEditNotePhotos() {
      try {
        const chosen = await new Promise((resolve, reject) => {
          common_vendor.index.chooseImage({ count: 9, sizeType: ["compressed"], success: resolve, fail: reject });
        });
        const tempPaths = (chosen == null ? void 0 : chosen.tempFilePaths) || [];
        const urls = await utils_upload.uploadImages(tempPaths);
        if (!form.photos)
          form.photos = [];
        form.photos = [...form.photos, ...urls].slice(0, 9);
      } catch (e) {
        common_vendor.index.showToast({ title: "选择图片失败", icon: "none" });
      }
    }
    function removeEditNotePhoto(index) {
      if (!form.photos)
        return;
      common_vendor.index.showModal({
        title: "删除照片",
        content: "确定要删除这张照片吗？",
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            form.photos.splice(index, 1);
          }
        }
      });
    }
    function saveEdit() {
      if (recordList.value.length > 0) {
        Object.assign(recordList.value[currentIndex.value].data, form);
        recordData.value = recordList.value[currentIndex.value].data;
        const current = recordList.value[currentIndex.value];
        if (current.id) {
          try {
            const key = current.type.key;
            const payload = (() => {
              if (key === "noting")
                return { content: recordData.value.content, photos: recordData.value.photos || [] };
              if (key === "eating")
                return { foodType: recordData.value.foodType, weight: recordData.value.weight, note: recordData.value.note };
              if (key === "drinking")
                return { amount: recordData.value.amount, method: recordData.value.method, note: recordData.value.note };
              if (key === "weight")
                return { weight: recordData.value.weight, method: recordData.value.method, note: recordData.value.note };
              if (key === "washing")
                return { washType: recordData.value.washType, product: recordData.value.product, note: recordData.value.note };
              if (key === "shit")
                return { status: recordData.value.status, color: recordData.value.color, note: recordData.value.note };
              if (key === "abnormal")
                return { abnormalType: recordData.value.abnormalType, severity: recordData.value.severity, description: recordData.value.description };
              if (key === "medicine")
                return { medicineName: recordData.value.medicineName, dosage: recordData.value.dosage, medicineTime: recordData.value.medicineTime, note: recordData.value.note };
              return {};
            })();
            utils_api.api.updateRecord(current.id, { payload });
          } catch (e) {
          }
        }
      }
      editMode.value = false;
      common_vendor.index.showToast({ title: "保存成功", icon: "success" });
    }
    async function deleteRecord() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除这条${currentRecord.value.title}记录吗？`,
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: async (res) => {
          if (res.confirm) {
            try {
              const currentRecordData = recordList.value[currentIndex.value];
              if (currentRecordData && currentRecordData.id) {
                await utils_api.api.deleteRecord(currentRecordData.id);
              }
              recordList.value.splice(currentIndex.value, 1);
              if (recordList.value.length === 0) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                currentRecord.value = recordTypes[currentFrontType.value] || recordTypes.eating;
                recordData.value = {};
                return;
              }
              if (currentIndex.value >= recordList.value.length) {
                currentIndex.value = recordList.value.length - 1;
              }
              const newCurrentRecordData = recordList.value[currentIndex.value];
              currentRecord.value = newCurrentRecordData.type;
              recordData.value = newCurrentRecordData.data;
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/recordDetail/recordDetail.vue:1051", "删除记录失败:", error);
              common_vendor.index.showToast({
                title: "删除失败",
                icon: "none"
              });
            }
          }
        }
      });
    }
    function togglePet(index) {
      const petIndex = selectedPets.value.indexOf(index);
      if (petIndex > -1) {
        selectedPets.value.splice(petIndex, 1);
      } else {
        selectedPets.value.push(index);
      }
      newRecord.selectedPets = selectedPets.value.map((index2) => petList.value[index2]);
    }
    function showAddModal() {
      var _a, _b;
      Object.keys(newRecord).forEach((key) => delete newRecord[key]);
      selectedPets.value = [];
      showAllPets.value = false;
      if (!currentRecord.value || !currentRecord.value.key) {
        const slideType = (_b = (_a = recordList.value[currentIndex.value]) == null ? void 0 : _a.type) == null ? void 0 : _b.key;
        currentRecord.value = recordTypes[slideType] || recordTypes[currentFrontType.value] || recordTypes.eating;
      }
      showModal.value = true;
    }
    function hideAddModal() {
      showModal.value = false;
    }
    async function selectNotePhotos() {
      try {
        const chosen = await new Promise((resolve, reject) => {
          common_vendor.index.chooseImage({
            count: 9,
            sizeType: ["compressed"],
            success: resolve,
            fail: reject
          });
        });
        const tempPaths = (chosen == null ? void 0 : chosen.tempFilePaths) || [];
        const urls = await utils_upload.uploadImages(tempPaths);
        if (!newRecord.photos)
          newRecord.photos = [];
        newRecord.photos = [...newRecord.photos, ...urls].slice(0, 9);
      } catch (e) {
        common_vendor.index.showToast({ title: "选择图片失败", icon: "none" });
      }
    }
    function removeNotePhoto(index) {
      if (!newRecord.photos)
        return;
      common_vendor.index.showModal({
        title: "删除照片",
        content: "确定要删除这张照片吗？",
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            newRecord.photos.splice(index, 1);
          }
        }
      });
    }
    function previewPhoto(list, index) {
      if (!Array.isArray(list) || list.length === 0)
        return;
      common_vendor.index.previewImage({
        current: index,
        urls: list
      });
    }
    async function saveNewRecord() {
      if (selectedPets.value.length === 0) {
        common_vendor.index.showToast({ title: "请选择宠物", icon: "none" });
        return;
      }
      const typeMap = { eating: "feed", drinking: "water", weight: "weight", washing: "clean", noting: "diary", shit: "diary", abnormal: "diary", medicine: "medicine" };
      const payloadBuilder = {
        eating: () => ({ foodType: newRecord.foodType, weight: newRecord.weight, note: newRecord.note }),
        drinking: () => ({ amount: newRecord.amount, method: newRecord.method, note: newRecord.note }),
        weight: () => ({ weight: newRecord.weight, method: newRecord.method, note: newRecord.note }),
        washing: () => ({ washType: newRecord.washType, product: newRecord.product, note: newRecord.note }),
        noting: () => ({ content: newRecord.content, photos: newRecord.photos || [] }),
        shit: () => ({ status: newRecord.status, color: newRecord.color, note: newRecord.note }),
        abnormal: () => ({ abnormalType: newRecord.abnormalType, severity: newRecord.severity, description: newRecord.description }),
        medicine: () => ({ medicineName: newRecord.medicineName, dosage: newRecord.dosage, medicineTime: newRecord.medicineTime, note: newRecord.note })
      };
      const frontKey = currentRecord.value.key;
      const backendType = typeMap[frontKey] || "diary";
      const payload = payloadBuilder[frontKey] ? payloadBuilder[frontKey]() : payloadBuilder["noting"]();
      try {
        const createdDisplayItems = [];
        for (const idx of selectedPets.value) {
          const pet = petList.value[idx];
          const created = await utils_api.api.createRecord({ petId: pet.id, type: backendType, payload, time: (/* @__PURE__ */ new Date()).toISOString() });
          createdDisplayItems.push({
            type: recordTypes[frontKey] || recordTypes.noting,
            data: {
              time: (created == null ? void 0 : created.time) || (/* @__PURE__ */ new Date()).toISOString(),
              petName: pet.name,
              petAvatar: pet.avatarUrl || pet.avatar || "/static/index/add.png",
              ...payload || {}
            }
          });
        }
        if (createdDisplayItems.length > 0) {
          recordList.value = [...createdDisplayItems, ...recordList.value];
          currentIndex.value = 0;
          currentRecord.value = createdDisplayItems[0].type;
          recordData.value = createdDisplayItems[0].data;
        }
        common_vendor.index.showToast({ title: "记录已保存", icon: "success" });
        hideAddModal();
        await initRecordList({ type: frontKey });
      } catch (e) {
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      }
    }
    function measureCurrentSlideHeight() {
      const id = `#slide-${currentIndex.value}`;
      common_vendor.index.createSelectorQuery().select(id).boundingClientRect((rect) => {
        if (rect && rect.height) {
          swiperHeight.value = Math.max(rect.height + 120, 900);
        } else {
          swiperHeight.value = 900;
        }
      }).exec();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoading.value
      }, isLoading.value ? {
        b: common_assets._imports_0$9
      } : recordList.value.length > 0 ? {
        d: common_vendor.f(recordList.value, (record, index, i0) => {
          return common_vendor.e({
            a: isDogTop(index) ? 1 : "",
            b: getTopImage(index),
            c: record.type.icon,
            d: common_vendor.t(record.type.title),
            e: common_vendor.t(formatTime(record.data.time))
          }, !editMode.value ? {
            f: getPetAvatarSrc(record.data.petAvatar),
            g: common_vendor.t(record.data.petName)
          } : {
            h: common_vendor.f(petList.value, (pet, k1, i1) => {
              return {
                a: getPetAvatarSrc(pet.avatarUrl || pet.avatar),
                b: common_vendor.t(pet.name),
                c: pet.id,
                d: form.petId === pet.id ? 1 : "",
                e: common_vendor.o(($event) => selectPet(pet), pet.id)
              };
            })
          }, {
            i: record.type.key === "eating"
          }, record.type.key === "eating" ? common_vendor.e({
            j: !editMode.value
          }, !editMode.value ? {
            k: common_vendor.t(record.data.foodType || "未填写")
          } : {
            l: form.foodType,
            m: common_vendor.o(($event) => form.foodType = $event.detail.value, index)
          }, {
            n: !editMode.value
          }, !editMode.value ? {
            o: common_vendor.t(record.data.weight ? record.data.weight + "g" : "未填写")
          } : {
            p: form.weight,
            q: common_vendor.o(common_vendor.m(($event) => form.weight = $event.detail.value, {
              number: true
            }), index)
          }, {
            r: !editMode.value
          }, !editMode.value ? {
            s: common_vendor.t(record.data.note || "无")
          } : {
            t: form.note,
            v: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : record.type.key === "drinking" ? common_vendor.e({
            x: !editMode.value
          }, !editMode.value ? {
            y: common_vendor.t(record.data.amount ? record.data.amount + "ml" : "未填写")
          } : {
            z: form.amount,
            A: common_vendor.o(common_vendor.m(($event) => form.amount = $event.detail.value, {
              number: true
            }), index)
          }, {
            B: !editMode.value
          }, !editMode.value ? {
            C: common_vendor.t(record.data.method || "未填写")
          } : {
            D: form.method,
            E: common_vendor.o(($event) => form.method = $event.detail.value, index)
          }, {
            F: !editMode.value
          }, !editMode.value ? {
            G: common_vendor.t(record.data.note || "无")
          } : {
            H: form.note,
            I: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : record.type.key === "weight" ? common_vendor.e({
            K: !editMode.value
          }, !editMode.value ? {
            L: common_vendor.t(record.data.weight ? record.data.weight + "kg" : "未填写")
          } : {
            M: form.weight,
            N: common_vendor.o(common_vendor.m(($event) => form.weight = $event.detail.value, {
              number: true
            }), index)
          }, {
            O: !editMode.value
          }, !editMode.value ? {
            P: common_vendor.t(record.data.method || "未填写")
          } : {
            Q: form.method,
            R: common_vendor.o(($event) => form.method = $event.detail.value, index)
          }, {
            S: !editMode.value
          }, !editMode.value ? {
            T: common_vendor.t(record.data.note || "无")
          } : {
            U: form.note,
            V: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : record.type.key === "washing" ? common_vendor.e({
            X: !editMode.value
          }, !editMode.value ? {
            Y: common_vendor.t(record.data.washType || "未填写")
          } : {
            Z: form.washType,
            aa: common_vendor.o(($event) => form.washType = $event.detail.value, index)
          }, {
            ab: !editMode.value
          }, !editMode.value ? {
            ac: common_vendor.t(record.data.product || "未填写")
          } : {
            ad: form.product,
            ae: common_vendor.o(($event) => form.product = $event.detail.value, index)
          }, {
            af: !editMode.value
          }, !editMode.value ? {
            ag: common_vendor.t(record.data.note || "无")
          } : {
            ah: form.note,
            ai: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : record.type.key === "shit" ? common_vendor.e({
            ak: !editMode.value
          }, !editMode.value ? {
            al: common_vendor.t(record.data.status || "未填写")
          } : {
            am: form.status,
            an: common_vendor.o(($event) => form.status = $event.detail.value, index)
          }, {
            ao: !editMode.value
          }, !editMode.value ? {
            ap: common_vendor.t(record.data.color || "未填写")
          } : {
            aq: form.color,
            ar: common_vendor.o(($event) => form.color = $event.detail.value, index)
          }, {
            as: !editMode.value
          }, !editMode.value ? {
            at: common_vendor.t(record.data.note || "无")
          } : {
            av: form.note,
            aw: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : record.type.key === "noting" ? common_vendor.e({
            ay: !editMode.value
          }, !editMode.value ? {
            az: common_vendor.t(record.data.content || "无内容")
          } : {
            aA: form.content,
            aB: common_vendor.o(($event) => form.content = $event.detail.value, index)
          }, {
            aC: editMode.value || record.data.photos && record.data.photos.length
          }, editMode.value || record.data.photos && record.data.photos.length ? common_vendor.e({
            aD: !editMode.value
          }, !editMode.value ? {
            aE: common_vendor.f(record.data.photos, (photo, i, i1) => {
              return {
                a: `photo-${i}-${photoUpdateTrigger.value}`,
                b: getPhotoSrc(photo),
                c: common_vendor.o(($event) => previewPhoto(record.data.photos, i), `photo-${i}-${photoUpdateTrigger.value}`)
              };
            })
          } : {
            aF: common_vendor.f(form.photos || [], (p, i, i1) => {
              return {
                a: getPhotoSrc(p),
                b: common_vendor.o(($event) => removeEditNotePhoto(i), `edit-photo-${i}-${photoUpdateTrigger.value}`),
                c: `edit-photo-${i}-${photoUpdateTrigger.value}`,
                d: common_vendor.o(($event) => previewPhoto(form.photos || [], i), `edit-photo-${i}-${photoUpdateTrigger.value}`)
              };
            }),
            aG: common_vendor.o(selectEditNotePhotos, index)
          }) : {}) : record.type.key === "abnormal" ? common_vendor.e({
            aI: !editMode.value
          }, !editMode.value ? {
            aJ: common_vendor.t(record.data.abnormalType || "未填写")
          } : {
            aK: form.abnormalType,
            aL: common_vendor.o(($event) => form.abnormalType = $event.detail.value, index)
          }, {
            aM: !editMode.value
          }, !editMode.value ? {
            aN: common_vendor.t(record.data.severity || "未填写")
          } : {
            aO: form.severity,
            aP: common_vendor.o(($event) => form.severity = $event.detail.value, index)
          }, {
            aQ: !editMode.value
          }, !editMode.value ? {
            aR: common_vendor.t(record.data.description || "无")
          } : {
            aS: form.description,
            aT: common_vendor.o(($event) => form.description = $event.detail.value, index)
          }) : record.type.key === "medicine" ? common_vendor.e({
            aV: !editMode.value
          }, !editMode.value ? {
            aW: common_vendor.t(record.data.medicineName || "未填写")
          } : {
            aX: form.medicineName,
            aY: common_vendor.o(($event) => form.medicineName = $event.detail.value, index)
          }, {
            aZ: !editMode.value
          }, !editMode.value ? {
            ba: common_vendor.t(record.data.dosage || "未填写")
          } : {
            bb: form.dosage,
            bc: common_vendor.o(($event) => form.dosage = $event.detail.value, index)
          }, {
            bd: !editMode.value
          }, !editMode.value ? {
            be: common_vendor.t(record.data.medicineTime || "未填写")
          } : {
            bf: form.medicineTime,
            bg: common_vendor.o(($event) => form.medicineTime = $event.detail.value, index)
          }, {
            bh: !editMode.value
          }, !editMode.value ? {
            bi: common_vendor.t(record.data.note || "无")
          } : {
            bj: form.note,
            bk: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : {}, {
            w: record.type.key === "drinking",
            J: record.type.key === "weight",
            W: record.type.key === "washing",
            aj: record.type.key === "shit",
            ax: record.type.key === "noting",
            aH: record.type.key === "abnormal",
            aU: record.type.key === "medicine"
          }, !editMode.value ? {
            bl: common_assets._imports_1$5,
            bm: common_vendor.o(startEdit, index)
          } : {
            bn: common_vendor.o(cancelEdit, index),
            bo: common_vendor.o(saveEdit, index)
          }, !editMode.value ? {
            bp: common_assets._imports_0$4,
            bq: common_vendor.o(deleteRecord, index)
          } : {}, {
            br: isDogBottom(index) ? 1 : "",
            bs: getBottomImage(index),
            bt: index,
            bv: `slide-${index}`
          });
        }),
        e: !editMode.value,
        f: !editMode.value,
        g: !editMode.value,
        h: editMode.value ? 1 : "",
        i: recordList.value.length,
        j: scrollLeft.value,
        k: common_vendor.o(onScrollChange),
        l: swiperHeight.value + "px"
      } : {}, {
        c: recordList.value.length > 0,
        m: !isLoading.value && recordList.value.length > 0
      }, !isLoading.value && recordList.value.length > 0 ? {
        n: common_vendor.f(recordList.value, (record, index, i0) => {
          return {
            a: index,
            b: common_vendor.n({
              active: index === currentIndex.value
            }),
            c: common_vendor.o(($event) => goToSlide(index), index)
          };
        })
      } : !isLoading.value ? {
        p: common_assets._imports_0$9
      } : {}, {
        o: !isLoading.value,
        q: common_assets._imports_3$1,
        r: common_vendor.o(showAddModal),
        s: showModal.value
      }, showModal.value ? common_vendor.e({
        t: common_vendor.t(currentRecord.value.title),
        v: common_vendor.o(hideAddModal),
        w: common_vendor.f(petList.value, (pet, index, i0) => {
          return common_vendor.e({
            a: getPetAvatarSrc(pet.avatarUrl || pet.avatar),
            b: common_vendor.t(pet.name),
            c: selectedPets.value.includes(index)
          }, selectedPets.value.includes(index) ? {} : {}, {
            d: index,
            e: selectedPets.value.includes(index) ? 1 : "",
            f: common_vendor.o(($event) => togglePet(index), index)
          });
        }),
        x: currentRecord.value.key === "eating"
      }, currentRecord.value.key === "eating" ? {
        y: newRecord.foodType,
        z: common_vendor.o(($event) => newRecord.foodType = $event.detail.value),
        A: newRecord.weight,
        B: common_vendor.o(common_vendor.m(($event) => newRecord.weight = $event.detail.value, {
          number: true
        })),
        C: newRecord.note,
        D: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "drinking" ? {
        F: newRecord.amount,
        G: common_vendor.o(common_vendor.m(($event) => newRecord.amount = $event.detail.value, {
          number: true
        })),
        H: newRecord.method,
        I: common_vendor.o(($event) => newRecord.method = $event.detail.value),
        J: newRecord.note,
        K: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "weight" ? {
        M: newRecord.weight,
        N: common_vendor.o(common_vendor.m(($event) => newRecord.weight = $event.detail.value, {
          number: true
        })),
        O: newRecord.method,
        P: common_vendor.o(($event) => newRecord.method = $event.detail.value),
        Q: newRecord.note,
        R: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "washing" ? {
        T: newRecord.washType,
        U: common_vendor.o(($event) => newRecord.washType = $event.detail.value),
        V: newRecord.product,
        W: common_vendor.o(($event) => newRecord.product = $event.detail.value),
        X: newRecord.note,
        Y: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "shit" ? {
        aa: newRecord.status,
        ab: common_vendor.o(($event) => newRecord.status = $event.detail.value),
        ac: newRecord.color,
        ad: common_vendor.o(($event) => newRecord.color = $event.detail.value),
        ae: newRecord.note,
        af: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "noting" ? {
        ah: newRecord.content,
        ai: common_vendor.o(($event) => newRecord.content = $event.detail.value),
        aj: common_vendor.f(newRecord.photos || [], (p, i, i0) => {
          return {
            a: getPhotoSrc(p),
            b: common_vendor.o(($event) => removeNotePhoto(i), `new-photo-${i}-${photoUpdateTrigger.value}`),
            c: `new-photo-${i}-${photoUpdateTrigger.value}`,
            d: common_vendor.o(($event) => previewPhoto(newRecord.photos || [], i), `new-photo-${i}-${photoUpdateTrigger.value}`)
          };
        }),
        ak: common_vendor.o(selectNotePhotos)
      } : currentRecord.value.key === "abnormal" ? {
        am: newRecord.abnormalType,
        an: common_vendor.o(($event) => newRecord.abnormalType = $event.detail.value),
        ao: newRecord.severity,
        ap: common_vendor.o(($event) => newRecord.severity = $event.detail.value),
        aq: newRecord.description,
        ar: common_vendor.o(($event) => newRecord.description = $event.detail.value)
      } : currentRecord.value.key === "medicine" ? {
        at: newRecord.medicineName,
        av: common_vendor.o(($event) => newRecord.medicineName = $event.detail.value),
        aw: newRecord.dosage,
        ax: common_vendor.o(($event) => newRecord.dosage = $event.detail.value),
        ay: newRecord.medicineTime,
        az: common_vendor.o(($event) => newRecord.medicineTime = $event.detail.value),
        aA: newRecord.note,
        aB: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : {}, {
        E: currentRecord.value.key === "drinking",
        L: currentRecord.value.key === "weight",
        S: currentRecord.value.key === "washing",
        Z: currentRecord.value.key === "shit",
        ag: currentRecord.value.key === "noting",
        al: currentRecord.value.key === "abnormal",
        as: currentRecord.value.key === "medicine",
        aC: common_vendor.o(hideAddModal),
        aD: common_vendor.o(saveNewRecord),
        aE: common_vendor.o(() => {
        }),
        aF: common_vendor.o(hideAddModal)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7889064e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recordDetail/recordDetail.js.map
