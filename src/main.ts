import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./store";
import "@amap/amap-jsapi-types";
import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { Capacitor } from "@capacitor/core";
import { useAMap } from "@/hooks/useAMap";
// import eruda from "eruda";
//
// eruda.init();
const { loadAMap } = useAMap();
if (Capacitor.isNativePlatform()) {
  ScreenOrientation.lock({ orientation: "portrait-primary" });
}
const app = createApp(App).use(pinia).use(IonicVue).use(router);

router.isReady().then(async () => {
  app.mount("#app");
  await loadAMap();
});
