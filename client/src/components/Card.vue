<template>
  <div :class="cardClasses">
    <div v-if="title" class="border-b border-gray-200 pb-4 mb-4">
      <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Card',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    }
  },
  setup(props) {
    const cardClasses = computed(() => {
      const base = 'bg-white rounded-lg shadow-md'
      const paddings = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
      }
      return `${base} ${paddings[props.padding]}`
    })

    return {
      cardClasses
    }
  }
}
</script>
