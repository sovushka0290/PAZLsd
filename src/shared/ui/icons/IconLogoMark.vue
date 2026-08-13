<template>
  <svg
    class="h-6 w-6 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="pazl-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#0066CC"/>
        <stop offset="100%" stop-color="#00B4A0"/>
      </linearGradient>
    </defs>
    <!-- P letter body -->
    <path
      d="M16 8 C16 8 16 56 16 56 L24 56 L24 40 L36 40 C50 40 56 32 56 24 C56 16 50 8 36 8 Z"
      fill="url(#pazl-grad)"
    />
    <!-- Inner cutout for P hole -->
    <path
      d="M24 16 L36 16 C44 16 48 19 48 24 C48 29 44 32 36 32 L24 32 Z"
      fill="white"
    />
    <!-- Arrow pointing right -->
    <path
      d="M28 22 L40 22 L40 18 L50 24 L40 30 L40 26 L28 26 Z"
      fill="white"
    />
    <!-- Medical cross -->
    <path
      d="M20 42 L20 46 L18 46 L18 48 L20 48 L20 52 L22 52 L22 48 L24 48 L24 46 L22 46 L22 42 Z"
      fill="white"
    />
    <!-- Bottom speed lines (puzzle/motion effect) -->
    <rect x="28" y="52" width="10" height="2" rx="1" fill="url(#pazl-grad)" opacity="0.6"/>
    <rect x="32" y="56" width="6" height="2" rx="1" fill="url(#pazl-grad)" opacity="0.4"/>
    <rect x="24" y="48" width="8" height="2" rx="1" fill="url(#pazl-grad)" opacity="0.3"/>
  </svg>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
</style>
