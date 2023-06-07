<template>
  <ion-modal
    ref="modal"
    :breakpoints="[0, 0.25, 0.5, 0.75]"
    :initial-breakpoint="0.75"
    trigger="open-modal"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Bluetooth</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list class="ion-no-padding">
        <ion-item-group v-if="pairedDevices.length && connectedDevice.isPaired">
          <ion-item-divider>
            <ion-label> MY DEVICES </ion-label>
          </ion-item-divider>
          <ion-item-sliding v-for="(item, index) in pairedDevices" :key="index">
            <ion-item detail @click="changePairedStatus(item)">
              <ion-icon
                v-if="item.isPaired"
                slot="start"
                :icon="bluetooth"
                color="primary"
              ></ion-icon>
              <ion-icon v-else slot="start" :icon="bluetooth"></ion-icon>
              <ion-label>{{ item.name }}</ion-label>
              <ion-note v-if="item.isPairing" slot="end">Pairing...</ion-note>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger" @click="deletePairedDevice(item)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-item-group>

        <ion-item-group v-if="!connectedDevice.isPaired">
          <ion-item-divider>
            <ion-label> OTHER DEVICES </ion-label>
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
    <ion-alert
      :buttons="alertButtons"
      :is-open="isOpenAlert"
      header="Alert"
      sub-header="Do you want to disconnect the Bluetooth!"
      @didDismiss="setOpenAlert(false)"
    ></ion-alert>
  </ion-modal>
</template>

<script lang="ts" setup>
import {
  IonAlert,
  IonContent,
  IonIcon,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
} from "@ionic/vue";
import { onMounted, ref } from "vue";
import { bluetooth, trash } from "ionicons/icons";
import { Device, useBleStore } from "@/store/useBleStore";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { storeToRefs } from "pinia";

const store = useBleStore();
const { connectedDevice, pairedDevices, availableDevices } = storeToRefs(store);
const { scan, connectBle, disConnectBle } = useBluetoothLe();
const modal = ref<InstanceType<typeof IonModal> | null>(null);
const alertButtons = [
  "Cancel",
  {
    text: "Okay",
    handler: () => {
      disConnectBle(connectedDevice.value, false);
    },
  },
];
const isOpenAlert = ref(false);

const isOpenToast = ref(false);

const isPairing = ref(false);

onMounted(() => {
  scan();
});

const selectDevice = async (device: Device) => {
  if (isPairing.value) return;
  try {
    isOpenToast.value = true;
    isPairing.value = true;
    await connectBle(device);
    isPairing.value = false;
    isOpenToast.value = false;
  } catch (e) {
    console.log(e);
  }
};
const changePairedStatus = (device: Device) => {
  if (device.isPaired) {
    // 确认是否断开连接
    setOpenAlert(true);
  } else {
    connectBle(device, false);
  }
};
const deletePairedDevice = (device: Device) => {
  disConnectBle(device, true);
  scan();
};
const setOpenAlert = (value: boolean) => {
  isOpenAlert.value = value;
};
const dismiss = () => {
  modal.value && modal.value.$el.dismiss();
};
</script>
