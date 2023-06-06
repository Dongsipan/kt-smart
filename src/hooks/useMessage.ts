import {useSetting} from "@/hooks/useSetting";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";
import {CharacteristicUUID, ServiceUUID} from "@/const/ble.const";
import {useDashboardStore} from "@/store/useDashboardStore";
import {useSettingStore} from "@/store/useSettingStore";
import {useBleStore} from "@/store/useBleStore";
import {storeToRefs} from "pinia";
import chalk from 'chalk';
import {
    dataViewToHexString,
    dataViewToNumbers,
    numbersToDataView,
    numberToUUID
} from "@capacitor-community/bluetooth-le";
import {useToast} from "@/hooks/useToast";
import {DimensionList} from "@/const/bike.const";
import {useErrorStore} from "@/store/useErrorStore";

chalk.level = 1

export function useMessage() {
    const settingStore = useSettingStore()
    const {getDisplayType} = storeToRefs(settingStore)
    const dashboardStore = useDashboardStore()
    const {writeData} = useSetting()
    const {dimension, candidateParam} = storeToRefs(useSettingStore())
    const {speed, singleMileage, totalMileage,} = storeToRefs(dashboardStore)
    const {
        setElectricQuantity,
        setSingleTime,
        setSpeed,
        setSingleMileage,
        setTotalMileage,
        setAssistance
    } = useDashboardStore()
    const {connectedDevice} = storeToRefs(useBleStore())
    const {updateConnectedDevicePairedStatus} = useBleStore()
    const {write, startNotification, stopNotification} = useBluetoothLe()
    const {presentToast} = useToast()
    const {setErrorCode} = useErrorStore()
    let writeInterval: any
    let singleTimeInterval: any
    let singleTimeSecond = 0
    const sendMessage = async () => {
        clearInterval(writeInterval)
        writeInterval = setInterval(async () => {
          if (!connectedDevice.value.deviceId) {
            await presentToast('Please connect your Bluetooth device first')
          }
          try {
            console.log(chalk.red('start write', dataViewToHexString(numbersToDataView(writeData.value))))
            await write(connectedDevice.value.deviceId, numberToUUID(ServiceUUID), numberToUUID(CharacteristicUUID), numbersToDataView(writeData.value))
            await startNotification(connectedDevice.value.deviceId, numberToUUID(ServiceUUID), numberToUUID(CharacteristicUUID), onNotification)
          } catch (error) {
            await presentToast('sendMessage error:'+JSON.stringify(error));
            console.log(chalk.red(`send message error: ${JSON.stringify(error)}`));
            clearInterval(writeInterval)
            updateConnectedDevicePairedStatus(false)
          }

        }, 1000)
        // if (!connectedDevice.value.deviceId) {
        //     await stopSendMessage()
        //     await presentToast('Bluetooth device not connected')
        // }
        // try {
        //     console.log(chalk.red('start write', dataViewToHexString(numbersToDataView(writeData.value))))
        //     await write(connectedDevice.value.deviceId, numberToUUID(ServiceUUID), numberToUUID(CharacteristicUUID), numbersToDataView(writeData.value))
        //     await startNotification(connectedDevice.value.deviceId, numberToUUID(ServiceUUID), numberToUUID(CharacteristicUUID), onNotification)
        // } catch (error) {
        //     console.log(chalk.red(`send message error: ${JSON.stringify(error)}`));
        //     clearInterval(writeInterval)
        //     updateConnectedDevicePairedStatus(false)
        // }
    }
    const stopSendMessage = async () => {
        clearInterval(writeInterval)
        if (!connectedDevice.value.deviceId) return
        await stopNotification(connectedDevice.value.deviceId, numberToUUID(ServiceUUID), numberToUUID(CharacteristicUUID))
    }
    const onNotification = (value: DataView) => {
        const message = dataViewToNumbers(value)
        console.log(chalk.green('onNotification', message))
        getBattery(message)
        getSpeed(message)
        getSingleDistance()
        getAssistance(message)
        checkError(message)
    }
    // 读取电量
    const getBattery = (message: number[]) => {
        const electricQuantity = (message[1] & 0x1F) >> 2;
        setElectricQuantity(electricQuantity)
    }
    // 读取速度
    const getSpeed = (message: number[]) => {
        const timeFirst = message[3] << 8;
        const timeLast = message[4];
        const timeSpan = timeFirst + timeLast;
        if (isNaN(timeSpan) || timeSpan > 21008 || timeSpan === 0) {
            return;
        } // 6922是停止时的时间间隔  21008异常时间
        console.log('timeSpan', timeSpan);
        if (timeSpan === 6922) {
            setSpeed(0)
            return;
        }
        console.log(chalk.yellow('dimension', dimension.value))
        const realDimension = DimensionList.find(item => item.value === dimension.value)?.dimension || 26
        const round = (realDimension * 25.4 * Math.PI) / Math.pow(10, 6);
        const defaultSpeed = (round / timeSpan) * 1000 * 3600;
        const speed = Math.floor(defaultSpeed) // === 1 ? 0 : Math.floor(defaultSpeed);
        console.log('speed', speed);
        const displaySpeed = getDisplayType.value === 'kilometer' ? speed : Math.floor(speed * 0.6213712);
        setSpeed(displaySpeed)
        if (displaySpeed > 0) {
            getSingleTime();
        } else {
            clearInterval(singleTimeInterval);
        }
    }
    // 获取单次计时
    const getSingleTime = () => {
        if (singleTimeInterval) return
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
    const getSingleDistance = () => {
        const timeDelay = 1/3600 // 0.0000294; // 106ms 转成 hour
        const distance = speed.value * timeDelay;
        const storageMileage = singleMileage || 0;
        const currentMileage = storageMileage.value + distance;
        const storageTotal = totalMileage || 0;
        const total = storageTotal.value + distance;
        setSingleMileage(currentMileage);
        setTotalMileage(total);
    }
    // 计算助力
    const getAssistance = (message: number[]) => {
        const isAssistance = (message[7] >> 4) & 1;
        const candidate = Number(candidateParam.value)
        if (isAssistance) {
            const received = ((message[10] & 0x3F) << 8) + message[11];
            if (received !== 0) {
                const assistance = 60 / (received * candidate / 1000);
                setAssistance(Math.floor(assistance));
            } else {
                setAssistance(0);
            }
        } else {
            setAssistance(0);
        }
    }
    // 系统错误
    const checkError = (message: number[]) => {
        const errorCode = message[5];
        setErrorCode(errorCode)
    }

    return {
        sendMessage,
        stopSendMessage,
        getSpeed,
        getBattery,
        checkError,
        getAssistance,
        getSingleDistance
    }
}
