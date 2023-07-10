<template>
  <div :id="container" class="amap-container"></div>
</template>

<script lang="ts" setup>
import { shallowRef } from "vue";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { Capacitor } from "@capacitor/core";
import { useToast } from "@/hooks/useToast";
import { usePositionStore } from "@/store/usePositionStore";
import { storeToRefs } from "pinia";
import LocationStartIcon from "@/assets/icon/location-start.png";
import LocationEndIcon from "@/assets/icon/location-end.png";
import BicycleIcon from "@/assets/icon/bicycle.svg";
import { useAMap } from "@/hooks/useAMap";

type LngLat = {
  lng: number;
  lat: number;
};
const map = shallowRef<AMap.Map>();
const polyline = shallowRef<AMap.Polyline>();
const passedPolyline = shallowRef<AMap.Polyline>();
const { getCurrentPosition } = useGeoLocation();
const positionStore = usePositionStore();
const { currentPosition } = storeToRefs(positionStore);
const isNative = Capacitor.isNativePlatform();
const startMarker = shallowRef<AMap.Marker>();
const endMarker = shallowRef<AMap.Marker>();
const rideMarker = shallowRef<AMap.Marker>();

const { presentToast } = useToast();
const { loadAMap } = useAMap();

const props = defineProps({
  container: {
    type: String,
    default: "track",
  },
});
const initMap = async () => {
  if (!window.AMap) {
    await loadAMap();
  }
  if (map.value) {
    await setMapToCenter();
  } else {
    map.value = new AMap.Map(props.container.toString(), {
      //设置地图容器id
      viewMode: "2D", //是否为3D地图模式
      zoom: 16, //初始化地图级别
      zooms: [12, 20],
    });
    map.value!.on("complete", () => {
      setMapToCenter();
      initPolyline();
    });
  }
};
const initTrack = async (path: [number, number][] | AMap.LngLat[]) => {
  map.value = new AMap.Map(props.container.toString(), {
    //设置地图容器id
    viewMode: "2D", //是否为3D地图模式
    zoom: 17, //初始化地图级别
    zooms: [12, 20],
  });
  map.value?.on("complete", () => {
    initPolyline();
    const startPoint = path[0];
    const endPoint = path[path.length - 1];
    if (startPoint instanceof AMap.LngLat) {
      addStartPositionMarker(startPoint.lng, startPoint.lat);
    } else {
      addStartPositionMarker(startPoint[0], startPoint[1]);
    }
    if (endPoint instanceof AMap.LngLat) {
      addEndPositionMarker(endPoint.lng, endPoint.lat);
    } else {
      addEndPositionMarker(endPoint[0], endPoint[1]);
    }
    // addRideMarker(path[0][0], path[0][1]);
    setPolylineByPath(path);
    // initPassedPolyline();

    map.value?.setFitView();
    // rideMarker.value?.on("moving" as any, (e) => {
    //   passedPolyline.value?.setPath(e.passedPath);
    //   map.value?.setCenter(e.target.getPosition(), true);
    // });
    // rideMarker.value?.moveAlong(path, {
    //   // 每一段的时长
    //   duration: 500, //可根据实际采集时间间隔设置
    //   // JSAPI2.0 是否延道路自动设置角度在 moveAlong 里设置
    //   autoRotation: true,
    // });
  });
};

const addStartPositionMarker = (lng: number, lat: number) => {
  const lnglat = new window.AMap.LngLat(lng, lat);
  if (!startMarker.value) {
    // map.value?.remove(startMarker.value as any);
    setMarker(lnglat, LocationStartIcon, startMarker!);
  }
};
const addEndPositionMarker = (lng: number, lat: number) => {
  const lnglat = new window.AMap.LngLat(lng, lat);
  if (!endMarker.value) {
    // map.value?.remove(endMarker.value as any);
    setMarker(lnglat, LocationEndIcon, endMarker);
  }
  // setMarker(lnglat, LocationEndIcon, endMarker);
};
const addRideMarker = (lng: number, lat: number) => {
  const lnglat = new window.AMap.LngLat(lng, lat);
  if (!rideMarker.value) {
    setMarker(lnglat, BicycleIcon, rideMarker);
  }
};
const setMarker = (position: AMap.LngLat, image: any, marker: any) => {
  // 创建一个 Icon
  const icon = new window.AMap.Icon({
    // 图标尺寸
    size: new window.AMap.Size(20, 20),
    // 图标的取图地址
    image: image,
    // 图标所用图片大小
    imageSize: new window.AMap.Size(20, 20),
  });

  // 将 icon 传入 marker
  marker.value = new window.AMap.Marker({
    position: position,
    icon: icon,
    offset: new window.AMap.Pixel(-10, -20),
  });
  map.value!.add([marker.value]);
};

const initPolyline = () => {
  // 绘制轨迹
  polyline.value = new window.AMap.Polyline({
    // path: path, // 初始为空数组
    lineJoin: "round",
    lineCap: "round",
    showDir: true,
    strokeColor: "#28F", //线颜色
    strokeOpacity: 0.8, // 线条透明度
    strokeWeight: 6, // 线条宽度
  });
  map.value?.add(polyline.value);
};

const initPassedPolyline = () => {
  passedPolyline.value = new AMap.Polyline({
    strokeColor: "#AF5", //线颜色
    strokeWeight: 6, //线宽
  });
  map.value?.add(passedPolyline.value);
};

const getPolyLineLength = () => {
  return polyline.value!.getLength();
};

// 将新经纬度添加到轨迹中
const addPointToPath = (longitude: number, latitude: number) => {
  // 将坐标转换为AMap.LngLat对象
  const point = new window.AMap.LngLat(longitude, latitude) as AMap.LngLat;
  const path = polyline.value!.getPath() as AMap.LngLat[] | undefined;
  if (path !== undefined) {
    path.push(point);
    polyline.value!.setPath(path);
  } else {
    polyline.value!.setPath([point]);
  }
  // map.value!.setCenter(point);
  map.value?.panTo(point);
};
let lastPolylinePoint: AMap.LngLat;
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
  // map.value!.setCenter(currentPoint);
  map.value?.panTo(lastPolylinePoint);
};
const setToCenter = (point: AMap.LngLat) => {
  map.value!.setCenter(point);
};
const clearPathAndMarker = () => {
  // polyline.value?.destroy();
  // polyline.value?.setPath([]);
  // startMarker.value?.remove();
  // endMarker.value?.remove();
  map.value?.clearMap();
  startMarker.value = undefined;
  endMarker.value = undefined;
};

const getDistance = (point1: AMap.LngLat, point2: AMap.LngLat) => {
  return window.AMap.GeometryUtil.distance(point1, point2);
};

const setMapToCenter = async () => {
  await getCurrentPosition();
  if (!currentPosition.value.coords) return;
  const position = (await convertGpsToAMap([
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude,
  ])) as any;
  map.value!.setCenter(position);
};

const convertGpsToAMap = (location: number[]) => {
  return new Promise((resolve, reject) => {
    try {
      window.AMap.convertFrom(location, "gps", (status: any, result: any) => {
        if (result.info === "ok") {
          const lngLat = result.locations[0];
          resolve(lngLat);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

defineExpose({
  setMapToCenter,
  addPointToPath,
  convertGpsToAMap,
  initPolyline,
  setPolylineByPath,
  addStartPositionMarker,
  addEndPositionMarker,
  getPolyLineLength,
  getDistance,
  initMap,
  initTrack,
  clearPathAndMarker,
  setToCenter,
});
</script>

<style lang="scss">
.amap-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
