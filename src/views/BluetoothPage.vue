<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-title>Bluetooth</ion-title>
        <ion-buttons slot="end">
          <ion-button>
            <ion-icon slot="icon-only" :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item-group v-if="pairedDevices.length">
          <ion-item-divider>
            <ion-label>
              PAIRED DEVICES
            </ion-label>
          </ion-item-divider>
          <ion-item-sliding v-for="(item, index) in pairedDevices" :key="index">
            <ion-item detail>
              <ion-icon v-if="item.isPaired" color="primary" name="bluetooth" slot="start"></ion-icon>
              <ion-icon v-else name="bluetooth" slot="start"></ion-icon>
              <ion-label>{{item.name||item.id}}</ion-label>
              <ion-note slot="end" v-if="item.isPairing">Pairing...</ion-note>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option color="danger">
                <ion-icon slot="icon-only" name="trash"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider>
            <ion-label>
              AVAILABLE DEVICES
            </ion-label>
          </ion-item-divider>
          <ion-item v-for="(item, index) in availableDevices"  :key="index">
            <ion-icon name="bluetooth" slot="start"></ion-icon>
            <ion-label>{{item.name||item.id}}</ion-label>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, IonButtons, IonIcon, IonList, IonItemGroup, IonItemDivider, IonItemSliding, IonItemOptions, IonItemOption, IonItem } from '@ionic/vue';
import { refresh } from 'ionicons/icons';
import {useBleStore} from "@/store/useBleStore";
import {useBluetoothLe} from "@/hooks/useBluetooth-le";
import {onMounted} from "vue";

const { pairedDevices, availableDevices } = useBleStore()

const { scan } = useBluetoothLe()

onMounted(() => {
  scan()
})
</script>
