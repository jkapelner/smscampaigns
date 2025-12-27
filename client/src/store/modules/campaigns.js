import { campaignAPI } from '../../services/api'

const state = {
  campaigns: [],
  currentCampaign: null,
  stats: null
}

const getters = {
  allCampaigns: (state) => state.campaigns,
  currentCampaign: (state) => state.currentCampaign,
  campaignStats: (state) => state.stats
}

const mutations = {
  setCampaigns(state, campaigns) {
    state.campaigns = campaigns
  },
  setCurrentCampaign(state, campaign) {
    state.currentCampaign = campaign
  },
  setStats(state, stats) {
    state.stats = stats
  },
  addCampaign(state, campaign) {
    state.campaigns.push(campaign)
  },
  updateCampaign(state, updatedCampaign) {
    const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id)
    if (index !== -1) {
      state.campaigns.splice(index, 1, updatedCampaign)
    }
    if (state.currentCampaign?.id === updatedCampaign.id) {
      state.currentCampaign = updatedCampaign
    }
  },
  removeCampaign(state, campaignId) {
    state.campaigns = state.campaigns.filter(c => c.id !== campaignId)
    if (state.currentCampaign?.id === campaignId) {
      state.currentCampaign = null
    }
  },
  clearCampaigns(state) {
    state.campaigns = []
    state.currentCampaign = null
    state.stats = null
  }
}

const actions = {
  async fetchCampaigns({ commit }) {
    try {
      const response = await campaignAPI.getAll()
      commit('setCampaigns', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async fetchCampaign({ commit }, campaignId) {
    try {
      const response = await campaignAPI.getById(campaignId)
      commit('setCurrentCampaign', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async createCampaign({ commit }, campaignData) {
    try {
      const response = await campaignAPI.create(campaignData)
      commit('addCampaign', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async updateCampaign({ commit }, { id, data }) {
    try {
      const response = await campaignAPI.update(id, data)
      commit('updateCampaign', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async deleteCampaign({ commit }, campaignId) {
    try {
      await campaignAPI.delete(campaignId)
      commit('removeCampaign', campaignId)
    } catch (error) {
      throw error
    }
  },

  async sendCampaign({ commit }, campaignId) {
    try {
      const response = await campaignAPI.send(campaignId)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async fetchStats({ commit }, campaignId) {
    try {
      const response = await campaignAPI.getStats(campaignId)
      commit('setStats', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
