<template>
  <ion-page>
    <ion-tabs class="tabs">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon aria-hidden="true" :icon="speedometer" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="setting" href="/tabs/setting">
          <ion-icon aria-hidden="true" :icon="settings" />
          <ion-label>Setting</ion-label>
        </ion-tab-button>

        <ion-tab-button class="tabs__item" tab="info" href="/tabs/info">
          <ion-icon aria-hidden="true" :icon="bicycle" />
          <ion-label>Info</ion-label>
          <ion-icon class="tabs-icon__alert tabs-icon__alert--on" :class="hasError ? 'tabs-icon__alert--on' : 'tabs-icon__alert--off'" :icon="notificationsOutline" color="danger" size="mini"></ion-icon>
        </ion-tab-button>
        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon aria-hidden="true" :icon="infinite" />
          <ion-label>Track</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { settings, bicycle, speedometer, infinite, notificationsOutline } from 'ionicons/icons';
import {useErrorStore} from "@/store/useErrorStore";
import {storeToRefs} from "pinia";

const errorStore = useErrorStore()
const { hasError } = storeToRefs(errorStore)

</script>
<style scoped lang="scss">
ion-tab-bar {
  --background: #000;
}
.tabs {
  .tabs__item {
    position: relative;
    .tabs-icon__alert {
      position: absolute;
      font-size: 1rem;
      top: 0;
      right: 20px;
      &.tabs-icon__alert--on {
        display: block;
        animation: twinkle 0.5s infinite alternate;
      }
      &.tabs-icon__alert--off {
        display: none;
      }
    }
  }
}
@keyframes twinkle {
  0%{
    opacity: 0.8;
  }
  100%{
    opacity: 0;
  }
}
</style>
