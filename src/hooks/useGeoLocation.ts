import { Geolocation, Position } from "@capacitor/geolocation";
import { useToast } from "@/hooks/useToast";
import { ref } from "vue";
import { isPlatform } from "@ionic/vue";
import { usePositionStore } from "@/store/usePositionStore";

export function useGeoLocation() {
  const { presentToast } = useToast();
  const callbackId = ref("");
  const { setCurrentPosition } = usePositionStore();
  const getCurrentPosition = (): Promise<Position> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (callbackId.value) {
          await clearWatch();
        }
        await Geolocation.requestPermissions({
          permissions: ["location", "coarseLocation"],
        });
        if (isPlatform("android")) {
          let callbackOnceId = await Geolocation.watchPosition(
            { enableHighAccuracy: true },
            async (position, error) => {
              if (error) {
                reject(error);
                await presentToast(
                  "Failed to obtain location information. Please try again"
                );
              }
              if (position?.coords.latitude) {
                await Geolocation.clearWatch({ id: callbackOnceId });
                setCurrentPosition(position);
                resolve(position);
              }
            }
          );
        } else {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
          });
          setCurrentPosition(position);
          resolve(position);
        }
      } catch (error) {
        reject(error);
        await presentToast(
          "Failed to obtain location information. Please try again"
        );
      }
    });
  };

  const watchCurrentPosition = async (
    callback: (position: Position | null, err?: any) => void
  ) => {
    callbackId.value = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      callback
    );
  };

  const clearWatch = async () => {
    await Geolocation.clearWatch({ id: callbackId.value });
  };
  return {
    getCurrentPosition,
    watchCurrentPosition,
    clearWatch,
  };
}
