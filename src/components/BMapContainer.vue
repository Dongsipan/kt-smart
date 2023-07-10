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
};
const updateMapRotation = () => {};
const setMapToCenter = async () => {
  await getCurrentPosition();
  if (!currentPosition.value.coords) return;
  const position = (await convertGpsToBMap([
    currentPosition.value.coords.longitude,
    currentPosition.value.coords.latitude,
  ])) as any;
  map.value.setCenter(position);
};
const convertGpsToBMap = (position: number[]) => {
  return new Promise((resolve, reject) => {
    try {
      const convertor = new window.BMapGL.Convertor();
      const point = new window.BMapGL.Point(position[0], position[1]);
      convertor.translate([point], 1, 5, (result: any) => {
        if (result.status === 0) {
          const lngLat = result.points[0];
          resolve(lngLat);
        }
      });
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
