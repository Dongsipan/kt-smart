<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Track</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding-horizontal">
      <AMapContainer ref="mapRef" />

      <ion-button
        size="small"
        style="position: absolute; bottom: 80px; right: 16px"
        @click="printCurrentPosition"
      >
        <ion-icon :icon="navigateOutline"></ion-icon>
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { navigateOutline } from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { ref } from "vue";
import { useToast } from "@/hooks/useToast";
import AMapContainer from "@/components/AMapContainer.vue";

const mapRef = ref(null) as any;

const { presentToast } = useToast();

const printCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  await presentToast(`Current position: ${JSON.stringify(coordinates)}`);
  if (!mapRef.value) return;
  const { latitude, longitude } = coordinates.coords;
  mapRef.value.setLocation(longitude, latitude);
  console.log("Current position:", coordinates);
};
</script>
<style></style>
