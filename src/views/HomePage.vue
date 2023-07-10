<template>
  <ion-page class="home-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-icon
            :class="{ 'home-page__battery--undervoltage': undervoltage }"
            :src="
              isBatteryAnimate
                ? batteryIconSource
                : `/assets/icon/battery_${electricQuantity}.svg`
            "
            class="home-page__battery"
            style="width: 3.5rem; height: 3rem; margin-left: 0.5rem"
          ></ion-icon>
          <ion-icon
            v-if="brake"
            :src="`/assets/icon/brake-outline.svg`"
            class="ion-margin-start"
          ></ion-icon>
          <ion-icon
            v-if="turnLeft"
            :icon="arrowBackOutline"
            class="ion-margin-start"
          ></ion-icon>
          <ion-icon
            v-if="turnRight"
            :icon="arrowForwardOutline"
            class="ion-margin-start"
          ></ion-icon>
        </ion-buttons>
        <!--        <ion-title>Dashboard</ion-title>-->
        <ion-buttons slot="end">
          <ion-button
            class="home-page__bluetooth-button"
            size="large"
            @click="toBluetoothPage"
          >
            <ion-icon
              :color="connectedDevice.isPaired ? 'primary' : 'light'"
              :icon="bluetooth"
              class="bluetooth ion-padding-start"
            />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :force-overscroll="true" :fullscreen="true" :scrollY="false">
      <div class="home-page__content">
        <dashboard-component
          class="home-page__dashboard"
          ref="dashboard"
          :gear-position="getGearPosition"
          :is-assistance="isAssistance"
          :is-km-unit="isKmUnit"
          :speed="speed"
          :throttle-status="throttle"
        />

        <ion-grid class="home-page__display">
          <ion-row>
            <ion-col>
              <ion-label>DST</ion-label>
              <ion-item lines="none">
                <ion-label v-if="getDisplayType === 'kilometer'" class="value">
                  {{ getSingleKM }}
                </ion-label>
                <ion-label v-else class="value">
                  {{ getSingleMileage }}
                </ion-label>
                <ion-text slot="end">{{ getDisplayUnit }}</ion-text>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-label>TM</ion-label>
              <ion-item lines="none">
                <ion-label class="value">
                  {{ singleTime }}
                </ion-label>
                <ion-text slot="end">H:M</ion-text>
              </ion-item>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col>
              <ion-label>ODO</ion-label>
              <ion-item lines="none">
                <ion-label v-if="getDisplayType === 'kilometer'" class="value">
                  {{ getTotalKM }}
                </ion-label>
                <ion-label v-else class="value">
                  {{ getTotalMileage }}
                </ion-label>
                <ion-text slot="end">{{ getDisplayUnit }}</ion-text>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-label>CADENCE</ion-label>
              <ion-item lines="none">
                <ion-label class="value">
                  {{ assistance }}
                </ion-label>
                <ion-text slot="end">RPM</ion-text>
              </ion-item>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col class="text-align-center">
              <ion-button
                class="icon-only-button"
                shape="round"
                @click="addSpeed"
              >
                <ion-icon
                  slot="icon-only"
                  src="/assets/icon/caret-up.svg"
                ></ion-icon>
                <ion-ripple-effect></ion-ripple-effect>
              </ion-button>
            </ion-col>
            <ion-col class="text-align-center">
              <ion-button
                class="icon-only-button"
                shape="round"
                @click="reduceSpeed"
              >
                <ion-icon
                  slot="icon-only"
                  src="/assets/icon/caret-down.svg"
                ></ion-icon>
                <ion-ripple-effect></ion-ripple-effect>
              </ion-button>
            </ion-col>
            <ion-col class="text-align-center">
              <ion-button
                :color="lightStatus ? 'primary' : 'light'"
                class="icon-only-button"
                shape="round"
                @click="changeLight"
              >
                <ion-icon slot="icon-only" src="/assets/icon/light-white.svg">
                </ion-icon>
                <ion-ripple-effect></ion-ripple-effect>
              </ion-button>
            </ion-col>
          </ion-row>
          <div style="display: none">
            {{
              `反冲电: ${regenative},欠压:${undervoltage},倒档: ${reverse},右转: ${turnRight},左转: ${turnLeft},转把状态: ${throttle},巡航状态: ${cruise},刹车状态: ${brake}`
            }}
          </div>
        </ion-grid>
      </div>

      <ion-alert
        :buttons="alertButtons"
        :is-open="isOpenAlert"
        header="Alert"
        sub-header="Do you want to disconnect the Bluetooth!"
        @didDismiss="setOpenAlert(false)"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRippleEffect,
  IonRow,
  IonText,
  IonToolbar,
  onIonViewDidEnter,
} from "@ionic/vue";
import {
  arrowBackOutline,
  arrowForwardOutline,
  bluetooth,
} from "ionicons/icons";
import { ComponentPublicInstance, computed, onMounted, ref, watch } from "vue";
import DashboardComponent from "@/components/DashboardComponent.vue";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSetting } from "@/hooks/useSetting";
import { useRouter } from "vue-router";
import { useBleStore } from "@/store/useBleStore";
import { storeToRefs } from "pinia";
import { useMessage } from "@/hooks/useMessage";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { useSettingStore } from "@/store/useSettingStore";
import { useExitApp } from "@/hooks/useExitApp";
// import {dataViewToNumbers, hexStringToDataView} from "@capacitor-community/bluetooth-le";

const bleStore = useBleStore();
const dashboardStore = useDashboardStore();
const settingStore = useSettingStore();
const { getDisplayType, getDisplayUnit } = storeToRefs(settingStore);
const {
  speed,
  getSingleMileage,
  getSingleKM,
  getTotalMileage,
  getTotalKM,
  singleTime,
  assistance,
  lightStatus,
  getGearPosition,
  electricQuantity,
  regenative,
  undervoltage,
  reverse,
  turnRight,
  turnLeft,
  throttle,
  cruise,
  brake,
} = storeToRefs(dashboardStore);
const { connectedDevice } = storeToRefs(bleStore);

const { initialBle, disConnectBle } = useBluetoothLe();
const { changeGearPosition, changeLightStatus } = useSetting();

const { sendMessage, stopSendMessage, getAssistance } = useMessage();

const router = useRouter();
const { exitListener } = useExitApp();
const dashboard = ref<ComponentPublicInstance | null>(null);

// onMounted(() => {
//   const data = "41 90 10 11 50 00 5f 02 01 00 80 39" // ['41', '70', '80', '00', 'f1', '00', 'ba', '02', '00', '00', '80', '39']
//   const dv = dataViewToNumbers(hexStringToDataView(data))
//   debugger
//   setInterval(() => {
//     getSpeed(dv)
//     getBattery(dv)
//     getSingleDistance()
//     getAssistance(dv)
//   }, 1000)
//
// })

onMounted(() => {
  exitListener();
  changeGearPosition(getGearPosition.value);
  initialBle().then(() => {
    setTimeout(async () => {
      await sendMessage();
    }, 1000);
  });
});

onIonViewDidEnter(async () => {
  if (connectedDevice.value.isPaired) {
    // 防止蓝牙初始化报错
    setTimeout(async () => {
      await sendMessage();
    }, 1000);
  }
});

const isOpenAlert = ref(false);
const setOpenAlert = (value: boolean) => {
  isOpenAlert.value = value;
};
const alertButtons = [
  "Cancel",
  {
    text: "Okay",
    handler: () => {
      stopSendMessage();
      disConnectBle(connectedDevice.value);
    },
  },
];
const toBluetoothPage = () => {
  // if (connectedDevice.value.isPaired) {
  //   setOpenAlert(true);
  // } else {
  //   router.push({ name: "bluetooth" });
  // }
  router.push({ name: "bluetooth" });
};

const addSpeed = () => {
  if (getGearPosition.value >= 5) return;
  const position = getGearPosition.value + 1;
  changeGearPosition(position);
  sendMessage();
  // batteryAnimate();
};
const reduceSpeed = () => {
  if (getGearPosition.value <= 0) return;
  const position = getGearPosition.value - 1;
  changeGearPosition(position);
  sendMessage();
};

const changeLight = () => {
  const value = !lightStatus.value;
  changeLightStatus(value);
  sendMessage();
};

const isKmUnit = computed(() => {
  return getDisplayType.value === "kilometer";
});
const isAssistance = computed(() => {
  return assistance.value > 0;
});
watch(regenative, (value) => {
  if (value === 1) {
    batteryAnimate();
  }
});
const isBatteryAnimate = ref(false);
const batteryIconSource = ref("/assets/icon/battery_0.svg");
const batteryAnimate = () => {
  isBatteryAnimate.value = true;
  const batteryIcons = [
    "/assets/icon/battery_0.svg",
    "/assets/icon/battery_1.svg",
    "/assets/icon/battery_2.svg",
    "/assets/icon/battery_3.svg",
    "/assets/icon/battery_4.svg",
  ];
  let index = 0;
  let count = 0;

  const printBatteryIcon = () => {
    console.log(batteryIcons[index]);
    batteryIconSource.value = batteryIcons[index];
    index++;
    if (index === batteryIcons.length) {
      index = 0;
      count++;
    }
    if (count === 2) {
      clearInterval(intervalId);
      isBatteryAnimate.value = false;
    }
  };

  const intervalId = setInterval(printBatteryIcon, 500);
};
</script>
<style lang="scss" scoped>
@keyframes twinkle {
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}
//@media only screen and (min-width: 375px) {
//  .logo {
//    width: 62.5px;
//  }
//}
.home-page {
  .home-page__battery {
    width: 2.5rem;

    &.home-page__battery--undervoltage {
      animation: twinkle 0.5s infinite alternate;
    }
  }

  .home-page__bluetooth-button {
    ion-icon {
      font-size: 2.2rem;
    }
  }

  .text-align-center {
    display: flex;
    justify-content: center;
    align-content: center;

    .icon-only-button {
      height: 4rem;
      width: 4rem;
      --border-radius: 50%;
      --padding-start: 0;
      --padding-end: 0;
    }
  }

  ion-icon {
    font-size: 2.5rem;
  }

  ion-toolbar {
    --background: #000;
    --color: white;
  }

  .home-page__content {
    display: flex;
    flex-direction: column;
    height: 100%;

    ion-grid {
      width: 100%;
    }
    .home-page__dashboard {
      flex: 0;
    }
    .home-page__display {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      flex: 1;
      .value {
        font-weight: bold;
      }
    }
  }
  ion-content {
    --background: #000;
    --color: #fff;
  }

  ion-item {
    --background: #000;
    --color: #fff;
  }

  //ion-row {
  //  margin-top: 1rem;
  //
  //  &:first-child {
  //    margin-top: 0;
  //  }
  //}
}
</style>
