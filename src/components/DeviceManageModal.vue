<template>
  <ion-modal
    ref="modal"
    :presenting-element="presentingElement"
    @didDismiss="didDismiss"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Device</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="dismiss()">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-card>
        <ion-card-header>
          <ion-card-title class="device-modal__title">
            {{ device.name }}
            <!--            <ion-icon id="present-alert" :icon="createOutline"></ion-icon>-->
          </ion-card-title>
          <ion-card-subtitle>Device Information</ion-card-subtitle>
        </ion-card-header>
        <ion-button
          v-if="device.isPaired"
          fill="clear"
          size="small"
          @click="disconnectDevice"
          >Disconnect
        </ion-button>
      </ion-card>
      <ion-row class="ion-margin">
        <ion-col>
          <ion-button
            expand="block"
            fill="outline"
            size="small"
            @click="deletePairedDevice"
            >Forget This Device
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
    <ion-alert
      :buttons="alertButtons"
      :is-open="isOpenAlert"
      header="Alert"
      sub-header="Do you want to disconnect the Bluetooth!"
      @didDismiss="setOpenAlert(false)"
    ></ion-alert>
    <ion-alert
      :buttons="alertEditButtons"
      :inputs="alertInputs"
      header="Please enter your device name"
      trigger="present-alert"
    ></ion-alert>
  </ion-modal>
</template>

<script lang="ts" setup>
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonHeader,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { onMounted, ref } from "vue";
import { Device } from "@/store/useBleStore";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { useMessage } from "@/hooks/useMessage";

defineProps({
  presentingElement: HTMLElement,
});

const { scan, disConnectBle } = useBluetoothLe();

const device = ref<Device>({
  deviceId: "",
  name: "",
  isPaired: false,
  isPairing: false,
});

const modal = ref<InstanceType<typeof IonModal> | null>(null);
const dismiss = () => {
  modal.value && modal.value.$el.dismiss();
};

const didDismiss = () => {
  scan();
};

const present = (data: Device) => {
  device.value = data;
  modal.value && modal.value.$el.present();
};

defineExpose({
  dismiss,
  present,
});

const deletePairedDevice = () => {
  disConnectBle(device.value);
  dismiss();
};

const disconnectDevice = () => {
  setOpenAlert(true);
  // disConnectBle(device.value, false)
};

const isOpenAlert = ref(false);
const setOpenAlert = (value: boolean) => {
  isOpenAlert.value = value;
};
const alertButtons = [
  "Cancel",
  {
    text: "Okay",
    handler: () => {
      disConnectBle(device.value);
    },
  },
];

const alertInputs = [
  {
    placeholder: "Nickname (max 10 characters)",
    attributes: {
      maxlength: 10,
    },
  },
];
const alertEditButtons = ["Cancel"] as any;

onMounted(() => {
  const { setBLEName } = useMessage();
  const save = {
    text: "Save",
    handler: async (res: any) => {
      const nickname = res[0];
      try {
        await setBLEName(nickname);
      } catch (e) {
        console.log(e);
      }
    },
  };
  alertEditButtons.push(save);
});
</script>

<style scoped>
.device-modal__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
