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
    currentPosition: {
      coords: {
        longitude: 120.452849,
        altitudeAccuracy: 19.185361862182617,
        accuracy: 35,
        heading: -1,
        latitude: 31.123824,
        altitude: 5.2325534820556641,
        speed: -1,
      },
      timestamp: 1688915717572,
    } as Position,
    historyTrack: [] as Track[],
    locating: false,
    watching: false,
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
    setLocatingStatus(payload: boolean) {
      this.locating = payload;
    },
    setWatchingStatus(payload: boolean) {
      this.watching = payload;
    },
    addHistoryTrack(payload: Track) {
      this.historyTrack.push(payload);
    },
    deleteHistory(payload: number) {
      this.historyTrack = this.historyTrack.filter(
        (item) => item.id !== payload
      );
    },
    clearHistory() {
      this.historyTrack.length = 0;
    },
  },
  persist: true,
});
