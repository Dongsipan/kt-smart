import {useSetting} from "@/hooks/useSetting";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";
import {CharacteristicUUID, ServiceUUID} from "@/const/ble.const";
import {useDashboardStore} from "@/store/useDashboardStore";
import {useSettingStore} from "@/store/useSettingStore";
import {useError} from "@/hooks/useError";

export function useMessage() {
  const {writeData} = useSetting()
  const {dimension, candidateParam} = useSettingStore()
  const {
    setElectricQuantity,
    setSingleTime,
    isKmUnit,
    setSpeed,
    speed,
    singleMileage,
    setSingleMileage,
    totalMileage,
    setTotalMileage,
    setAssistance
  } = useDashboardStore()
  const {connectedDevice, write, startNotification, stopNotification} = useBluetoothLe()
  const { setError } = useError()
  let writeInterval: NodeJS.Timer
  let singleTimeInterval: NodeJS.Timer
  let singleTimeSecond = 0
  const sendMessage = () => {
    writeInterval = setInterval(async () => {
      if (!connectedDevice.value) {
        return
      }
      try {
        await write(connectedDevice.value.id, ServiceUUID, CharacteristicUUID, new DataView(writeData.buffer))
        await startNotification(connectedDevice.value.id, ServiceUUID, CharacteristicUUID, onNotification)
      } catch (error) {
        await stopSendMessage()
      }

    }, 105)
  }
  const stopSendMessage = async () => {
    if (!connectedDevice.value) return
    await stopNotification(connectedDevice.value.id, ServiceUUID, CharacteristicUUID)
    clearInterval(writeInterval)
  }
  const onNotification = (value: DataView) => {
    const message = DataViewToUint8Array(value)
    getBattery(message)
    getSpeed(message)
    getSingleMileage()
    getAssistance(message)
    checkError(message)
  }
  // 读取电量
  const getBattery = (message: Uint8Array) => {
    const electricQuantity = (message[1] & 0x1F) >> 2;
    setElectricQuantity(electricQuantity)
  }
  // 读取速度
  const getSpeed = (message: Uint8Array) => {
    const timeFirst = message[3] << 8;
    const timeLast = message[4];
    const timeSpan = timeFirst + timeLast;
    if (isNaN(timeSpan) || timeSpan > 21008 || timeSpan === 0) {
      return;
    } // 6922是停止时的时间间隔  21008异常时间
    console.log('timeSpan', timeSpan);
    const round = (dimension * 25.4 * Math.PI) / Math.pow(10, 6);
    const defaultSpeed = (round / timeSpan) * 1000 * 3600;
    const speed = Math.floor(defaultSpeed) === 1 ? 0 : Math.floor(defaultSpeed);
    console.log('speed', speed);
    const displaySpeed = isKmUnit ? speed : Math.floor(speed * 0.6213712);
    setSpeed(displaySpeed)
    if (displaySpeed > 0) {
      getSingleTime();
    } else {
      clearInterval(singleTimeInterval);
    }
  }
  // 获取单次计时
  const getSingleTime = () => {
    clearInterval(singleTimeInterval);
    singleTimeInterval = setInterval(() => {
      singleTimeSecond++;
      const singleTime = formatSeconds(singleTimeSecond);
      setSingleTime(singleTime);
    }, 1000);
  }
  const formatSeconds = (time: number) => {
    const min = Math.floor(time % 3600);
    return formatBit(Math.floor(time / 3600)) + ':' + formatBit(Math.floor(min / 60)) + ':' + formatBit(time % 60);
  }
  const formatBit = (val: number) => {
    val = +val;
    return val > 9 ? val : '0' + val;
  }
  // 计算单次里程
  const getSingleMileage = () => {
    const timeDelay = 0.0000294; // 106ms 转成 hour
    const distance = speed * timeDelay;
    const storageMileage = singleMileage || 0;
    const currentMileage = storageMileage + distance;
    const storageTotal = totalMileage || 0;
    const total = storageTotal + distance;
    setSingleMileage(currentMileage);
    setTotalMileage(total);

  }
  // 计算助力
  const getAssistance = (message: Uint8Array) => {
    const isAssistance = (message[7] >> 4) & 1;
    if (isAssistance) {
      const received = ((message[10] & 0x3F) << 8) + message[11];
      if (received !== 0) {
        const assistance = 60 / (received * candidateParam / 1000);
        setAssistance(Math.floor(assistance));
      } else {
        setAssistance(0);
      }
    } else {
      setAssistance(0);
    }
  }
  // 系统错误
  const checkError = (message: Uint8Array) => {
    const errorCode = message[5];
    setError(errorCode)
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
