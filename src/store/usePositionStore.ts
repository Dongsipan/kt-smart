import { defineStore } from "pinia";
import { Position } from "@capacitor/geolocation";

export interface Track {
  id: number;
  path: AMap.LngLat[];
  maxSpeed: number;
  maxAltitude: number;
  distance: number;
  time: number;
}

export const usePositionStore = defineStore("position", {
  state: () => ({
    currentPosition: {} as Position,
    historyTrack: [] as Track[],
  }),
  getters: {
    getHistoryTrackById: (state) => {
      return (id: number) =>
        state.historyTrack.find((history) => history.id === id);
    },
  },
  actions: {
    setCurrentPosition(payload: Position) {
      this.currentPosition = payload;
    },
    addHistoryTrack(payload: Track) {
      this.historyTrack.push(payload);
    },
  },
  persist: true,
});
