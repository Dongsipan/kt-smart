<template>
  <ion-page class="home-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-icon class="home-page__battery" style="width: 2.5rem; height: 2rem;margin-left: 0.5rem;" src="/assets/icon/battery_0.svg"></ion-icon>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon :icon="bluetooth" class="bluetooth" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :force-overscroll="true" :scrollY="false">
      <dashboard-component :speed="45" :gear-position="2" :is-assistance="false" :is-km-unit="true"/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonButton } from '@ionic/vue';
import { bluetooth } from 'ionicons/icons';
import {onMounted} from "vue";
import DashboardComponent from "@/components/DashboardComponent.vue";


onMounted(()=> {
  // set('test', 112233445566)
})
</script>
<style lang="scss">
.home-page {
  .home-page__battery {
    width: 2.5rem;
  }
}
ion-icon {
  font-size: 2rem;
}
</style>