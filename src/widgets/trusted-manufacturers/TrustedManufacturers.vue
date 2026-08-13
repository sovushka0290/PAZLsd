<template>
  <div class="trusted-manufacturers w-full py-10 bg-slate-50 border-t border-slate-200 overflow-hidden relative">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
      <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">Нам доверяют более 100 производителей</h3>
      <p class="text-sm text-slate-500 mt-2">Лучшие бренды стоматологического рынка на одной платформе</p>
    </div>
    
    <!-- Gradient Masks for smooth fade on edges -->
    <div class="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
    <div class="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

    <div class="marquee-container flex">
      <!-- We render the list twice to create an infinite loop effect -->
      <div class="marquee-content flex shrink-0 items-center gap-6 px-3">
        <div 
          v-for="(brand, i) in brands" 
          :key="'a'+i"
          class="flex items-center justify-center bg-white px-6 py-4 rounded-xl shadow-xs border border-slate-200/60 min-w-[140px] grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
        >
          <span class="font-black text-xl tracking-tighter text-slate-700">{{ brand }}</span>
        </div>
      </div>
      <div class="marquee-content flex shrink-0 items-center gap-6 px-3" aria-hidden="true">
        <div 
          v-for="(brand, i) in brands" 
          :key="'b'+i"
          class="flex items-center justify-center bg-white px-6 py-4 rounded-xl shadow-xs border border-slate-200/60 min-w-[140px] grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
        >
          <span class="font-black text-xl tracking-tighter text-slate-700">{{ brand }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brands = [
  '3M',
  'Kerr',
  'Dentsply Sirona',
  'Ivoclar',
  'GC',
  'Voco',
  'Zhermack',
  'NSK',
  'W&H',
  'KaVo',
  'Septodont',
  'Tokuyama'
]
</script>

<style scoped>
.marquee-container {
  /* Hide scrollbar */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.marquee-container::-webkit-scrollbar {
  display: none;
}

.marquee-content {
  animation: scroll 30s linear infinite;
}

.marquee-container:hover .marquee-content {
  animation-play-state: paused;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
