<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { KeepAwake } from '@capacitor-community/keep-awake'
import { useBleStore } from '@/store/useBleStore'
import { useDisconnectEventBus } from '@/hooks/useDisconnectEventBus'
import { useToast } from '@/hooks/useToast'
import { useMessage } from '@/hooks/useMessage'
import { useBluetoothLe } from '@/hooks/useBluetooth-le'
import { useDashboardStore } from '@/store/useDashboardStore'
import { useGeoLocation } from '@/hooks/useGeoLocation'
import { onMounted, onUnmounted } from 'vue'

const { stopSendMessage } = useMessage()
const { scan } = useBluetoothLe()
const store = useBleStore()
const { resetDashboard } = useDashboardStore()
const { on } = useDisconnectEventBus()
const toast = useToast()
const { getCurrentPosition } = useGeoLocation()
on(async () => {
  // 监听设备是否断开
  await toast.presentToast('Bluetooth disconnected')
  store.updateConnectedDevicePairedStatus(false)
  store.clearAvailableDevices()
  await stopSendMessage()
  resetDashboard()
  await scan()
})

onMounted(() => {
  getCurrentPosition()
  keepAwake()
})

onUnmounted(() => {
  allowSleep()
})

const keepAwake = async () => {
  await KeepAwake.keepAwake()
}

const allowSleep = async () => {
  await KeepAwake.allowSleep()
}
</script>
