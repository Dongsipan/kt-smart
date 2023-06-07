export enum GearDirection {
  positionZero = 0x00,
  positionOne = 0x01,
  positionTwo = 0x02,
  positionThree = 0x03,
  positionFour = 0x04,
  positionFive = 0x05,
  positionDefault = 0x08,
}

export const LevelList = [
  {
    name: "Zero",
    value: 0,
  },
  {
    name: "One",
    value: 1,
  },
  {
    name: "Two",
    value: 2,
  },
  {
    name: "Three",
    value: 3,
  },
  {
    name: "Four",
    value: 4,
  },
  {
    name: "Five",
    value: 5,
  },
  {
    name: "Default",
    value: 8,
  },
];

export const enum LightDirection {
  on = 0x80,
  off = 0x00,
}

/**
 * 尺寸所对应的轮径
 */
export const enum DimensionSize {
  inch_5 = 15,
  inch_6 = 14,
  inch_8 = 12,
  inch_10 = 13,
  inch_12 = 10,
  inch_14 = 11,
  inch_16 = 0,
  inch_18 = 1,
  inch_20 = 2,
  inch_22 = 3,
  inch_24 = 4,
  inch_26 = 5,
  inch_28 = 7,
  inch_29 = 17,
  c700 = 6,
}

export const DefaultSize = DimensionSize.inch_26;

export const DimensionList = [
  {
    name: "5 inch",
    value: DimensionSize.inch_5,
    dimension: 5,
  },
  {
    name: "6 inch",
    value: DimensionSize.inch_6,
    dimension: 6,
  },
  {
    name: "8 inch",
    value: DimensionSize.inch_8,
    dimension: 8,
  },
  {
    name: "10 inch",
    value: DimensionSize.inch_10,
    dimension: 10,
  },
  {
    name: "12 inch",
    value: DimensionSize.inch_12,
    dimension: 12,
  },
  {
    name: "14 inch",
    value: DimensionSize.inch_14,
    dimension: 14,
  },
  {
    name: "16 inch",
    value: DimensionSize.inch_16,
    dimension: 16,
  },
  {
    name: "18 inch",
    value: DimensionSize.inch_18,
    dimension: 18,
  },
  {
    name: "20 inch",
    value: DimensionSize.inch_20,
    dimension: 20,
  },
  {
    name: "22 inch",
    value: DimensionSize.inch_22,
    dimension: 22,
  },
  {
    name: "24 inch",
    value: DimensionSize.inch_24,
    dimension: 24,
  },
  {
    name: "26 inch",
    value: DimensionSize.inch_26,
    dimension: 26,
  },
  {
    name: "28 inch",
    value: DimensionSize.inch_28,
    dimension: 28,
  },
  {
    name: "29 inch",
    value: DimensionSize.inch_29,
    dimension: 29,
  },
  {
    name: "700 C",
    value: DimensionSize.c700,
    dimension: 28,
  },
];
