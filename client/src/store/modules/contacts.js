import { contactAPI } from '../../services/api'

const state = {
  contacts: []
}

const getters = {
  allContacts: (state) => state.contacts
}

const mutations = {
  setContacts(state, contacts) {
    state.contacts = contacts
  },
  addContact(state, contact) {
    state.contacts.push(contact)
  },
  updateContact(state, updatedContact) {
    const index = state.contacts.findIndex(c => c.id === updatedContact.id)
    if (index !== -1) {
      state.contacts.splice(index, 1, updatedContact)
    }
  },
  removeContact(state, contactId) {
    state.contacts = state.contacts.filter(c => c.id !== contactId)
  },
  clearContacts(state) {
    state.contacts = []
  }
}

const actions = {
  async fetchContacts({ commit }, campaignId) {
    try {
      const response = await contactAPI.getAllByCampaign(campaignId)
      commit('setContacts', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async createContact({ commit }, { campaignId, contactData }) {
    try {
      const response = await contactAPI.create(campaignId, contactData)
      commit('addContact', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async updateContact({ commit }, { id, data }) {
    try {
      const response = await contactAPI.update(id, data)
      commit('updateContact', response.data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  async deleteContact({ commit }, contactId) {
    try {
      await contactAPI.delete(contactId)
      commit('removeContact', contactId)
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
