import AMapLoader from "@amap/amap-jsapi-loader";

export function useAMap() {
  const loadAMap = async () => {
    window.AMap = await AMapLoader.load({
      key: "f4470fae2fb3b8aa6b1c753b8cac5c26", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.MoveAnimation"], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    });
  };

  return {
    loadAMap,
  };
}
