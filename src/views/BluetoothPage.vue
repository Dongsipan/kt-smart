<template>
  <ion-page ref="page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Bluetooth</ion-title>
        <ion-buttons v-if="!connectedDevice.isPaired" slot="end">
          <ion-button @click="scan">
            <ion-icon
              slot="icon-only"
              :class="{ 'icon-refresh--on': scanning }"
              :icon="refresh"
            ></ion-icon>
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
        <ion-card-content>
          Device ID:{{ connectedDevice.deviceId }}
        </ion-card-content>
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
          <ion-item v-if="scanning" lines="none">
            <ion-note v-if="isPlatform('ios')">
              Searching for available devices...
            </ion-note>
            <ion-note v-else slot="start">
              Searching for available devices...
            </ion-note>
            <ion-spinner slot="end"></ion-spinner>
          </ion-item>
          <ion-item
            v-if="availableDevices.length === 0 && !scanning"
            lines="none"
          >
            <ion-note v-if="isPlatform('ios')">
              No available Bluetooth devices found
            </ion-note>
            <ion-note v-else slot="start">
              No available Bluetooth devices found
            </ion-note>
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
  IonCardContent,
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
  IonNote,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  isPlatform,
  loadingController,
} from "@ionic/vue";
import { bluetooth, refresh } from "ionicons/icons";
import { Device, useBleStore } from "@/store/useBleStore";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { onMounted, shallowRef } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useMessage } from "@/hooks/useMessage";
import { useDisconnectEventBus } from "@/hooks/useDisconnectEventBus";

const store = useBleStore();
const { connectedDevice, availableDevices } = storeToRefs(store);
const { scan, scanning, connectBle, disConnectBle, onDisconnect } =
  useBluetoothLe();
const { stopSendMessage } = useMessage();
const router = useRouter();
const { on } = useDisconnectEventBus();

onMounted(() => {
  if (connectedDevice.value.isPaired) return;
  scan();
});

on(async () => {
  // 监听设备是否断开
  store.setConnectedDevice({} as Device);
  await stopSendMessage();
});
const selectDevice = async (device: Device) => {
  await showConnectLoading();
  await connectBle(device);
  connectLoading.value?.dismiss();
  router.back();
};
const alertButtons = [
  "Cancel",
  {
    text: "Okay",
    handler: async () => {
      alert.value?.dismiss();
      await showDisconnectLoading();
      await stopSendMessage();
      await disConnectBle(connectedDevice.value);
      disconnectLoading.value?.dismiss();
      setTimeout(async () => {
        await scan();
      }, 500);
    },
  },
];
const alert = shallowRef<HTMLIonAlertElement>();
const presentAlert = async () => {
  alert.value = await alertController.create({
    header: "Alert",
    subHeader: "Do you want to disconnect the Bluetooth!",
    buttons: alertButtons,
  });

  await alert.value.present();
};
const connectLoading = shallowRef<HTMLIonLoadingElement>();
const showConnectLoading = async () => {
  connectLoading.value = await loadingController.create({
    message: "Disconnecting Bluetooth device",
  });
  await connectLoading.value.present;
};
const disconnectLoading = shallowRef<HTMLIonLoadingElement>();
const showDisconnectLoading = async () => {
  disconnectLoading.value = await loadingController.create({
    message: "Disconnecting Bluetooth device",
  });

  await disconnectLoading.value.present();
};
</script>
<style lang="scss">
@keyframes refresh {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.icon-refresh--on {
  animation-name: refresh;
  animation-duration: 1s;
  animation-iteration-count: 1;
}
</style>
