import { computed, ref } from "vue";

export function useError() {
  const errorCode = ref(-1);
  const current = ref(false);
  const throttle = ref(false);
  const motorPhase = ref(false);
  const motorHall = ref(false);
  const torqueSensor = ref(false);
  const speedSensor = ref(false);
  const hasError = computed(() => {
    return errorCode.value > 0;
  });
  const setError = (code: number) => {
    errorCode.value = code;
    switch (code) {
      case 33:
        current.value = true;
        break;
      case 34:
        throttle.value = true;
        break;
      case 35:
        motorPhase.value = true;
        break;
      case 36:
        motorHall.value = true;
        break;
      case 38:
        torqueSensor.value = true;
        break;
      case 39:
        speedSensor.value = true;
        break;
      case 0:
        resetError();
        break;
      default:
        break;
    }
  };
  const resetError = () => {
    current.value = false;
    throttle.value = false;
    motorPhase.value = false;
    motorHall.value = false;
    torqueSensor.value = false;
    speedSensor.value = false;
  };

  return {
    setError,
    errorCode,
    current,
    throttle,
    motorPhase,
    motorHall,
    torqueSensor,
    speedSensor,
    hasError,
  };
}
