<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Track</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="setMapToCenter">
            <ion-icon :icon="locateOutline"></ion-icon>
          </ion-button>
          <ion-button @click="toHistoriesPage">
            <ion-icon :icon="footstepsOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-no-padding">
      <ion-fab slot="fixed" :edge="true" horizontal="end" vertical="bottom">
        <ion-fab-button id="open-modal">
          <ion-icon :icon="flashOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <AMapContainer ref="mapRef" />
    </ion-content>
    <ion-footer :translucent="true" class="ion-no-border">
      <ion-toolbar class="dashboard-toolbar">
        <div class="dashboard">
          <div class="dashboard-main">
            <div class="dashboard-main__data dashboard-main__data--outer">
              <div>altitude</div>
              <div>{{ altitudeToFixed || "--" }}</div>
            </div>
            <div class="dashboard-main__action">
              <svg
                id="dashboard__action-outer"
                height="150px"
                width="150px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M75 0.5 A73.5 73.5 0 1 0 147.38 86.76"
                  fill="none"
                  stroke="white"
                  stroke-width="0.5"
                ></path>
              </svg>
              <ion-button
                v-if="!isRiding"
                class="dashboard-main__action-trigger"
                shape="round"
                @click="startRide"
              >
                <span>Start<br />Ride</span>
              </ion-button>
              <template v-else>
                <ion-button
                  v-if="!isStopRiding"
                  v-on-long-press="onLongPressCallbackDirective"
                  class="dashboard-main__action-trigger"
                  color="success"
                  shape="round"
                  @click="stopRide"
                >
                  <span>Stop<br />Ride</span>
                </ion-button>
                <ion-button
                  v-else
                  v-on-long-press="onLongPressCallbackDirective"
                  class="dashboard-main__action-trigger"
                  color="warning"
                  shape="round"
                  @click="restoreRide"
                >
                  <span>Restore<br />Ride</span>
                </ion-button>
              </template>
              <div class="dashboard-main__data">
                <div>mileage</div>
                <div>--</div>
              </div>
            </div>
            <div class="dashboard-main__data dashboard-main__data--outer">
              <div>speed</div>
              <div>{{ speedToKm || "--" }}</div>
            </div>
          </div>
          <div class="dashboard-info ion-margin-top">
            <div class="dashboard-info__data">
              <div>Time</div>
              <div>{{ formatTime || "--" }}</div>
            </div>
            <div class="dashboard-info__data">
              <div>Extreme speed</div>
              <div>{{ maxSpeed || "--" }}</div>
            </div>
            <div class="dashboard-info__data">
              <div>Uniform speed</div>
              <div>{{ averageSpeedToKm || "--" }}</div>
            </div>
          </div>
        </div>
      </ion-toolbar>
    </ion-footer>
    <ion-modal ref="modal" trigger="open-modal">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="closeModal()">Cancel</ion-button>
          </ion-buttons>
          <ion-title>GPS Information</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label>
            <h3>Longitude</h3>
            <p>{{ currentLongitude }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Latitude</h3>
            <p>{{ currentLatitude }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Speed</h3>
            <p>{{ currentSpeed }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Altitude</h3>
            <p>{{ currentAltitude }}</p>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <h3>Path</h3>
            <ion-textarea :auto-grow="true" :value="JSON.stringify(path)">
            </ion-textarea>
          </ion-label>
        </ion-item>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  alertController,
  IonAlert,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonTextarea,
  IonTitle,
  IonToolbar,
  onIonViewDidEnter,
} from "@ionic/vue";
import {
  flashOutline,
  footstepsOutline,
  locateOutline,
  mapOutline,
} from "ionicons/icons";
import AMapContainer from "@/components/AMapContainer.vue";
import { computed, onMounted, ref } from "vue";
import { vOnLongPress } from "@vueuse/components";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useToast } from "@/hooks/useToast";
import { PathSmoothTool } from "@/services/PathSmoothTool";
import { usePositionStore } from "@/store/usePositionStore";
import { useTimer } from "@/hooks/useTimer";
import { Position } from "@capacitor/geolocation";
import { useRouter } from "vue-router";
import { Capacitor } from "@capacitor/core";

const mapRef = ref(null) as any;

const positionStore = usePositionStore();
const { watchCurrentPosition, clearWatch } = useGeoLocation();
const { presentToast } = useToast();
const router = useRouter();
const setMapToCenter = () => {
  mapRef.value.setMapToCenter();
};
const toHistoriesPage = () => {
  router.push({ name: "histories" });
};
const geoLocationData = [] as Position[];
const path = [] as AMap.LngLat[]; // ref<AMap.LngLat[]>([]);
let smoothedPath = [] as AMap.LngLat[];
const pathSmoothTool = new PathSmoothTool();
// const currentSpeed = ref<number | string | null>(null);
const currentLongitude = ref();
const currentLatitude = ref();
const currentSpeed = ref<number>();
const currentAltitude = ref<number>();
const currentAccuracy = ref();
const currentAverageSpeed = ref<number>();
const currentDistance = ref<number>();

const isRiding = ref(false);
const isStopRiding = ref(false);
const { elapsedTime, toggleTimer, formatTime } = useTimer();

const speedToKm = computed(() => {
  return currentSpeed.value && currentSpeed.value !== -1
    ? ((currentSpeed.value * 3600) / 1000).toFixed(1)
    : 0;
});

const averageSpeedToKm = computed(() => {
  return currentAverageSpeed.value && currentAverageSpeed.value < 1
    ? (currentAverageSpeed.value * 3.6).toFixed(1)
    : 0;
});
const altitudeToFixed = computed(() => {
  return currentAltitude.value ? currentAltitude.value?.toFixed(1) : 0;
});
const isNative = Capacitor.isNativePlatform();
onMounted(() => {
  if (isNative) {
    mapRef.value.initMap();
  } else {
    mapRef.value.initWebMap();
  }
});
const startRide = () => {
  setMapToCenter();
  mapRef.value.initPolyline();
  isRiding.value = true;
  toggleTimer();
  // mockPath();
  watchPosition();
};
const watchPosition = () => {
  watchCurrentPosition(async (geolocationPosition) => {
    if (geolocationPosition === null) return;
    const { longitude, latitude, altitude, speed, accuracy } =
      geolocationPosition!.coords;
    currentSpeed.value = speed || 0;
    currentAltitude.value = altitude || 0;
    currentLongitude.value = longitude;
    currentLatitude.value = latitude;
    currentAccuracy.value = accuracy;
    geoLocationData.push(geolocationPosition); // 存储原始数据

    const positions = await mapRef.value.convertGpsToAMap([
      longitude,
      latitude,
    ]); // 转化成高德坐标
    path.push(positions);
    smoothedPath = pathSmoothTool.pathOptimize(path); // 优化轨迹
    mapRef.value.setPolylineByPath(smoothedPath); // 绘制轨迹
    getMaxData(); // 从GPS数据中计算最大速度、最高海拔
    calculateAverageSpeed(); // 计算平均速度
    currentDistance.value = mapRef.value.getPolyLineLength();
  });
};
/*
 * {"timestamp":1686647786114,"coords":{"altitude":32.022853851318359,"heading":-1,"latitude":31.298159747161719,"altitudeAccuracy":10.407867431640625,"longitude":120.54356498135141,"accuracy":46,"speed":-1}}
 * */

const stopRide = () => {
  isStopRiding.value = true;
  toggleTimer();
  clearWatch();
};
const restoreRide = () => {
  isStopRiding.value = false;
  toggleTimer();
  watchPosition();
};
const { addHistoryTrack } = usePositionStore();
const finishRide = () => {
  isRiding.value = false;
  isStopRiding.value = false;
  toggleTimer();
  clearWatch();
  if (smoothedPath.length < 10) {
    presentNotSaveAlert();
  } else {
    const lastPosition = smoothedPath[smoothedPath.length - 1];
    mapRef.value.addEndPositionMarker(lastPosition.lng, lastPosition.lat);
    saveHistory();
  }
};
const presentFinishAlert = async () => {
  const alert = await alertController.create({
    header: "End cycling",
    subHeader: "Whether to end cycling",
    buttons: alertButtons,
  });

  await alert.present();
};
const presentNotSaveAlert = async () => {
  const alert = await alertController.create({
    header: "Alert",
    subHeader: "The distance is too short and will not be stored",
    buttons: ["OK"],
  });

  await alert.present();
};
const alertButtons = [
  "Cancel",
  {
    text: "OK",
    role: "confirm",
    handler: () => {
      finishRide();
    },
  },
];
/*获取最高海拔、最大速度*/
const maxSpeed = ref(0);
const maxAltitude = ref(0);
const getMaxData = () => {
  const { _maxSpeed, _maxAltitude } = geoLocationData.reduce(
    (acc: any, curr: any) => {
      if (curr.coords.speed) {
        if (curr.coords.speed > acc.maxSpeed) {
          acc.maxSpeed = curr.coords.speed;
        }
      }
      if (curr.coords.altitude) {
        if (curr.coords.altitude > acc.maxAltitude) {
          acc.maxAltitude = curr.coords.altitude;
        }
      }
      return acc;
    },
    { _maxSpeed: 0, _maxAltitude: 0 }
  );
  maxSpeed.value = Number(_maxSpeed);
  maxAltitude.value = Number(_maxAltitude);
};

const calculateAverageSpeed = () => {
  // 计算总行驶距离和总行驶时间
  let totalDistance = 0;
  let totalTime = 0;
  for (let i = 1; i < geoLocationData.length; i++) {
    const prevPoint = geoLocationData[i - 1];
    const currPoint = geoLocationData[i];
    const prevLnglat = new AMap.LngLat(
      prevPoint.coords.longitude,
      prevPoint.coords.latitude
    );
    const currLnglat = new AMap.LngLat(
      currPoint.coords.longitude,
      currPoint.coords.latitude
    );
    const distance = mapRef.value.getDistance(prevLnglat, currLnglat);
    const timeDiff = currPoint.timestamp - prevPoint.timestamp;
    totalDistance += distance;
    totalTime += timeDiff;
  }

  // 计算平均速度（单位：米/秒）
  const averageSpeed = totalDistance / totalTime;
  currentAverageSpeed.value = averageSpeed;
};
const saveHistory = () => {
  const distance = mapRef.value.getPolyLineLength();
  const history = {
    id: new Date().valueOf(),
    path: smoothedPath,
    maxSpeed: maxSpeed.value,
    maxAltitude: maxAltitude.value,
    distance: distance,
    time: elapsedTime.value,
  };
  positionStore.addHistoryTrack(history);
};

const onLongPressCallbackDirective = (e: PointerEvent) => {
  presentFinishAlert();
};

const modal = ref(null) as any;
const closeModal = () => {
  modal.value.$el.dismiss(null, "cancel");
};
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
      align-items: center;
    }
  }
}

ion-toolbar.dashboard-toolbar {
  --background: rgba(0, 0, 0, 0.3);
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
