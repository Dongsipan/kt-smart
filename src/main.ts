import {createApp} from 'vue'
import App from './App.vue'
import router from './router';
import store from './store'

import {IonicVue} from '@ionic/vue';
import {Storage} from '@ionic/storage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';


const app = createApp(App)
const initStorage = async (app: any) => {
  /*初始化持久化storage*/
  const store = new Storage()
  app.config.globalProperties.$storage = await store.create()
}
initStorage(app).then(() => {
  app.use(IonicVue)
  app.use(router)
  app.use(store);

  router.isReady().then(async () => {
    app.mount('#app');
  });
})

