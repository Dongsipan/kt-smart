import { defineStore } from "pinia";
import { Position } from "@capacitor/geolocation";

export const usePositionStore = defineStore("position", {
  state: () => ({
    currentPosition: {} as Position,
    currentTrack: [] as number[][],
    historyTrack: [] as [],
  }),
  getters: {},
  actions: {
    setCurrentPosition(payload: Position) {
      this.currentPosition = payload;
    },
    setCurrentTrack(payload: number[][]) {
      this.currentTrack = payload;
    },
  },
  persist: true,
});
