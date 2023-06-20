<template>
  <ion-page class="track-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Track History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-no-padding">
      <AMapContainer ref="mapRef" container="history" />
    </ion-content>
    <ion-footer :translucent="true" class="ion-no-border">
      <ion-toolbar class="dashboard-toolbar">
        <div class="dashboard">
          <div class="dashboard-info ion-margin-top">
            <div class="dashboard-main__data">
              <div>altitude</div>
              <div>{{ maxAltitude || "--" }}</div>
            </div>
            <div class="dashboard-main__data">
              <div>Distance</div>
              <div>{{ distance || "--" }}</div>
            </div>
          </div>
          <div class="dashboard-info ion-margin-top">
            <div class="dashboard-info__data">
              <div>Time</div>
              <div>{{ time || "--" }}</div>
            </div>
            <div class="dashboard-info__data">
              <div>Extreme speed</div>
              <div>{{ maxSpeed || "--" }}</div>
            </div>
            <div class="dashboard-info__data">
              <div>Uniform speed</div>
              <div>{{ averageSpeed || "--" }}</div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  onIonViewDidEnter,
} from "@ionic/vue";
import { useDateFormat } from "@vueuse/core";
import AMapContainer from "@/components/AMapContainer.vue";
import { ref } from "vue";
import { usePositionStore } from "@/store/usePositionStore";
import { useRoute } from "vue-router";

const route = useRoute();
const { getHistoryTrackById } = usePositionStore();
const mapRef = ref(null) as any;

const maxSpeed = ref("");
const maxAltitude = ref("");
const averageSpeed = ref("");
const distance = ref("");
const time = ref("");

onIonViewDidEnter(() => {
  const id = route.params.id;
  const history = getHistoryTrackById(Number(id));
  const path = history!.path;
  mapRef.value.initTrack(path);
  maxSpeed.value = history!.maxSpeed.toString();
  maxAltitude.value = history!.maxAltitude.toString();
  averageSpeed.value = history!.averageSpeed.toString();
  distance.value = history!.distance.toString();
  time.value = useDateFormat(history!.time, "HH:mm:ss").value;
});
</script>

<style lang="scss"></style>
