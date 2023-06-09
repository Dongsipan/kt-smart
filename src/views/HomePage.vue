<template>
  <ion-page class="home-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-icon
            :src="`/assets/icon/battery_${electricQuantity}.svg`"
            class="home-page__battery"
            style="width: 2.5rem; height: 2rem; margin-left: 0.5rem"
          ></ion-icon>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toBluetoothPage">
            <ion-icon
              :color="connectedDevice.isPaired ? 'primary' : 'light'"
              :icon="bluetooth"
              class="bluetooth"
            />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :force-overscroll="true" :fullscreen="true" :scrollY="false">
      <dashboard-component
        ref="dashboard"
        :gear-position="getGearPosition"
        :is-assistance="isAssistance"
        :is-km-unit="isKmUnit"
        :speed="speed"
      />

      <ion-grid>
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
      </ion-grid>
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
  IonTitle,
  IonToolbar,
  onIonViewDidEnter,
} from "@ionic/vue";
import { bluetooth } from "ionicons/icons";
import { ComponentPublicInstance, computed, ref } from "vue";
import DashboardComponent from "@/components/DashboardComponent.vue";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSetting } from "@/hooks/useSetting";
import { useRouter } from "vue-router";
import { useBleStore } from "@/store/useBleStore";
import { storeToRefs } from "pinia";
import { useMessage } from "@/hooks/useMessage";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { useSettingStore } from "@/store/useSettingStore";
// import {dataViewToNumbers, hexStringToDataView} from "@capacitor-community/bluetooth-le";

const dashboardStore = useDashboardStore();
const bleStore = useBleStore();
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
} = storeToRefs(dashboardStore);
const { connectedDevice } = storeToRefs(bleStore);

const { initialBle, disConnectBle } = useBluetoothLe();
const { changeGearPosition, changeLightStatus } = useSetting();

const { sendMessage, stopSendMessage, getAssistance } = useMessage();

const router = useRouter();

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

onIonViewDidEnter(async () => {
  debugger;
  if (connectedDevice.value.isPaired) {
    await sendMessage();
  } else {
    // 防止蓝牙初始化报错
    setTimeout(async () => {
      await initialBle();
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
      disConnectBle(connectedDevice.value, false);
    },
  },
];
const toBluetoothPage = () => {
  if (connectedDevice.value.isPaired) {
    setOpenAlert(true);
  } else {
    router.push({ name: "bluetooth" });
  }
};

const addSpeed = () => {
  if (getGearPosition.value >= 5) return;
  const position = getGearPosition.value + 1;
  changeGearPosition(position);
  sendMessage();
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
</script>
<style lang="scss" scoped>
.home-page {
  .home-page__battery {
    width: 2.5rem;
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
    font-size: 2rem;
  }

  ion-toolbar {
    --background: #000;
    --color: white;
  }

  ion-content {
    --background: #000;
    --color: #fff;
  }

  ion-item {
    --background: #000;
    --color: #fff;
  }

  ion-row {
    margin-top: 1rem;
  }
}
</style>
