import { defineStore } from "pinia";
import { BleDevice } from "@capacitor-community/bluetooth-le";

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

export interface Device extends BleDevice {
  isPaired: boolean;
  isPairing: boolean;

  [propName: string]: any;
}

export const useBleStore = defineStore("ble", {
  state: () => ({
    connectedDevice: {} as Device,
    availableDevices: [] as Device[],
  }),
  getters: {
    getConnectedDevice: (state) => state.connectedDevice,
    getAvailableDevices: (state) => state.availableDevices,
  },
  actions: {
    setConnectedDevice(payload: Device) {
      this.connectedDevice = payload;
    },
    updateConnectedDevicePairedStatus(payload: boolean) {
      this.connectedDevice.isPaired = payload;
    },
    updateConnectedDevicePairingStatus(payload: boolean) {
      this.connectedDevice.isPairing = payload;
    },
    removeConnectedDevice(payload: Device) {
      this.connectedDevice = {} as Device;
    },
    setAvailableDevice(payload: Device) {
      this.availableDevices.push(payload);
    },
    clearAvailableDevices() {
      this.availableDevices.length = 0;
    },
  },
  persist: {
    paths: ["connectedDevice"],
  },
});
