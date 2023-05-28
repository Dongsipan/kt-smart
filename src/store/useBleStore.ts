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
    connectedDevice: {} as PeripheralModule,
    availableDevices: [
      {"device":{"deviceId":"509D3B9C-FE9A-BF1F-2519-6250EFCE9E07","name":"董思盼的MacBook Pro"},"rssi":-56,"txPower":9,"uuids":[],"isPaired":false,"isPairing":false},
      {"txPower":8,"uuids":[],"rssi":-98,"device":{"name":"董思盼的Apple Watch","deviceId":"51FD931A-0A66-D005-99B3-C29AE796B21F"},"isPaired":false,"isPairing":false},
      {"device":{"name":"yeelink.light.light3","deviceId":"5576AE7E-C57F-F894-367F-2CEB9B39F1A6"},"serviceData":{"0000fe95-0000-1000-8000-00805f9b34fb":{}},"rssi":-101,"txPower":127,"uuids":[],"localName":"yeelink.light.light3","isPaired":false,"isPairing":false}
    ] as any [],
    pairedDevices: [] as any[]
  }),
  getters: {
    getConnectedDevice: (state) => state.connectedDevice,
    getAvailableDevices: (state) => state.availableDevices
  },
  actions: {
    setConnectedDevice(payload: PeripheralModule) {
      this.connectedDevice = payload
      this.pairedDevices = [payload]
    },
    removeConnectedDevice() {
      return new Promise((resolve, reject) => {
        try {
          this.connectedDevice = {} as PeripheralModule
          resolve(true)
        } catch (e) {
          reject(e)
        }
      })
    },
    setAvailableDevice(payload: any) {
      this.availableDevices.push(payload)
    },
    setPairedDevices(payload: any) {
      this.pairedDevices.push(payload)
    }
  },
  persist: false
})
