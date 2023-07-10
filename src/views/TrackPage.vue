<template>
  <ion-page class="track-page">
    <ion-header>
      <ion-toolbar>
        <ion-title>Track</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="watching" @click="setMapToCenter">
            <ion-icon
              v-if="isPlatform('ios')"
              :class="{ 'locate-icon--locating--ios': locating }"
              :icon="locateOutline"
            ></ion-icon>
            <ion-icon
              v-else
              :class="{ 'locate-icon--locating--android': locating }"
              :icon="locateOutline"
            ></ion-icon>
          </ion-button>
          <ion-button :disabled="watching" @click="toHistoriesPage">
            <ion-icon :icon="footstepsOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content
      :fullscreen="true"
      class="ion-no-padding"
      style="width: 100vw; height: 100vh"
    >
      <ion-fab
        slot="fixed"
        :edge="true"
        horizontal="end"
        style="display: none"
        vertical="bottom"
      >
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
              <div>Altitude</div>
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
                <div>Distance</div>
                <div>{{ distanceToKm || "--" }}</div>
              </div>
            </div>
            <div class="dashboard-main__data dashboard-main__data--outer">
              <div>Speed</div>
              <div>{{ speedToKm || "--" }}</div>
            </div>
          </div>
          <div class="dashboard-info ion-margin-top ion-margin-horizontal">
            <div class="dashboard-info__data">
              <div>Time</div>
              <div>{{ formatTime || "--" }}</div>
            </div>
            <div class="dashboard-info__data">
              <div>Extreme speed</div>
              <div>{{ maxSpeedToKm || "--" }}</div>
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
  isPlatform,
  onIonViewDidEnter,
  onIonViewWillEnter,
} from "@ionic/vue";
import { flashOutline, footstepsOutline, locateOutline } from "ionicons/icons";
import AMapContainer from "@/components/AMapContainer.vue";
import { computed, ref } from "vue";
import { vOnLongPress } from "@vueuse/components";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useToast } from "@/hooks/useToast";
import { PathSmoothTool } from "@/services/PathSmoothTool";
import { usePositionStore } from "@/store/usePositionStore";
import { useTimer } from "@/hooks/useTimer";
import { Position } from "@capacitor/geolocation";
import { useRouter } from "vue-router";
import { Capacitor } from "@capacitor/core";
import { storeToRefs } from "pinia";
import { useThrottleFn } from "@vueuse/core";
import GPSKalmanFilter from "@/services/GPSKalmanFilter";

const mapRef = ref(null) as any;

const positionStore = usePositionStore();
const { locating, watching } = storeToRefs(positionStore);
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
const kalmanFilter = new GPSKalmanFilter();
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
const { start, stop, reset, formatTime } = useTimer();

const speedToKm = computed(() => {
  return currentSpeed.value && currentSpeed.value > 0
    ? ((currentSpeed.value * 3600) / 1000).toFixed(1)
    : 0;
});

const maxSpeedToKm = computed(() => {
  return maxSpeed.value && maxSpeed.value > 0
    ? (maxSpeed.value * 3.6).toFixed(1)
    : 0;
});

const averageSpeedToKm = computed(() => {
  return currentAverageSpeed.value && currentAverageSpeed.value > 0
    ? (currentAverageSpeed.value * 3.6).toFixed(1)
    : 0;
});

const distanceToKm = computed(() => {
  return currentDistance.value ? (currentDistance.value / 1000).toFixed(1) : 0;
});
const altitudeToFixed = computed(() => {
  return currentAltitude.value ? currentAltitude.value?.toFixed(1) : 0;
});
const isNative = Capacitor.isNativePlatform();

onIonViewDidEnter(() => {
  mapRef.value.initMap();
});

const initRide = () => {
  path.length = 0;
  geoLocationData.length = 0;
  currentAltitude.value = 0;
  currentAverageSpeed.value = 0;
  currentDistance.value = 0;
  mapRef.value.clearPathAndMarker();
  mapRef.value.initPolyline();
  isRiding.value = true;
  startPosition = undefined;
  reset();
  start();
};
let startPosition;
const startRide = () => {
  if (locating.value) {
    presentToast("Positioning in progress, please wait");
    return;
  }
  initRide();
  // smoothedPath.length = 0;
  if (isNative) {
    watchPosition();
  } else {
    const mock = [
      {
        coords: {
          latitude: 31.1262937,
          longitude: 120.4477933,
          accuracy: 12.413000106811523,
          altitude: 12.85125732421875,
          altitudeAccuracy: 11.879189491271973,
          speed: 4.633049488067627,
          heading: 311.044677734375,
        },
        timestamp: 1687532006145,
      },
      {
        coords: {
          latitude: 31.1263135,
          longitude: 120.4477688,
          accuracy: 8.928999900817871,
          altitude: 15.0125732421875,
          altitudeAccuracy: 9.62825870513916,
          speed: 0.27304595708847046,
          heading: 12.490877151489258,
        },
        timestamp: 1687532010742,
      },
      {
        coords: {
          latitude: 31.1263155,
          longitude: 120.4477783,
          accuracy: 14.178999900817871,
          altitude: 15.0125732421875,
          altitudeAccuracy: 9.62825870513916,
          speed: 0.22676877677440643,
          heading: 41.79863357543945,
        },
        timestamp: 1687532015263,
      },
      {
        coords: {
          latitude: 31.1263037,
          longitude: 120.4478327,
          accuracy: 16.02199935913086,
          altitude: 20.47149658203125,
          altitudeAccuracy: 14.575793266296387,
          speed: 0.49227774143218994,
          heading: 93.03411102294922,
        },
        timestamp: 1687532019899,
      },
      {
        coords: {
          latitude: 31.1262954,
          longitude: 120.4479044,
          accuracy: 18.73900032043457,
          altitude: 20.47149658203125,
          altitudeAccuracy: 14.575793266296387,
          speed: 0.8445966839790344,
          heading: 93.26995849609375,
        },
        timestamp: 1687532024883,
      },
      {
        coords: {
          latitude: 31.1262855,
          longitude: 120.4479801,
          accuracy: 21.049999237060547,
          altitude: 19.33721923828125,
          altitudeAccuracy: 18.13079833984375,
          speed: 1.016179084777832,
          heading: 95.4952621459961,
        },
        timestamp: 1687532029403,
      },
      {
        coords: {
          latitude: 31.1262729,
          longitude: 120.4480818,
          accuracy: 20.356000900268555,
          altitude: 19.33721923828125,
          altitudeAccuracy: 18.13079833984375,
          speed: 1.1502346992492676,
          heading: 95.50843811035156,
        },
        timestamp: 1687532034967,
      },
      {
        coords: {
          latitude: 31.1262617,
          longitude: 120.4481826,
          accuracy: 21.375999450683594,
          altitude: 21.07763671875,
          altitudeAccuracy: 13.175178527832031,
          speed: 1.2502585649490356,
          heading: 92.52903747558594,
        },
        timestamp: 1687532039603,
      },
      {
        coords: {
          latitude: 31.1262504,
          longitude: 120.4482721,
          accuracy: 14.932999610900879,
          altitude: 21.07763671875,
          altitudeAccuracy: 13.175178527832031,
          speed: 1.3178050518035889,
          heading: 93.61415100097656,
        },
        timestamp: 1687532044239,
      },
      {
        coords: {
          latitude: 31.1262446,
          longitude: 120.4483567,
          accuracy: 15.11400032043457,
          altitude: 20.9114990234375,
          altitudeAccuracy: 11.816811561584473,
          speed: 1.3209741115570068,
          heading: 97.40968322753906,
        },
        timestamp: 1687532048876,
      },
      {
        coords: {
          latitude: 31.1262333,
          longitude: 120.4484153,
          accuracy: 10.545999526977539,
          altitude: 20.9114990234375,
          altitudeAccuracy: 11.816811561584473,
          speed: 1.2798484563827515,
          heading: 99.10550689697266,
        },
        timestamp: 1687532053859,
      },
      {
        coords: {
          latitude: 31.1262296,
          longitude: 120.4484749,
          accuracy: 13.585000038146973,
          altitude: 17.26812744140625,
          altitudeAccuracy: 19.55817222595215,
          speed: 1.2590947151184082,
          heading: 95.78394317626953,
        },
        timestamp: 1687532058489,
      },
      {
        coords: {
          latitude: 31.1262346,
          longitude: 120.4485351,
          accuracy: 14.946000099182129,
          altitude: 17.26812744140625,
          altitudeAccuracy: 19.55817222595215,
          speed: 1.2882599830627441,
          heading: 90.07588195800781,
        },
        timestamp: 1687532063016,
      },
      {
        coords: {
          latitude: 31.1262382,
          longitude: 120.4485909,
          accuracy: 18.0049991607666,
          altitude: 17.26812744140625,
          altitudeAccuracy: 19.55817222595215,
          speed: 1.3094755411148071,
          heading: 87.02710723876953,
        },
        timestamp: 1687532067536,
      },
      {
        coords: {
          latitude: 31.1262473,
          longitude: 120.4486682,
          accuracy: 15.40999984741211,
          altitude: 20.22357177734375,
          altitudeAccuracy: 15.856236457824707,
          speed: 1.3357502222061157,
          heading: 85.37618255615234,
        },
        timestamp: 1687532072520,
      },
      {
        coords: {
          latitude: 31.1262514,
          longitude: 120.4487423,
          accuracy: 18.018999099731445,
          altitude: 20.22357177734375,
          altitudeAccuracy: 15.856236457824707,
          speed: 1.3493794202804565,
          heading: 88.18750762939453,
        },
        timestamp: 1687532077156,
      },
      {
        coords: {
          latitude: 31.1262552,
          longitude: 120.4488067,
          accuracy: 13.79800033569336,
          altitude: 24.76922607421875,
          altitudeAccuracy: 8.238835334777832,
          speed: 1.3451457023620605,
          heading: 88.24646759033203,
        },
        timestamp: 1687532081676,
      },
      {
        coords: {
          latitude: 31.1262583,
          longitude: 120.4489033,
          accuracy: 13.625,
          altitude: 24.76922607421875,
          altitudeAccuracy: 8.238835334777832,
          speed: 1.3522353172302246,
          heading: 87.04612731933594,
        },
        timestamp: 1687532087239,
      },
      {
        coords: {
          latitude: 31.1262538,
          longitude: 120.4489539,
          accuracy: 12.024999618530273,
          altitude: 19.67730712890625,
          altitudeAccuracy: 5.672508239746094,
          speed: 1.2910549640655518,
          heading: 92.6560287475586,
        },
        timestamp: 1687532091875,
      },
      {
        coords: {
          latitude: 31.1262424,
          longitude: 120.4490301,
          accuracy: 13.446000099182129,
          altitude: 19.67730712890625,
          altitudeAccuracy: 5.672508239746094,
          speed: 1.3053648471832275,
          heading: 94.6934585571289,
        },
        timestamp: 1687532096511,
      },
      {
        coords: {
          latitude: 31.1262759,
          longitude: 120.4490451,
          accuracy: 14.715999603271484,
          altitude: 24.3831787109375,
          altitudeAccuracy: 12.0009126663208,
          speed: 0.41696080565452576,
          heading: 72.29947662353516,
        },
        timestamp: 1687532101495,
      },
      {
        coords: {
          latitude: 31.1262897,
          longitude: 120.4489854,
          accuracy: 12.753999710083008,
          altitude: 24.3831787109375,
          altitudeAccuracy: 12.0009126663208,
          speed: 0.08929099887609482,
          heading: 0,
        },
        timestamp: 1687532106105,
      },
      {
        coords: {
          latitude: 31.1262722,
          longitude: 120.4488758,
          accuracy: 12.470000267028809,
          altitude: 34.1373291015625,
          altitudeAccuracy: 9.753472328186035,
          speed: 0.3951999843120575,
          heading: 248.19252014160156,
        },
        timestamp: 1687532110767,
      },
      {
        coords: {
          latitude: 31.1262743,
          longitude: 120.4487781,
          accuracy: 14.446000099182129,
          altitude: 34.1373291015625,
          altitudeAccuracy: 9.753472328186035,
          speed: 0.7563164830207825,
          heading: 274.61285400390625,
        },
        timestamp: 1687532116330,
      },
      {
        coords: {
          latitude: 31.1262762,
          longitude: 120.4486777,
          accuracy: 15.963000297546387,
          altitude: 31.56048583984375,
          altitudeAccuracy: 11.818158149719238,
          speed: 1.0699423551559448,
          heading: 276.3619079589844,
        },
        timestamp: 1687532120845,
      },
      {
        coords: {
          latitude: 31.1262856,
          longitude: 120.4485907,
          accuracy: 17.78700065612793,
          altitude: 31.56048583984375,
          altitudeAccuracy: 11.818158149719238,
          speed: 1.2695256471633911,
          heading: 277.9208679199219,
        },
        timestamp: 1687532125415,
      },
      {
        coords: {
          latitude: 31.1262585,
          longitude: 120.4484863,
          accuracy: 15.982999801635742,
          altitude: 29.4058837890625,
          altitudeAccuracy: 8.683859825134277,
          speed: 1.4041341543197632,
          heading: 276.1004333496094,
        },
        timestamp: 1687532130415,
      },
      {
        coords: {
          latitude: 31.1262522,
          longitude: 120.4484116,
          accuracy: 14.906000137329102,
          altitude: 29.4058837890625,
          altitudeAccuracy: 8.683859825134277,
          speed: 1.4003323316574097,
          heading: 271.9714050292969,
        },
        timestamp: 1687532134990,
      },
    ];
    let mockLength = mock.length;
    let index = 0;
    mockInterval = setInterval(async () => {
      if (index < mockLength) {
        const data = mock[index];
        index++;
        await throttledComputedRideData(data);
      }
    }, 2000);
  }
};
let mockInterval: any;
let isFirstPoint = true;
const watchPosition = () => {
  watchCurrentPosition(async (geolocationPosition) => {
    if (geolocationPosition === null) return;
    await throttledComputedRideData(geolocationPosition);
  });
};
const throttledComputedRideData = useThrottleFn(
  (geolocationPosition: Position) => {
    computedRideData(geolocationPosition);
  },
  5000
);
const computedRideData = async (geolocationPosition: Position) => {
  if (isFirstPoint) {
    isFirstPoint = false;
    return;
  }
  const { longitude, latitude, altitude, speed, accuracy } =
    geolocationPosition!.coords;
  currentSpeed.value = speed || 0;
  currentAltitude.value = altitude || 0;
  currentLongitude.value = longitude;
  currentLatitude.value = latitude;
  currentAccuracy.value = accuracy;
  geoLocationData.push(geolocationPosition); // 存储原始数据
  console.log(geoLocationData);
  window.localStorage.geoLocationData = JSON.stringify(geoLocationData);
  const filterPosition = kalmanFilter.filter(
    latitude,
    longitude,
    accuracy,
    geolocationPosition.timestamp
  );
  const positions = await mapRef.value.convertGpsToAMap(filterPosition); // 转化成高德坐标
  path.push(positions);
  // smoothedPath = pathSmoothTool.pathOptimize(path); // 优化轨迹
  startPosition = path[0];
  // if (smoothedPath) {
  //   mapRef.value.setToCenter(startPosition);
  //   mapRef.value.addStartPositionMarker(startPosition.lng, startPosition.lat);
  // }
  mapRef.value.setToCenter(startPosition);
  mapRef.value.addStartPositionMarker(startPosition.lng, startPosition.lat);
  mapRef.value.setPolylineByPath(path); // 绘制轨迹
  if (path.length >= 2) {
    getMaxData(); // 从GPS数据中计算最大速度、最高海拔
    computedCurrentDistance(); // 计算行驶里程
    computedAverageSpeed(); // 计算平均速度
  }
};

/*
 * {"timestamp":1686647786114,"coords":{"altitude":32.022853851318359,"heading":-1,"latitude":31.298159747161719,"altitudeAccuracy":10.407867431640625,"longitude":120.54356498135141,"accuracy":46,"speed":-1}}
 * */

const stopRide = () => {
  clearInterval(mockInterval);
  isStopRiding.value = true;
  stop();
  clearWatch();
};
const restoreRide = () => {
  isStopRiding.value = false;
  start();
  watchPosition();
};
const { addHistoryTrack } = usePositionStore();
const finishRide = () => {
  clearInterval(mockInterval);
  isRiding.value = false;
  isStopRiding.value = false;
  stop();
  clearWatch();
  if (path.length < 5) {
    presentNotSaveAlert();
  } else {
    const lastPosition = path[path.length - 1];
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
        if (curr.coords.speed > acc._maxSpeed) {
          acc._maxSpeed = curr.coords.speed;
        }
      }
      if (curr.coords.altitude) {
        if (curr.coords.altitude > acc._maxAltitude) {
          acc._maxAltitude = curr.coords.altitude;
        }
      }
      return acc;
    },
    { _maxSpeed: 0, _maxAltitude: 0 }
  );
  maxSpeed.value = Number(_maxSpeed);
  maxAltitude.value = Number(_maxAltitude);
};

const computedCurrentDistance = () => {
  // 计算总行驶距离和总行驶时间
  let totalDistance = 0;
  let totalTime = 0;
  for (let i = 1; i < geoLocationData.length; i++) {
    const prevPoint = geoLocationData[i - 1];
    const currPoint = geoLocationData[i];
    const distance = calculateDistance(prevPoint, currPoint); // mapRef.value.getDistance(prevLnglat, currLnglat);
    const timeDiff = currPoint.timestamp - prevPoint.timestamp;
    totalDistance += distance;
    totalTime += timeDiff;
  }
  currentDistance.value = totalDistance;
};
const computedAverageSpeed = () => {
  let totalSpeed = 0;
  let count = 0;

  for (const data of geoLocationData) {
    if (data.coords.speed !== null) {
      totalSpeed += data.coords.speed;
      count++;
    }
  }

  currentAverageSpeed.value = count > 0 ? totalSpeed / count : 0;
};
const calculateDistance = (prevPoint: Position, currPoint: Position) => {
  const R = 6371e3; // earth radius in meters
  const φ1 = (prevPoint.coords.latitude * Math.PI) / 180; // convert to radians
  const φ2 = (currPoint.coords.latitude * Math.PI) / 180;
  const Δφ =
    ((currPoint.coords.latitude - prevPoint.coords.latitude) * Math.PI) / 180;
  const Δλ =
    ((currPoint.coords.longitude - prevPoint.coords.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

const saveHistory = () => {
  const history = {
    id: new Date().valueOf(),
    path: path,
    maxSpeed: maxSpeedToKm.value,
    maxAltitude: altitudeToFixed.value,
    averageSpeed: averageSpeedToKm.value,
    distance: distanceToKm.value.toString(),
    time: formatTime.value,
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
</script>
<style lang="scss">
@keyframes ios-locating {
  from {
    color: var(--ion-toolbar-color, var(--color));
  }
  to {
    color: #fff;
  }
}

@keyframes android-locating {
  from {
    color: var(--ion-toolbar-color, var(--color));
  }
  to {
    color: #ef4c28;
  }
}

.track-page {
  .locate-icon--locating--ios {
    animation: ios-locating 0.8s infinite alternate;
  }

  .locate-icon--locating--android {
    animation: android-locating 0.8s infinite alternate;
  }

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
          flex: 1;
        }

        div:last-child {
          font-size: 2rem;
          font-weight: bold;
          //text-align: center;
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
        //align-items: center;
        flex: 1;

        div:last-child {
          width: 100%;
          font-size: 1.3rem;
          font-weight: bold;
          //text-align: center;
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
<!--如何计算骑行消耗的热量（卡路里）？-->
<!--骑行消耗的热量一般按照平均功率计算，这个公式是目前公认最准确的功率骑行热量消耗公式，绝大多数的码表计算热量消耗的方法便是依照此公式而来，职业车手一般也会以此公式计算能量消耗从而计划食物补给。-->
<!--公式为：消耗热量（kcal）=平均功率（w）*1.1（校正系数）*3.6（换算系数）*运动时间（h）。-->
<!--假如以200w的平均功率连续骑行1h，所消耗的热量约为200*3.6*1.1*1=792kcal，-->
<!--以150w的平均功率连续骑行1h消耗的热量约为594kcal，-->
<!--以100w的平均功率连续骑行1h消耗的热量约为396kcal。-->
<!--也就是说，比较“卖力”骑行一小时大约会消耗800kcal的热量，相当于一顿正餐。-->
<!--正常骑行一小时大约会消耗600kcal的热量，大约相当于一个汉堡。-->
<!--而“休闲”骑行一小时消耗的热量约为400kcal，大约相当于一大份薯条的热量。-->
