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
      <ion-list>
        <ion-item-group v-if="pairedDevices.length">
          <ion-item-divider>
            <ion-label> MY DEVICES</ion-label>
          </ion-item-divider>
          <ion-item-sliding v-for="(item, index) in pairedDevices" :key="index">
            <ion-item @click="changePairedStatus(item)">
              <ion-icon
                v-if="item.isPaired"
                slot="start"
                :icon="bluetooth"
                color="primary"
              ></ion-icon>
              <ion-icon v-else slot="start" :icon="bluetooth"></ion-icon>
              <ion-label>{{ item.name }}</ion-label>
              <ion-spinner
                v-if="item.isPairing"
                slot="end"
                name="lines-small"
              ></ion-spinner>
              <ion-note v-if="!item.isPairing" slot="end"
                >{{ item.isPaired ? "Connected" : "Not Connected" }}
              </ion-note>
              <ion-icon
                slot="end"
                :icon="informationCircle"
                class="ion-margin-start"
                @click.stop="openDeviceInfo(item)"
              ></ion-icon>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" @click="deletePairedDevice(item)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider>
            <ion-label> OTHER DEVICES</ion-label>
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
    <!--    <ion-alert-->
    <!--      :buttons="alertButtons"-->
    <!--      :is-open="isOpenAlert"-->
    <!--      header="Alert"-->
    <!--      sub-header="Do you want to disconnect the Bluetooth!"-->
    <!--      @didDismiss="setOpenAlert(false)"-->
    <!--    ></ion-alert>-->
    <device-manage-modal
      ref="deviceManageModal"
      :presentingElement="presentingElement"
    />
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  alertController,
} from "@ionic/vue";
import { bluetooth, informationCircle, refresh, trash } from "ionicons/icons";
import { Device, useBleStore } from "@/store/useBleStore";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { ComponentPublicInstance, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import DeviceManageModal from "@/components/DeviceManageModal.vue";

const store = useBleStore();
const { connectedDevice, pairedDevices, availableDevices } = storeToRefs(store);
const { scan, connectBle, disConnectBle } = useBluetoothLe();

const isPairing = ref(false);

onMounted(() => {
  presentingElement = page.value?.$el;
  scan();
});

let presentingElement: HTMLElement;

const page = ref<ComponentPublicInstance | null>(null);

const deviceManageModal = ref<InstanceType<typeof DeviceManageModal> | null>(
  null
);

const openDeviceInfo = (device: Device) => {
  if (deviceManageModal.value) {
    deviceManageModal.value?.present(device);
  }
};

const selectDevice = async (device: Device) => {
  if (device.isPairing) return;
  try {
    await connectBle(device);
  } catch (e) {
    console.log(e);
  }
};
const changePairedStatus = async (device: Device) => {
  if (device.isPaired) {
    // 确认是否断开连接
    await presentAlert();
  } else {
    await connectBle(device, false);
  }
};
const deletePairedDevice = (device: Device) => {
  disConnectBle(device, true);
  scan();
};
const alertButtons = [
  "Cancel",
  {
    text: "Okay",
    handler: () => {
      disConnectBle(connectedDevice.value, false);
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
