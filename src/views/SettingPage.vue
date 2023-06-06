<template>
  <ion-page class="page-setting">
    <ion-header>
      <ion-toolbar>
        <ion-title>Setting</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-list-header>
          <ion-label>Parameters</ion-label>
        </ion-list-header>

        <ion-item>
          <ion-input label="MaxSpeed" name="maxSpeed" v-model="settingStore.maxSpeed" @change="setMaxSpeed" :maxlength="2" type="number" placeholder="km/h" min="0" max="72" step="1">
          </ion-input>
        </ion-item>

        <ion-item>
          <ion-select label="BikeDimension" name="dimension" v-model="settingStore.dimension" :multiple="false" placeholder="Select Dimension">
            <ion-select-option v-for="(item, index) in settingStore.dimensionList" :key="index" :value="item.value">
              {{ item.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input label="MotorSetting (P1)" name="p1" v-model="settingStore.p1" type="number"
                     placeholder="P1"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="SpeedSensor (P2)" name="p2" v-model="settingStore.p2" type="number"
                     placeholder="P2"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="Torque (P3)" name="p3" v-model="settingStore.p3" type="number"
                     placeholder="P3"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="ZeroStart (P4)" name="p4" v-model="settingStore.p4" type="number"
                     placeholder="P4"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="Battery (P5)" name="p5" v-model="settingStore.p5" type="number"
                     placeholder="P5"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="PAS (C1)" name="c1" v-model="settingStore.c1" type="number"
                     placeholder="C1"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="MotorPhase (C2)" name="c2" v-model="settingStore.c2" type="number"
                     placeholder="C2"></ion-input>
        </ion-item>

        <ion-item>
          <ion-select label="InitLevel (C3)" name="initLevel" v-model="settingStore.c3" :multiple="false"
                      placeholder="Select InitLevel">
            <ion-select-option v-for="(item, index) of settingStore.levelList" :key="index" :value="item.value">
              {{ item.name }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-input label="Throttle (C4)" name="c4" v-model="settingStore.c4" type="number"
                     placeholder="C4"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="Current (C5)" name="c5" v-model="settingStore.c5" type="number"
                     placeholder="C5"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="Cruise (C7)" name="c7" v-model="settingStore.c7" type="number"
                     placeholder="C7"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="UVLO (C12)" name="c12" v-model="settingStore.c12" type="number"
                     placeholder="C12"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="Regenerative (C13)" name="c13" v-model="settingStore.c13" type="number"
                     placeholder="C13"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="PASPower (C14)" name="c14" v-model="settingStore.c14" type="number"
                     placeholder="C14"></ion-input>
        </ion-item>

        <ion-item>
          <ion-input label="MaxSpeed (Throttle)" name="handleBarSpeed" v-model="settingStore.handlebarMaxSpeed" type="number"
                     placeholder="data.displayType === 'kilometer' ? 'km/h' : 'mile/h'"></ion-input>
          <!--TODO  c4必须等于2，才会起作用        -->
        </ion-item>

        <ion-item>
          <ion-input label="FirstLevelPercent (Throttle)" name="percent" v-model="settingStore.percent" type="number"
                     placeholder="percentage"></ion-input>
          <!--TODO  c4必须等于4，才会起作用        -->
        </ion-item>

        <ion-item>
          <ion-input label="Candidate" name="candidate" v-model="settingStore.candidateParam"
                     type="number" placeholder="Signal of PAS"></ion-input>
        </ion-item>

        <ion-radio-group v-model="settingStore.displayType" name="displayType">
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
          <ion-button size="small" shape="round" fill="outline" @click="restore">Restore Settings</ion-button>
        </ion-col>
      </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonRadioGroup,
  IonRadio,
  IonRow,
  IonCol,
  IonButton,
  IonGrid,
  onIonViewWillEnter, onIonViewWillLeave
} from '@ionic/vue';
import {useSettingStore} from "@/store/useSettingStore";
import {useMessage} from "@/hooks/useMessage";
import {useSetting} from "@/hooks/useSetting";
import {useErrorStore} from "@/store/useErrorStore";


const settingStore = useSettingStore()
const errorStore = useErrorStore()

const { stopSendMessage } = useMessage()
const {setMaxSpeed, updateSetting } = useSetting()

onIonViewWillEnter(() => {
  stopSendMessage()
});

onIonViewWillLeave(() => {
  updateSetting()
})

const restore = () => {
  settingStore.$reset()
  errorStore.$reset()
}

</script>
<style lang="scss">
.page-setting {
  .page-setting__restore {
    display: flex;
    justify-content: center;
  }
}
</style>
