import {useSettingStore} from "@/store/useSettingStore";
import {useDashboardStore} from "@/store/useDashboardStore";
import {GearDirection} from "@/const/bike.const";
import {WriteData} from "@/const/ble.const";

export function useSetting() {
  const writeData = WriteData

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
    c4,
    c5,
    c7,
    c12,
    c13,
    c14,
    percent,
    handlebarMaxSpeed
  } = useSettingStore()
  const {gearPosition} = useDashboardStore()

  /*设置最大速度*/
  const setMaxSpeed = () => {
    const dimensionMode = getDimension()
    let expand
    let secondData = 0x0
    let limitSpeed = 0x0
    if (maxSpeed < 32) {
      limitSpeed = 0x0;
      const speed: number = maxSpeed << 3;
      secondData = Int2Bytes(speed + dimensionMode.dimension);
    }
    if (maxSpeed >= 32 && maxSpeed < 64) {
      limitSpeed = 0x20;
      const speedDiff = maxSpeed - 32;
      if (speedDiff === 0) {
        secondData = 0x5;
      } else {
        const speed: number = speedDiff << 3;
        secondData = Int2Bytes(speed + dimension);
      }
    }
    writeData[2] = secondData;
    if (dimensionMode.code === 1) {
      expand = 0x80;
    } else {
      expand = 0x0;
    }
    writeData[4] = p2 + (p3 << 3) + (p4 << 4) + limitSpeed + expand; // p2+p3+p4+限速+轮径拓展
    // code = 0 轮径不需要扩展  code = 1 需要扩展
    // maxSpeed < 31 限速不需要扩展
  }
  /*获取不同尺寸轮径的数据*/
  const getDimension = () => {
    if (dimension < 10) {
      return {
        code: 0,
        dimension: Int2Bytes(dimension)
      }
    } else {
      const diff = dimension - 10;
      return {
        code: 1,
        dimension: Int2Bytes(diff)
      }
    }
  }
  const setGearPosition = () => {
    switch (gearPosition) {
      case 0:
        writeData[1] = GearDirection.positionZero;
        break;
      case 1:
        writeData[1] = GearDirection.positionOne;
        break;
      case 2:
        writeData[1] = GearDirection.positionTwo;
        break;
      case 3:
        writeData[1] = GearDirection.positionThree;
        break;
      case 4:
        writeData[1] = GearDirection.positionFour;
        break;
      case 5:
        writeData[1] = GearDirection.positionFive;
        break;
      default:
        writeData[1] = GearDirection.positionFive;
        break;
    }
  }
  const setP1 = () => {
    writeData[3] = Int2Bytes(p1);
  }
  const setP5 = () => {
    writeData[0] = Int2Bytes(p5);
  }
  const setC1C2 = () => {
    const c1Hex = Int2Bytes(c1);

    const c2Hex = Int2Bytes(c2);

    writeData[6] = (c1Hex << 3) + (c2Hex);
  }
  const setC5C14 = () => {
    const c5Hex = Int2Bytes(c5);

    const c14Hex = Int2Bytes(c14 << 5);

    writeData[7] = 128 + c14Hex + c5Hex;
  }
  const setC4C7C12 = () => {
    const c4Hex = Int2Bytes(c4 << 5);

    const c7Hex = Int2Bytes(c7 << 3);

    const c12Hex = Int2Bytes(c12);

    writeData[8] = c4Hex + c7Hex + c12Hex;
  }
  const setC13 = () => {
    const c13Hex = Int2Bytes(c13 << 2);
    writeData[10] = c13Hex + 1;
  }
  const setPercent = () => {
    writeData[11] = Int2Bytes(percent);
  }
  const setHandlebar = () => {
    writeData[9] = Int2Bytes(handlebarMaxSpeed);
  }
  const Int2Bytes = (value: number) => {
    const hex = value.toString(16);
    return HexString2Bytes(hex)[0];
  }

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
  }
  return {
    setGearPosition,
    setMaxSpeed,
    setP1,
    setP5,
    setC1C2,
    setC5C14,
    setC4C7C12,
    setC13,
    setPercent,
    setHandlebar,
    writeData
  }
}
