import { defineStore } from "pinia";
import { DefaultSetting } from "@/const/setting.const";
import { DimensionList, LevelList } from "@/const/bike.const";

export const useSettingStore = defineStore("setting", {
  state: () => ({
    maxSpeed: DefaultSetting.maxSpeed,
    dimension: DefaultSetting.dimension,
    p1: DefaultSetting.p1,
    p2: DefaultSetting.p2,
    p3: DefaultSetting.p3,
    p4: DefaultSetting.p4,
    p5: DefaultSetting.p5,
    c1: DefaultSetting.c1,
    c2: DefaultSetting.c2,
    c3: DefaultSetting.c3,
    c4: DefaultSetting.c4,
    c5: DefaultSetting.c5,
    c7: DefaultSetting.c7,
    c12: DefaultSetting.c12,
    c13: DefaultSetting.c13,
    c14: DefaultSetting.c14,
    percent: DefaultSetting.percent,
    handlebarMaxSpeed: DefaultSetting.handlebarMaxSpeed,
    candidateParam: DefaultSetting.candidateParam,
    displayType: DefaultSetting.displayType,
    dimensionList: DimensionList,
    levelList: LevelList,
  }),
  getters: {
    getMaxSpeed: (state) => state.maxSpeed,
    getDimension: (state) => state.dimension,
    getP1: (state) => state.p1,
    getP2: (state) => state.p2,
    getP3: (state) => state.p3,
    getP4: (state) => state.p4,
    getP5: (state) => state.p5,
    getC1: (state) => state.c1,
    getC2: (state) => state.c2,
    getPosition: (state) => {
      return state.c3;
    },
    getC4: (state) => state.c4,
    getC5: (state) => state.c5,
    getC7: (state) => state.c7,
    getC12: (state) => state.c12,
    getC13: (state) => state.c13,
    getC14: (state) => state.c14,
    getPercent: (state) => state.percent,
    getHandlebarMaxSpeed: (state) => state.handlebarMaxSpeed,
    getCandidateParam: (state) => state.candidateParam,
    getDisplayType: (state) => state.displayType,
    getDisplayUnit: (state) =>
      state.displayType === "kilometer" ? "KM/h" : "Mil/h",
  },
  actions: {
    setMaxSpeed(payload: number) {
      this.maxSpeed = payload;
    },
    setDimension(payload: number) {
      this.dimension = payload;
    },
    setP1(payload: number) {
      this.p1 = payload;
    },
    setP2(payload: number) {
      this.p2 = payload;
    },
    setP3(payload: number) {
      this.p3 = payload;
    },
    setP4(payload: number) {
      this.p4 = payload;
    },
    setP5(payload: number) {
      this.p5 = payload;
    },
    setC1(payload: number) {
      this.c1 = payload;
    },
    setC2(payload: number) {
      this.c2 = payload;
    },
    setC3(payload: number) {
      this.c3 = payload;
    },
    setC4(payload: number) {
      this.c4 = payload;
    },
    setC5(payload: number) {
      this.c5 = payload;
    },
    setC7(payload: number) {
      this.c7 = payload;
    },
    setC12(payload: number) {
      this.c12 = payload;
    },
    setC13(payload: number) {
      this.c13 = payload;
    },
    setC14(payload: number) {
      this.c14 = payload;
    },
    setPercent(payload: number) {
      this.percent = payload;
    },
    setHandlebarMaxSpeed(payload: number) {
      this.handlebarMaxSpeed = payload;
    },
    setCandidateParam(payload: number) {
      this.candidateParam = payload;
    },
    setDisplayType(payload: string) {
      this.displayType = payload;
    },
  },
  persist: true,
});
