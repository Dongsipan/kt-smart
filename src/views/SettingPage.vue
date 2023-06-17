<template>
  <ion-page class="page-setting">
    <ion-header>
      <ion-toolbar>
        <ion-title>Setting</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="updateSetting">Save</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-list-header>
          <ion-label>Parameters</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-input
            v-model="maxSpeed"
            :max="72"
            :maxlength="2"
            :min="10"
            inputmode="numeric"
            label="MaxSpeed"
            name="maxSpeed"
            placeholder="km/h"
            type="number"
          >
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-select
            v-model="dimension"
            :multiple="false"
            label="BikeDimension"
            name="dimension"
            placeholder="Select Dimension"
          >
            <ion-select-option
              v-for="(item, index) in dimensionList"
              :key="index"
              :value="item.value"
            >
              {{ item.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="p1"
            inputmode="numeric"
            label="MotorSetting (P1)"
            name="p1"
            placeholder="P1"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="p2"
            inputmode="numeric"
            label="SpeedSensor (P2)"
            name="p2"
            placeholder="P2"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="p3"
            inputmode="numeric"
            label="Torque (P3)"
            name="p3"
            placeholder="P3"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="p4"
            inputmode="numeric"
            label="ZeroStart (P4)"
            name="p4"
            placeholder="P4"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="p5"
            inputmode="numeric"
            label="Battery (P5)"
            name="p5"
            placeholder="P5"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c1"
            inputmode="numeric"
            label="PAS (C1)"
            name="c1"
            placeholder="C1"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c2"
            inputmode="numeric"
            label="MotorPhase (C2)"
            name="c2"
            placeholder="C2"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-select
            v-model="c3"
            :multiple="false"
            label="InitLevel (C3)"
            name="initLevel"
            placeholder="Select InitLevel"
          >
            <ion-select-option
              v-for="(item, index) of levelList"
              :key="index"
              :value="item.value"
            >
              {{ item.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c4"
            inputmode="numeric"
            label="Throttle (C4)"
            name="c4"
            placeholder="C4"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c5"
            inputmode="numeric"
            label="Current (C5)"
            name="c5"
            placeholder="C5"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c7"
            inputmode="numeric"
            label="Cruise (C7)"
            name="c7"
            placeholder="C7"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c12"
            inputmode="numeric"
            label="UVLO (C12)"
            name="c12"
            placeholder="C12"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c13"
            inputmode="numeric"
            label="Regenerative (C13)"
            name="c13"
            placeholder="C13"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="c14"
            inputmode="numeric"
            label="PASPower (C14)"
            name="c14"
            placeholder="C14"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-input
            v-model="handlebarMaxSpeed"
            inputmode="numeric"
            label="Handlebar Maximum Speed"
            name="handleBarSpeed"
            placeholder="data.displayType === 'kilometer' ? 'km/h' : 'mile/h'"
            type="number"
          ></ion-input>
          <!--TODO  c4必须等于2，才会起作用        -->
        </ion-item>

        <ion-item>
          <ion-input
            v-model="percent"
            inputmode="numeric"
            label="FirstLevelPercent (Throttle)"
            name="percent"
            placeholder="percentage"
            type="number"
          ></ion-input>
          <!--TODO  c4必须等于4，才会起作用        -->
        </ion-item>

        <ion-item>
          <ion-input
            v-model="candidateParam"
            inputmode="numeric"
            label="Candidate"
            name="candidate"
            placeholder="Signal of PAS"
            type="number"
          ></ion-input>
        </ion-item>

        <ion-radio-group v-model="displayType" name="displayType">
          <ion-list-header>Kilometer／Mile</ion-list-header>
          <ion-item>
            <ion-label>Kilometer</ion-label>
            <ion-radio value="kilometer">Kilometer</ion-radio>
          </ion-item>
          <ion-item>
            <ion-label>Mile</ion-label>
            <ion-radio value="mile">Mile</ion-radio>
          </ion-item>
        </ion-radio-group>
      </ion-list>
      <ion-grid>
        <ion-row>
          <ion-col class="page-setting__restore">
            <ion-button
              fill="outline"
              shape="round"
              size="small"
              @click="restore"
              >Restore Settings
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  onIonViewWillEnter,
  onIonViewWillLeave,
} from "@ionic/vue";
import { useSettingStore } from "@/store/useSettingStore";
import { useMessage } from "@/hooks/useMessage";
import { useSetting } from "@/hooks/useSetting";
import { useErrorStore } from "@/store/useErrorStore";
import { storeToRefs } from "pinia";

const settingStore = useSettingStore();
const errorStore = useErrorStore();
const {
  maxSpeed,
  dimension,
  dimensionList,
  p1,
  p2,
  p3,
  p4,
  p5,
  c1,
  c2,
  c3,
  c4,
  c5,
  c7,
  c12,
  c13,
  c14,
  levelList,
  handlebarMaxSpeed,
  percent,
  candidateParam,
  displayType,
} = storeToRefs(settingStore);

const { stopSendMessage } = useMessage();
const { updateSetting } = useSetting();

onIonViewWillEnter(() => {
  stopSendMessage();
});

onIonViewWillLeave(() => {
  updateSetting();
});

const restore = () => {
  settingStore.$reset();
  errorStore.$reset();
};
// const ionMaxSpeedEl = ref();
// const onMaxSpeedInput = (ev: any) => {
//   const value = ev.target!.value;
//   const filteredValue = value.replace(/[^0-9]+/g, "");
//   maxSpeed.value = filteredValue;
//   const inputCmp = ionMaxSpeedEl.value;
//   if (inputCmp !== undefined) {
//     inputCmp.$el.value = filteredValue;
//   }
// };
// const ionP1El = ref();
// const onP1Input = (ev: any) => {
//   const value = ev.target!.value;
//   const filteredValue = value.replace(/[^0-9]+/g, "");
//   p1.value = filteredValue;
//   const inputCmp = ionP1El.value;
//   if (inputCmp !== undefined) {
//     inputCmp.$el.value = filteredValue;
//   }
// };
</script>
<style lang="scss">
.page-setting {
  .page-setting__restore {
    display: flex;
    justify-content: center;
  }
}
</style>
