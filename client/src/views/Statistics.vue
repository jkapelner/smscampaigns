<template>
  <div>
    <div class="mb-6">
      <Button
        variant="secondary"
        size="sm"
        @click="$router.push(`/campaigns/${campaignId}`)"
        class="mb-4"
      >
        &larr; Back to Campaign
      </Button>
    </div>

    <LoadingSpinner v-if="loading" size="lg" center text="Loading statistics..." />

    <div v-else>
      <Card title="Campaign Statistics" :subtitle="campaign?.name" class="mb-6">
        <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Messages -->
          <div class="bg-blue-50 rounded-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-600 uppercase">Total Messages</p>
                <p class="text-3xl font-bold text-blue-900 mt-2">{{ stats.total || 0 }}</p>
              </div>
              <div class="bg-blue-100 rounded-full p-3">
                <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Sent Messages -->
          <div class="bg-green-50 rounded-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-green-600 uppercase">Sent</p>
                <p class="text-3xl font-bold text-green-900 mt-2">{{ stats.success || 0 }}</p>
                <p class="text-xs text-green-700 mt-1">{{ getSentPercentage() }}%</p>
              </div>
              <div class="bg-green-100 rounded-full p-3">
                <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Failed Messages -->
          <div class="bg-red-50 rounded-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-red-600 uppercase">Failed</p>
                <p class="text-3xl font-bold text-red-900 mt-2">{{ stats.failed || 0 }}</p>
                <p class="text-xs text-red-700 mt-1">{{ getFailedPercentage() }}%</p>
              </div>
              <div class="bg-red-100 rounded-full p-3">
                <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Pending Messages -->
          <div class="bg-yellow-50 rounded-lg p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-yellow-600 uppercase">Pending</p>
                <p class="text-3xl font-bold text-yellow-900 mt-2">{{ stats.pending || 0 }}</p>
                <p class="text-xs text-yellow-700 mt-1">{{ getPendingPercentage() }}%</p>
              </div>
              <div class="bg-yellow-100 rounded-full p-3">
                <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-gray-500">No statistics available yet. Send messages to see stats.</p>
        </div>

        <!-- Progress Bar -->
        <div v-if="stats && stats.total > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Message Status Distribution</h3>
          <div class="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div class="flex h-full">
              <div
                v-if="stats.success > 0"
                :style="{ width: getSentPercentage() + '%' }"
                class="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
              >
                {{ stats.success > 0 ? getSentPercentage() + '%' : '' }}
              </div>
              <div
                v-if="stats.failed > 0"
                :style="{ width: getFailedPercentage() + '%' }"
                class="bg-red-500 flex items-center justify-center text-xs font-medium text-white"
              >
                {{ stats.failed > 0 ? getFailedPercentage() + '%' : '' }}
              </div>
              <div
                v-if="stats.pending > 0"
                :style="{ width: getPendingPercentage() + '%' }"
                class="bg-yellow-500 flex items-center justify-center text-xs font-medium text-white"
              >
                {{ stats.pending > 0 ? getPendingPercentage() + '%' : '' }}
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-4 text-sm">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span class="text-gray-700">Sent: {{ stats.success }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span class="text-gray-700">Failed: {{ stats.failed }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              <span class="text-gray-700">Pending: {{ stats.pending }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button variant="secondary" @click="refreshStats" :loading="refreshing">
            Refresh Statistics
          </Button>
        </div>
      </Card>

      <!-- Campaign Details Summary -->
      <Card v-if="campaign" title="Campaign Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm font-medium text-gray-500">Campaign Name</p>
            <p class="text-base text-gray-900 mt-1">{{ campaign.name }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Phone Number</p>
            <p class="text-base text-gray-900 mt-1">{{ campaign.phoneNumber }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm font-medium text-gray-500">Message Template</p>
            <p class="text-base text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">{{ campaign.message }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Created Date</p>
            <p class="text-base text-gray-900 mt-1">{{ formatDate(campaign.created) }}</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'Statistics',
  components: {
    Card,
    Button,
    LoadingSpinner
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    const loading = ref(false)
    const refreshing = ref(false)

    const campaignId = computed(() => route.params.id)
    const campaign = computed(() => store.state.campaigns.currentCampaign)
    const stats = computed(() => store.state.campaigns.stats)

    const loadStats = async () => {
      loading.value = true
      try {
        await Promise.all([
          store.dispatch('campaigns/fetchCampaign', campaignId.value),
          store.dispatch('campaigns/fetchStats', campaignId.value)
        ])
      } catch (error) {
        console.error('Failed to load statistics:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadStats)

    const refreshStats = async () => {
      refreshing.value = true
      try {
        await store.dispatch('campaigns/fetchStats', campaignId.value)
      } catch (error) {
        console.error('Failed to refresh statistics:', error)
      } finally {
        refreshing.value = false
      }
    }

    const getSentPercentage = () => {
      if (!stats.value || stats.value.total === 0) return 0
      return Math.round((stats.value.success / stats.value.total) * 100)
    }

    const getFailedPercentage = () => {
      if (!stats.value || stats.value.total === 0) return 0
      return Math.round((stats.value.failed / stats.value.total) * 100)
    }

    const getPendingPercentage = () => {
      if (!stats.value || stats.value.total === 0) return 0
      return Math.round((stats.value.pending / stats.value.total) * 100)
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      loading,
      refreshing,
      campaignId,
      campaign,
      stats,
      refreshStats,
      getSentPercentage,
      getFailedPercentage,
      getPendingPercentage,
      formatDate
    }
  }
}
</script>
