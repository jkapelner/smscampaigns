import { createStore } from 'vuex'
import auth from './modules/auth'
import campaigns from './modules/campaigns'
import contacts from './modules/contacts'

export default createStore({
  state: {
    error: null,
    loading: false
  },
  mutations: {
    setError(state, error) {
      state.error = error
    },
    clearError(state) {
      state.error = null
    },
    setLoading(state, loading) {
      state.loading = loading
    }
  },
  modules: {
    auth,
    campaigns,
    contacts
  }
})
