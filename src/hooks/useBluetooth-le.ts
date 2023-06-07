import { ref } from "vue";
import {
  BleClient,
  dataViewToHexString,
  numberToUUID,
  ScanResult,
} from "@capacitor-community/bluetooth-le";
import { Device, useBleStore } from "@/store/useBleStore";
import { Capacitor } from "@capacitor/core";
import { storeToRefs } from "pinia";
import { useToast } from "@/hooks/useToast";
import { ServiceUUID } from "@/const/ble.const";

export function useBluetoothLe() {
  const bleStore = useBleStore();
  const { presentToast } = useToast();
  const { pairedDevices } = storeToRefs(bleStore);
  const {
    connectedDevice,
    setAvailableDevice,
    clearAvailableDevices,
    setConnectedDevice,
    removeConnectedDevice,
    updateConnectedDevicePairedStatus,
  } = useBleStore();
  const scanning = ref(false);
  const isNative = Capacitor.isNativePlatform();

  async function scan() {
    clearAvailableDevices();
    if (!isNative) {
      testBleDevice();
      return;
    }
    try {
      scanning.value = true;
      await BleClient.initialize({ androidNeverForLocation: true });

      await BleClient.requestLEScan(
        {
          services: [numberToUUID(ServiceUUID)], // 电动车蓝牙uuid
        },
        (result) => {
          deviceDetected(result);
          console.log("received new scan result", result);
        }
      );

      setTimeout(async () => {
        await BleClient.stopLEScan();
        scanning.value = false;
        console.log("stopped scanning");
      }, 5000);
    } catch (error) {
      scanning.value = false;
      console.error("scanForBluetoothDevices", error);
    }
  }

  const initialBle = async () => {
    try {
      await BleClient.initialize();
      const isBtEnabled = await BleClient.isEnabled();
      if (!isBtEnabled) {
        await presentToast("BT not enabled, or not supported!");
      } else {
        if (!connectedDevice.isPaired) {
          await BleClient.getDevices([connectedDevice.deviceId]);
          await connectBle(connectedDevice, false);
        }
      }
    } catch (e) {
      console.error("Bluetooth Unavailable");
    }
  };
  /*TODO 自动连接失败处理，给提示或者不抛错
  * ⚡️  WebView loaded
    ⚡️  BluetoothLe - Resolve initialize BLE powered on
    ⚡️  TO JS undefined
    ⚡️  To Native ->  BluetoothLe isEnabled 43232727
    ⚡️  TO JS {"value":true}
    ⚡️  To Native ->  App addListener 43232728
    ⚡️  To Native ->  BluetoothLe getDevices 43232729
    ⚡️  To Native ->  Keyboard getResizeMode 43232730
    ⚡️  TO JS {"devices":[{"name":"LanQianTech","deviceId":"A8DF3B4C-A830-8D3D-C2B1-381972D8396B"}]}
    ⚡️  TO JS {"mode":"native"}
    ⚡️  To Native ->  BluetoothLe addListener 43232731
    ⚡️  To Native ->  BluetoothLe connect 43232732
    ⚡️  BluetoothLe - Connecting to peripheral <CBPeripheral: 0x283059ba0, identifier = A8DF3B4C-A830-8D3D-C2B1-381972D8396B, name = LanQianTech, mtu = 0, state = disconnected>
    ⚡️  BluetoothLe - Reject connect Connection timeout
    ERROR MESSAGE:  {"errorMessage":"Connection timeout","message":"Connection timeout"}
    ⚡️  [error] - {"errorMessage":"Connection timeout","message":"Connection timeout"}
    ⚡️  [error] - connectToDevice {"errorMessage":"Connection timeout"}
  * */

  const connectBle = async (device: Device, isNewDevice = true) => {
    try {
      if (isNative) {
        await BleClient.connect(device.deviceId, (deviceId) =>
          onDisconnect(deviceId)
        );
      }
      if (isNewDevice) {
        setConnectedDevice({ ...device, isPaired: true });
      } else {
        updateConnectedDevicePairedStatus(true);
      }
    } catch (error) {
      updateConnectedDevicePairedStatus(false);
      console.error("connectToDevice", error);
      await presentToast(
        "Bluetooth device connection failed, please try again"
      );
    }
  };
  // ⚡️  To Native ->  BluetoothLe addListener 86768910
  // ⚡️  To Native ->  BluetoothLe connect 86768911
  // ⚡️  BluetoothLe - Connecting to peripheral <CBPeripheral: 0x280b3b4d0, identifier = A8DF3B4C-A830-8D3D-C2B1-381972D8396B, name = LanQianTech, mtu = 0, state = disconnected>
  // ⚡️  BluetoothLe - Connected to device <CBPeripheral: 0x280b3b4d0, identifier = A8DF3B4C-A830-8D3D-C2B1-381972D8396B, name = LanQianTech, mtu = 23, state = connected>
  // ⚡️  BluetoothLe - Resolve connect|A8DF3B4C-A830-8D3D-C2B1-381972D8396B Successfully connected.
  // ⚡️  BluetoothLe - Connected to peripheral. Waiting for service discovery.
  // ⚡️  BluetoothLe - didDiscoverServices
  // ⚡️  BluetoothLe - didDiscoverCharacteristicsFor 1 1
  // ⚡️  BluetoothLe - Resolve connect Connection successful.

  const disConnectBle = async (device: Device, isDeleteDevice: boolean) => {
    try {
      if (isNative) {
        await BleClient.disconnect(device.deviceId);
      }
      if (isDeleteDevice) {
        removeConnectedDevice(device);
      } else {
        updateConnectedDevicePairedStatus(false);
      }
    } catch (error) {
      console.error("disconnectFromDevice", error);
      await presentToast(JSON.stringify(error));
    }
  };
  const onDisconnect = (deviceId: string) => {
    console.log(`device ${deviceId} disconnected`);
  };
  const write = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    value: DataView
  ) => {
    if (!isNative) return;
    await BleClient.write(deviceId, serviceUUID, characteristicUUID, value);
  };

  const startNotification = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    callback: (value: DataView) => void
  ) => {
    if (!isNative) return;
    await BleClient.startNotifications(
      deviceId,
      serviceUUID,
      characteristicUUID,
      (value) => {
        console.log("current notification", dataViewToHexString(value));
        callback(value);
      }
    );
  };

  const stopNotification = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string
  ) => {
    if (!isNative) return;
    await BleClient.stopNotifications(
      deviceId,
      serviceUUID,
      characteristicUUID
    );
    // try {
    //   await BleClient.stopNotifications(deviceId, serviceUUID, characteristicUUID);
    //   // await BleClient.disconnect(deviceId);
    // } catch (error) {
    //   console.error('stopNotifications error', JSON.stringify(error))
    //   await presentToast('Please connect your Bluetooth device first');
    // }
  };

  const testBleDevice = () => {
    const devices = [
      {
        rssi: -53,
        txPower: 0,
        device: {
          deviceId: "A8DF3B4C-A830-8D3D-C2B1-381972D8396B",
          name: "LanQianTech",
        },
        localName: "LanQianTech",
        uuids: ["0000fff0-0000-1000-8000-00805f9b34fb"],
      },
      {
        rssi: -51,
        device: {
          deviceId: "51FD931A-0A66-D005-99B3-C29AE796B21F",
          name: "董思盼的Apple Watch",
        },
        txPower: 8,
        uuids: [],
      },
      {
        uuids: [],
        device: {
          deviceId: "A6542A21-2997-8DB4-D660-EA1011D9442F",
          name: "思盼的AirPods Pro",
        },
        rssi: -56,
        txPower: 127,
      },
      {
        uuids: [],
        device: {
          deviceId: "509D3B9C-FE9A-BF1F-2519-6250EFCE9E07",
          name: "董思盼的MacBook Pro",
        },
        rssi: -40,
        txPower: 127,
      },
      {
        uuids: [],
        device: { deviceId: "8EBA9D81-BEC0-8C12-FE8A-EE11D5F8CE5F" },
        rssi: -73,
        txPower: 127,
      },
      {
        rssi: -79,
        uuids: [],
        device: { deviceId: "DE8A09EE-DDE5-0A3C-5E5C-AFA35877A8E2" },
        txPower: 8,
      },
    ];
    devices.forEach((item) => {
      deviceDetected(item);
    });
  };

  const deviceDetected = (result: ScanResult) => {
    const { device } = result;
    if (!device.deviceId || !device.name) return; // 过滤掉没有deviceId、没有名字的设备
    const availableDevices = {
      ...device,
      isPaired: false,
      isPairing: false,
    };
    if (
      pairedDevices.value.findIndex(
        (item) => item.deviceId === device.deviceId
      ) > -1
    )
      return;
    setAvailableDevice(availableDevices);
  };

  return {
    initialBle,
    scan,
    connectBle,
    disConnectBle,
    write,
    startNotification,
    stopNotification,
  };
}

/*
⚡️  To Native ->  BluetoothLe write 36263596
⚡️  [log] - [31mstart write 0f 04 f5 58 2e b2 38 ca 84 14 65 32 0e[39m
⚡️  BluetoothLe - Resolve write|0000FFF0-0000-1000-8000-00805F9B34FB|0000FFF1-0000-1000-8000-00805F9B34FB Successfully written value.
⚡️  TO JS undefined
⚡️  To Native ->  BluetoothLe removeListener 36263597
⚡️  To Native ->  BluetoothLe addListener 36263598
⚡️  To Native ->  BluetoothLe startNotifications 36263599
⚡️  BluetoothLe - Set notifications true
⚡️  TO JS {"value":"41 90 80 1b 0a 24 9e 02 00 00 80 39 "}
⚡️  [log] - current notification 41 90 80 1b 0a 24 9e 02 00 00 80 39
⚡️  [log] - [32monNotification 65,144,128,27,10,36,158,2,0,0,128,57[39m
⚡️  [log] - timeSpan 6922
*/
