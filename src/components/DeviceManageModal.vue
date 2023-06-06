<template>
  <ion-modal ref="modal" :presenting-element="presentingElement" @didDismiss="didDismiss">
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
          <ion-card-title>{{device.name}}</ion-card-title>
          <ion-card-subtitle>Device Information</ion-card-subtitle>
        </ion-card-header>
        <ion-button v-if="device.isPaired" fill="clear" size="small" @click="disconnectDevice">Disconnect</ion-button>
      </ion-card>
      <ion-row class="ion-margin">
        <ion-col>
          <ion-button size="small" expand="block" fill="outline" @click="deletePairedDevice">Forget This Device</ion-button>
        </ion-col>
      </ion-row>
    </ion-content>
    <ion-alert
        :is-open="isOpenAlert"
        header="Alert"
        sub-header="Do you want to disconnect the Bluetooth!"
        :buttons="alertButtons"
        @didDismiss="setOpenAlert(false)"
    ></ion-alert>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonAlert
} from "@ionic/vue";
import {ref} from "vue";
import {Device} from "@/store/useBleStore";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";

defineProps({
  presentingElement: HTMLElement
})

const {scan, disConnectBle } = useBluetoothLe()

const device = ref<Device>({deviceId: "", name: '', isPaired: false, isPairing: false})

const modal = ref<InstanceType<typeof IonModal> | null>(null)
const dismiss = () => {
  modal.value && modal.value.$el.dismiss();
}

const didDismiss = () => {
  scan()
}

const present = (data: Device) => {
  device.value = data
  modal.value && modal.value.$el.present();
}

defineExpose({
  dismiss,
  present
})

const deletePairedDevice = () => {
  disConnectBle(device.value, true)
  dismiss()
}

const disconnectDevice = () => {
  setOpenAlert(true)
  // disConnectBle(device.value, false)
}

const isOpenAlert = ref(false)
const setOpenAlert = (value: boolean) => {
  isOpenAlert.value = value
}
const alertButtons = [
  'Cancel',
  {
    text: 'Okay', handler: () => {
      debugger
      disConnectBle(device.value, false)
    }
  }
]


</script>

<style scoped>

</style>
