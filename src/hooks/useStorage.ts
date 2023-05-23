import {ComponentInternalInstance, getCurrentInstance} from "vue";
import { Storage } from '@ionic/storage';

export function useStorage () {
  const { appContext } = getCurrentInstance() as ComponentInternalInstance
  const storage = appContext.config.globalProperties.$storage as Storage
  const set = (key: string, value: any) => storage.set(key, value);
  const get = (key: string) => storage.get(key);
  const remove = (key: string) => storage.remove(key);
  const clear = () => storage.clear();

  return {
    set, get, remove, clear
  }
}
