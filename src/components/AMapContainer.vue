<template>
  <div id="container"></div>
</template>

<script lang="ts" setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, ref, shallowRef } from "vue";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { Position } from "@capacitor/geolocation/dist/esm/definitions";
import { Capacitor } from "@capacitor/core";
import { useToast } from "@/hooks/useToast";
import { usePositionStore } from "@/store/usePositionStore";
import { storeToRefs } from "pinia";
import LocationStartIcon from "@/assets/icon/location-start.png";
type LngLat = {
  lng: number;
  lat: number;
};
const map = shallowRef<any>(null);
const { getCurrentPosition } = useGeoLocation();
const positionStore = usePositionStore();
const { currentPosition } = storeToRefs(positionStore);
const isNative = Capacitor.isNativePlatform();
let AMapInstance: any;

const { presentToast } = useToast();
const initMap = async () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      AMapInstance = AMap;
      map.value = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 16, //初始化地图级别
        mapStyle: "amap://styles/dark", //设置地图的显示样式
        center: currentPosition.value.coords
          ? [
              currentPosition.value.coords.longitude,
              currentPosition.value.coords.latitude,
            ]
          : undefined, //初始化地图中心点位置
      });
      map.value.on("complete", () => {
        if (currentPosition.value.coords) {
          addCurrentPositionMarker([
            currentPosition.value.coords.longitude,
            currentPosition.value.coords.latitude,
          ]);
        }
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

const addCurrentPositionMarker = (position: number[]) => {
  // 创建一个 Icon
  const startIcon = new AMapInstance.Icon({
    // 图标尺寸
    size: new AMapInstance.Size(20, 20),
    // 图标的取图地址
    image: LocationStartIcon,
    // 图标所用图片大小
    imageSize: new AMapInstance.Size(20, 20),
  });

  // 将 icon 传入 marker
  const startMarker = new AMapInstance.Marker({
    position: new AMapInstance.LngLat(position[0], position[1]),
    icon: startIcon,
    offset: new AMapInstance.Pixel(-20, -20),
  });
  map.value.add([startMarker]);
};
const initWebMap = () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      AMapInstance = AMap;
      map.value = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 17, //初始化地图级别
        mapStyle: "amap://styles/dark", //设置地图的显示样式
        center: [120.452543, 31.123945], //初始化地图中心点位置
      });

      map.value.on("complete", () => {
        addCurrentPositionMarker([120.452543, 31.123945]);
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

const setMapToCenter = async () => {
  await getCurrentPosition();
  await presentToast(JSON.stringify(currentPosition.value.coords));
  if (!currentPosition.value.coords) return;
  convertFrom(
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude,
    ({ lat, lng }: LngLat) => {
      currentPosition.value.coords.longitude = lng;
      currentPosition.value.coords.latitude = lat;
    }
  );
  map.value.setCenter([
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude,
  ]);
};
const convertFrom = (lng: number, lat: number, callback: Function) => {
  const location = [lng, lat];
  AMapInstance.convertFrom(location, "gps", (status: any, result: any) => {
    if (result.info === "ok") {
      const lngLats = result.locations; // Array.<LngLat>
      const { lng, lat }: LngLat = lngLats[0];
      callback({
        lng,
        lat,
      });
    }
  });
};

defineExpose({
  setMapToCenter,
});
onMounted(() => {
  if (isNative) {
    initMap();
  } else {
    initWebMap();
  }
});
</script>

<style lang="scss" scoped>
#container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
