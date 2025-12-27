<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            sign in to existing account
          </router-link>
        </p>
      </div>

      <Card>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <Input
            id="email"
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            :required="true"
            :error="errors.email"
            @blur="validateEmail"
          />

          <Input
            id="password"
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="••••••••"
            :required="true"
            :error="errors.password"
            :hint="!errors.password ? 'Must be at least 6 characters' : ''"
            @blur="validatePassword"
          />

          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            :required="true"
            :error="errors.confirmPassword"
            @blur="validateConfirmPassword"
          />

          <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
          </div>

          <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
            <p class="text-sm text-green-800">{{ successMessage }}</p>
          </div>

          <Button
            type="submit"
            variant="primary"
            :loading="loading"
            :disabled="!isFormValid"
            class="w-full"
          >
            Create account
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Card from '../components/Card.vue'
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'

export default {
  name: 'Signup',
  components: {
    Card,
    Input,
    Button
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const form = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const errors = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })

    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const validateEmail = () => {
      if (!form.value.email) {
        errors.value.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email address'
      } else {
        errors.value.email = ''
      }
    }

    const validatePassword = () => {
      if (!form.value.password) {
        errors.value.password = 'Password is required'
      } else if (form.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
      } else {
        errors.value.password = ''
      }

      // Also validate confirm password if it's filled
      if (form.value.confirmPassword) {
        validateConfirmPassword()
      }
    }

    const validateConfirmPassword = () => {
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = 'Please confirm your password'
      } else if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match'
      } else {
        errors.value.confirmPassword = ''
      }
    }

    const isFormValid = computed(() => {
      return form.value.email &&
             form.value.password &&
             form.value.confirmPassword &&
             !errors.value.email &&
             !errors.value.password &&
             !errors.value.confirmPassword
    })

    const handleSubmit = async () => {
      validateEmail()
      validatePassword()
      validateConfirmPassword()

      if (!isFormValid.value) return

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        await store.dispatch('auth/signup', {
          email: form.value.email,
          password: form.value.password
        })
        successMessage.value = 'Account created successfully! Redirecting...'
        setTimeout(() => {
          router.push('/campaigns')
        }, 1500)
      } catch (error) {
        errorMessage.value = error.response?.data?.error || 'Failed to create account'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      errorMessage,
      successMessage,
      isFormValid,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      handleSubmit
    }
  }
}
</script>
