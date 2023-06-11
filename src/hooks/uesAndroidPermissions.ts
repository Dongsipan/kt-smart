import { AndroidPermissions } from "@ionic-native/android-permissions";

export function useAndroidPermission() {
  const requestLocationPermission = async () => {
    await AndroidPermissions.requestPermissions([
      AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION,
      AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
      AndroidPermissions.PERMISSION.ACCESS_LOCATION_EXTRA_COMMANDS,
    ]);
  };

  return {
    requestLocationPermission,
  };
}
