<template>
  <div id="container"></div>
</template>

<script lang="ts" setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, ref, shallowRef } from "vue";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { Position } from "@capacitor/geolocation/dist/esm/definitions";
import { Capacitor } from "@capacitor/core";
type LngLat = {
  lng: number;
  lat: number;
};
const map = shallowRef<any>(null);
const { getCurrentPosition } = useGeoLocation();
const coords = ref<Position>();
const isNative = Capacitor.isNativePlatform();
let AMapInstance: any;
const initMap = async () => {
  coords.value = await getCurrentPosition();
  if (!coords.value?.coords) return;
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      AMapInstance = AMap;
      convertFrom(
        coords.value!.coords.longitude,
        coords.value!.coords.latitude,
        ({ lat, lng }: LngLat) => {
          coords.value!.coords.longitude = lng;
          coords.value!.coords.latitude = lat;
        }
      );
      map.value = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 14, //初始化地图级别
        mapStyle: "amap://styles/dark", //设置地图的显示样式
        center: [coords.value!.coords.longitude, coords.value!.coords.latitude], //初始化地图中心点位置
      });
    })
    .catch((e) => {
      console.log(e);
    });
};
const initWebMap = () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      map.value = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 15, //初始化地图级别
        mapStyle: "amap://styles/dark", //设置地图的显示样式
        center: [120.452543, 31.123945], //初始化地图中心点位置
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

const setMapToCenter = async () => {
  coords.value = await getCurrentPosition();
  if (!coords.value?.coords) return;
  convertFrom(
    coords.value!.coords.longitude,
    coords.value!.coords.latitude,
    ({ lat, lng }: LngLat) => {
      coords.value!.coords.longitude = lng;
      coords.value!.coords.latitude = lat;
    }
  );
  map.value.setCenter([
    coords.value!.coords.longitude,
    coords.value!.coords.latitude,
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
