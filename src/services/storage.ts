import { NativeStorage } from '@ionic-native/native-storage/ngx';
export const setItem = (reference: string, value: any) => NativeStorage.setItem(reference, value);