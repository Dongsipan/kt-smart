import {defineStore} from "pinia";

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    electricQuantity: 0,
    speed: 0,
    gearPosition: 0,
    displayType: 'mile',
    singleMileage: 0,
    singleTime: '00:00:00',
    totalMileage: 0,
    lightStatus: false,
    assistanceStatus: false,
    isKmUnit: false,
    assistance: 0
  }),
  getters: {
    getElectricQuantity: (state) => state.electricQuantity,
    getSpeed: (state) => state.speed,
    getGearPosition: (state) => state.gearPosition,
    getDisplayType: (state) => state.displayType,
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
    getAssistanceStatus: (state) => state.assistanceStatus,
    getUnit: (state) => {
      return state.isKmUnit ? 'KM/h' : 'Mil/h'
    },
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
    setIsKmUnit(payload: boolean) {
      this.isKmUnit = payload
    },
    setAssistance(payload: number) {
      this.assistance = payload;
    }
  },
  persist: true
})
