<template>
  <div :id="container" class="amap-container"></div>
</template>

<script lang="ts" setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { shallowRef } from "vue";
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

const props = defineProps({
  container: {
    type: String,
    default: "track",
  },
});
const initMap = async () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      window.AMap = AMap;
      if (map.value) {
        setMapToCenter();
      } else {
        map.value = new AMap.Map(props.container.toString(), {
          //设置地图容器id
          pitch: 2,
          viewMode: "3D", //是否为3D地图模式
          zoom: 16, //初始化地图级别
        });
        map.value!.on("complete", () => {
          setMapToCenter();
          initPolyline();
        });
      }
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
      window.AMap = AMap;
      if (map.value) {
        setMapToCenter();
      } else {
        map.value = new AMap.Map(props.container.toString(), {
          //设置地图容器id
          pitch: 2,
          viewMode: "3D", //是否为3D地图模式
          zoom: 16, //初始化地图级别
        });
        map.value!.on("complete", () => {
          setMapToCenter();
          initPolyline();
        });
      }
    })
    .catch((e) => {
      console.log(e);
    });
};
const initTrack = async (path: [number, number][]) => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      window.AMap = AMap;
      map.value = new AMap.Map(props.container.toString(), {
        //设置地图容器id
        pitch: 2,
        viewMode: "3D", //是否为3D地图模式
        zoom: 17, //初始化地图级别
      });
      map.value!.on("complete", () => {
        initPolyline();
        addStartPositionMarker(path[0][0], path[0][1]);
        setPolylineByPath(path);
        addEndPositionMarker(
          path[path.length - 1][0],
          path[path.length - 1][1]
        );
        map.value?.setFitView();
      });
    })
    .catch((e) => {
      console.log(e);
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
    showDir: true,
    strokeColor: "#28F", //线颜色
    strokeOpacity: 0.8, // 线条透明度
    strokeWeight: 6, // 线条宽度
  });
  map.value?.add(polyline.value);
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
const setPolylineByPath = (path: any) => {
  if (path.length < 2) return;
  polyline.value!.setPath(path);
  map.value!.setCenter(path[path.length - 1]);
};
const setToCenter = (point: AMap.LngLat) => {
  map.value!.setCenter(point);
};
const clearPathAndMarker = () => {
  polyline.value?.destroy();
  startMarker.value?.remove();
  endMarker.value?.remove();
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
  initWebMap,
  initMap,
  initTrack,
  clearPathAndMarker,
  setToCenter,
});
</script>

<style lang="scss" scoped>
.amap-container {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
}
</style>
