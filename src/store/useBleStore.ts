import {defineStore} from "pinia";

export interface CharacteristicModule {
  service: string;
  characteristic: string;
  properties: string[];
}
export interface PeripheralModule {
  name: string;
  id: string;
  advertising: object;
  rssi: string;
  isPairing: boolean;
  isPaired: boolean;
  services: string[];
  characteristics: CharacteristicModule[];
}
export const useBleStore = defineStore('ble', {
  state: () => ({
    connectedDevice: {},
    availableDevices: [] as any[]
  }),
  getters: {
    getConnectedDevice: (state) => state.connectedDevice,
    getAvailableDevices: (state) => state.availableDevices
  },
  actions: {
    setConnectedDevice(payload: PeripheralModule) {
      return new Promise((resolve, reject) => {
        try {
          this.connectedDevice = payload
          resolve(payload)
        } catch (e) {
          reject(e)
        }
      })
    },
    removeConnectedDevice() {
      return new Promise((resolve, reject) => {
        try {
          this.connectedDevice = {}
          resolve(true)
        } catch (e) {
          reject(e)
        }
      })
    },
    setAvailableDevice(payload: any) {
      return new Promise((resolve, reject) => {
        try {
          this.availableDevices.push(payload)
          resolve(payload)
        } catch (e) {
          reject(e)
        }
      })
    },
  },
  persist: true
})
