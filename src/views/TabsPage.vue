<template>
  <ion-page>
    <ion-tabs class="tabs">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button href="/tabs/home" tab="home">
          <ion-icon :icon="speedometer" aria-hidden="true" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button href="/tabs/setting" tab="setting">
          <ion-icon :icon="settings" aria-hidden="true" />
          <ion-label>Setting</ion-label>
        </ion-tab-button>

        <ion-tab-button class="tabs__item" href="/tabs/info" tab="info">
          <ion-icon :icon="bicycle" aria-hidden="true" />
          <ion-label>Info</ion-label>
          <ion-icon
            :class="hasError ? 'tabs-icon__alert--on' : 'tabs-icon__alert--off'"
            :icon="notificationsOutline"
            class="tabs-icon__alert tabs-icon__alert--on"
            color="danger"
            size="mini"
          ></ion-icon>
        </ion-tab-button>
        <ion-tab-button href="/tabs/track" tab="track">
          <ion-icon :icon="infinite" aria-hidden="true" />
          <ion-label>Track</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/vue";
import {
  bicycle,
  infinite,
  notificationsOutline,
  settings,
  speedometer,
} from "ionicons/icons";
import { useErrorStore } from "@/store/useErrorStore";
import { storeToRefs } from "pinia";

const errorStore = useErrorStore();
const { hasError } = storeToRefs(errorStore);
</script>
<style lang="scss" scoped>
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
  0% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}
</style>
