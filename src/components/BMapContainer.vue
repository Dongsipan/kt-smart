<template>
  <div :id="container" class="bmap-container"></div>
</template>
<script lang="ts" setup>
import { ref, shallowRef } from "vue";
import { usePositionStore } from "@/store/usePositionStore";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { storeToRefs } from "pinia";
import LocationStartIcon from "@/assets/icon/location-start.png";
import LocationEndIcon from "@/assets/icon/location-end.png";
import LocationCurrent from "@/assets/icon/location-current.png";
import { isPlatform } from "@ionic/vue";

const startMarker = shallowRef();
const endMarker = shallowRef();
const polyline = shallowRef();
const { getCurrentPosition } = useGeoLocation();
const positionStore = usePositionStore();
const { currentPosition } = storeToRefs(positionStore);

const props = defineProps({
  container: {
    type: String,
    default: "track",
  },
});

const map = ref();

const initMap = async () => {
  map.value = new window.BMapGL.Map("track");
  const point = new window.BMapGL.Point(116.404, 39.915); // 创建点坐标
  map.value.setMinZoom(10);
  map.value.setMaxZoom(18);
  map.value.centerAndZoom(point, 17);
  await setMapToCenter();
  initRidingRoute();
};
const initRidingRoute = () => {
  let points = [];
  const path = [
    new BMapGL.Point(120.4477933, 31.1262937),
    new BMapGL.Point(120.4477783, 31.1263155),
    new BMapGL.Point(120.4479044, 31.1262954),
    new BMapGL.Point(120.4480818, 31.1262729),
  ];
  let totalTime = 0; //根据点的数组长度和速度，计算路程的长度
  let pastTime = 0; //点已经走的时间
  let pathIndex = 0;
  let pointIndex = 0;
  const riding = new BMapGL.RidingRoute(map.value);
  let marker;
  riding.search(path[pathIndex], path[pathIndex + 1]);
  riding.setSearchCompleteCallback(() => {
    points = riding.getResults().getPlan(0).getRoute(0).getPath(); //根据起点和终点，拿到路径上所有的点
    totalTime = points.length * 50; // 总时间
    const icon = new window.BMapGL.Icon(
      LocationCurrent,
      new window.BMapGL.Size(20, 20)
    );

    // 将 icon 传入 marker
    marker = new window.BMapGL.Marker(points[0], {
      icon: icon,
      offset: new window.BMapGL.Size(0, -10),
    });
    map.value.addOverlay(marker);
    play();
    pathIndex++;
  });

  function play() {
    const point = points[pointIndex];

    if (pointIndex > 0) {
      const line = new BMapGL.Polyline([points[pointIndex - 1], point], {
        strokeWeight: "8", //折线的宽度，以像素为单位
        strokeOpacity: 0.8, //折线的透明度，取值范围0 - 1
        strokeColor: "#18a45b", //折线颜色
      });
      map.value.addOverlay(line);
    }
    marker.setPosition(point);
    pointIndex++;
    if (pathIndex < path.length) {
      addPoints();
    }
    if (pointIndex < points.length) {
      play();
    } else {
      map.value.panTo(point);
    }
  }

  function addPoints() {
    riding.search(path[pathIndex], path[pathIndex + 1]); //起点和终点
    riding.setSearchCompleteCallback(function () {
      var pwe = riding.getResults().getPlan(0).getRoute(0).getPath(); //根据起点和终点，拿到路径上所有的点
      points = points.concat(pwe);
    });
  }
};
const initTrackAnimation = () => {
  map.value.centerAndZoom(new window.BMapGL.Point(116.297611, 40.047363), 17);
  var path = [];
  var pathRaw = [
    {
      lng: 116.302839,
      lat: 40.048219,
    },
    {
      lng: 116.308301,
      lat: 40.050566,
    },
    {
      lng: 116.305732,
      lat: 40.054957,
    },
    {
      lng: 116.304754,
      lat: 40.057953,
    },
    {
      lng: 116.306487,
      lat: 40.058312,
    },
    {
      lng: 116.307223,
      lat: 40.056379,
    },
  ];
  const point = new BMapGL.Point(116.297611, 40.047363);
  var pl = new BMapGL.Polyline([point]);
  const trackAni = new BMapGLLib.TrackAnimation(map.value, pl, {
    overallView: true,
    tilt: 30,
    duration: 20000,
    delay: 300,
  });
  let index = 1;
  let length = 6;
  const interval = setInterval(() => {
    if (index < length) {
      // point.push(new window.BMapGL.Point(path[index].lng, path[index].lat));
      const oldPath = pl.getPath();
      const path = [
        ...oldPath,
        new BMapGL.Point(pathRaw[index].lng, pathRaw[index].lat),
      ];
      index++;
      pl.setPath(path);
      // pauseAni();
      trackAni.setPolyline(pl);
      // continueAni();
    } else {
      clearInterval(interval);
      // trackAni.cancel();
    }
  }, 5000);

  setTimeout(() => {
    start();
  }, 3000);

  function start() {
    trackAni.start && trackAni.start();
  }
  function pauseAni() {
    trackAni.pause && trackAni.pause();
  }
  function continueAni() {
    trackAni.continue && trackAni.continue();
  }
};
const updateMapRotation = () => {};
const setMapToCenter = async () => {
  // await getCurrentPosition();
  if (!currentPosition.value.coords) return;
  const position = (await convertGpsToBMap(
    [
      currentPosition.value.coords.longitude,
      currentPosition.value.coords.latitude,
    ],
    isPlatform("ios") ? "gps" : "amap"
  )) as any;
  map.value.setCenter(position);
};
const convertGpsToBMap = (position: number[], type = "gps") => {
  return new Promise((resolve, reject) => {
    try {
      const convertor = new window.BMapGL.Convertor();
      const point = new window.BMapGL.Point(position[0], position[1]);
      convertor.translate(
        [point],
        type === "gps" ? window.COORDINATES_WGS84 : window.COORDINATES_GCJ02,
        window.COORDINATES_BD09,
        (result: any) => {
          if (result.status === 0) {
            const lngLat = result.points[0];
            resolve(lngLat);
          }
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
const addStartPositionMarker = (lng: number, lat: number) => {
  const lnglat = new window.BMapGL.Point(lng, lat);
  if (!startMarker.value) {
    setMarker(lnglat, LocationStartIcon, startMarker!);
  }
};
const addEndPositionMarker = (lng: number, lat: number) => {
  const lnglat = new window.BMapGL.Point(lng, lat);
  if (!endMarker.value) {
    setMarker(lnglat, LocationEndIcon, endMarker);
  }
};
const setMarker = (position: any, image: any, marker: any) => {
  // 创建一个 Icon
  const icon = new window.BMapGL.Icon(image, new window.BMapGL.Size(20, 20));

  // 将 icon 传入 marker
  marker.value = new window.BMapGL.Marker(position, {
    icon: icon,
    offset: new window.BMapGL.Size(0, -10),
  });
  map.value.addOverlay(marker.value);
};

const initPolyline = () => {
  const sy = new window.BMapGL.Symbol(
    window.BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW,
    {
      scale: 0.6, //图标缩放大小
      strokeColor: "#fff", //设置矢量图标的线填充颜色
      strokeWeight: "2", //设置线宽
    }
  );
  const icons = new window.BMapGL.IconSequence(sy, "10", "30");
  // 绘制轨迹
  polyline.value = new window.BMapGL.Polyline([], {
    enableEditing: false, //是否启用线编辑，默认为false
    enableClicking: true, //是否响应点击事件，默认为true
    icons: [icons],
    strokeWeight: "8", //折线的宽度，以像素为单位
    strokeOpacity: 0.8, //折线的透明度，取值范围0 - 1
    strokeColor: "#18a45b", //折线颜色
  });
  map.value?.addOverlay(polyline.value);
};

let lastPolylinePoint: any;
const setPolylineByPath = (path: any) => {
  if (path.length < 2) return;
  const currentPoint = path[path.length - 1];
  if (
    lastPolylinePoint &&
    lastPolylinePoint.lat === currentPoint.lat &&
    lastPolylinePoint.lng === currentPoint.lng
  ) {
    return;
  }
  lastPolylinePoint = currentPoint;
  polyline.value!.setPath(path);
  map.value.panTo(lastPolylinePoint);
};
const setToCenter = (point: any) => {
  map.value!.setCenter(point);
};
const clearPathAndMarker = () => {
  map.value.clearOverlays();
  startMarker.value = undefined;
  endMarker.value = undefined;
};

defineExpose({
  initMap,
  setMapToCenter,
  addStartPositionMarker,
  addEndPositionMarker,
  initPolyline,
  setPolylineByPath,
  setToCenter,
  clearPathAndMarker,
  convertGpsToBMap,
});
</script>
<style lang="scss" scoped>
.bmap-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
