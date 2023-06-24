import { computed, ref, watch } from "vue";

export function useTimer() {
  const startTime = Date.now();
  const elapsedTime = ref(0);
  const timerRunning = ref(false);
  let intervalId: NodeJS.Timer;

  const toggleTimer = () => {
    timerRunning.value = !timerRunning.value;
  };

  const start = () => {
    timerRunning.value = true;
  };
  const stop = () => {
    timerRunning.value = false;
  };
  const reset = () => {
    elapsedTime.value = 0;
  };
  watch(timerRunning, (newVal) => {
    if (newVal) {
      // 开始计时
      intervalId = setInterval(() => {
        elapsedTime.value = Date.now() - startTime;
      }, 10);
    } else {
      // 暂停计时
      clearInterval(intervalId);
    }
  });

  const formatTime = computed(() => {
    if (elapsedTime.value === 0) return "";
    const minutes = Math.floor(elapsedTime.value / 60000);
    const seconds = Math.floor((elapsedTime.value % 60000) / 1000);
    const milliseconds = Math.floor((elapsedTime.value % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  });

  return {
    elapsedTime,
    toggleTimer,
    formatTime,
    start,
    stop,
    reset,
  };
}
