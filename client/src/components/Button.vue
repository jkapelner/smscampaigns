<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="loading" class="mr-2" size="sm" />
    <slot></slot>
  </button>
</template>

<script>
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'Button',
  components: {
    LoadingSpinner
  },
  props: {
    type: {
      type: String,
      default: 'button'
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    }
  },
  emits: ['click'],
  setup(props) {
    const buttonClasses = computed(() => {
      const base = 'btn inline-flex items-center justify-center'
      const sizes = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3'
      }
      const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger'
      }

      return `${base} ${sizes[props.size]} ${variants[props.variant]}`
    })

    return {
      buttonClasses
    }
  }
}
</script>
