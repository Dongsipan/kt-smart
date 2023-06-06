<template>
  <ion-page class="info-page">
    <ion-header>
      <ion-toolbar>
        <ion-title>Error Information</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row align-items-center>
          <ion-col align-self-center class="info-page__bicycle">
            <ion-icon :icon="bicycle"></ion-icon>
          </ion-col>
        </ion-row>
        <ion-row align-items-center>
          <ion-col align-self-center size="6">
            <ion-row align-items-center>
              <ion-col size="4">
                <ion-icon :icon="warningOutline" :color="current ? 'primary' : ''"></ion-icon>
              </ion-col>
              <ion-col align-self-center size="8">
                <ion-text>Current</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
          <ion-col size="6">
            <ion-row align-items-center>
              <ion-col align-self-center size="4">
                <ion-icon :icon="warningOutline" :color="throttle ? 'danger' : ''"></ion-icon>
              </ion-col>
              <ion-col align-self-center size="8">
                <ion-text>Throttle</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
        <ion-row align-items-center>
          <ion-col align-self-center size="6">
            <ion-row align-items-center>
              <ion-col size="4">
                <ion-icon :icon="warningOutline" :color="motorPhase ? 'danger' : ''"></ion-icon>
              </ion-col>
              <ion-col align-self-center size="8">
                <ion-text>MotorPhase</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
          <ion-col size="6">
            <ion-row align-items-center>
              <ion-col align-self-center size="4">
                <ion-icon :icon="warningOutline" :color="motorHall ? 'danger' : ''"></ion-icon>
              </ion-col>
              <ion-col align-self-center size="8">
                <ion-text>MotorHall</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
        <ion-row align-items-center>
          <ion-col align-self-center size="6">
            <ion-row align-items-center>
              <ion-col size="4">
                <ion-icon :icon="warningOutline" :color="torqueSensor ? 'danger' : ''"></ion-icon>
              </ion-col>
              <ion-col align-self-center size="8">
                <ion-text>TorqueSensor</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
          <ion-col size="6">
            <ion-row align-items-center>
              <ion-col align-self-center size="4">
                <ion-icon :icon="warningOutline" :color="speedSensor ? 'danger' : ''"></ion-icon>
              </ion-col>
              <ion-col align-self-center size="8">
                <ion-text>SpeedSensor</ion-text>
              </ion-col>
            </ion-row>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonText } from '@ionic/vue';
import {bicycle, warningOutline} from 'ionicons/icons';
import {useErrorStore} from "@/store/useErrorStore";
import {storeToRefs} from "pinia";
const errorStore = useErrorStore()
const { current, throttle, motorPhase, motorHall, torqueSensor, speedSensor } = storeToRefs(errorStore)
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
}
</style>
