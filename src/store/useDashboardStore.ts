import {defineStore} from "pinia";

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    electricQuantity: 0,
    speed: 0,
    gearPosition: 0,
    displayType: 'mile',
    singleMileage: 0,
    singleTime: '',
    totalMileage: 0,
    lightStatus: false,
    assistanceStatus: false,
    isKmUint: false,
    assistance: 0
  }),
  getters: {
    getElectricQuantity: (state) => state.electricQuantity,
    getSpeed: (state) => state.speed,
    getGearPosition: (state) => state.gearPosition,
    getDisplayType: (state) => state.displayType,
    getSingleMileage: (state) => state.singleMileage,
    getSingleTime: (state) => state.singleTime,
    getTotalMileage: (state) => state.totalMileage,
    getLightStatus: (state) => state.lightStatus,
    getAssistanceStatus: (state) => state.assistanceStatus,
    getIsKmUint: (state) => state.isKmUint,
    getAssistance: (state) => state.assistance
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
    setDisplayType(payload: string) {
      this.displayType = payload
    },
    setElectricQuantity(payload: number) {
      this.electricQuantity = payload;
    },
    setSpeed(payload: number) {
      this.speed = payload;
    },
    setLightStatus(payload: boolean) {
      this.lightStatus = payload;
    },
    setAssistanceStatus(payload: boolean) {
      this.assistanceStatus = payload;
    },
    setIsKmUint(payload: boolean) {
      this.isKmUint = payload
    },
    setAssistance(payload: number) {
      this.assistance = payload;
    }
  },
  persist: true
})
