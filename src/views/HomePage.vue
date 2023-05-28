<template>
  <ion-page class="home-page">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-icon class="home-page__battery" style="width: 2.5rem; height: 2rem;margin-left: 0.5rem;" src="/assets/icon/battery_0.svg"></ion-icon>
        </ion-buttons>
        <ion-title>Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="toBluetoothPage">
            <ion-icon :icon="bluetooth" class="bluetooth" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" :force-overscroll="true" :scrollY="false">
      <dashboard-component ref="dashboard" :speed="45" :gear-position="2" :is-assistance="false" :is-km-unit="true"/>

      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-label>DST</ion-label>
            <ion-item lines="none">
              <ion-label class="value" v-if="isKmUnit">
                {{ getSingleKM }}
              </ion-label>
              <ion-label class="value" v-else>
                {{ getSingleMileage }}
              </ion-label>
              <ion-text slot="end">{{ getUnit }}</ion-text>
            </ion-item>
          </ion-col>
          <ion-col>
            <ion-label>TM</ion-label>
            <ion-item lines="none">
              <ion-label class="value">
                {{ singleTime }}
              </ion-label>
              <ion-text slot="end">H:M</ion-text>
            </ion-item>
          </ion-col>
        </ion-row>

        <ion-row>
          <ion-col>
            <ion-label>ODO</ion-label>
            <ion-item lines="none">
              <ion-label class="value" v-if="isKmUnit">
                {{ getTotalKM }}
              </ion-label>
              <ion-label class="value" v-else>
                {{ getTotalMileage }}
              </ion-label>
              <ion-text slot="end">{{ getUnit }}</ion-text>
            </ion-item>
          </ion-col>
          <ion-col>
            <ion-label>CADENCE</ion-label>
            <ion-item lines="none">
              <ion-label class="value">
                {{ assistance }}
              </ion-label>
              <ion-text slot="end">RPM</ion-text>
            </ion-item>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col class="text-align-center">
            <ion-button class="icon-only" shape="round" @click="addSpeed">
              <ion-icon slot="icon-only" src="/assets/icon/caret-up.svg"></ion-icon>
              <ion-ripple-effect></ion-ripple-effect>
            </ion-button>
          </ion-col>
          <ion-col class="text-align-center">
            <ion-button class="icon-only" shape="round" @click="reduceSpeed">
              <ion-icon slot="icon-only" src="/assets/icon/caret-down.svg"></ion-icon>
              <ion-ripple-effect></ion-ripple-effect>
            </ion-button>
          </ion-col>
          <ion-col class="text-align-center">
            <ion-button class="icon-only btn-light" shape="round" @click="changeLight">
              <ion-icon slot="icon-only" src="/assets/icon/light-white.svg" :class="{'light-on': lightStatus}">
              </ion-icon>
              <ion-ripple-effect></ion-ripple-effect>
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButtons, IonButton, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonText, IonRippleEffect } from '@ionic/vue';
import { bluetooth } from 'ionicons/icons';
import {ComponentPublicInstance, onMounted, ref} from "vue";
import DashboardComponent from "@/components/DashboardComponent.vue";
import {useDashboardStore} from "@/store/useDashboardStore";
import {useSetting} from "@/hooks/useSetting";
import {useRouter} from "vue-router";

const { getSingleMileage, getSingleKM, getTotalMileage, getTotalKM, singleTime, isKmUnit, getUnit, assistance, lightStatus, gearPosition } = useDashboardStore()

const { changeGearPosition, changeLightStatus } = useSetting()

const router = useRouter()

const dashboard = ref<ComponentPublicInstance|null>(null)

onMounted(()=> {
  // computedGridHeight()
})

// const computedGridHeight = () => {
//   nextTick(() => {
//     debugger
//     if (!dashboard.value) return
//     const $el = dashboard.value.$el
//     const realEl = $el.getElementById('chartEl')
//     const chartHeight = realEl.style.height
//
//   })
//
// }

const toBluetoothPage = () => {
  router.push({name: 'bluetooth' })
}

const addSpeed = () => {
  if (gearPosition >=5) return
  const position = gearPosition + 1
  changeGearPosition(position)
}
const reduceSpeed = () => {
  if (gearPosition <= 1) return
  const position = gearPosition - 1
  changeGearPosition(position)
}

const changeLight = () => {
  changeLightStatus(lightStatus)
}
</script>
<style lang="scss" scoped>
.home-page {
  .home-page__battery {
    width: 2.5rem;
  }
  ion-icon {
    font-size: 2rem;
  }
  ion-toolbar {
    --background: #000;
    --color: white;
  }

  ion-content {
    --background: #000;
    --color: #fff;
  }
  ion-item {
    --background: #000;
    --color: #fff;
  }
  ion-row {
    margin-top: 1rem;
  }
}

</style>