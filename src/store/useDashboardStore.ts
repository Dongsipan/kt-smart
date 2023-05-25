import {defineStore} from "pinia";

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    gearPosition: 0,
    displayType: 'mile',
    singleMileage: 0,
    singleTime: '',
    totalMileage: 0,
  }),
  getters: {
    getGearPosition: (state) => state.gearPosition,
    getDisplayType: (state) => state.displayType,
    getSingleMileage: (state) => state.singleMileage,
    getSingleTime: (state) => state.singleTime,
    getTotalMileage: (state) => state.totalMileage
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
    }
  }
})
