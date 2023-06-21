<template>
  <ion-page ref="page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Bluetooth</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="clearLocalStorage">
            <ion-icon slot="icon-only" :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card v-if="connectedDevice.isPaired">
        <ion-card-header>
          <ion-card-title class="device-modal__title">
            {{ connectedDevice.name }}
          </ion-card-title>
          <ion-card-subtitle>Device Information</ion-card-subtitle>
        </ion-card-header>
        <ion-button fill="clear" size="small" @click="presentAlert"
          >Disconnect
        </ion-button>
      </ion-card>
      <ion-list v-else>
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Available Devices</ion-label>
          </ion-item-divider>
          <ion-item
            v-for="(item, index) in availableDevices"
            :key="index"
            @click="selectDevice(item)"
          >
            <ion-icon slot="start" :icon="bluetooth"></ion-icon>
            <ion-label>{{ item.name }}</ion-label>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  alertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { bluetooth, refresh } from "ionicons/icons";
import { Device, useBleStore } from "@/store/useBleStore";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const store = useBleStore();
const { connectedDevice, availableDevices } = storeToRefs(store);
const { scan, connectBle, disConnectBle } = useBluetoothLe();
const router = useRouter();

onMounted(() => {
  scan();
});

const selectDevice = async (device: Device) => {
  await connectBle(device);
  router.back();
};
const alertButtons = [
  "Cancel",
  {
    text: "Okay",
    handler: async () => {
      await disConnectBle(connectedDevice.value, false);
      await scan();
    },
  },
];
const presentAlert = async () => {
  const alert = await alertController.create({
    header: "Alert",
    subHeader: "Do you want to disconnect the Bluetooth!",
    buttons: alertButtons,
  });

  await alert.present();
};
const clearLocalStorage = () => {
  window.localStorage.clear();
};
</script>
