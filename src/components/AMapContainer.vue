<template>
  <div id="container"></div>
</template>

<script lang="ts" setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, shallowRef } from "vue";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { Capacitor } from "@capacitor/core";
import { useToast } from "@/hooks/useToast";
import { usePositionStore } from "@/store/usePositionStore";
import { storeToRefs } from "pinia";
import LocationStartIcon from "@/assets/icon/location-start.png";
import LocationEndIcon from "@/assets/icon/location-end.png";

type LngLat = {
  lng: number;
  lat: number;
};
const map = shallowRef<AMap.Map>();
const polyline = shallowRef<AMap.Polyline>();
const { getCurrentPosition } = useGeoLocation();
const positionStore = usePositionStore();
const { currentPosition } = storeToRefs(positionStore);
const isNative = Capacitor.isNativePlatform();
const startMarker = shallowRef<AMap.Marker>();
const endMarker = shallowRef<AMap.Marker>();

const { presentToast } = useToast();
const initMap = async () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      window.AMap = AMap;
      map.value = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 16, //初始化地图级别
        mapStyle: "amap://styles/dark", //设置地图的显示样式
      });
      map.value!.on("complete", () => {
        if (currentPosition.value.coords) {
          addStartPositionMarker(
            currentPosition.value.coords.longitude,
            currentPosition.value.coords.latitude
          );
        } else {
          setMapToCenter();
        }
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

const addStartPositionMarker = (lng: number, lat: number) => {
  const lnglat = new window.AMap.LngLat(lng, lat);
  setMarker(lnglat, LocationStartIcon, startMarker.value!);
};
const addEndPositionMarker = (lng: number, lat: number) => {
  const lnglat = new window.AMap.LngLat(lng, lat);
  setMarker(lnglat, LocationEndIcon, endMarker.value!);
};
const setMarker = (position: AMap.LngLat, image: any, marker: AMap.Marker) => {
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
  marker = new window.AMap.Marker({
    position: position,
    icon: icon,
    offset: new window.AMap.Pixel(-20, -20),
  });
  map.value!.add([marker]);
};
const initWebMap = () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      window.AMap = AMap;
      map.value = new AMap.Map("container", {
        //设置地图容器id
        pitch: 2,
        viewMode: "3D", //是否为3D地图模式
        zoom: 17, //初始化地图级别
        mapStyle: "amap://styles/dark", //设置地图的显示样式
        center: [120.452543, 31.123945], //初始化地图中心点位置
      });
      map.value!.on("complete", () => {
        map.value!.setMapStyle("amap://styles/dark");
        addStartPositionMarker(120.452543, 31.123945);
      });
    })
    .catch((e) => {
      console.log(e);
    });
};
const initPolyline = () => {
  // 绘制轨迹
  polyline.value = new window.AMap.Polyline({
    // path: path, // 初始为空数组
    strokeColor: "#3366FF", // 线条颜色
    strokeOpacity: 1, // 线条透明度
    strokeWeight: 3, // 线条宽度
  });
  map.value!.add(polyline.value);
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
  map.value!.setCenter(point);
};
const setPolylineByPath = (path: AMap.LngLat[]) => {
  polyline.value!.setPath(path);
  map.value!.setCenter(path[path.length - 1]);
};

const getDistance = (point1: AMap.LngLat, point2: AMap.LngLat) => {
  return window.AMap.GeometryUtil.distance(point1, point2);
};

const setMapToCenter = async () => {
  await getCurrentPosition();
  if (!currentPosition.value.coords) return;
  convertFrom(
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude,
    ({ lat, lng }: LngLat) => {
      currentPosition.value.coords.longitude = lng;
      currentPosition.value.coords.latitude = lat;
    }
  );
  map.value!.setCenter([
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude,
  ]);
  addStartPositionMarker(
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude
  );
};
const convertFrom = (lng: number, lat: number, callback: Function) => {
  const location = [lng, lat];
  window.AMap.convertFrom(location, "gps", (status: any, result: any) => {
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
