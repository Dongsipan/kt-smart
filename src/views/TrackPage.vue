<template>
  <capacitor-google-map ref="mapRef"></capacitor-google-map>
  <button @click="createMap()">Create Map</button>
</template>

<script setup lang="ts">
import { GoogleMap } from '@capacitor/google-maps';
import {ref} from "vue";

const mapRef = ref<HTMLElement | null>(null)

let newMap: GoogleMap;

const createMap = async () => {
  if (!mapRef.value) return;

  newMap = await GoogleMap.create({
    id: 'my-map', // Unique identifier for this map instance
    element: mapRef.value, // reference to the capacitor-google-map element
    apiKey: 'YOUR_API_KEY_HERE', // Your Google Maps API Key
    config: {
      center: {
        // The initial position to be rendered by the map
        lat: 33.6,
        lng: -117.9,
      },
      zoom: 8, // The initial zoom level to be rendered by the map
    },
  });
};
</script>
<style>
capacitor-google-map {
  display: inline-block;
  width: 275px;
  height: 400px;
}
</style>
