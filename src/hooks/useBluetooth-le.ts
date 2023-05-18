// import { reactive, ref } from "vue";
// import { BleClient } from '@capacitor-community/bluetooth-le';
//
// export default function () {
//     // const Ble = reactive({
//     //     peripherals: [],
//     //     availableDevices: [],
//     //     connectedDevice: {},
//     //     scaning: false
//     // })
//     const peripherals = ref([])
//     const availableDevices = ref([])
//     const connectedDevice = ref({})
//     const scaning = ref(false)
//     async function scan() {
//         try {
//           await BleClient.initialize();
//
//           await BleClient.requestLEScan(
//             {
//               services: [HEART_RATE_SERVICE],
//             },
//             (result) => {
//               console.log('received new scan result', result);
//             }
//           );
//
//           setTimeout(async () => {
//             await BleClient.stopLEScan();
//             console.log('stopped scanning');
//           }, 5000);
//         } catch (error) {
//           console.error(error);
//         }
//       }
// }