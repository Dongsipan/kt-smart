import {defineStore, storeToRefs} from "pinia";
import {useSettingStore} from "@/store/useSettingStore";

const { getPosition, getDisplayType } = storeToRefs(useSettingStore())

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    electricQuantity: 0,
    speed: 0,
    gearPosition: -1,
    singleMileage: 0,
    singleTime: '00:00:00',
    totalMileage: 0,
    lightStatus: false,
    assistance: 0
  }),
  getters: {
    getElectricQuantity: (state) => state.electricQuantity,
    getSpeed: (state) => state.speed,
    getGearPosition: (state) => {
      return getPosition.value === 8 ? state.gearPosition === -1 ? 5 : state.gearPosition : state.gearPosition
    },
    getSingleMileage: (state) => {
      return state.singleMileage.toFixed(1)
    },
    getSingleKM: (state) => {
      const value = state.singleMileage * 0.6213712
      return value.toFixed(1)
    },
    getSingleTime: (state) => state.singleTime,
    getTotalMileage: (state) => {
      return state.totalMileage.toFixed(1)
    },
    getTotalKM: (state) => {
      const value = state.totalMileage * 0.6213712
      return value.toFixed(1)
    },
    getLightStatus: (state) => state.lightStatus,
    getAssistance: (state) => state.assistance,

  },
  actions: {
    setGearPosition(payload: number) {
      this.gearPosition = payload;
    },
    setSingleMileage(payload: number) {
      this.singleMileage = payload;
    },
    setSingleTime(payload: string) {
      this.singleTime = payload;
    },
    setTotalMileage(payload: number) {
      this.totalMileage = payload;
    },
    setElectricQuantity(payload: number) {
      this.electricQuantity = payload;
    },
    setSpeed(payload: number) {
      this.speed = payload;
      // setInterval(() => {
      //   this.speed = Math.floor(Math.random()*72)
      // }, 1000)
    },
    setLightStatus(payload: boolean) {
      this.lightStatus = payload;
    },
    setAssistance(payload: number) {
      this.assistance = payload;
    }
  },
  persist: {
    paths: ['gearPosition', 'displayType', 'totalMileage']
  }
})
