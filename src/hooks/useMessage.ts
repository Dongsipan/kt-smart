import {useSetting} from "@/hooks/useSetting";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";
import {CharacteristicUUID, ServiceUUID} from "@/const/ble.const";

export function useMessage () {
  const { writeData } = useSetting()
  const { connectedDevice, write, startNotification, stopNotification } = useBluetoothLe()
  let writeInterval
  const sendMessage = () => {
    writeInterval = setInterval( async () => {
      if (!connectedDevice.value) {
        return
      }
      await write(connectedDevice.value.id,ServiceUUID, CharacteristicUUID, new DataView(writeData.buffer))
      await startNotification(connectedDevice.value.id, ServiceUUID, CharacteristicUUID, onNotification)
    }, 105)
  }
  const onNotification = () => {

  }
  return {
    sendMessage
  }
}
