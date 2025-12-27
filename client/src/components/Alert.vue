<template>
  <Transition name="alert">
    <div
      v-if="show"
      :class="alertClasses"
      class="fixed top-4 right-4 max-w-md w-full shadow-lg rounded-lg p-4 z-50"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg v-if="type === 'success'" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="type === 'error'" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="type === 'warning'" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg v-else class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium" :class="textColorClass">
            {{ message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="$emit('close')"
            class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="buttonColorClass"
          >
            <span class="sr-only">Close</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Alert',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    message: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const alertClasses = computed(() => {
      const types = {
        success: 'bg-green-50 border-l-4 border-green-400',
        error: 'bg-red-50 border-l-4 border-red-400',
        warning: 'bg-yellow-50 border-l-4 border-yellow-400',
        info: 'bg-blue-50 border-l-4 border-blue-400'
      }
      return types[props.type]
    })

    const textColorClass = computed(() => {
      const colors = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800'
      }
      return colors[props.type]
    })

    const buttonColorClass = computed(() => {
      const colors = {
        success: 'text-green-500 hover:text-green-600 focus:ring-green-500',
        error: 'text-red-500 hover:text-red-600 focus:ring-red-500',
        warning: 'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-500',
        info: 'text-blue-500 hover:text-blue-600 focus:ring-blue-500'
      }
      return colors[props.type]
    })

    return {
      alertClasses,
      textColorClass,
      buttonColorClass
    }
  }
}
</script>

<style scoped>
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.alert-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
