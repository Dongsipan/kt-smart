import {ref} from "vue";
import {BleClient, numberToUUID} from '@capacitor-community/bluetooth-le';
import {useBleStore} from "@/store/useBleStore";

export function useBluetoothLe() {
    const {getAvailableDevices} = useBleStore()

    const HEART_RATE_SERVICE = numberToUUID(0x180d);
    const peripherals = ref<any[]>([])
    const availableDevices = ref<any[]>([])
    const connectedDevice = ref({})
    const scanning = ref(false)

    availableDevices.value = getAvailableDevices

    async function scan() {
        try {
            scanning.value = true
            await BleClient.initialize();

            await BleClient.requestLEScan(
                {
                    services: [HEART_RATE_SERVICE],
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

    const connectBle = async (device: any) => {
        await BleClient.connect(device.id, (deviceId) => onDisconnect(deviceId));
    }

    const disConnectBle = async (device: any)=> {
        await BleClient.disconnect(device.deviceId);
    }
    const onDisconnect = (deviceId: string) => {
        console.log(`device ${deviceId} disconnected`);
    }
    const write = async (deviceId: string, serviceUUID: string, characteristicUUID: string, value: DataView)=> {
        await BleClient.write(deviceId, serviceUUID, characteristicUUID, value);
    }

    const startNotification = async (deviceId: string, serviceUUID: string, characteristicUUID: string) =>{
        await BleClient.startNotifications(
            deviceId,
            serviceUUID,
            characteristicUUID,
            (value) => {
                console.log('current notification', value);
            }
        );
    }

    const stopNotification = async (deviceId: string, serviceUUID: string, characteristicUUID: string) => {
        await BleClient.stopNotifications(deviceId, serviceUUID, characteristicUUID);
        await BleClient.disconnect(deviceId);
        console.log('disconnected from device', deviceId);
    }

    const updateConnectedDeviceStatus = (device: any, status: boolean) => {

    }
    const deviceDetected = (device: any) => {
        device.isPaired = false;
        device.isPairing = false;
        if (availableDevices.value.findIndex(d => d.id === device.id) > -1) {
            return
        }
        if (deviceAlreadyInPeripheralsArray(device)) {
            updateExistingDevice(device);
        } else {
            addNewDevice(device);
        }
    }
    const deviceAlreadyInPeripheralsArray = (device: any) => {
        const d = peripherals.value.find(item => item.id === device.id);
        return d !== undefined;
    }

    const updateExistingDevice = (newDevice: any) => {
        const deviceIndex = peripherals.value.findIndex(d => d.id === newDevice.id);
        peripherals.value[deviceIndex] = newDevice;
    }

    const addNewDevice = (device: any) => {
        peripherals.value.push(device);
    }

    return {
        peripherals,
        availableDevices,
        connectedDevice,
        scanning,
        scan
    }
}
