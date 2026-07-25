<template>
  <div class="category-node select-none">
    <!-- Category Row Item -->
    <div
      class="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent"
      :class="[
        isSelected
          ? 'bg-blue-600 shadow-md shadow-blue-500/20 text-white font-bold'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        level === 0 && !isSelected ? 'text-slate-900 font-bold bg-slate-50/80 mb-1 border-slate-100' : ''
      ]"
      :style="{ paddingLeft: `${14 + level * 14}px` }"
      @click="onSelect"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Vector Icon for Top Level Categories -->
        <UIcon
          v-if="level === 0"
          :name="getCategoryIcon(node.name)"
          class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110"
          :class="isSelected ? 'text-white' : 'text-blue-600'"
        />
        <span class="truncate pr-1" :title="node.name">{{ node.name }}</span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Product Count Badge -->
        <span
          v-if="(node as any).products_count !== undefined && (node as any).products_count > 0"
          class="text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors"
          :class="[
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
          ]"
        >
          {{ (node as any).products_count }}
        </span>

        <!-- Expand / Collapse Arrow -->
        <button
          v-if="node.children.length > 0"
          type="button"
          class="h-6 w-6 flex items-center justify-center rounded-lg transition-all duration-300"
          :class="[
            isSelected
              ? 'hover:bg-white/20 text-white'
              : 'hover:bg-slate-200/50 dark:hover:bg-neutral-700/50 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-neutral-200'
          ]"
          @click.stop="toggleExpand"
        >
          <span
            class="text-[9px] transform transition-transform duration-300"
            :class="isExpanded ? 'rotate-90' : ''"
          >
            ▶
          </span>
        </button>
      </div>
    </div>

    <!-- Children Menu Container -->
    <transition
      name="slide"
      @enter="enter"
      @leave="leave"
    >
      <div
        v-if="node.children.length > 0 && isExpanded"
        class="mt-1 mb-2 space-y-1 overflow-hidden transition-all duration-300"
      >
        <CategoryNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :selected-slug="selectedSlug"
          :expanded-ids="expandedIds"
          :level="level + 1"
          @select="$emit('select', $event)"
          @toggle-expand="$emit('toggle-expand', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryTreeNode } from '@fsd/shared/lib/buildCategoryTree'

const props = defineProps<{
  node: CategoryTreeNode
  selectedSlug: string
  expandedIds: Set<number>
  level?: number
}>()

const emit = defineEmits<{
  'select': [slug: string]
  'toggle-expand': [id: number]
}>()

const level = computed(() => props.level ?? 0)
const isSelected = computed(() => props.selectedSlug === props.node.slug)
const isExpanded = computed(() => props.expandedIds.has(props.node.id))

function onSelect() {
  emit('select', props.node.slug)
  if (props.node.children.length > 0 && !isExpanded.value) {
    emit('toggle-expand', props.node.id)
  }
}

function toggleExpand() {
  emit('toggle-expand', props.node.id)
}

// Helper to determine vector icon based on category name
function getCategoryIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('терап') || n.includes('пломб') || n.includes('эстет') || n.includes('реставр')) return 'i-lucide-activity'
  if (n.includes('эндодонт') || n.includes('файл') || n.includes('канал')) return 'i-lucide-disc'
  if (n.includes('ортопед') || n.includes('слепоч') || n.includes('оттиск') || n.includes('протез')) return 'i-lucide-crown'
  if (n.includes('оборуд') || n.includes('установ') || n.includes('микроскоп') || n.includes('печ')) return 'i-lucide-cpu'
  if (n.includes('хирург') || n.includes('имплант') || n.includes('скальп') || n.includes('шовн')) return 'i-lucide-syringe'
  if (n.includes('шлиф') || n.includes('полир') || n.includes('диск')) return 'i-lucide-sparkles'
  if (n.includes('матриц') || n.includes('клин')) return 'i-lucide-ruler'
  if (n.includes('инструмент') || n.includes('бор') || n.includes('наконеч')) return 'i-lucide-wrench'
  return 'i-lucide-package'
}

// Smooth transition helper functions
function enter(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = '0'
  // Trigger repaint
  htmlEl.offsetHeight
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
}

function leave(el: Element) {
  const htmlEl = el as HTMLElement
  htmlEl.style.height = `${htmlEl.scrollHeight}px`
  // Trigger repaint
  htmlEl.offsetHeight
  htmlEl.style.height = '0'
}
</script>

<style scoped>
.category-node {
  width: 100%;
}

.slide-enter-active,
.slide-leave-active {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  height: 0 !important;
  opacity: 0;
}
</style>
