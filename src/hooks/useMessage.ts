import { useSetting } from "@/hooks/useSetting";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { CharacteristicUUID, ServiceUUID } from "@/const/ble.const";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSettingStore } from "@/store/useSettingStore";
import { Device, useBleStore } from "@/store/useBleStore";
import { storeToRefs } from "pinia";
import chalk from "chalk";
import {
  BleClient,
  dataViewToHexString,
  dataViewToNumbers,
  numbersToDataView,
  numberToUUID,
} from "@capacitor-community/bluetooth-le";
import { useToast } from "@/hooks/useToast";
import { DimensionList } from "@/const/bike.const";
import { useErrorStore } from "@/store/useErrorStore";

chalk.level = 1;

export function useMessage() {
  const settingStore = useSettingStore();
  const { getDisplayType } = storeToRefs(settingStore);
  const dashboardStore = useDashboardStore();
  const { writeData, updateSetting } = useSetting();
  const { dimension, candidateParam } = storeToRefs(useSettingStore());
  const { speed, singleMileage, totalMileage } = storeToRefs(dashboardStore);
  const {
    setElectricQuantity,
    setSingleTime,
    setSpeed,
    setSingleMileage,
    setTotalMileage,
    setAssistance,
    setRegenative,
    setUndervoltage,
    setReverse,
    setTurnRight,
    setTurnLeft,
    setThrottle,
    setCruise,
    setBrake,
  } = useDashboardStore();
  const { connectedDevice } = storeToRefs(useBleStore());
  const { setConnectedDevice } = useBleStore();
  const { write, startNotification, stopNotification, disConnectBle } =
    useBluetoothLe();
  const { presentToast } = useToast();
  const { setErrorCode } = useErrorStore();
  let writeInterval: any;
  let singleTimeInterval: any;
  let singleTimeSecond = 0;
  const exitApp = async () => {
    await stopSendMessage();
    await disConnectBle(connectedDevice.value);
  };
  const sendMessage = async () => {
    if (!connectedDevice.value.deviceId || !connectedDevice.value.isPaired) {
      await presentToast("Please connect your Bluetooth device first");
      return;
    }
    updateSetting();
    clearInterval(writeInterval);
    writeInterval = setInterval(async () => {
      try {
        console.log(
          chalk.red(
            "start write",
            dataViewToHexString(numbersToDataView(writeData.value))
          )
        );
        if (!connectedDevice.value.isPaired) {
          clearInterval(writeInterval);
        } // 如果设备未连接，则停止发送数据
        await write(
          connectedDevice.value.deviceId,
          numberToUUID(ServiceUUID),
          numberToUUID(CharacteristicUUID),
          numbersToDataView(writeData.value)
        );
      } catch (error: any) {
        clearInterval(writeInterval);
        if (error.errorMessage === "Not connected to device.") {
          // 应该不会触发，已经监听了断开回调函数
          // 如果设备意外断开，则清空连接状态
          setConnectedDevice({} as Device);
        }
        console.log(chalk.red(`send message error: ${JSON.stringify(error)}`));
      }
    }, 500);
    await startNotification(
      connectedDevice.value.deviceId,
      numberToUUID(ServiceUUID),
      numberToUUID(CharacteristicUUID),
      onNotification
    );
  };
  const stopSendMessage = async () => {
    clearInterval(writeInterval);
    if (!connectedDevice.value.deviceId) return;
    await stopNotification(
      connectedDevice.value.deviceId,
      numberToUUID(ServiceUUID),
      numberToUUID(CharacteristicUUID)
    );
  };
  const onNotification = (value: DataView) => {
    // 欠压、反冲电 message[1]
    // 倒档、转向 message[2]
    const message = dataViewToNumbers(value);
    console.log(chalk.green("onNotification", message));
    getBattery(message);
    getSpeed(message);
    getSingleDistance();
    getAssistance(message);
    checkError(message);
    computedMessageFirst(message);
    computedMessageSecond(message);
    computedMessageSeventh(message);
  };
  const computedMessageFirst = (message: number[]) => {
    const command = message[1];
    const undervoltage = command & 1; // 是否是欠压
    const regenative = (command & 2) >> 1; // 是否是反冲电
    setRegenative(regenative);
    setUndervoltage(undervoltage);
  };
  const computedMessageSecond = (message: number[]) => {
    const command = message[2];
    const reverse = (command & 0x40) >> 5; // 是否是倒档
    const turnRight = command & 1; // 是否是右转
    const turnLeft = (command & 2) >> 1; // 是否是左转
    setReverse(reverse);
    setTurnRight(turnRight);
    setTurnLeft(turnLeft);
  };
  const computedMessageSeventh = (message: number[]) => {
    const command = message[7];
    const throttle = command & 3; // 转把状态 1 停止工作，2工作中
    const cruise = (command & 8) >> 3; // 巡航状态 1 代表巡航
    const brake = (command & 32) >> 5; // 刹车状态 1代表刹车
    setThrottle(throttle);
    setCruise(cruise);
    setBrake(brake);
  };
  const setBLEName = async (nickname: string) => {
    const command = `AT+NAME=${nickname}\r\n`;
    const bytes = new TextEncoder().encode(command);
    const dataView = new DataView(bytes.buffer);
    await write(
      connectedDevice.value.deviceId,
      numberToUUID(ServiceUUID),
      numberToUUID(CharacteristicUUID),
      dataView
    );
    await BleClient.startNotifications(
      connectedDevice.value.deviceId,
      numberToUUID(ServiceUUID),
      numberToUUID(CharacteristicUUID),
      (result) => {
        console.log("rename str", dataViewToHexString(result));
        console.log("rename", dataViewToNumbers(result));
      }
    );
  };
  // 读取电量
  const getBattery = (message: number[]) => {
    const electricQuantity = (message[1] & 0x1f) >> 2;
    setElectricQuantity(electricQuantity);
  };
  // 读取速度
  const getSpeed = (message: number[]) => {
    const timeFirst = message[3] << 8;
    const timeLast = message[4];
    const timeSpan = timeFirst + timeLast;
    if (isNaN(timeSpan) || timeSpan > 21008 || timeSpan === 0) {
      return;
    } // 6922是停止时的时间间隔  21008异常时间
    console.log("timeSpan", timeSpan);
    if (timeSpan === 6922) {
      setSpeed(0);
      clearInterval(singleTimeInterval);
      return;
    }
    console.log(chalk.yellow("dimension", dimension.value));
    const realDimension =
      DimensionList.find((item) => item.value === dimension.value)?.dimension ||
      26;
    const round = (realDimension * 25.4 * Math.PI) / Math.pow(10, 6);
    const defaultSpeed = (round / timeSpan) * 1000 * 3600;
    const speed = Math.floor(defaultSpeed); // === 1 ? 0 : Math.floor(defaultSpeed);
    console.log("speed", speed);
    const displaySpeed =
      getDisplayType.value === "kilometer"
        ? speed
        : Math.floor(speed * 0.6213712);
    setSpeed(displaySpeed);
    getSingleTime();
  };
  // 获取单次计时
  const getSingleTime = () => {
    if (singleTimeInterval) return;
    singleTimeInterval = setInterval(() => {
      singleTimeSecond++;
      const singleTime = formatSeconds(singleTimeSecond);
      setSingleTime(singleTime);
    }, 1000);
  };
  const formatSeconds = (time: number) => {
    const min = Math.floor(time % 3600);
    return (
      formatBit(Math.floor(time / 3600)) +
      ":" +
      formatBit(Math.floor(min / 60)) +
      ":" +
      formatBit(time % 60)
    );
  };
  const formatBit = (val: number) => {
    val = +val;
    return val > 9 ? val : "0" + val;
  };
  // 计算单次里程
  const getSingleDistance = () => {
    const timeDelay = 1 / 3600; // 0.0000294; // 106ms 转成 hour
    const distance = speed.value * timeDelay;
    const storageMileage = singleMileage || 0;
    const currentMileage = storageMileage.value + distance;
    const storageTotal = totalMileage || 0;
    const total = storageTotal.value + distance;
    setSingleMileage(currentMileage);
    setTotalMileage(total);
  };
  // 计算助力
  const getAssistance = (message: number[]) => {
    const isAssistance = (message[7] >> 4) & 1;
    const candidate = Number(candidateParam.value);
    if (isAssistance) {
      const received = ((message[10] & 0x3f) << 8) + message[11];
      if (received !== 0) {
        const assistance = 60 / ((received * candidate) / 1000);
        setAssistance(Math.floor(assistance));
      } else {
        setAssistance(0);
      }
    } else {
      setAssistance(0);
    }
  };
  // 系统错误
  const checkError = (message: number[]) => {
    const errorCode = message[5];
    setErrorCode(errorCode);
  };

  return {
    sendMessage,
    stopSendMessage,
    getSpeed,
    getBattery,
    checkError,
    getAssistance,
    getSingleDistance,
    exitApp,
    setBLEName,
  };
}
