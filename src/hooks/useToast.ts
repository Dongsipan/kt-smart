import { toastController } from "@ionic/vue";

export function useToast() {
  const presentToast = async (
    message: string,
    position: "top" | "middle" | "bottom" = "middle",
    duration = 3000
  ) => {
    const toast = await toastController.create({
      message,
      duration,
      position,
    });

    await toast.present();
  };
  return {
    presentToast,
  };
}
