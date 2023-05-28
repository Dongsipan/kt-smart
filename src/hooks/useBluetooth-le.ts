import {ref} from "vue";
import {BleClient, numberToUUID} from '@capacitor-community/bluetooth-le';
import {useBleStore} from "@/store/useBleStore";

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

export interface CharacteristicModule {
  service: string;
  characteristic: string;
  properties: string[];
}

export function useBluetoothLe() {
  const {availableDevices, setAvailableDevice, pairedDevices} = useBleStore()
  const HEART_RATE_SERVICE = numberToUUID(0x180d);
  const scanning = ref(false)

  async function scan() {
    try {
      scanning.value = true
      await BleClient.initialize();

      await BleClient.requestLEScan(
          {
            // services: [HEART_RATE_SERVICE],
          },
          (result) => {
             deviceDetected(result)
            console.log('received new scan result', result);
          }
      );

      setTimeout(async () => {
        await BleClient.stopLEScan();
        scanning.value = false
        console.log('stopped scanning');
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }

  const connectBle = async (deviceId: string) => {
    await BleClient.connect(deviceId, (deviceId) => onDisconnect(deviceId));
  }

  const disConnectBle = async (deviceId: string) => {
    await BleClient.disconnect(deviceId);
  }
  const onDisconnect = (deviceId: string) => {
    console.log(`device ${deviceId} disconnected`);
  }
  const write = async (deviceId: string, serviceUUID: string, characteristicUUID: string, value: DataView) => {
    await BleClient.write(deviceId, serviceUUID, characteristicUUID, value);
  }

  const startNotification = async (deviceId: string, serviceUUID: string, characteristicUUID: string, callback: (value: DataView) => void) => {
    await BleClient.startNotifications(
        deviceId,
        serviceUUID,
        characteristicUUID,
        (value) => {
          console.log('current notification', value);
          callback(value)
        }
    );
  }

  const stopNotification = async (deviceId: string, serviceUUID: string, characteristicUUID: string) => {
    await BleClient.stopNotifications(deviceId, serviceUUID, characteristicUUID);
    await BleClient.disconnect(deviceId);
    console.log('disconnected from device', deviceId);
  }

  // const updateConnectedDeviceStatus = (device: any, status: boolean) => {
  //
  // }
  const deviceDetected = (device: any) => {
    device.isPaired = false;
    device.isPairing = false;
    // if (pairedDevices.findIndex(d => d.id === device.id) > -1) {
    //   return
    // }
    // if (deviceAlreadyInPeripheralsArray(device)) {
    //   updateExistingDevice(device);
    // } else {
    //   setAvailableDevice(device);
    // }
    setAvailableDevice(device);
  }
  // const deviceAlreadyInPeripheralsArray = (device: any) => {
  //   const d = availableDevices.find(item => item.id === device.id);
  //   return d !== undefined;
  // }

  // const updateExistingDevice = (newDevice: any) => {
  //   const deviceIndex = availableDevices.findIndex(d => d.id === newDevice.id);
  //   peripherals.value[deviceIndex] = newDevice;
  // }

  return {
    scan,
    connectBle,
    disConnectBle,
    write,
    startNotification,
    stopNotification
  }
}
