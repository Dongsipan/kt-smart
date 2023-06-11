<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Track</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="setMapToCenter">
            <ion-icon :icon="locateOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-no-padding">
      <AMapContainer ref="mapRef" />
    </ion-content>
    <ion-footer :translucent="true" class="ion-no-border">
      <ion-toolbar class="dashboard-toolbar">
        <div class="dashboard">
          <div class="dashboard-main">
            <div class="dashboard-main__data dashboard-main__data--outer">
              <div>altitude</div>
              <div>--</div>
            </div>
            <div class="dashboard-main__action">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="150px"
                width="150px"
                id="dashboard__action-outer"
              >
                <path
                  d="M75 0.5 A73.5 73.5 0 1 0 147.38 86.76"
                  stroke="white"
                  stroke-width="0.5"
                  fill="none"
                ></path>
              </svg>
              <ion-button
                @click="startRide"
                shape="round"
                class="dashboard-main__action-trigger"
                >start<br />
                ride</ion-button
              >
              <div class="dashboard-main__data">
                <div>mileage</div>
                <div>--</div>
              </div>
            </div>
            <div class="dashboard-main__data dashboard-main__data--outer">
              <div>speed</div>
              <div>--</div>
            </div>
          </div>
          <div class="dashboard-info ion-margin-top">
            <div class="dashboard-info__data">
              <div>Time</div>
              <div>--</div>
            </div>
            <div class="dashboard-info__data">
              <div>Extreme speed</div>
              <div>--</div>
            </div>
            <div class="dashboard-info__data">
              <div>Uniform speed</div>
              <div>--</div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFooter,
} from "@ionic/vue";
import { locateOutline } from "ionicons/icons";
import AMapContainer from "@/components/AMapContainer.vue";
import { onMounted, ref } from "vue";
import { useAndroidPermission } from "@/hooks/uesAndroidPermissions";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useToast } from "@/hooks/useToast";
import { usePositionStore } from "@/store/usePositionStore";

const { requestLocationPermission } = useAndroidPermission();
const mapRef = ref(null) as any;

const { watchCurrentPosition } = useGeoLocation();
const { presentToast } = useToast();
const setMapToCenter = () => {
  mapRef.value.setMapToCenter();
};

const currentTrack = ref<number[][]>([]);
const currentSpeed = ref<number | null>(null);
const currentAltitude = ref<number | null>(null);

const startRide = () => {
  watchCurrentPosition(async (location) => {
    await presentToast(JSON.stringify(location));
    const { longitude, latitude, altitude, speed } = location!.coords;
    currentSpeed.value = speed;
    currentAltitude.value = altitude;
    const positions = await mapRef.value.convertGpsToAMap([
      longitude,
      latitude,
    ]);
    currentTrack.value.push(positions);
    setPolyline();
  });
};

const setPolyline = () => {};

// onMounted(() => {
//   initCycle();
// });

// onIonViewDidEnter(() => {
//   requestLocationPermission();
//   watchCurrentPosition((location) => {
//     presentToast(JSON.stringify(location));
//   });
// });

const initCycle = () => {
  const svg = document.getElementById("dashboard__action-outer");
  const path = createSVGPath(75, 0, 74, 260, 0.5, "white");
  svg!.appendChild(path);
};

const createSVGPath = (
  startX: number,
  startY: number,
  R: number,
  theta: number,
  width: number,
  color: string
) => {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const realR = R - width;
  const dArr = [
    "M" + startX,
    startY + width,
    "A" + realR,
    realR,
    0,
    theta >= 180 ? 1 : 0,
    0,
  ];
  const cx = startX,
    cy = startY + R;

  const theta2 = theta % 360;
  // 避免360度与0度一样的情况
  theta = theta > 0 && theta2 == 0 ? 359.9 : theta2;

  const alpha = ((theta + 90) / 180) * Math.PI;
  const dx = realR * Math.cos(alpha);
  const dy = realR * Math.sin(alpha);
  const x = cx + dx,
    y = cy - dy;

  dArr.push(x.toFixed(2));
  dArr.push(y.toFixed(2));
  const d = dArr.join(" ");

  path.setAttribute("d", d);
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", width.toString());
  path.setAttribute("fill", "none");

  return path;
};
</script>
<style lang="scss" scoped>
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
      align-items: center;
    }
  }
}
ion-toolbar.dashboard-toolbar {
  --background: transparent;
  --color: white;
}
</style>
<!--如何计算骑行消耗的热量（卡路里）？-->
<!--骑行消耗的热量一般按照平均功率计算，这个公式是目前公认最准确的功率骑行热量消耗公式，绝大多数的码表计算热量消耗的方法便是依照此公式而来，职业车手一般也会以此公式计算能量消耗从而计划食物补给。-->
<!--公式为：消耗热量（kcal）=平均功率（w）*1.1（校正系数）*3.6（换算系数）*运动时间（h）。-->
<!--假如以200w的平均功率连续骑行1h，所消耗的热量约为200*3.6*1.1*1=792kcal，-->
<!--以150w的平均功率连续骑行1h消耗的热量约为594kcal，-->
<!--以100w的平均功率连续骑行1h消耗的热量约为396kcal。-->
<!--也就是说，比较“卖力”骑行一小时大约会消耗800kcal的热量，相当于一顿正餐。-->
<!--正常骑行一小时大约会消耗600kcal的热量，大约相当于一个汉堡。-->
<!--而“休闲”骑行一小时消耗的热量约为400kcal，大约相当于一大份薯条的热量。-->
