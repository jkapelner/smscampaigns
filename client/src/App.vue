<template>
  <div id="app" class="min-h-screen">
    <nav v-if="isAuthenticated" class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-primary-600">SMS Campaign Manager</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link
                to="/campaigns"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.path.startsWith('/campaigns')
                  ? 'border-primary-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'"
              >
                Campaigns
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-700 mr-4">{{ user?.email }}</span>
            <button
              @click="handleLogout"
              class="btn btn-secondary text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <Alert
      v-if="alert.show"
      :type="alert.type"
      :message="alert.message"
      @close="clearAlert"
    />
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Alert from './components/Alert.vue'

export default {
  name: 'App',
  components: {
    Alert
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const user = computed(() => store.state.auth.user)

    const alert = ref({
      show: false,
      type: 'info',
      message: ''
    })

    // Watch for global errors
    watch(
      () => store.state.error,
      (error) => {
        if (error) {
          alert.value = {
            show: true,
            type: 'error',
            message: error
          }
          setTimeout(clearAlert, 5000)
        }
      }
    )

    const handleLogout = async () => {
      await store.dispatch('auth/logout')
      router.push('/login')
    }

    const clearAlert = () => {
      alert.value.show = false
      store.commit('clearError')
    }

    return {
      isAuthenticated,
      user,
      alert,
      handleLogout,
      clearAlert
    }
  }
}
</script>
