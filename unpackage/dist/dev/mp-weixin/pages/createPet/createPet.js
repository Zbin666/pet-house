"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const utils_upload = require("../../utils/upload.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "createPet",
  setup(__props) {
    const form = common_vendor.reactive({
      name: "",
      months: "",
      weight: "",
      gender: "female",
      breed: "",
      color: "",
      birthday: "",
      startTogether: "",
      neutered: false,
      vaccines: [],
      temperament: "",
      avatar: "",
      gallery: []
    });
    const genders = common_vendor.ref(["女生", "男生"]);
    const genderIndex = common_vendor.ref(0);
    const vaccineOptions = common_vendor.ref(["已接种猫三联疫苗", "已接种狂犬疫苗", "已接种其他疫苗"]);
    common_vendor.onLoad(() => {
      common_vendor.index.setNavigationBarColor({
        frontColor: "#000000",
        backgroundColor: "#fff1a8"
      });
    });
    function onGenderChange(e) {
      genderIndex.value = Number(e.detail.value);
      form.gender = genderIndex.value === 1 ? "male" : "female";
    }
    function onBirthdayChange(e) {
      form.birthday = e.detail.value;
    }
    function onStartTogetherChange(e) {
      form.startTogether = e.detail.value;
    }
    function onVaccinesChange(e) {
      form.vaccines = e.detail.value || [];
    }
    async function pickAvatar() {
      try {
        const res = await common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        const compressedPath = await utils_upload.compressImage(res.tempFilePaths[0], 0.8);
        common_vendor.index.showLoading({ title: "上传头像中..." });
        const avatarUrl = await utils_upload.uploadImage(compressedPath, "avatar");
        form.avatar = avatarUrl;
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "头像上传成功", icon: "success" });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/createPet/createPet.vue:215", "选择头像失败:", error);
        common_vendor.index.showToast({ title: "头像上传失败", icon: "none" });
      }
    }
    async function pickPhotos() {
      const remainingCount = 9 - form.gallery.length;
      if (remainingCount <= 0) {
        common_vendor.index.showToast({
          title: "最多只能上传9张照片",
          icon: "none"
        });
        return;
      }
      try {
        const res = await common_vendor.index.chooseImage({
          count: remainingCount,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"]
        });
        common_vendor.index.showLoading({ title: "上传照片中..." });
        const uploadPromises = res.tempFilePaths.map(async (filePath) => {
          const compressedPath = await utils_upload.compressImage(filePath, 0.7);
          return await utils_upload.uploadImage(compressedPath, "gallery");
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        form.gallery = form.gallery.concat(uploadedUrls);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: `成功上传${uploadedUrls.length}张照片`, icon: "success" });
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/createPet/createPet.vue:254", "选择照片失败:", error);
        common_vendor.index.showToast({ title: "照片上传失败", icon: "none" });
      }
    }
    function deletePhoto(index) {
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
    function validateForm() {
      if (!form.name.trim()) {
        common_vendor.index.showToast({
          title: "请输入宠物昵称",
          icon: "none"
        });
        return false;
      }
      return true;
    }
    async function savePet() {
      if (!validateForm())
        return;
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        const payload = {
          name: form.name,
          gender: form.gender,
          breed: form.breed || "",
          neutered: !!form.neutered
        };
        if (form.birthday)
          payload.birthday = form.birthday;
        if (form.startTogether)
          payload.startTogether = form.startTogether;
        if (form.months)
          payload.months = parseInt(form.months);
        if (form.weight)
          payload.weight = parseFloat(form.weight);
        if (form.color)
          payload.color = form.color;
        if (form.temperament)
          payload.temperament = form.temperament;
        if (form.vaccines && form.vaccines.length > 0)
          payload.vaccines = form.vaccines;
        if (form.avatar) {
          payload.avatarUrl = form.avatar;
        }
        common_vendor.index.__f__("log", "at pages/createPet/createPet.vue:317", "提交宠物数据:", payload);
        const pet = await utils_api.api.createPet(payload);
        common_vendor.index.__f__("log", "at pages/createPet/createPet.vue:319", "宠物创建成功:", pet);
        if (form.gallery && form.gallery.length > 0) {
          const uploadedUrls = form.gallery.filter((url) => url && url.trim());
          if (uploadedUrls.length > 0) {
            try {
              await utils_api.api.createMedia({
                petId: pet.id,
                type: "image",
                urls: uploadedUrls,
                description: "宠物照片"
              });
              common_vendor.index.__f__("log", "at pages/createPet/createPet.vue:334", "成功创建媒体记录:", uploadedUrls.length, "张照片");
            } catch (error) {
              common_vendor.index.__f__("warn", "at pages/createPet/createPet.vue:336", "照片上传失败，但宠物已创建:", error);
            }
          } else {
            common_vendor.index.__f__("log", "at pages/createPet/createPet.vue:339", "没有照片，跳过媒体记录创建");
          }
        }
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "宠物创建成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 800);
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/createPet/createPet.vue:352", "创建宠物失败:", e);
        let errorMessage = "创建失败";
        if (e.message) {
          if (e.message.includes("Unauthorized")) {
            errorMessage = "登录已过期，请重新登录";
          } else if (e.message.includes("Network")) {
            errorMessage = "网络连接失败，请检查网络";
          } else {
            errorMessage = `创建失败: ${e.message}`;
          }
        }
        common_vendor.index.showToast({ title: errorMessage, icon: "none" });
      }
    }
    function cancel() {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消创建宠物吗？已填写的信息将丢失。",
        confirmText: "确定",
        cancelText: "继续编辑",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateBack();
          }
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.avatar
      }, form.avatar ? {
        b: form.avatar
      } : {
        c: common_assets._imports_0$1
      }, {
        d: common_vendor.o(pickAvatar),
        e: form.name,
        f: common_vendor.o(($event) => form.name = $event.detail.value),
        g: form.months,
        h: common_vendor.o(common_vendor.m(($event) => form.months = $event.detail.value, {
          number: true
        })),
        i: form.weight,
        j: common_vendor.o(($event) => form.weight = $event.detail.value),
        k: common_vendor.t(genders.value[genderIndex.value]),
        l: genders.value,
        m: genderIndex.value,
        n: common_vendor.o(onGenderChange),
        o: form.breed,
        p: common_vendor.o(($event) => form.breed = $event.detail.value),
        q: form.color,
        r: common_vendor.o(($event) => form.color = $event.detail.value),
        s: common_vendor.t(form.birthday || "选择生日"),
        t: form.birthday,
        v: common_vendor.o(onBirthdayChange),
        w: common_vendor.t(form.startTogether || "选择日期"),
        x: form.startTogether,
        y: common_vendor.o(onStartTogetherChange),
        z: common_assets._imports_1$4,
        A: form.neutered,
        B: common_vendor.o((e) => form.neutered = e.detail.value),
        C: common_vendor.f(vaccineOptions.value, (option, k0, i0) => {
          return {
            a: option,
            b: form.vaccines.includes(option),
            c: common_vendor.t(option),
            d: option
          };
        }),
        D: common_vendor.o(onVaccinesChange),
        E: form.temperament,
        F: common_vendor.o(($event) => form.temperament = $event.detail.value),
        G: common_assets._imports_1$4,
        H: common_vendor.f(form.gallery, (photo, index, i0) => {
          return {
            a: photo,
            b: common_vendor.o(($event) => deletePhoto(index), index),
            c: index
          };
        }),
        I: common_assets._imports_0$1,
        J: common_vendor.o(pickPhotos),
        K: common_vendor.o(cancel),
        L: common_vendor.o(savePet)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6624aaeb"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/createPet/createPet.js.map
