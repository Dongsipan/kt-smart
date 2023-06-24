<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Track Histories</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list v-if="historyTrack.length">
        <ion-item-sliding v-for="item in historyTrack" :key="item.id">
          <ion-item @click="toHistoryPage(item.id)">
            <ion-icon slot="start" :icon="mapOutline" />
            <ion-label>{{ dateFormat(item.id) }}</ion-label>
          </ion-item>

          <ion-item-options>
            <ion-item-option color="danger" @click="deleteHistory(item.id)"
              >Delete</ion-item-option
            >
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <ion-list v-else>
        <ion-item> No Data </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItemOption,
  IonItemSliding,
} from "@ionic/vue";
import { useDateFormat } from "@vueuse/core";
import { usePositionStore } from "@/store/usePositionStore";
import { mapOutline } from "ionicons/icons";
import { useRouter } from "vue-router";

const { historyTrack, deleteHistory } = usePositionStore();
const router = useRouter();
const dateFormat = (date: number) => {
  return useDateFormat(date, "YYYY-MM-DD HH:mm:ss").value;
};

const toHistoryPage = (id: number) => {
  router.push({ name: "history", params: { id } });
};
</script>
