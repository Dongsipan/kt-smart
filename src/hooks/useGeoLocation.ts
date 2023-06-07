import {Geolocation} from "@capacitor/geolocation";
import {useToast} from "@/hooks/useToast";
import {Position} from "@capacitor/geolocation/dist/esm/definitions";
import {ref} from "vue";

export function useGeoLocation () {
    const { presentToast } = useToast()
    const callbackId = ref('')
    const getCurrentPosition = async () => {
        try {
            await Geolocation.requestPermissions()
            return await Geolocation.getCurrentPosition()
        } catch (error) {
            await presentToast('Failed to obtain location information. Please try again')
        }
    }

    const watchCurrentPosition = async (callback: (position: Position | null, err?: any) => void) => {
        callbackId.value = await Geolocation.watchPosition({ enableHighAccuracy: true }, callback)
    }

    const clearWatch = async  () => {
        await Geolocation.clearWatch({ id: callbackId.value })
    }
    return {
        getCurrentPosition,
        watchCurrentPosition,
        clearWatch
    }
}