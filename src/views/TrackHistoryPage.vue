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
              <div>Altitude</div>
              <div>{{ maxAltitude || "--" }}</div>
            </div>
            <div class="dashboard-main__data">
              <div>Distance</div>
              <div>{{ distance || "--" }}</div>
            </div>
          </div>
          <div class="dashboard-info ion-margin-top ion-margin-horizontal">
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
  const path = history?.path;
  if (path) {
    mapRef.value.initTrack(path);
  }
  maxSpeed.value = history!.maxSpeed.toString();
  maxAltitude.value = history!.maxAltitude.toString();
  averageSpeed.value = history!.averageSpeed.toString();
  distance.value = history!.distance.toString();
  time.value = history!.time;
});
</script>

<style lang="scss">
.track-page {
  ion-content {
    position: relative;
  }

  .dashboard {
    display: flex;
    flex-direction: column;
    //position: absolute;
    //bottom: 50px;
    //width: 100%;
    background-color: transparent;
    backdrop-filter: blur(4px);
    color: #fff;

    .dashboard-main {
      display: flex;
      justify-content: space-around;

      .dashboard-main__action {
        position: relative;
        width: 150px;
        height: 150px;

        #dashboard__action-outer {
          position: absolute;
          transform: rotate(130deg);
        }

        .dashboard-main__action-trigger {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          transform: translate(36px, 8px);

          span {
            color: #fff;
          }
        }
      }

      .dashboard-main__data {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1rem;

        &.dashboard-main__data--outer {
          margin-top: 2.5rem;
        }
      }
    }

    .dashboard-info {
      height: 50px;
      display: flex;
      justify-content: space-around;

      .dashboard-info__data {
        display: flex;
        flex-direction: column;
        flex: 1;
        div:last-child {
          width: 100%;
        }
      }
    }
  }
}

ion-toolbar.dashboard-toolbar {
  --background: rgba(0, 0, 0, 0.3);
  --color: white;
}
</style>
