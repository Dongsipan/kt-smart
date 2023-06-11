// import { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
// import { registerPlugin } from "@capacitor/core";
// import { ref } from "vue";
// import { useToast } from "@/hooks/useToast";
// const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>(
//   "BackgroundGeolocation"
// );
//
// export function useBackgroundLocation() {
//   const locationResult = ref<Location>();
//   const { presentToast } = useToast();
//   let watcherId = "";
//   const watchLocation = () => {
//     BackgroundGeolocation.addWatcher(
//       {
//         // If the "backgroundMessage" option is defined, the watcher will
//         // provide location updates whether the app is in the background or the
//         // foreground. If it is not defined, location updates are only
//         // guaranteed in the foreground. This is true on both platforms.
//
//         // On Android, a notification must be shown to continue receiving
//         // location updates in the background. This option specifies the text of
//         // that notification.
//         backgroundMessage: "Cancel to prevent battery drain.",
//
//         // The title of the notification mentioned above. Defaults to "Using
//         // your location".
//         backgroundTitle: "Tracking You.",
//
//         // Whether permissions should be requested from the user automatically,
//         // if they are not already granted. Defaults to "true".
//         requestPermissions: true,
//
//         // If "true", stale locations may be delivered while the device
//         // obtains a GPS fix. You are responsible for checking the "time"
//         // property. If "false", locations are guaranteed to be up to date.
//         // Defaults to "false".
//         stale: false,
//
//         // The minimum number of metres between subsequent locations. Defaults
//         // to 0.
//         distanceFilter: 0,
//       },
//       async function callback(location, error) {
//         if (error) {
//           if (error.code === "NOT_AUTHORIZED") {
//             if (
//               window.confirm(
//                 "This app needs your location, " +
//                   "but does not have permission.\n\n" +
//                   "Open settings now?"
//               )
//             ) {
//               // It can be useful to direct the user to their device's
//               // settings when location permissions have been denied. The
//               // plugin provides the 'openSettings' method to do exactly
//               // this.
//               await BackgroundGeolocation.openSettings();
//             }
//           }
//           await presentToast(JSON.stringify(error));
//           return console.error(error);
//         }
//         await presentToast(JSON.stringify(location));
//         return console.log(location);
//       }
//     ).then(function after_the_watcher_has_been_added(watcher_id) {
//       watcherId = watcher_id;
//       // When a watcher is no longer needed, it should be removed by calling
//       // 'removeWatcher' with an object containing its ID.
//     });
//   };
//   const removeWatcher = () => {
//     BackgroundGeolocation.removeWatcher({
//       id: watcherId,
//     });
//   };
//
//   return {
//     locationResult,
//     watchLocation,
//     removeWatcher,
//   };
// }
export {};
