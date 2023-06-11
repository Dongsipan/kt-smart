<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet, useBackButton } from "@ionic/vue";
import { App } from "@capacitor/app";
import { onMounted, ref } from "vue";
import { useToast } from "@/hooks/useToast";
import { usePositionStore } from "@/store/usePositionStore";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const { getCurrentPosition } = useGeoLocation();
const { presentToast } = useToast();
const backButtonPressedTwiceToExit = ref(false);
const listenBackButton = () => {
  useBackButton(-1, () => {
    if (backButtonPressedTwiceToExit.value) {
      App.exitApp();
    } else {
      backButtonPressedTwiceToExit.value = true;
      presentToast("Press again to exit the application");
      setTimeout(() => {
        backButtonPressedTwiceToExit.value = false;
      }, 2000);
    }
  });
};

onMounted(async () => {
  listenBackButton();
  await getCurrentPosition();
});
</script>
