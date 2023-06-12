import { useToast } from "@/hooks/useToast";
import { useMessage } from "@/hooks/useMessage";
import { ref } from "vue";
import { useBackButton } from "@ionic/vue";
import { App } from "@capacitor/app";

export function useExitApp() {
  const { presentToast } = useToast();
  const { exitApp } = useMessage();
  const backButtonPressedTwiceToExit = ref(false);
  const exitListener = () => {
    useBackButton(-1, async () => {
      if (backButtonPressedTwiceToExit.value) {
        await exitApp();
        await App.exitApp();
      } else {
        backButtonPressedTwiceToExit.value = true;
        await presentToast("Press again to exit the application");
        setTimeout(() => {
          backButtonPressedTwiceToExit.value = false;
        }, 2000);
      }
    });
  };
  return {
    exitListener,
  };
}
