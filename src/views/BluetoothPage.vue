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
            <ion-label>
              MY DEVICES
            </ion-label>
          </ion-item-divider>
          <ion-item-sliding v-for="(item, index) in pairedDevices" :key="index">
            <ion-item @click="changePairedStatus(item)">
              <ion-icon v-if="item.isPaired" color="primary" :icon="bluetooth" slot="start"></ion-icon>
              <ion-icon v-else :icon="bluetooth" slot="start"></ion-icon>
              <ion-label>{{item.name}}</ion-label>
              <ion-note slot="end">{{ item.isPaired ? 'Connected' : 'Not Connected' }}</ion-note>
              <ion-icon class="ion-margin-start" :icon="informationCircle" slot="end" @click.stop="openDeviceInfo(item)"></ion-icon>
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
            <ion-label>
              OTHER DEVICES
            </ion-label>
          </ion-item-divider>
          <ion-item v-for="(item, index) in availableDevices" :key="index" @click="selectDevice(item)">
            <ion-icon :icon="bluetooth" slot="start"></ion-icon>
            <ion-label>{{item.name}}</ion-label>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
    <ion-alert
      :is-open="isOpenAlert"
      header="Alert"
      sub-header="Do you want to disconnect the Bluetooth!"
      :buttons="alertButtons"
      @didDismiss="setOpenAlert(false)"
    ></ion-alert>
    <device-manage-modal ref="deviceManageModal" :presentingElement="presentingElement"/>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItemGroup,
  IonItemDivider,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItem,
  IonLabel,
  IonNote,
  IonAlert
} from '@ionic/vue';
import {bluetooth, informationCircle, refresh, trash} from 'ionicons/icons';
import {Device, useBleStore} from "@/store/useBleStore";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";
import {ComponentPublicInstance, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import DeviceManageModal from "@/components/DeviceManageModal.vue";

const store = useBleStore()
const { connectedDevice, pairedDevices, availableDevices} = storeToRefs(store)
const { scan, connectBle, disConnectBle } = useBluetoothLe()

const isPairing = ref(false)

onMounted(() => {
  presentingElement = page.value?.$el
  scan()
})

let presentingElement: HTMLElement

const page = ref<ComponentPublicInstance|null>(null)

const deviceManageModal = ref<InstanceType<typeof DeviceManageModal> | null>(null)

const openDeviceInfo = (device: Device) => {
  if (deviceManageModal.value) {
    deviceManageModal.value?.present(device)
  }
}

const selectDevice = async (device: Device) => {
  if(isPairing.value) return
  try {
    isPairing.value = true
    await connectBle(device)
    isPairing.value = false
  } catch (e) {
    console.log(e)
  }
}
const changePairedStatus = (device: Device) => {
  if (device.isPaired) {
    // 确认是否断开连接
    setOpenAlert(true)
  } else {
    connectBle(device, false)
  }
}
const deletePairedDevice = (device: Device) => {
  disConnectBle(device, true)
  scan()
}

const isOpenAlert = ref(false)
const setOpenAlert = (value: boolean) => {
  isOpenAlert.value = value
}
const alertButtons = [
  'Cancel',
  {
    text: 'Okay', handler: () => {
      disConnectBle(connectedDevice.value, false)
    }
  }
]
const clearLocalStorage = () => {
  debugger
  window.localStorage.clear()
}
</script>
