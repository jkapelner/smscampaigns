import { authAPI } from '../../services/api'

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null
}

const getters = {
  isAuthenticated: (state) => !!state.token,
  currentUser: (state) => state.user
}

const mutations = {
  setAuth(state, { token, user }) {
    state.token = token
    state.user = user
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },
  clearAuth(state) {
    state.token = null
    state.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

const actions = {
  async signup({ commit }, { email, password }) {
    try {
      const response = await authAPI.signup(email, password)
      const { token, user } = response.data
      commit('setAuth', { token, user })
      return response.data
    } catch (error) {
      throw error
    }
  },

  async login({ commit }, { email, password }) {
    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data
      commit('setAuth', { token, user })
      return response.data
    } catch (error) {
      throw error
    }
  },

  logout({ commit }) {
    commit('clearAuth')
    commit('campaigns/clearCampaigns', null, { root: true })
    commit('contacts/clearContacts', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
