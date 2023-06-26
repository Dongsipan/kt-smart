import { Geolocation, Position } from "@capacitor/geolocation";
import { useToast } from "@/hooks/useToast";
import { ref } from "vue";
import { usePositionStore } from "@/store/usePositionStore";
import { Capacitor } from "@capacitor/core";

export function useGeoLocation() {
  const { presentToast } = useToast();
  const callbackId = ref("");
  const { setCurrentPosition, setLocatingStatus, setWatchingStatus } =
    usePositionStore();
  const getCurrentPosition = async (): Promise<Position> => {
    return new Promise(async (resolve, reject) => {
      try {
        setLocatingStatus(true);
        if (callbackId.value) {
          await clearWatch();
        }
        if (Capacitor.isNativePlatform()) {
          await Geolocation.requestPermissions({
            permissions: ["location", "coarseLocation"],
          });
        }

        const watchTimes = 3;
        let currentTimes = 0;
        let callbackOnceId = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          async (position, error) => {
            if (currentTimes <= watchTimes) {
              currentTimes++;
              return;
            }
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
              setLocatingStatus(false);
            }
          }
        );
      } catch (error) {
        reject(error);
        setLocatingStatus(false);
        await presentToast(
          "Failed to obtain location information. Please try again"
        );
      }
    });
  };

  const watchCurrentPosition = async (
    callback: (position: Position | null, err?: any) => void
  ) => {
    setWatchingStatus(true);
    callbackId.value = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 1000 * 10 },
      callback
    );
  };

  const clearWatch = async () => {
    setWatchingStatus(false);
    await Geolocation.clearWatch({ id: callbackId.value });
  };
  return {
    getCurrentPosition,
    watchCurrentPosition,
    clearWatch,
  };
}
