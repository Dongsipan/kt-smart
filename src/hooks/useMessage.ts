import {useSetting} from "@/hooks/useSetting";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";
import {CharacteristicUUID, ServiceUUID} from "@/const/ble.const";

export function useMessage() {
  const {writeData} = useSetting()
  const {connectedDevice, write, startNotification, stopNotification} = useBluetoothLe()
  let writeInterval
  const sendMessage = () => {
    writeInterval = setInterval(async () => {
      if (!connectedDevice.value) {
        return
      }
      await write(connectedDevice.value.id, ServiceUUID, CharacteristicUUID, new DataView(writeData.buffer))
      await startNotification(connectedDevice.value.id, ServiceUUID, CharacteristicUUID, onNotification)
    }, 105)
  }
  const onNotification = (value: DataView) => {
    const message = DataViewToUint8Array(value)
  }
  // 读取电量
  const getBattery = (message: Uint8Array) => {
  }
  // 读取速度
  const getSpeed = (message: Uint8Array) => {
  }
  // 计算单次里程
  const getSingleMileage = (message: Uint8Array) => {
  }
  // 计算助力
  const getAssistance = (message: Uint8Array) => {
  }
  // 系统错误
  const checkError = (message: Uint8Array) => {
  }
  const DataViewToUint8Array = (dataView: DataView) => {
    const uint8Array = new Uint8Array(dataView.buffer.byteLength);
    for (let index = 0; index < uint8Array.length; index++) {
      uint8Array[index] = dataView.getInt8(index);
    }
    return uint8Array;
  }
  return {
    sendMessage
  }
}
