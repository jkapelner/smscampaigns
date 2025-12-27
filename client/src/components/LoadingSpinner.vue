<template>
  <div :class="spinnerClasses">
    <svg class="animate-spin" :class="sizeClasses" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span v-if="text" class="ml-2">{{ text }}</span>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    center: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const sizeClasses = computed(() => {
      const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
      }
      return sizes[props.size]
    })

    const spinnerClasses = computed(() => {
      const base = 'inline-flex items-center'
      const center = props.center ? 'justify-center w-full' : ''
      return `${base} ${center}`
    })

    return {
      sizeClasses,
      spinnerClasses
    }
  }
}
</script>
