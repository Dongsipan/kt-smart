import { useSettingStore } from "@/store/useSettingStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { GearDirection, LightDirection } from "@/const/bike.const";
import { WriteData } from "@/const/ble.const";
import { ref } from "vue";
import { storeToRefs } from "pinia";

export function useSetting() {
  const writeData = ref(WriteData);
  const dashboardStore = useDashboardStore();
  /*从store里获取设置数据*/
  const {
    dimension,
    maxSpeed,
    p1,
    p2,
    p3,
    p4,
    p5,
    c1,
    c2,
    c3,
    c4,
    c5,
    c7,
    c12,
    c13,
    c14,
    percent,
    handlebarMaxSpeed,
  } = storeToRefs(useSettingStore());
  const { setDisplayType } = useSettingStore();
  const { gearPosition, lightStatus } = storeToRefs(dashboardStore);
  const { setGearPosition, setLightStatus } = useDashboardStore();
  // const { sendMessage } = useMessage()
  // watch(writeData,async() => {
  //   await sendMessage()
  // }, { deep: true })

  /*设置最大速度*/
  const setMaxSpeed = () => {
    const dimensionMode = getDimension();
    let expand = 0x0;
    let secondData = 0x0;
    let limitSpeed = 0x0;
    if (dimensionMode.code === 1) {
      expand = 0x80;
    } else {
      expand = 0x0;
    }
    if (maxSpeed.value < 32) {
      limitSpeed = 0x0;
      const speed: number = maxSpeed.value << 3;
      secondData = Int2Bytes(speed + dimensionMode.dimension);
      writeData.value[2] = secondData;
      writeData.value[4] =
        Int2Bytes(p2.value) +
        (Int2Bytes(p3.value) << 3) +
        (Int2Bytes(p4.value) << 4) +
        limitSpeed +
        expand; // p2+p3+p4+限速+轮径拓展
    }
    if (maxSpeed.value >= 32 && maxSpeed.value < 64) {
      limitSpeed = 0x20;
      const speedDiff = maxSpeed.value - 32;
      if (speedDiff === 0) {
        secondData = 0x5;
      } else {
        const speed: number = speedDiff << 3;
        secondData = Int2Bytes(speed + dimension.value);
      }
      writeData.value[2] = secondData;
      writeData.value[4] =
        Int2Bytes(p2.value) +
        (Int2Bytes(p3.value) << 3) +
        (Int2Bytes(p4.value) << 4) +
        limitSpeed +
        expand; // p2+p3+p4+限速+轮径拓展
    }
    updateFiveIndexOfData();
    // code = 0 轮径不需要扩展  code = 1 需要扩展
    // maxSpeed < 31 限速不需要扩展
  };
  // const setDimension = () => {
  //   debugger
  //   let dimension = this.getDimension();
  //   let p2: any = "0x" + (this.P2.toString(16)).toUpperCase();
  //   let p3: any = "0x" + (this.P3.toString(16)).toUpperCase();
  //   let p4: any = "0x" + (this.P4.toString(16)).toUpperCase();
  //   let maxspeed = this.SETTINGS_MAX_SPEED - 10;
  //   this.setData(dimension, p2, p3, p4, maxspeed);
  // }
  /*获取不同尺寸轮径的数据*/
  const getDimension = () => {
    if (dimension.value < 10) {
      return {
        code: 0,
        dimension: Int2Bytes(dimension.value),
      };
    } else {
      const diff = dimension.value - 10;
      return {
        code: 1,
        dimension: Int2Bytes(diff),
      };
    }
  };

  const changeGearPosition = (position: number) => {
    setGearPosition(position);
    updateFirstIndexOfData();
  };
  const changeLightStatus = (status: boolean) => {
    setLightStatus(status);
    updateFirstIndexOfData();
  };
  const updateFirstIndexOfData = () => {
    const lightValue = lightStatus.value
      ? LightDirection.on
      : LightDirection.off;
    switch (gearPosition.value) {
      case 0:
        writeData.value[1] = GearDirection.positionZero + lightValue;
        break;
      case 1:
        writeData.value[1] = GearDirection.positionOne + lightValue;
        break;
      case 2:
        writeData.value[1] = GearDirection.positionTwo + lightValue;
        break;
      case 3:
        writeData.value[1] = GearDirection.positionThree + lightValue;
        break;
      case 4:
        writeData.value[1] = GearDirection.positionFour + lightValue;
        break;
      case 5:
        writeData.value[1] = GearDirection.positionFive + lightValue;
        break;
      default:
        writeData.value[1] = GearDirection.positionFive + lightValue;
        break;
    }
    updateFiveIndexOfData();
  };

  const updateFiveIndexOfData = () => {
    writeData.value[5] =
      writeData.value[1] ^
      writeData.value[2] ^
      writeData.value[3] ^
      writeData.value[4] ^
      writeData.value[6] ^
      writeData.value[7] ^
      writeData.value[8] ^
      writeData.value[9] ^
      writeData.value[10] ^
      writeData.value[11];
  };

  const setP1 = () => {
    writeData.value[3] = Int2Bytes(p1.value);
    updateFiveIndexOfData();
  };
  const setP2 = () => {
    // writeData.value[4] = Int2Bytes(p2);
    setMaxSpeed();
  };
  const setP3 = () => {
    // writeData.value[4] = Int2Bytes(p3) << 3 || writeData.value[4]
    setMaxSpeed();
  };
  const setP4 = () => {
    // writeData.value[4] = Int2Bytes(p4) << 4 || writeData.value[4]
    setMaxSpeed();
  };
  const setP5 = () => {
    writeData.value[0] = Int2Bytes(p5.value);
    updateFiveIndexOfData();
  };
  const setC1C2 = () => {
    const c1Hex = Int2Bytes(c1.value);

    const c2Hex = Int2Bytes(c2.value);

    writeData.value[6] = (c1Hex << 3) + c2Hex;
    updateFiveIndexOfData();
  };
  // c3 对应的是档位
  const setC3 = () => {
    const position = Number(c3.value);
    if (position === 8) return;
    gearPosition.value = Number(position);
    changeGearPosition(position);
  };
  const setC5C14 = () => {
    const c5Hex = Int2Bytes(c5.value);

    const c14Hex = Int2Bytes(c14.value) << 5;

    writeData.value[7] = 128 + c14Hex + c5Hex;
    updateFiveIndexOfData();
  };
  const setC4C7C12 = () => {
    const c4Hex = Int2Bytes(c4.value) << 5;

    const c7Hex = Int2Bytes(c7.value) << 3;

    const c12Hex = Int2Bytes(c12.value);

    writeData.value[8] = c4Hex + c7Hex + c12Hex;
    updateFiveIndexOfData();
  };
  const setC13 = () => {
    const c13Hex = Int2Bytes(c13.value) << 2;
    writeData.value[10] = c13Hex + 1;
    updateFiveIndexOfData();
  };
  const setPercent = () => {
    writeData.value[11] = Int2Bytes(percent.value);
    updateFiveIndexOfData();
  };
  const setHandlebar = () => {
    writeData.value[9] = Int2Bytes(handlebarMaxSpeed.value);
    updateFiveIndexOfData();
  };
  const setUnitDisplayType = () => {};
  const Int2Bytes = (value: number | string) => {
    if (typeof value === "string") {
      value = Number(value);
    }
    const hex = value.toString(16);
    return HexString2Bytes(hex)[0];
  };

  const HexString2Bytes = (hexString: string) => {
    let pos = 0;
    let len = hexString.length;
    // if (len % 2 !== 0) {
    //   return null;
    // }
    len /= 2;
    const arrBytes = [];
    for (let i = 0; i < len; i++) {
      const s = hexString.substring(pos, 2);
      const v = parseInt(s, 16);
      arrBytes.push(v);
      pos += 2;
    }
    return arrBytes;
  };
  const updateSetting = () => {
    setP1();
    setP2();
    setP5();
    setC1C2();
    setC3();
    setC5C14();
    setC4C7C12();
    setC13();
    setPercent();
    setHandlebar();
    setMaxSpeed();
    // setP3() setP4() => 引用 setMaxSpeed
  };
  return {
    changeGearPosition,
    changeLightStatus,
    setMaxSpeed,
    // setP1,
    // setP2,
    // setP3,
    // setP4,
    // setP5,
    // setC1C2,
    // setC5C14,
    // setC4C7C12,
    // setC13,
    // setPercent,
    // setHandlebar,
    writeData,
    updateSetting,
  };
}
