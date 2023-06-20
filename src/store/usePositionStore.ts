import { defineStore } from "pinia";
import { Position } from "@capacitor/geolocation";

export interface Track {
  id: number;
  path: AMap.LngLat[];
  maxSpeed: string | number;
  maxAltitude: string | number;
  averageSpeed: string | number;
  distance: string | number;
  time: string;
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
