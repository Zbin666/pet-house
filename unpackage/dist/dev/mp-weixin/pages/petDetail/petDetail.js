"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  __name: "petDetail",
  setup(__props) {
    const pet = common_vendor.ref({});
    common_vendor.onLoad(async (query) => {
      var _a;
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      if (query == null ? void 0 : query.pet) {
        try {
          const data = JSON.parse(decodeURIComponent(query.pet));
          Object.assign(pet.value, data);
        } catch (e) {
        }
      }
      if ((_a = pet.value) == null ? void 0 : _a.id) {
        try {
          const res = await utils_api.api.getMedia({ petId: pet.value.id });
          const mediaList = Array.isArray(res) ? res : res.media || res.data || [];
          gallery.value = mediaList.map((m) => m.url).filter(Boolean);
        } catch (err) {
          common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:141", "加载宠物相册失败", err);
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
      pet.value = { ...pet.value, name: form.name, months: form.months, weight: form.weight, gender: form.gender, breed: form.breed, color: form.color, neutered: form.neutered, birthday: form.birthday, startTogether: form.startTogether, avatarUrl: form.avatarUrl || pet.value.avatarUrl };
      vaccines.value = [...form.vaccines];
      temperament.value = form.temperament;
      gallery.value = [...form.gallery];
      editMode.value = false;
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: editMode.value && form.avatarUrl ? form.avatarUrl : pet.value.avatarUrl || "/static/logo.png",
        b: common_vendor.o(($event) => editMode.value ? pickAvatar() : null),
        c: !editMode.value
      }, !editMode.value ? {
        d: common_vendor.t(pet.value.name)
      } : {
        e: form.name,
        f: common_vendor.o(($event) => form.name = $event.detail.value)
      }, {
        g: !editMode.value
      }, !editMode.value ? {
        h: common_vendor.t(pet.value.months || 0)
      } : {
        i: form.months,
        j: common_vendor.o(common_vendor.m(($event) => form.months = $event.detail.value, {
          number: true
        }))
      }, {
        k: !editMode.value
      }, !editMode.value ? {
        l: common_vendor.t(pet.value.weight || 0)
      } : {
        m: form.weight,
        n: common_vendor.o(($event) => form.weight = $event.detail.value)
      }, {
        o: !editMode.value
      }, !editMode.value ? {
        p: common_vendor.t(pet.value.gender === "male" ? "男生" : "女生")
      } : {
        q: common_vendor.t(genders.value[genderIndex.value]),
        r: genders.value,
        s: genderIndex.value,
        t: common_vendor.o(onGenderChange)
      }, {
        v: !editMode.value
      }, !editMode.value ? {
        w: common_vendor.t(pet.value.breed)
      } : {
        x: form.breed,
        y: common_vendor.o(($event) => form.breed = $event.detail.value)
      }, {
        z: !editMode.value
      }, !editMode.value ? {
        A: common_assets._imports_0$8,
        B: common_vendor.o(startEdit),
        C: common_assets._imports_1$1,
        D: common_vendor.o(deletePet)
      } : {
        E: common_vendor.o(cancelEdit),
        F: common_vendor.o(saveEdit)
      }, {
        G: common_assets._imports_1$5,
        H: !editMode.value
      }, !editMode.value ? {
        I: common_vendor.t(pet.value.neutered ? "已绝育" : "未绝育")
      } : {
        J: form.neutered,
        K: common_vendor.o((e) => form.neutered = e.detail.value)
      }, {
        L: common_assets._imports_1$5,
        M: !editMode.value
      }, !editMode.value ? {
        N: common_vendor.f(vaccines.value, (v, i, i0) => {
          return {
            a: common_vendor.t(v),
            b: i
          };
        })
      } : {
        O: common_vendor.f(vaccineOptions.value, (opt, k0, i0) => {
          return {
            a: opt,
            b: form.vaccines.includes(opt),
            c: common_vendor.t(opt),
            d: opt
          };
        }),
        P: common_vendor.o(onVaccinesChange)
      }, {
        Q: common_assets._imports_1$5,
        R: !editMode.value
      }, !editMode.value ? {
        S: common_vendor.t(temperament.value)
      } : {
        T: form.temperament,
        U: common_vendor.o(($event) => form.temperament = $event.detail.value)
      }, {
        V: common_assets._imports_1$5,
        W: common_vendor.f(editMode.value ? form.gallery : gallery.value, (g, i, i0) => {
          return common_vendor.e({
            a: g
          }, editMode.value ? {
            b: common_vendor.o(($event) => deletePhoto(i), "g" + i)
          } : {}, {
            c: "g" + i
          });
        }),
        X: editMode.value,
        Y: editMode.value
      }, editMode.value ? {
        Z: common_vendor.o(pickGallery)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-19c9ba30"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/petDetail/petDetail.js.map
