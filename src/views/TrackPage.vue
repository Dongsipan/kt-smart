<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Track</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="setMapToCenter">
            <ion-icon :icon="locateOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-no-padding">
      <AMapContainer ref="mapRef" />

      <!--      <ion-button-->
      <!--        size="small"-->
      <!--        style="position: absolute; bottom: 90px; right: 16px"-->
      <!--        @click="getCurrentPosition"-->
      <!--      >-->
      <!--        <ion-icon :icon="navigateOutline"></ion-icon>-->
      <!--      </ion-button>-->
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { locateOutline, navigateOutline } from "ionicons/icons";
import AMapContainer from "@/components/AMapContainer.vue";
import { ref } from "vue";

const mapRef = ref(null) as any;

const setMapToCenter = () => {
  mapRef.value.setMapToCenter();
};
</script>
<style></style>
