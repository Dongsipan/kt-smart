<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toBluetoothPage">
            <ion-icon :icon="bluetooth" class="bluetooth" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-button @click="addSpeed">add</ion-button>
      <ion-button @click="reduceSpeed">reduce</ion-button>
      <ExploreContainer name="Tab 1 page" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import ExploreContainer from "@/components/ExploreContainer.vue";
import { onMounted } from "vue";
import { bluetooth } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useSetting } from "@/hooks/useSetting";
import { useMessage } from "@/hooks/useMessage";
import { storeToRefs } from "pinia";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  dataViewToNumbers,
  hexStringToDataView,
} from "@capacitor-community/bluetooth-le";
// import {dataViewToNumbers} from "@capacitor-community/bluetooth-le";
// import {hexStringToDataView} from "@capacitor-community/bluetooth-le/dist/esm/conversion";
// import {useError} from "@/hooks/useError";
const dashboardStore = useDashboardStore();
const { gearPosition } = storeToRefs(dashboardStore);
const { changeGearPosition } = useSetting();

const {
  sendMessage,
  getSpeed,
  // getBattery,
  getAssistance,
  checkError,
} = useMessage();
const router = useRouter();

const toBluetoothPage = () => {
  router.push({ name: "bluetooth" });
};
const addSpeed = () => {
  debugger;
  if (gearPosition.value >= 5) return;
  const position = gearPosition.value + 1;
  changeGearPosition(position);
  sendMessage();
};
const reduceSpeed = () => {
  if (gearPosition.value <= 1) return;
  const position = gearPosition.value - 1;
  changeGearPosition(position);
  sendMessage();
};
onMounted(() => {
  const data = "41 90 80 05 f0 00 5f 02 01 00 80 39"; // ['41', '70', '80', '00', 'f1', '00', 'ba', '02', '00', '00', '80', '39']
  const dv = dataViewToNumbers(hexStringToDataView(data));
  debugger;
  // getAssistance(dv)
  // getBattery(dv)
  setInterval(() => {
    getSpeed(dv);
  }, 1000);
});
</script>
