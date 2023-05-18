import {defineStore} from "pinia";

export interface CharacteristicModule {
  service: string;
  characteristic: string;
  properties: string[];
}
export interface PeripheralModule {
  name: string;
  id: string;
  advertising: {};
  rssi: string;
  isPairing: boolean;
  isPaired: boolean;
  services: string[];
  characteristics: CharacteristicModule[];
}
export const useBleStore = defineStore('ble', {
  state: () => ({
    connectedDevice: {},
    availableDevices: [
      // {
      //   id: '0D:CD:45:F1:D9:BF',
      //   name: 'aaaa',
      //   advertising: {},
      //   rssi: '-86',
      //   isPairing: false,
      //   isPaired: false,
      //   services: [],
      //   characteristics: []
      // },
      // {
      //   id: '0D:CD:45:F9:D9:BF',
      //   name: 'bbbb',
      //   advertising: {},
      //   rssi: '-86',
      //   isPairing: false,
      //   isPaired: false,
      //   services: [],
      //   characteristics: []
      // }
    ]
  }),
  getters: {
    gerConnectedDevice: (state) => state.connectedDevice,
    getAvailableDevices: (state) => state.availableDevices
  },
  actions: {
    setConnectedDevice(payload: PeripheralModule) {
      this.connectedDevice = payload
    },
    removeConnectedDevice() {
      this.connectedDevice = {}
    }
  }
})