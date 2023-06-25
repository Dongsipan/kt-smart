import type { EventBusKey } from "@vueuse/core";
import { useEventBus } from "@vueuse/core";

export const disconnectEventBus: EventBusKey<{ name: "onBleDisconnect" }> =
  Symbol("symbol-key");

export function useDisconnectEventBus() {
  const bus = useEventBus<string>(disconnectEventBus);
  const { emit, on, off, reset, once } = bus;
  return {
    bus,
    emit,
    on,
    off,
    reset,
    once,
  };
}
