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
            pet.value = { ...pet.value || {} };
          } else {
            avatarCache.set(normalized, "/static/logo.png");
            pet.value = { ...pet.value || {} };
          }
        },
        fail: () => {
          avatarCache.set(normalized, "/static/logo.png");
          pet.value = { ...pet.value || {} };
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
            common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:217", "照片下载失败:", normalized, res.statusCode);
            photoCache.set(normalized, "/static/index/add.png");
            photoUpdateTrigger.value++;
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:223", "照片下载失败:", normalized, err);
          photoCache.set(normalized, "/static/index/add.png");
          photoUpdateTrigger.value++;
        }
      });
      return "/static/index/add.png";
    }
    common_vendor.onLoad(async (query) => {
      var _a;
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:235", "=== 宠物详情页加载调试信息 ===");
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:236", "URL参数:", query);
      if (query == null ? void 0 : query.pet) {
        try {
          const data = JSON.parse(decodeURIComponent(query.pet));
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:241", "解析后的宠物数据:", data);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:242", "宠物头像URL:", data.avatarUrl);
          Object.assign(pet.value, data);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:244", "赋值后的pet.value:", pet.value);
          if (data.avatarUrl) {
            common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:248", "🔍 测试图片URL可访问性...");
            common_vendor.index.request({
              url: data.avatarUrl,
              method: "HEAD",
              success: (testRes) => {
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:255", "✅ 原始图片URL测试成功:", testRes.statusCode);
              },
              fail: (testErr) => {
                common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:258", "❌ 原始图片URL测试失败:", testErr);
              }
            });
            const filename = data.avatarUrl.split("/").pop();
            const testUrl = `http://pet-api.zbinli.cn/api/test-image/${filename}`;
            common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:265", "🧪 测试API路由:", testUrl);
            common_vendor.index.request({
              url: testUrl,
              method: "GET",
              success: (apiRes) => {
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:271", "✅ API路由测试成功:", apiRes.statusCode);
              },
              fail: (apiErr) => {
                common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:274", "❌ API路由测试失败:", apiErr);
              }
            });
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:279", "解析宠物数据失败:", e);
        }
      }
      if ((_a = pet.value) == null ? void 0 : _a.id) {
        try {
          const res = await utils_api.api.getMedia({ petId: pet.value.id });
          const mediaList = Array.isArray(res) ? res : res.media || res.data || [];
          const sortedMediaList = mediaList.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
            const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
            return timeA - timeB;
          });
          gallery.value = sortedMediaList.map((m) => m.url).filter(Boolean);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:296", "照片按时间排序:", sortedMediaList.map((m) => ({ url: m.url, createdAt: m.createdAt || m.created_at })));
        } catch (err) {
          common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:298", "加载宠物相册失败", err);
        }
      }
    });
    common_vendor.ref([
      { id: "r1", time: "今天 08:00", type: "喂食", desc: "猫粮 60g" },
      { id: "r2", time: "昨天 21:10", type: "清洁", desc: "铲砂" }
    ]);
    const vaccines = common_vendor.ref([]);
    const temperament = common_vendor.ref("");
    const gallery = common_vendor.ref([]);
    const editMode = common_vendor.ref(false);
    const genders = common_vendor.ref(["女生", "男生"]);
    const genderIndex = common_vendor.ref(1);
    const vaccineOptions = common_vendor.ref(["已接种猫三联疫苗", "已接种狂犬疫苗"]);
    const form = common_vendor.reactive({ name: "", months: "", weight: "", gender: "male", breed: "", color: "", neutered: false, birthday: "", startTogether: "", avatar: "", vaccines: [], temperament: "", gallery: [] });
    const originalGallery = common_vendor.ref([]);
    function startEdit() {
      editMode.value = true;
      Object.assign(form, { ...pet.value, vaccines: [...vaccines.value], temperament: temperament.value, avatarUrl: pet.value.avatarUrl, gallery: [...gallery.value] });
      originalGallery.value = [...gallery.value];
      genderIndex.value = form.gender === "male" ? 1 : 0;
    }
    function cancelEdit() {
      editMode.value = false;
      gallery.value = [...originalGallery.value];
    }
    async function saveEdit() {
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
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
            const { uploadImage, compressImage } = await "../../utils/upload.js";
            const compressedPath = await compressImage(form.avatar, 0.8);
            const avatarUrl = await uploadImage(compressedPath, "avatar");
            updateData.avatarUrl = avatarUrl;
          } catch (error) {
            common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:357", "头像上传失败:", error);
            common_vendor.index.showToast({ title: "头像上传失败，其他信息已保存", icon: "none" });
          }
        } else if (form.avatarUrl) {
          updateData.avatarUrl = form.avatarUrl;
        }
        await utils_api.api.updatePet(pet.value.id, updateData);
        common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:368", "🔍 检查照片更新...");
        common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:369", "form.gallery:", form.gallery);
        common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:370", "gallery.value:", gallery.value);
        if (form.gallery && form.gallery.length > 0) {
          const newPhotos = form.gallery.filter((photo) => photo.startsWith("wxfile://"));
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:375", "新照片数量:", newPhotos.length);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:376", "新照片路径:", newPhotos);
          if (newPhotos.length > 0) {
            try {
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:380", "开始上传照片...");
              const uploadPromises = newPhotos.map(async (photoPath) => {
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:384", "压缩照片:", photoPath);
                const compressedPath = await utils_upload.compressImage(photoPath, 0.7);
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:386", "压缩后路径:", compressedPath);
                const uploadedUrl = await utils_upload.uploadImage(compressedPath, "gallery");
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:388", "上传成功，URL:", uploadedUrl);
                return uploadedUrl;
              });
              const uploadedUrls = await Promise.all(uploadPromises);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:393", "所有照片上传完成:", uploadedUrls);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:396", "创建媒体记录...");
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:397", "petId:", pet.value.id);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:398", "urls:", uploadedUrls);
              const mediaResult = await utils_api.api.createMedia({
                petId: pet.value.id,
                type: "image",
                urls: uploadedUrls,
                description: "宠物照片"
              });
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:407", "媒体记录创建结果:", mediaResult);
              common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:408", "成功上传照片:", uploadedUrls.length, "张");
              try {
                const res = await utils_api.api.getMedia({ petId: pet.value.id });
                const mediaList = Array.isArray(res) ? res : res.media || res.data || [];
                const sortedMediaList = mediaList.sort((a, b) => {
                  const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
                  const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
                  return timeA - timeB;
                });
                gallery.value = sortedMediaList.map((m) => m.url).filter(Boolean);
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:423", "保存后重新加载照片，按时间排序:", sortedMediaList.map((m) => ({ url: m.url, createdAt: m.createdAt || m.created_at })));
              } catch (err) {
                common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:425", "重新加载照片失败，使用本地更新:", err);
                const existingPhotos = form.gallery.filter((photo) => !photo.startsWith("wxfile://"));
                gallery.value = [...existingPhotos, ...uploadedUrls];
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:432", "照片上传失败:", error);
              common_vendor.index.showToast({ title: "照片上传失败，其他信息已保存", icon: "none" });
            }
          } else {
            common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:436", "没有新照片需要上传");
          }
        } else {
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:439", "没有照片需要处理");
        }
        pet.value = { ...pet.value, ...updateData };
        vaccines.value = [...form.vaccines];
        temperament.value = form.temperament;
        gallery.value = [...form.gallery];
        editMode.value = false;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:454", "保存失败:", error);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
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
      common_vendor.index.chooseImage({ count: 1, sizeType: ["compressed"], success: (res) => {
        form.avatar = res.tempFilePaths[0];
      } });
    }
    function pickGallery() {
      common_vendor.index.chooseImage({ count: 9, sizeType: ["compressed"], success: (res) => {
        form.gallery = form.gallery.concat(res.tempFilePaths);
      } });
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
            common_vendor.index.showToast({ title: "宠物已删除", icon: "success" });
            common_vendor.index.$emit && common_vendor.index.$emit("pets:changed");
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 600);
          } catch (e) {
            common_vendor.index.showToast({ title: "删除失败", icon: "none" });
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
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:521", "✅ 头像图片加载成功:", e);
    }
    function onAvatarError(e) {
      common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:525", "❌ 头像图片加载失败:", e);
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:526", "当前图片URL:", pet.value.avatarUrl);
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
