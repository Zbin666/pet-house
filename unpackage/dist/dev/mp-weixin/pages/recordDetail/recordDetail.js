"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
    const recordData = common_vendor.ref({});
    const editMode = common_vendor.ref(false);
    const form = common_vendor.reactive({});
    const showModal = common_vendor.ref(false);
    const newRecord = common_vendor.reactive({});
    const petList = common_vendor.ref([
      { id: 1, name: "火火", avatar: "/static/logo.png" },
      { id: 2, name: "水水", avatar: "/static/logo.png" },
      { id: 3, name: "土土", avatar: "/static/logo.png" }
    ]);
    const selectedPets = common_vendor.ref([]);
    const showAllPets = common_vendor.ref(false);
    const currentIndex = common_vendor.ref(0);
    const recordList = common_vendor.ref([]);
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
    common_vendor.onLoad((query) => {
      common_vendor.index.setNavigationBarTitle({ title: "记录详情" });
      common_vendor.index.setNavigationBarColor({ frontColor: "#000000", backgroundColor: "#fff1a8" });
      initRecordList(query);
    });
    function initRecordList(query) {
      const targetType = query.type || "eating";
      const getRecordsByType = (type) => {
        const baseTime = /* @__PURE__ */ new Date();
        const records = [];
        switch (type) {
          case "eating":
            records.push(
              {
                type: recordTypes.eating,
                data: {
                  time: baseTime,
                  petName: "火火",
                  petAvatar: "/static/logo.png",
                  foodType: "猫粮",
                  weight: 50,
                  note: "今天食欲很好"
                }
              },
              {
                type: recordTypes.eating,
                data: {
                  time: new Date(baseTime.getTime() - 24 * 60 * 60 * 1e3),
                  petName: "火火",
                  petAvatar: "/static/logo.png",
                  foodType: "罐头",
                  weight: 80,
                  note: "特别爱吃这个口味"
                }
              },
              {
                type: recordTypes.eating,
                data: {
                  time: new Date(baseTime.getTime() - 2 * 24 * 60 * 60 * 1e3),
                  petName: "水水",
                  petAvatar: "/static/logo.png",
                  foodType: "湿粮",
                  weight: 60,
                  note: "新尝试的湿粮"
                }
              }
            );
            break;
          case "drinking":
            records.push(
              {
                type: recordTypes.drinking,
                data: {
                  time: baseTime,
                  petName: "水水",
                  petAvatar: "/static/logo.png",
                  amount: 200,
                  method: "水碗",
                  note: "正常饮水"
                }
              },
              {
                type: recordTypes.drinking,
                data: {
                  time: new Date(baseTime.getTime() - 24 * 60 * 60 * 1e3),
                  petName: "火火",
                  petAvatar: "/static/logo.png",
                  amount: 150,
                  method: "自动饮水机",
                  note: "喜欢流动的水"
                }
              }
            );
            break;
          case "weight":
            records.push(
              {
                type: recordTypes.weight,
                data: {
                  time: baseTime,
                  petName: "土土",
                  petAvatar: "/static/logo.png",
                  weight: 4.2,
                  method: "电子秤",
                  note: "体重稳定"
                }
              },
              {
                type: recordTypes.weight,
                data: {
                  time: new Date(baseTime.getTime() - 7 * 24 * 60 * 60 * 1e3),
                  petName: "土土",
                  petAvatar: "/static/logo.png",
                  weight: 4.1,
                  method: "电子秤",
                  note: "略有增长"
                }
              }
            );
            break;
          case "washing":
            records.push(
              {
                type: recordTypes.washing,
                data: {
                  time: baseTime,
                  petName: "火火",
                  petAvatar: "/static/logo.png",
                  washType: "洗澡",
                  product: "宠物专用洗发水",
                  note: "洗得很干净"
                }
              },
              {
                type: recordTypes.washing,
                data: {
                  time: new Date(baseTime.getTime() - 14 * 24 * 60 * 60 * 1e3),
                  petName: "水水",
                  petAvatar: "/static/logo.png",
                  washType: "梳毛",
                  product: "宠物梳子",
                  note: "梳理得很顺滑"
                }
              }
            );
            break;
          case "noting":
            records.push(
              {
                type: recordTypes.noting,
                data: {
                  time: baseTime,
                  petName: "水水",
                  petAvatar: "/static/logo.png",
                  content: "今天火火特别活泼，在客厅里跑来跑去，还学会了新的小把戏！",
                  photos: ["/static/logo.png", "/static/logo.png"]
                }
              },
              {
                type: recordTypes.noting,
                data: {
                  time: new Date(baseTime.getTime() - 24 * 60 * 60 * 1e3),
                  petName: "土土",
                  petAvatar: "/static/logo.png",
                  content: "土土今天很安静，一直在窗边晒太阳，看起来很享受。",
                  photos: ["/static/logo.png"]
                }
              }
            );
            break;
          default:
            records.push({
              type: recordTypes.eating,
              data: {
                time: baseTime,
                petName: "火火",
                petAvatar: "/static/logo.png",
                foodType: "猫粮",
                weight: 50,
                note: "今天食欲很好"
              }
            });
        }
        return records;
      };
      recordList.value = getRecordsByType(targetType);
      currentIndex.value = 0;
      if (recordList.value.length > 0) {
        const currentRecordData = recordList.value[currentIndex.value];
        currentRecord.value = currentRecordData.type;
        recordData.value = currentRecordData.data;
      }
    }
    function formatTime(time) {
      const date = new Date(time);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    function onSwiperChange(e) {
      currentIndex.value = e.detail.current;
      if (recordList.value.length > 0) {
        const currentRecordData = recordList.value[currentIndex.value];
        currentRecord.value = currentRecordData.type;
        recordData.value = currentRecordData.data;
      }
    }
    function goToSlide(index) {
      currentIndex.value = index;
      if (recordList.value.length > 0) {
        const currentRecordData = recordList.value[currentIndex.value];
        currentRecord.value = currentRecordData.type;
        recordData.value = currentRecordData.data;
      }
    }
    function startEdit() {
      editMode.value = true;
      Object.assign(form, recordData.value);
      const currentPet = petList.value.find((pet) => pet.name === recordData.value.petName);
      if (currentPet) {
        form.petId = currentPet.id;
      }
    }
    function cancelEdit() {
      editMode.value = false;
    }
    function selectPet(pet) {
      form.petId = pet.id;
      form.petName = pet.name;
      form.petAvatar = pet.avatar;
    }
    function saveEdit() {
      if (recordList.value.length > 0) {
        Object.assign(recordList.value[currentIndex.value].data, form);
        recordData.value = recordList.value[currentIndex.value].data;
      }
      editMode.value = false;
      common_vendor.index.showToast({
        title: "保存成功",
        icon: "success"
      });
    }
    function deleteRecord() {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除这条${currentRecord.value.title}记录吗？`,
        confirmText: "删除",
        cancelText: "取消",
        confirmColor: "#ff4757",
        success: (res) => {
          if (res.confirm) {
            recordList.value.splice(currentIndex.value, 1);
            if (recordList.value.length === 0) {
              common_vendor.index.showToast({
                title: "删除成功",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
              return;
            }
            if (currentIndex.value >= recordList.value.length) {
              currentIndex.value = recordList.value.length - 1;
            }
            const currentRecordData = recordList.value[currentIndex.value];
            currentRecord.value = currentRecordData.type;
            recordData.value = currentRecordData.data;
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
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
    function toggleExpand() {
      showAllPets.value = !showAllPets.value;
    }
    function showAddModal() {
      Object.keys(newRecord).forEach((key) => delete newRecord[key]);
      selectedPets.value = [];
      showAllPets.value = false;
      showModal.value = true;
    }
    function hideAddModal() {
      showModal.value = false;
    }
    function saveNewRecord() {
      common_vendor.index.showToast({
        title: "记录已保存",
        icon: "success"
      });
      hideAddModal();
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(recordList.value, (record, index, i0) => {
          return common_vendor.e({
            a: isDogTop(index) ? 1 : "",
            b: getTopImage(index),
            c: record.type.icon,
            d: common_vendor.t(record.type.title),
            e: common_vendor.t(formatTime(record.data.time))
          }, !editMode.value ? {
            f: record.data.petAvatar,
            g: common_vendor.t(record.data.petName)
          } : {
            h: common_vendor.f(petList.value, (pet, k1, i1) => {
              return {
                a: pet.avatar,
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
            aC: record.data.photos && record.data.photos.length
          }, record.data.photos && record.data.photos.length ? {
            aD: common_vendor.f(record.data.photos, (photo, i, i1) => {
              return {
                a: i,
                b: photo
              };
            })
          } : {}) : record.type.key === "abnormal" ? common_vendor.e({
            aF: !editMode.value
          }, !editMode.value ? {
            aG: common_vendor.t(record.data.abnormalType || "未填写")
          } : {
            aH: form.abnormalType,
            aI: common_vendor.o(($event) => form.abnormalType = $event.detail.value, index)
          }, {
            aJ: !editMode.value
          }, !editMode.value ? {
            aK: common_vendor.t(record.data.severity || "未填写")
          } : {
            aL: form.severity,
            aM: common_vendor.o(($event) => form.severity = $event.detail.value, index)
          }, {
            aN: !editMode.value
          }, !editMode.value ? {
            aO: common_vendor.t(record.data.description || "无")
          } : {
            aP: form.description,
            aQ: common_vendor.o(($event) => form.description = $event.detail.value, index)
          }) : record.type.key === "medicine" ? common_vendor.e({
            aS: !editMode.value
          }, !editMode.value ? {
            aT: common_vendor.t(record.data.medicineName || "未填写")
          } : {
            aU: form.medicineName,
            aV: common_vendor.o(($event) => form.medicineName = $event.detail.value, index)
          }, {
            aW: !editMode.value
          }, !editMode.value ? {
            aX: common_vendor.t(record.data.dosage || "未填写")
          } : {
            aY: form.dosage,
            aZ: common_vendor.o(($event) => form.dosage = $event.detail.value, index)
          }, {
            ba: !editMode.value
          }, !editMode.value ? {
            bb: common_vendor.t(record.data.medicineTime || "未填写")
          } : {
            bc: form.medicineTime,
            bd: common_vendor.o(($event) => form.medicineTime = $event.detail.value, index)
          }, {
            be: !editMode.value
          }, !editMode.value ? {
            bf: common_vendor.t(record.data.note || "无")
          } : {
            bg: form.note,
            bh: common_vendor.o(($event) => form.note = $event.detail.value, index)
          }) : {}, {
            w: record.type.key === "drinking",
            J: record.type.key === "weight",
            W: record.type.key === "washing",
            aj: record.type.key === "shit",
            ax: record.type.key === "noting",
            aE: record.type.key === "abnormal",
            aR: record.type.key === "medicine"
          }, !editMode.value ? {
            bi: common_assets._imports_0$8,
            bj: common_vendor.o(startEdit, index)
          } : {
            bk: common_vendor.o(cancelEdit, index),
            bl: common_vendor.o(saveEdit, index)
          }, !editMode.value ? {
            bm: common_assets._imports_1$1,
            bn: common_vendor.o(deleteRecord, index)
          } : {}, {
            bo: index
          });
        }),
        b: !editMode.value,
        c: !editMode.value,
        d: !editMode.value,
        e: editMode.value ? 1 : "",
        f: currentIndex.value,
        g: common_vendor.o(onSwiperChange),
        h: common_vendor.f(recordList.value, (record, index, i0) => {
          return {
            a: index,
            b: common_vendor.n({
              active: index === currentIndex.value
            }),
            c: common_vendor.o(($event) => goToSlide(index), index)
          };
        }),
        i: common_assets._imports_2$2,
        j: common_vendor.o(showAddModal),
        k: isDogBottom(currentIndex.value) ? 1 : "",
        l: getBottomImage(currentIndex.value),
        m: showModal.value
      }, showModal.value ? common_vendor.e({
        n: common_vendor.t(currentRecord.value.title),
        o: common_vendor.o(hideAddModal),
        p: common_vendor.f(showAllPets.value ? petList.value : petList.value.slice(0, 2), (pet, index, i0) => {
          return common_vendor.e({
            a: pet.avatar,
            b: common_vendor.t(pet.name),
            c: selectedPets.value.includes(index)
          }, selectedPets.value.includes(index) ? {} : {}, {
            d: index,
            e: common_vendor.n({
              selected: selectedPets.value.includes(index)
            }),
            f: common_vendor.o(($event) => togglePet(index), index)
          });
        }),
        q: petList.value.length > 2
      }, petList.value.length > 2 ? {
        r: showAllPets.value ? 1 : "",
        s: common_vendor.o(toggleExpand)
      } : {}, {
        t: currentRecord.value.key === "eating"
      }, currentRecord.value.key === "eating" ? {
        v: newRecord.foodType,
        w: common_vendor.o(($event) => newRecord.foodType = $event.detail.value),
        x: newRecord.weight,
        y: common_vendor.o(common_vendor.m(($event) => newRecord.weight = $event.detail.value, {
          number: true
        })),
        z: newRecord.note,
        A: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "drinking" ? {
        C: newRecord.amount,
        D: common_vendor.o(common_vendor.m(($event) => newRecord.amount = $event.detail.value, {
          number: true
        })),
        E: newRecord.method,
        F: common_vendor.o(($event) => newRecord.method = $event.detail.value),
        G: newRecord.note,
        H: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "weight" ? {
        J: newRecord.weight,
        K: common_vendor.o(common_vendor.m(($event) => newRecord.weight = $event.detail.value, {
          number: true
        })),
        L: newRecord.method,
        M: common_vendor.o(($event) => newRecord.method = $event.detail.value),
        N: newRecord.note,
        O: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "washing" ? {
        Q: newRecord.washType,
        R: common_vendor.o(($event) => newRecord.washType = $event.detail.value),
        S: newRecord.product,
        T: common_vendor.o(($event) => newRecord.product = $event.detail.value),
        U: newRecord.note,
        V: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "shit" ? {
        X: newRecord.status,
        Y: common_vendor.o(($event) => newRecord.status = $event.detail.value),
        Z: newRecord.color,
        aa: common_vendor.o(($event) => newRecord.color = $event.detail.value),
        ab: newRecord.note,
        ac: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : currentRecord.value.key === "noting" ? {
        ae: newRecord.content,
        af: common_vendor.o(($event) => newRecord.content = $event.detail.value)
      } : currentRecord.value.key === "abnormal" ? {
        ah: newRecord.abnormalType,
        ai: common_vendor.o(($event) => newRecord.abnormalType = $event.detail.value),
        aj: newRecord.severity,
        ak: common_vendor.o(($event) => newRecord.severity = $event.detail.value),
        al: newRecord.description,
        am: common_vendor.o(($event) => newRecord.description = $event.detail.value)
      } : currentRecord.value.key === "medicine" ? {
        ao: newRecord.medicineName,
        ap: common_vendor.o(($event) => newRecord.medicineName = $event.detail.value),
        aq: newRecord.dosage,
        ar: common_vendor.o(($event) => newRecord.dosage = $event.detail.value),
        as: newRecord.medicineTime,
        at: common_vendor.o(($event) => newRecord.medicineTime = $event.detail.value),
        av: newRecord.note,
        aw: common_vendor.o(($event) => newRecord.note = $event.detail.value)
      } : {}, {
        B: currentRecord.value.key === "drinking",
        I: currentRecord.value.key === "weight",
        P: currentRecord.value.key === "washing",
        W: currentRecord.value.key === "shit",
        ad: currentRecord.value.key === "noting",
        ag: currentRecord.value.key === "abnormal",
        an: currentRecord.value.key === "medicine",
        ax: common_vendor.o(hideAddModal),
        ay: common_vendor.o(saveNewRecord),
        az: common_vendor.o(() => {
        }),
        aA: common_vendor.o(hideAddModal)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7889064e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recordDetail/recordDetail.js.map
