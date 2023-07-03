<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { useBleStore } from "@/store/useBleStore";
import { useDisconnectEventBus } from "@/hooks/useDisconnectEventBus";
import { useToast } from "@/hooks/useToast";
import { useMessage } from "@/hooks/useMessage";
import { useBluetoothLe } from "@/hooks/useBluetooth-le";
import { useDashboardStore } from "@/store/useDashboardStore";

const { stopSendMessage } = useMessage();
const { scan } = useBluetoothLe();
const store = useBleStore();
const { resetDashboard } = useDashboardStore();
const { on } = useDisconnectEventBus();
const toast = useToast();
on(async () => {
  // 监听设备是否断开
  await toast.presentToast("Bluetooth disconnected");
  store.updateConnectedDevicePairedStatus(false);
  store.clearAvailableDevices();
  await stopSendMessage();
  resetDashboard();
  await scan();
});
</script>
