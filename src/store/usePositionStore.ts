import { defineStore } from "pinia";
import { Position } from "@capacitor/geolocation";

export const usePositionStore = defineStore("position", {
  state: () => ({
    currentPosition: {} as Position,
  }),
  getters: {},
  actions: {
    setCurrentPosition(payload: Position) {
      this.currentPosition = payload;
    },
  },
  persist: true,
});
