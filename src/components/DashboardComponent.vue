<template>
  <ion-grid class="ion-padding-top bg-black">
    <ion-row>
      <ion-col class="ion-no-padding">
        <div id="chartEl" class="dashboard">
          <svg id="svgEl">
            <defs>
              <radialGradient id="grad1">
                <stop offset="0%" style="stop-color: #000" />
                <stop offset="70%" style="stop-color: #000" />
                <stop offset="85%" style="stop-color: maroon" />
                <stop offset="100%" style="stop-color: #000" />
              </radialGradient>
            </defs>
            <path class="path-out" d="M 0 0" />
            <circle cx="0" cy="0" r="0" />
            <path class="path-inner" d="M 0 0" />
          </svg>
          <canvas id="canvasEl"></canvas>
          <ion-grid class="speed-container">
            <ion-row>
              <ion-col size="12">
                <div class="speed-container__unit">{{ unit }}</div>
                <div class="speed-container__speed">{{ speed }}</div>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-grid class="info-container">
            <ion-row v-if="throttleStatus === 2">
              <ion-col size="12"> Throttle </ion-col>
            </ion-row>
            <ion-row v-if="isAssistance && throttleStatus !== 2">
              <ion-col size="12"> Assist </ion-col>
            </ion-row>
            <ion-row>
              <ion-col size="12">
                {{ gearPosition }}
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts" setup>
import { IonCol, IonGrid, IonRow } from "@ionic/vue";
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  speed: {
    type: Number,
    default: 0,
  },
  gearPosition: {
    type: Number,
    default: 0,
  },
  isAssistance: {
    type: Boolean,
    default: false,
  },
  isKmUnit: {
    type: Boolean,
    default: false,
  },
  throttleStatus: {
    type: Number,
    default: 1,
  },
});

const minSpeed = 0;
const maxSpeed = 72;
const padding = 20;
let chartSize = 0;

const unit = ref("KM/h");
const initChart = () => {
  return new Promise((resolve, reject) => {
    try {
      const chartEl = document.getElementById("chartEl");
      const canvasEl = document.getElementById("canvasEl") as HTMLCanvasElement;
      const svgEl = document.getElementById("svgEl");
      const clientHeight = document.body.clientHeight;
      const clientWidth = document.body.clientWidth;
      const size = Math.min(clientHeight, clientWidth) - padding; // 保证chart图表是一个正圆形，且不超越屏幕的高度和宽度
      const height = Math.round(size * 0.7);
      chartSize = size;
      if (chartEl) {
        chartEl.style.width = `${chartSize}px`;
        chartEl.style.height = `${Math.round(size * 0.8)}px`;
      }
      if (canvasEl) {
        canvasEl.width = chartSize;
        canvasEl.height = height;
      }
      // 最外层的灰色圆弧
      let radius = chartSize * 0.45; // 最外层圆弧的半径
      let x1 = chartSize / 2 - radius * Math.cos(Math.PI / 9);
      let y1 = chartSize / 2 + radius * Math.sin(Math.PI / 9);
      let x2 = chartSize / 2 + radius * Math.cos(Math.PI / 9);
      let y2 = y1;

      let path = `M ${x1} ${y1} A${radius} ${radius} 0 1 1 ${x2} ${y2}`;
      if (!svgEl) return;
      const svgPathOut = svgEl.firstChild?.nextSibling as any;
      if (!svgPathOut) return;
      svgPathOut.setAttribute("d", path);
      // 画里面的深红色圆
      radius = chartSize * 0.4; // 深红色圆弧的半径
      const svgCircle = svgPathOut.nextSibling;
      svgCircle.setAttribute("cx", String(chartSize / 2));
      svgCircle.setAttribute("cy", String(chartSize / 2));
      svgCircle.setAttribute("r", String(radius));

      x1 = chartSize / 2 - radius * Math.cos(Math.PI / 9);
      y1 = chartSize / 2 + radius * Math.sin(Math.PI / 9);
      x2 = chartSize / 2 + radius * Math.cos(Math.PI / 9);
      y2 = y1;
      path = `M ${x1} ${y1} A${radius} ${radius} 0 1 0 ${x2} ${y2} L${
        chartSize / 2
      } ${chartSize / 2}`;
      const svgPathInner = svgCircle.nextSibling;
      svgPathInner.setAttribute("d", path);
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
};

const renderChart = (value: number) => {
  const canvasEl = document.getElementById("canvasEl") as any;
  if (!canvasEl) return;
  const context = canvasEl.getContext("2d");
  const radius = chartSize * 0.4;
  // 计算终止角度
  const angle =
    (((220 * (value - minSpeed)) / (maxSpeed - minSpeed) - 200) * Math.PI) /
    180;
  // 开始作画
  // context?.clearRect(0, 0, chartSize, Math.round(chartSize * 0.7))
  // eslint-disable-next-line no-self-assign
  canvasEl.width = canvasEl.width;
  context?.beginPath();
  const gradient = context?.createRadialGradient(
    chartSize / 2,
    chartSize / 2,
    0,
    chartSize / 2,
    chartSize / 2,
    radius
  );
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.7, "#000");
  gradient.addColorStop(0.85, "green");
  gradient.addColorStop(0.87, "#030");
  gradient.addColorStop(1, "#020");
  context.fillStyle = gradient;
  context.arc(chartSize / 2, chartSize / 2, radius, (-10 * Math.PI) / 9, angle);
  context.lineTo(chartSize / 2, chartSize / 2);
  context.closePath();
  context.fill();
  // 画5条分割线
  for (let i = 1; i <= 5; i++) {
    // 所有线条的起点都是画布的中心位置
    // 计算终点
    const alpha = (Math.PI * ((220 * i) / 6 - 20)) / 180;
    const endX = chartSize / 2 + radius * Math.cos(alpha);
    const endY = chartSize / 2 - radius * Math.sin(alpha);
    context.beginPath();
    context.strokeWidth = 3;
    context.strokeStyle = "#000";
    context.moveTo(chartSize / 2, chartSize / 2);
    context.lineTo(endX, endY);
    context.stroke();
  }
};

const resizeEvent = () => {
  initChart();
  renderChart(props.speed);
};

onMounted(async () => {
  await initChart();
  renderChart(props.speed);
  window.addEventListener("resize", resizeEvent);
});

onUnmounted(() => {
  window.removeEventListener("resize", resizeEvent);
});

watch(
  () => props.speed,
  async (value) => {
    renderChart(value);
  }
);
watch(
  () => props.isKmUnit,
  async (value) => {
    unit.value = value ? "KM/h" : "Mil/h";
  }
);
</script>
<style lang="scss">
.dashboard {
  margin: auto;
  position: relative;
  background: #000;

  svg {
    width: 100%;
    height: 100%;

    .path-out {
      stroke-width: 3;
      stroke: gray;
    }

    .path-inner {
      fill: #000;
    }

    circle {
      fill: url(#grad1);
    }
  }

  canvas {
    position: absolute;
    left: 0;
  }

  .speed-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
    color: #fff;

    & ion-col {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .speed-container__unit {
        font-size: 1rem;
        text-align: center;
      }
      .speed-container__speed {
        font-size: 6rem;
        line-height: 5rem;
        text-align: center;
      }
    }
  }

  .info-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 6.375rem;
    color: #fff;
    font-size: 1.5rem;

    ion-row:first-child {
      font-size: 1rem;
    }

    ion-row:last-child {
      font-size: 3rem;
      line-height: 3rem;

      ion-col {
        padding: 0;
      }
    }
  }
}
</style>
