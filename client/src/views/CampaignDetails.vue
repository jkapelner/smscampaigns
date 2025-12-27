<template>
  <div>
    <div class="mb-6">
      <Button
        variant="secondary"
        size="sm"
        @click="$router.push('/campaigns')"
        class="mb-4"
      >
        &larr; Back to Campaigns
      </Button>
    </div>

    <LoadingSpinner v-if="loading" size="lg" center text="Loading campaign..." />

    <div v-else-if="campaign">
      <!-- Campaign Info -->
      <Card title="Campaign Details" class="mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Name</p>
            <p class="text-base text-gray-900">{{ campaign.name }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Phone Number</p>
            <p class="text-base text-gray-900">{{ formatPhoneNumber(campaign.phoneNumber) }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm font-medium text-gray-500">Message</p>
            <p class="text-base text-gray-900 whitespace-pre-wrap">{{ campaign.message }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Created</p>
            <p class="text-base text-gray-900">{{ formatDate(campaign.created) }}</p>
          </div>
        </div>

        <div class="mt-6 flex space-x-3">
          <Button
            variant="primary"
            @click="handleSendMessages"
            :loading="sending"
            :disabled="contacts.length === 0"
          >
            Send Messages
          </Button>
          <Button
            variant="secondary"
            @click="$router.push(`/campaigns/${campaign.id}/stats`)"
          >
            View Statistics
          </Button>
        </div>
      </Card>

      <!-- Contacts Section -->
      <Card>
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">
            Contacts ({{ contacts.length }})
          </h2>
          <Button @click="showAddContactModal = true" variant="primary" size="sm">
            Add Contact
          </Button>
        </div>

        <div v-if="contacts.length === 0" class="text-center py-8">
          <p class="text-gray-500">No contacts yet. Add contacts to send messages.</p>
          <Button
            @click="showAddContactModal = true"
            variant="primary"
            size="sm"
            class="mt-4"
          >
            Add First Contact
          </Button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Can Send
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="contact in contacts" :key="contact.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ contact.firstName }} {{ contact.lastName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatPhoneNumber(contact.phoneNumber) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="contact.canSend
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ contact.canSend ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="editContact(contact)"
                    class="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDeleteContact(contact)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    <!-- Add/Edit Contact Modal -->
    <Modal
      :show="showAddContactModal || showEditContactModal"
      :title="editingContact ? 'Edit Contact' : 'Add Contact'"
      @close="closeContactModal"
    >
      <form @submit.prevent="handleContactSubmit">
        <Input
          id="firstName"
          v-model="contactForm.firstName"
          label="First Name"
          placeholder="John"
          :required="true"
          :error="contactErrors.firstName"
        />

        <Input
          id="lastName"
          v-model="contactForm.lastName"
          label="Last Name"
          placeholder="Doe"
          :required="true"
          :error="contactErrors.lastName"
        />

        <Input
          id="contactPhone"
          v-model="contactForm.phoneNumber"
          label="Phone Number"
          placeholder="+1234567890"
          :required="true"
          :error="contactErrors.phoneNumber"
          hint="Format: +1234567890"
        />

        <div class="mb-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="contactForm.canSend"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-700">Can receive messages</span>
          </label>
        </div>
      </form>

      <template #footer>
        <Button
          type="button"
          variant="secondary"
          @click="closeContactModal"
          class="mr-3"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          :loading="submittingContact"
          @click="handleContactSubmit"
        >
          {{ editingContact ? 'Update' : 'Add' }}
        </Button>
      </template>
    </Modal>

    <!-- Delete Contact Confirmation Modal -->
    <Modal
      :show="showDeleteContactModal"
      title="Delete Contact"
      @close="showDeleteContactModal = false"
    >
      <p class="text-sm text-gray-500">
        Are you sure you want to delete {{ contactToDelete?.firstName }} {{ contactToDelete?.lastName }}?
      </p>
      <template #footer>
        <Button
          variant="secondary"
          @click="showDeleteContactModal = false"
          class="mr-3"
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          :loading="deletingContact"
          @click="handleDeleteContact"
        >
          Delete
        </Button>
      </template>
    </Modal>

    <!-- Send Messages Success Modal -->
    <Modal
      :show="showSuccessModal"
      title="Messages Queued"
      @close="showSuccessModal = false"
    >
      <div class="text-center py-4">
        <svg class="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-4 text-sm text-gray-700">
          Messages have been queued successfully and will be sent shortly.
        </p>
      </div>
      <template #footer>
        <Button
          variant="primary"
          @click="showSuccessModal = false"
        >
          Close
        </Button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import Input from '../components/Input.vue'
import Modal from '../components/Modal.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'CampaignDetails',
  components: {
    Card,
    Button,
    Input,
    Modal,
    LoadingSpinner
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    const loading = ref(false)
    const sending = ref(false)
    const submittingContact = ref(false)
    const deletingContact = ref(false)

    const showAddContactModal = ref(false)
    const showEditContactModal = ref(false)
    const showDeleteContactModal = ref(false)
    const showSuccessModal = ref(false)

    const editingContact = ref(null)
    const contactToDelete = ref(null)

    const contactForm = ref({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      canSend: true
    })

    const contactErrors = ref({
      firstName: '',
      lastName: '',
      phoneNumber: ''
    })

    const campaign = computed(() => store.state.campaigns.currentCampaign)
    const contacts = computed(() => store.getters['contacts/allContacts'])

    onMounted(async () => {
      loading.value = true
      try {
        await Promise.all([
          store.dispatch('campaigns/fetchCampaign', route.params.id),
          store.dispatch('contacts/fetchContacts', route.params.id)
        ])
      } catch (error) {
        console.error('Failed to load campaign details:', error)
      } finally {
        loading.value = false
      }
    })

    const validateContactForm = () => {
      let isValid = true

      if (!contactForm.value.firstName.trim()) {
        contactErrors.value.firstName = 'First name is required'
        isValid = false
      } else {
        contactErrors.value.firstName = ''
      }

      if (!contactForm.value.lastName.trim()) {
        contactErrors.value.lastName = 'Last name is required'
        isValid = false
      } else {
        contactErrors.value.lastName = ''
      }

      if (!contactForm.value.phoneNumber.trim()) {
        contactErrors.value.phoneNumber = 'Phone number is required'
        isValid = false
      } else if (!/^\+\d{10,15}$/.test(contactForm.value.phoneNumber)) {
        contactErrors.value.phoneNumber = 'Phone number must start with + and contain 10-15 digits'
        isValid = false
      } else {
        contactErrors.value.phoneNumber = ''
      }

      return isValid
    }

    const handleContactSubmit = async () => {
      if (!validateContactForm()) return

      submittingContact.value = true

      try {
        if (editingContact.value) {
          await store.dispatch('contacts/updateContact', {
            id: editingContact.value.id,
            data: contactForm.value
          })
        } else {
          await store.dispatch('contacts/createContact', {
            campaignId: route.params.id,
            contactData: contactForm.value
          })
        }
        closeContactModal()
      } catch (error) {
        console.error('Failed to save contact:', error)
      } finally {
        submittingContact.value = false
      }
    }

    const editContact = (contact) => {
      editingContact.value = contact
      contactForm.value = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        phoneNumber: contact.phoneNumber,
        canSend: contact.canSend
      }
      showEditContactModal.value = true
    }

    const confirmDeleteContact = (contact) => {
      contactToDelete.value = contact
      showDeleteContactModal.value = true
    }

    const handleDeleteContact = async () => {
      deletingContact.value = true
      try {
        await store.dispatch('contacts/deleteContact', contactToDelete.value.id)
        showDeleteContactModal.value = false
        contactToDelete.value = null
      } catch (error) {
        console.error('Failed to delete contact:', error)
      } finally {
        deletingContact.value = false
      }
    }

    const closeContactModal = () => {
      showAddContactModal.value = false
      showEditContactModal.value = false
      editingContact.value = null
      contactForm.value = {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        canSend: true
      }
      contactErrors.value = {
        firstName: '',
        lastName: '',
        phoneNumber: ''
      }
    }

    const handleSendMessages = async () => {
      if (contacts.value.length === 0) return

      sending.value = true
      try {
        await store.dispatch('campaigns/sendCampaign', route.params.id)
        showSuccessModal.value = true
      } catch (error) {
        console.error('Failed to send messages:', error)
      } finally {
        sending.value = false
      }
    }

    const formatPhoneNumber = (phone) => {
      return phone || 'N/A'
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      loading,
      sending,
      submittingContact,
      deletingContact,
      campaign,
      contacts,
      showAddContactModal,
      showEditContactModal,
      showDeleteContactModal,
      showSuccessModal,
      editingContact,
      contactToDelete,
      contactForm,
      contactErrors,
      handleContactSubmit,
      editContact,
      confirmDeleteContact,
      handleDeleteContact,
      closeContactModal,
      handleSendMessages,
      formatPhoneNumber,
      formatDate
    }
  }
}
</script>
