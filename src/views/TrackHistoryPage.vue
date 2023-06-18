<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Track History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-no-padding">
      <AMapContainer container="history" ref="mapRef" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  onIonViewDidEnter,
} from "@ionic/vue";
import AMapContainer from "@/components/AMapContainer.vue";
import { ref, unref } from "vue";
import { usePositionStore } from "@/store/usePositionStore";
import { useRoute } from "vue-router";

const route = useRoute();
const { getHistoryTrackById } = usePositionStore();
const mapRef = ref(null) as any;

onIonViewDidEnter(() => {
  const id = route.params.id;
  const history = getHistoryTrackById(Number(id));
  const path = history!.path;
  mapRef.value.initTrack(path);
});
</script>

<style scoped lang="scss"></style>
