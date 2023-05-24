<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import {onMounted} from "vue";
import {useStorage} from "@/hooks/useStorage";
import {useBleStore} from "@/store/useBleStore";

const {set} = useStorage()
const {setConnectedDevice} = useBleStore()

onMounted(()=> {
  set('test', 112233445566)
  setConnectedDevice({
    id: '0D:CD:45:F1:D9:BF',
    name: 'aaaa',
    advertising: {},
    rssi: '-86',
    isPairing: false,
    isPaired: false,
    services: [],
    characteristics: []
  })
})
</script>
