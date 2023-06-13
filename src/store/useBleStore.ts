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
    pairedDevices: [] as Device[],
  }),
  getters: {
    getConnectedDevice: (state) => state.connectedDevice,
    getAvailableDevices: (state) => state.availableDevices,
  },
  actions: {
    setConnectedDevice(payload: Device) {
      this.connectedDevice = payload;
      this.setPairedDevices(payload);
      this.removePairedDeviceFromAvailableDevices(payload);
    },
    updateConnectedDevice(payload: Device) {
      this.connectedDevice = payload;
      this.pairedDevices.forEach((item) => {
        item.isPaired = false;
      });
    },
    updateConnectedDevicePairedStatus(payload: boolean) {
      this.connectedDevice.isPaired = payload;
      this.connectedDevice.isPairing = false;
      const index = this.pairedDevices.findIndex(
        (item) => item.deviceId === this.connectedDevice.deviceId
      );
      if (index > -1) {
        this.pairedDevices[index].isPaired = payload;
        this.pairedDevices[index].isPairing = false;
      }
    },

    removeConnectedDevice(payload: Device) {
      this.connectedDevice = {} as Device;
      this.removePairedDevice(payload);
    },
    setAvailableDevice(payload: Device) {
      this.availableDevices.push(payload);
    },
    clearAvailableDevices() {
      this.availableDevices.length = 0;
    },
    removePairedDeviceFromAvailableDevices(payload: Device) {
      this.$patch((state) => {
        state.availableDevices = this.availableDevices.filter(
          (item) => payload.deviceId !== item.deviceId
        );
      });
    },
    setPairedDevices(payload: Device) {
      this.pairedDevices.push(payload);
    }, // 暂时只存储一个配对的设备
    removePairedDevice(payload: Device) {
      this.pairedDevices = this.pairedDevices.filter(
        (item) => payload.deviceId !== item.deviceId
      );
    },
  },
  persist: {
    paths: ["pairedDevices", "connectedDevice"],
  },
});
