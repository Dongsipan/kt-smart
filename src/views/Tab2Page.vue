<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>
      {{ test }}
      <ExploreContainer name="Tab 2 page" />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import ExploreContainer from "@/components/ExploreContainer.vue";
import { onMounted, ref } from "vue";
import { useBleStore } from "@/store/useBleStore";

const { getConnectedDevice } = useBleStore();
const test = ref("");
onMounted(async () => {
  test.value = JSON.stringify(getConnectedDevice);
});
</script>
