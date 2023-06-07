<template>
  <ion-page class="info-page">
    <ion-header>
      <ion-toolbar>
        <ion-title>Error Information</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding-horizontal">
      <ion-grid>
        <ion-row>
          <ion-col class="info-page__bicycle">
            <ion-icon :icon="bicycle"></ion-icon>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-row align-items-center>
              <ion-col size="3">
                <ion-icon
                  :color="current ? 'primary' : ''"
                  :icon="warningOutline"
                ></ion-icon>
              </ion-col>
              <ion-col class="ion-align-self-center" size="9">
                <ion-text>Current</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
          <ion-col size="6">
            <ion-row>
              <ion-col class="ion-align-self-center" size="3">
                <ion-icon
                  :color="throttle ? 'danger' : ''"
                  :icon="warningOutline"
                ></ion-icon>
              </ion-col>
              <ion-col class="ion-align-self-center" size="9">
                <ion-text>Throttle</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-row>
              <ion-col size="3">
                <ion-icon
                  :color="motorPhase ? 'danger' : ''"
                  :icon="warningOutline"
                ></ion-icon>
              </ion-col>
              <ion-col class="ion-align-self-center" size="9">
                <ion-text>MotorPhase</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
          <ion-col size="6">
            <ion-row>
              <ion-col size="3">
                <ion-icon
                  :color="motorHall ? 'danger' : ''"
                  :icon="warningOutline"
                ></ion-icon>
              </ion-col>
              <ion-col class="ion-align-self-center" size="9">
                <ion-text>MotorHall</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col size="6">
            <ion-row>
              <ion-col size="3">
                <ion-icon
                  :color="torqueSensor ? 'danger' : ''"
                  :icon="warningOutline"
                ></ion-icon>
              </ion-col>
              <ion-col class="ion-align-self-center" size="9">
                <ion-text>TorqueSensor</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
          <ion-col size="6">
            <ion-row>
              <ion-col size="3">
                <ion-icon
                  :color="speedSensor ? 'danger' : ''"
                  :icon="warningOutline"
                ></ion-icon>
              </ion-col>
              <ion-col class="ion-align-self-center" size="9">
                <ion-text>SpeedSensor</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { bicycle, warningOutline } from "ionicons/icons";
import { useErrorStore } from "@/store/useErrorStore";
import { storeToRefs } from "pinia";

const errorStore = useErrorStore();
const { current, throttle, motorPhase, motorHall, torqueSensor, speedSensor } =
  storeToRefs(errorStore);
</script>
<style lang="scss">
.info-page {
  .info-page__bicycle {
    display: flex;
    align-items: center;
    justify-content: center;

    ion-icon {
      font-size: 15rem;
    }
  }

  ion-icon {
    font-size: 2rem;
  }
}
</style>
