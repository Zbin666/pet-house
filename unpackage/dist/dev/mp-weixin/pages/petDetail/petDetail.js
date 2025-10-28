"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const utils_upload = require("../../utils/upload.js");
const _sfc_main = {
  __name: "petDetail",
  setup(__props) {
    const avatarCache = /* @__PURE__ */ new Map();
    const photoCache = /* @__PURE__ */ new Map();
    const photoUpdateTrigger = common_vendor.ref(0);
    const pet = common_vendor.ref({});
    function normalizeVaccines(val) {
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (e) {
        }
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [];
    }
    function getPetAvatarSrc(url) {
      if (!url)
        return "/static/logo.png";
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/")) {
        return normalized;
      }
      if (avatarCache.has(normalized)) {
        return avatarCache.get(normalized);
      }
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            avatarCache.set(normalized, res.tempFilePath);
            pet.value = {
              ...pet.value || {}
            };
          } else {
            avatarCache.set(normalized, "/static/logo.png");
            pet.value = {
              ...pet.value || {}
            };
          }
        },
        fail: () => {
          avatarCache.set(normalized, "/static/logo.png");
          pet.value = {
            ...pet.value || {}
          };
        }
      });
      return "/static/logo.png";
    }
    function getPhotoSrc(url) {
      if (!url)
        return "/static/index/add.png";
      let normalized = url;
      if (normalized.startsWith("/uploads/")) {
        normalized = `https://pet-api.zbinli.cn${normalized}`;
      }
      if (normalized.startsWith("http://pet-api.zbinli.cn")) {
        normalized = normalized.replace("http://pet-api.zbinli.cn", "https://pet-api.zbinli.cn");
      }
      normalized = normalized.replace("://pet-api.zbinli.cn:80", "://pet-api.zbinli.cn");
      if (normalized.startsWith("wxfile://") || normalized.startsWith("/static/")) {
        return normalized;
      }
      if (photoCache.has(normalized)) {
        return photoCache.get(normalized);
      }
      common_vendor.index.downloadFile({
        url: normalized,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            photoCache.set(normalized, res.tempFilePath);
            photoUpdateTrigger.value++;
          } else {
            common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:261", "照片下载失败:", normalized, res.statusCode);
            photoCache.set(normalized, "/static/index/add.png");
            photoUpdateTrigger.value++;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:267", "照片下载失败:", normalized, err);
          photoCache.set(normalized, "/static/index/add.png");
          photoUpdateTrigger.value++;
        }
      });
      return "/static/index/add.png";
    }
    common_vendor.onLoad(async (query) => {
      var _a;
      common_vendor.index.setNavigationBarColor({
        frontColor: "#000000",
        backgroundColor: "#fff1a8"
      });
      if (query == null ? void 0 : query.pet) {
        try {
          const data = JSON.parse(decodeURIComponent(query.pet));
          Object.assign(pet.value, data);
          vaccines.value = normalizeVaccines(data.vaccines);
          temperament.value = data.temperament || "";
          if (!data.vaccines || Array.isArray(data.vaccines) && data.vaccines.length === 0) {
            try {
              const fresh = await utils_api.api.getPet(pet.value.id);
              vaccines.value = normalizeVaccines(fresh && fresh.vaccines);
              temperament.value = fresh && fresh.temperament || temperament.value;
            } catch (refreshErr) {
            }
          }
          common_vendor.nextTick$1(() => {
          });
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:301", "赋值后的pet.value:", pet.value);
        } catch (e) {
        }
      }
      if ((_a = pet.value) == null ? void 0 : _a.id) {
        try {
          const res = await utils_api.api.getMedia({
            petId: pet.value.id
          });
          const mediaList = Array.isArray(res) ? res : res.media || res.data || [];
          const sortedMediaList = mediaList.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
            const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
            return timeA - timeB;
          });
          gallery.value = sortedMediaList.map((m) => m.url).filter(Boolean);
        } catch (err) {
        }
      }
    });
    common_vendor.ref([
      {
        id: "r1",
        time: "今天 08:00",
        type: "喂食",
        desc: "猫粮 60g"
      },
      {
        id: "r2",
        time: "昨天 21:10",
        type: "清洁",
        desc: "铲砂"
      }
    ]);
    const vaccines = common_vendor.ref([]);
    const temperament = common_vendor.ref("");
    const gallery = common_vendor.ref([]);
    const editMode = common_vendor.ref(false);
    const genders = common_vendor.ref(["女生", "男生"]);
    const genderIndex = common_vendor.ref(1);
    const vaccineOptions = common_vendor.ref([
      // 猫类常见疫苗
      "已接种猫三联疫苗",
      "已接种猫三联第二针/加强",
      "已接种猫白血病疫苗(FeLV)",
      "已接种狂犬疫苗",
      // 犬类常见疫苗
      "已接种犬五联疫苗",
      "已接种犬六联疫苗",
      "已接种犬七联疫苗",
      "已接种小犬细小疫苗",
      "已接种犬瘟热疫苗",
      "已接种博德特氏支气管炎疫苗",
      "已接种钩端螺旋体疫苗",
      // 其他
      "已接种其他疫苗"
    ]);
    const form = common_vendor.reactive({
      name: "",
      months: "",
      weight: "",
      gender: "male",
      breed: "",
      color: "",
      neutered: false,
      birthday: "",
      startTogether: "",
      avatar: "",
      vaccines: [],
      temperament: "",
      gallery: []
    });
    const originalGallery = common_vendor.ref([]);
    function startEdit() {
      editMode.value = true;
      Object.assign(form, {
        ...pet.value,
        vaccines: [...vaccines.value],
        temperament: temperament.value,
        avatarUrl: pet.value.avatarUrl,
        gallery: [...gallery.value]
      });
      originalGallery.value = [...gallery.value];
      genderIndex.value = form.gender === "male" ? 1 : 0;
    }
    function cancelEdit() {
      editMode.value = false;
      gallery.value = [...originalGallery.value];
    }
    async function saveEdit() {
      try {
        common_vendor.index.showLoading({
          title: "保存中..."
        });
        const updateData = {
          name: form.name,
          months: form.months,
          weight: form.weight,
          gender: form.gender,
          breed: form.breed,
          color: form.color,
          neutered: form.neutered,
          birthday: form.birthday,
          startTogether: form.startTogether,
          temperament: form.temperament,
          vaccines: form.vaccines
        };
        if (form.avatar && form.avatar.startsWith("wxfile://")) {
          try {
            const {
              uploadImage,
              compressImage
            } = await "../../utils/upload.js";
            const compressedPath = await compressImage(form.avatar, 0.8);
            const avatarUrl = await uploadImage(compressedPath, "avatar");
            updateData.avatarUrl = avatarUrl;
          } catch (error) {
            common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:435", "头像上传失败:", error);
            common_vendor.index.showToast({
              title: "头像上传失败，其他信息已保存",
              icon: "none"
            });
          }
        } else if (form.avatarUrl) {
          updateData.avatarUrl = form.avatarUrl;
        }
        await utils_api.api.updatePet(pet.value.id, updateData);
        common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:449", "🔍 检查照片更新...");
        common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:450", "form.gallery:", form.gallery);
        common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:451", "gallery.value:", gallery.value);
        if (form.gallery && form.gallery.length > 0) {
          const newPhotos = form.gallery.filter((photo) => photo.startsWith("wxfile://"));
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:456", "新照片数量:", newPhotos.length);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:457", "新照片路径:", newPhotos);
          if (newPhotos.length > 0) {
            try {
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:461", "开始上传照片...");
              const uploadPromises = newPhotos.map(async (photoPath) => {
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:465", "压缩照片:", photoPath);
                const compressedPath = await utils_upload.compressImage(photoPath, 0.7);
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:467", "压缩后路径:", compressedPath);
                const uploadedUrl = await utils_upload.uploadImage(compressedPath, "gallery");
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:469", "上传成功，URL:", uploadedUrl);
                return uploadedUrl;
              });
              const uploadedUrls = await Promise.all(uploadPromises);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:474", "所有照片上传完成:", uploadedUrls);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:477", "创建媒体记录...");
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:478", "petId:", pet.value.id);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:479", "urls:", uploadedUrls);
              const mediaResult = await utils_api.api.createMedia({
                petId: pet.value.id,
                type: "image",
                urls: uploadedUrls,
                description: "宠物照片"
              });
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:488", "媒体记录创建结果:", mediaResult);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:489", "成功上传照片:", uploadedUrls.length, "张");
              try {
                const res = await utils_api.api.getMedia({
                  petId: pet.value.id
                });
                const mediaList = Array.isArray(res) ? res : res.media || res.data || [];
                const sortedMediaList = mediaList.sort((a, b) => {
                  const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
                  const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
                  return timeA - timeB;
                });
                gallery.value = sortedMediaList.map((m) => m.url).filter(Boolean);
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:506", "保存后重新加载照片，按时间排序:", sortedMediaList.map((m) => ({
                  url: m.url,
                  createdAt: m.createdAt || m.created_at
                })));
              } catch (err) {
                common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:511", "重新加载照片失败，使用本地更新:", err);
                const existingPhotos = form.gallery.filter((photo) => !photo.startsWith("wxfile://"));
                gallery.value = [...existingPhotos, ...uploadedUrls];
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:518", "照片上传失败:", error);
              common_vendor.index.showToast({
                title: "照片上传失败，其他信息已保存",
                icon: "none"
              });
            }
          } else {
            common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:525", "没有新照片需要上传");
          }
        } else {
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:528", "没有照片需要处理");
        }
        pet.value = {
          ...pet.value,
          ...updateData
        };
        vaccines.value = [...form.vaccines];
        temperament.value = form.temperament;
        gallery.value = [...form.gallery];
        editMode.value = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:549", "保存失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      }
    }
    function onGenderChange(e) {
      genderIndex.value = Number(e.detail.value || 0);
      form.gender = genderIndex.value === 1 ? "male" : "female";
    }
    function onVaccinesChange(e) {
      form.vaccines = e.detail.value || [];
    }
    function pickAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: (res) => {
          form.avatar = res.tempFilePaths[0];
        }
      });
    }
    function pickGallery() {
      common_vendor.index.chooseImage({
        count: 9,
        sizeType: ["compressed"],
        success: (res) => {
          form.gallery = form.gallery.concat(res.tempFilePaths);
        }
      });
    }
    function deletePhoto(index) {
      if (editMode.value) {
        common_vendor.index.showModal({
          title: "确认删除",
          content: "确定要删除这张照片吗？",
          confirmText: "删除",
          cancelText: "取消",
          confirmColor: "#ff4757",
          success: (res) => {
            if (res.confirm) {
              form.gallery.splice(index, 1);
            }
          }
        });
      }
    }
    function preview(index) {
      const list = editMode.value ? form.gallery : gallery.value;
      if (!Array.isArray(list) || list.length === 0)
        return;
      common_vendor.index.previewImage({
        current: index,
        urls: list
      });
    }
    async function deletePet() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除宠物"${pet.value.name}"吗？此操作不可恢复！`,
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            await utils_api.api.deletePet(pet.value.id);
            common_vendor.index.showToast({
              title: "宠物已删除",
              icon: "success"
            });
            common_vendor.index.$emit && common_vendor.index.$emit("pets:changed");
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 600);
          } catch (e) {
            common_vendor.index.showToast({
              title: "删除失败",
              icon: "none"
            });
          }
        }
      });
    }
    common_vendor.computed(() => {
      const start = new Date(pet.value.startTogether).getTime();
      const today = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
      return Math.max(1, Math.floor((today - start) / 864e5) + 1);
    });
    function onAvatarLoad(e) {
    }
    function onAvatarError(e) {
      try {
        e && e.target && (e.target.src = "/static/logo.png");
      } catch {
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: getPetAvatarSrc(editMode.value && form.avatarUrl ? form.avatarUrl : pet.value.avatarUrl),
        b: common_vendor.o(onAvatarLoad),
        c: common_vendor.o(onAvatarError),
        d: common_vendor.o(($event) => editMode.value ? pickAvatar() : null),
        e: !editMode.value
      }, !editMode.value ? {
        f: common_vendor.t(pet.value.name)
      } : {
        g: form.name,
        h: common_vendor.o(($event) => form.name = $event.detail.value)
      }, {
        i: !editMode.value
      }, !editMode.value ? {
        j: common_vendor.t(pet.value.months || 0)
      } : {
        k: form.months,
        l: common_vendor.o(common_vendor.m(($event) => form.months = $event.detail.value, {
          number: true
        }))
      }, {
        m: !editMode.value
      }, !editMode.value ? {
        n: common_vendor.t(pet.value.weight || 0)
      } : {
        o: form.weight,
        p: common_vendor.o(($event) => form.weight = $event.detail.value)
      }, {
        q: !editMode.value
      }, !editMode.value ? {
        r: common_vendor.t(pet.value.gender === "male" ? "男生" : "女生")
      } : {
        s: common_vendor.t(genders.value[genderIndex.value]),
        t: genders.value,
        v: genderIndex.value,
        w: common_vendor.o(onGenderChange)
      }, {
        x: !editMode.value
      }, !editMode.value ? {
        y: common_vendor.t(pet.value.breed)
      } : {
        z: form.breed,
        A: common_vendor.o(($event) => form.breed = $event.detail.value)
      }, {
        B: !editMode.value
      }, !editMode.value ? {
        C: common_assets._imports_1$5,
        D: common_vendor.o(startEdit),
        E: common_assets._imports_0$4,
        F: common_vendor.o(deletePet)
      } : {
        G: common_vendor.o(cancelEdit),
        H: common_vendor.o(saveEdit)
      }, {
        I: common_assets._imports_1$4,
        J: !editMode.value
      }, !editMode.value ? {
        K: common_vendor.t(pet.value.neutered ? "已绝育" : "未绝育")
      } : {
        L: form.neutered,
        M: common_vendor.o((e) => form.neutered = e.detail.value)
      }, {
        N: common_assets._imports_1$4,
        O: !editMode.value
      }, !editMode.value ? {
        P: common_vendor.f(vaccines.value, (v, i, i0) => {
          return {
            a: common_vendor.t(v),
            b: i
          };
        })
      } : {
        Q: common_vendor.f(vaccineOptions.value, (opt, k0, i0) => {
          return {
            a: opt,
            b: form.vaccines.includes(opt),
            c: common_vendor.t(opt),
            d: opt
          };
        }),
        R: common_vendor.o(onVaccinesChange)
      }, {
        S: common_assets._imports_1$4,
        T: !editMode.value
      }, !editMode.value ? {
        U: common_vendor.t(temperament.value)
      } : {
        V: form.temperament,
        W: common_vendor.o(($event) => form.temperament = $event.detail.value)
      }, {
        X: common_assets._imports_1$4,
        Y: common_vendor.f(editMode.value ? form.gallery : gallery.value, (g, i, i0) => {
          return common_vendor.e({
            a: getPhotoSrc(g),
            b: common_vendor.o(($event) => preview(i), `photo-${i}-${photoUpdateTrigger.value}`)
          }, editMode.value ? {
            c: common_vendor.o(($event) => deletePhoto(i), `photo-${i}-${photoUpdateTrigger.value}`)
          } : {}, {
            d: `photo-${i}-${photoUpdateTrigger.value}`
          });
        }),
        Z: editMode.value,
        aa: editMode.value
      }, editMode.value ? {
        ab: common_vendor.o(pickGallery)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-19c9ba30"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/petDetail/petDetail.js.map
