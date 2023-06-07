<template>
  <div id="container"></div>
</template>

<script lang="ts" setup>
import AMapLoader from "@amap/amap-jsapi-loader";
import { onMounted, shallowRef } from "vue";

window._AMapSecurityConfig = {
  securityJsCode: "da407eef4b941f5e02b4e8b7cb1a043c",
};
const map = shallowRef<any>(null);
const initMap = () => {
  AMapLoader.load({
    key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [""], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      map.value = new AMap.Map("container", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 16, //初始化地图级别
        center: [105.602725, 37.076636], //初始化地图中心点位置
      });
    })
    .catch((e) => {
      console.log(e);
    });
};
const setLocation = (lng: number, lat: number) => {
  if (!map.value) return;

  AMap.convertFrom([lng, lat], "gps", function (status: any, result: any) {
    if (result.info === "ok") {
      const lnglats = result.locations; // Array.<LngLat>
      const { lng, lat } = lnglats[0];
      map.value.setCenter([lng, lat]);
    }
  });

  // map.value.LngLat.prototype.setLng(lan);
  // map.value.LngLat.prototype.setLat(lat);
};

defineExpose({
  setLocation,
});
onMounted(() => {
  initMap();
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
