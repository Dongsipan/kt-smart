<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { onMounted } from "vue";
import { useGeoLocation } from "@/hooks/useGeoLocation";

const { getCurrentPosition } = useGeoLocation();
onMounted(async () => {
  await getCurrentPosition();
});
</script>
