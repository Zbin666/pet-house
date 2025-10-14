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
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:130", "=== 宠物详情页加载调试信息 ===");
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:131", "URL参数:", query);
      if (query == null ? void 0 : query.pet) {
        try {
          const data = JSON.parse(decodeURIComponent(query.pet));
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:136", "解析后的宠物数据:", data);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:137", "宠物头像URL:", data.avatarUrl);
          Object.assign(pet.value, data);
          common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:139", "赋值后的pet.value:", pet.value);
          if (data.avatarUrl) {
            common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:143", "🔍 测试图片URL可访问性...");
            common_vendor.index.request({
              url: data.avatarUrl,
              method: "HEAD",
              success: (testRes) => {
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:150", "✅ 原始图片URL测试成功:", testRes.statusCode);
              },
              fail: (testErr) => {
                common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:153", "❌ 原始图片URL测试失败:", testErr);
              }
            });
            const filename = data.avatarUrl.split("/").pop();
            const testUrl = `http://10.161.196.67:3000/api/test-image/${filename}`;
            common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:160", "🧪 测试API路由:", testUrl);
            common_vendor.index.request({
              url: testUrl,
              method: "GET",
              success: (apiRes) => {
                common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:166", "✅ API路由测试成功:", apiRes.statusCode);
              },
              fail: (apiErr) => {
                common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:169", "❌ API路由测试失败:", apiErr);
              }
            });
          }
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:174", "解析宠物数据失败:", e);
        }
      }
      if ((_a = pet.value) == null ? void 0 : _a.id) {
        try {
          const res = await utils_api.api.getMedia({ petId: pet.value.id });
          const mediaList = Array.isArray(res) ? res : res.media || res.data || [];
          gallery.value = mediaList.map((m) => m.url).filter(Boolean);
        } catch (err) {
          common_vendor.index.__f__("warn", "at pages/petDetail/petDetail.vue:184", "加载宠物相册失败", err);
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
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:287", "✅ 头像图片加载成功:", e);
    }
    function onAvatarError(e) {
      common_vendor.index.__f__("error", "at pages/petDetail/petDetail.vue:291", "❌ 头像图片加载失败:", e);
      common_vendor.index.__f__("log", "at pages/petDetail/petDetail.vue:292", "当前图片URL:", pet.value.avatarUrl);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: editMode.value && form.avatarUrl ? form.avatarUrl : pet.value.avatarUrl || "/static/logo.png",
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
        C: common_assets._imports_0$9,
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
            a: g,
            b: common_vendor.o(($event) => preview(i), "g" + i)
          }, editMode.value ? {
            c: common_vendor.o(($event) => deletePhoto(i), "g" + i)
          } : {}, {
            d: "g" + i
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
