<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleClose">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="handleClose"></div>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <!-- Header -->
              <div class="flex items-start justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">
                  {{ title }}
                </h3>
                <button
                  type="button"
                  class="text-gray-400 hover:text-gray-500"
                  @click="handleClose"
                >
                  <span class="sr-only">Close</span>
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Content -->
              <div class="mt-2">
                <slot></slot>
              </div>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const handleClose = () => {
      if (props.closeOnBackdrop) {
        emit('close')
      }
    }

    return {
      handleClose
    }
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
