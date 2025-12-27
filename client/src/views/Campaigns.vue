<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Campaigns</h1>
      <Button @click="showCreateModal = true" variant="primary">
        Create Campaign
      </Button>
    </div>

    <LoadingSpinner v-if="loading" size="lg" center text="Loading campaigns..." />

    <div v-else-if="campaigns.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new campaign.</p>
      <div class="mt-6">
        <Button @click="showCreateModal = true" variant="primary">
          Create Campaign
        </Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div @click="goToCampaign(campaign.id)">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ campaign.name }}</h3>
          <p class="text-sm text-gray-600 mb-4 line-clamp-3">{{ campaign.message }}</p>

          <div class="text-sm text-gray-500 mb-4">
            <p>Phone: {{ formatPhoneNumber(campaign.phoneNumber) }}</p>
            <p class="text-xs mt-1">Created: {{ formatDate(campaign.created) }}</p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex space-x-2">
              <button
                @click.stop="editCampaign(campaign)"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Edit
              </button>
              <button
                @click.stop="confirmDelete(campaign)"
                class="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Create/Edit Campaign Modal -->
    <Modal
      :show="showCreateModal || showEditModal"
      :title="editingCampaign ? 'Edit Campaign' : 'Create Campaign'"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit">
        <Input
          id="name"
          v-model="form.name"
          label="Campaign Name"
          placeholder="Summer Sale 2024"
          :required="true"
          :error="errors.name"
        />

        <Input
          id="message"
          v-model="form.message"
          label="Message"
          placeholder="Hi {first_name}, check out our summer sale!"
          :required="true"
          :error="errors.message"
          hint="Use {first_name} and {last_name} for personalization"
        />

        <Input
          id="phoneNumber"
          v-model="form.phoneNumber"
          label="Sender Phone Number"
          placeholder="+1234567890"
          :required="true"
          :error="errors.phoneNumber"
          hint="Format: +1234567890"
        />
      </form>

      <template #footer>
        <Button
          type="button"
          variant="secondary"
          @click="closeModal"
          class="mr-3"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          {{ editingCampaign ? 'Update' : 'Create' }}
        </Button>
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      :show="showDeleteModal"
      title="Delete Campaign"
      @close="showDeleteModal = false"
    >
      <p class="text-sm text-gray-500">
        Are you sure you want to delete "{{ campaignToDelete?.name }}"? This action cannot be undone.
      </p>
      <template #footer>
        <Button
          variant="secondary"
          @click="showDeleteModal = false"
          class="mr-3"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          :loading="deleting"
          @click="handleDelete"
        >
          Delete
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import Input from '../components/Input.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'Campaigns',
  components: {
    Card,
    Button,
    Input,
    Modal,
    LoadingSpinner
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const loading = ref(false)
    const submitting = ref(false)
    const deleting = ref(false)

    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)

    const editingCampaign = ref(null)
    const campaignToDelete = ref(null)

    const form = ref({
      name: '',
      message: '',
      phoneNumber: ''
    })

    const errors = ref({
      name: '',
      message: '',
      phoneNumber: ''
    })

    const campaigns = computed(() => store.getters['campaigns/allCampaigns'])

    onMounted(async () => {
      loading.value = true
      try {
        await store.dispatch('campaigns/fetchCampaigns')
      } catch (error) {
        console.error('Failed to load campaigns:', error)
      } finally {
        loading.value = false
      }
    })

    const validateForm = () => {
      let isValid = true

      if (!form.value.name.trim()) {
        errors.value.name = 'Campaign name is required'
        isValid = false
      } else {
        errors.value.name = ''
      }

      if (!form.value.message.trim()) {
        errors.value.message = 'Message is required'
        isValid = false
      } else {
        errors.value.message = ''
      }

      if (!form.value.phoneNumber.trim()) {
        errors.value.phoneNumber = 'Phone number is required'
        isValid = false
      } else if (!/^\+\d{10,15}$/.test(form.value.phoneNumber)) {
        errors.value.phoneNumber = 'Phone number must start with + and contain 10-15 digits'
        isValid = false
      } else {
        errors.value.phoneNumber = ''
      }

      return isValid
    }

    const handleSubmit = async () => {
      if (!validateForm()) return

      submitting.value = true

      try {
        if (editingCampaign.value) {
          await store.dispatch('campaigns/updateCampaign', {
            id: editingCampaign.value.id,
            data: form.value
          })
        } else {
          await store.dispatch('campaigns/createCampaign', form.value)
        }
        closeModal()
      } catch (error) {
        console.error('Failed to save campaign:', error)
      } finally {
        submitting.value = false
      }
    }

    const editCampaign = (campaign) => {
      editingCampaign.value = campaign
      form.value = {
        name: campaign.name,
        message: campaign.message,
        phoneNumber: campaign.phoneNumber
      }
      showEditModal.value = true
    }

    const confirmDelete = (campaign) => {
      campaignToDelete.value = campaign
      showDeleteModal.value = true
    }

    const handleDelete = async () => {
      deleting.value = true
      try {
        await store.dispatch('campaigns/deleteCampaign', campaignToDelete.value.id)
        showDeleteModal.value = false
        campaignToDelete.value = null
      } catch (error) {
        console.error('Failed to delete campaign:', error)
      } finally {
        deleting.value = false
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      editingCampaign.value = null
      form.value = {
        name: '',
        message: '',
        phoneNumber: ''
      }
      errors.value = {
        name: '',
        message: '',
        phoneNumber: ''
      }
    }

    const goToCampaign = (campaignId) => {
      router.push(`/campaigns/${campaignId}`)
    }

    const formatPhoneNumber = (phone) => {
      return phone || 'N/A'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    return {
      loading,
      submitting,
      deleting,
      campaigns,
      showCreateModal,
      showEditModal,
      showDeleteModal,
      editingCampaign,
      campaignToDelete,
      form,
      errors,
      handleSubmit,
      editCampaign,
      confirmDelete,
      handleDelete,
      closeModal,
      goToCampaign,
      formatPhoneNumber,
      formatDate
    }
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
