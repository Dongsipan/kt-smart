import { defineStore } from "pinia";

export const useErrorStore = defineStore("error", {
  state: () => ({
    errorCode: -1,
  }),
  getters: {
    hasError: (state) => state.errorCode > 0,
    current: (state) => state.errorCode === 33,
    throttle: (state) => state.errorCode === 34,
    motorPhase: (state) => state.errorCode === 35,
    motorHall: (state) => state.errorCode === 36,
    torqueSensor: (state) => state.errorCode === 38,
    speedSensor: (state) => state.errorCode === 39,
  },
  actions: {
    setErrorCode(payload: number) {
      this.errorCode = payload;
    },
  },
  persist: true,
});
