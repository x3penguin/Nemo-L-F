import itemService from '@/services/item.service';

export const items = {
  namespaced: true,
  state: {
    lostItems: [],
    foundItems: [],
    matchedItems: [],
    currentItem: null,
    isLoading: false,
    error: null
  },
  actions: {
    async fetchLostItems({ commit }) {
      try {
        commit('setLoading', true);
        const response = await itemService.getLostItems();
        commit('setLostItems', response.data);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch lost items');
        return Promise.reject(error);
      } finally {
        commit('setLoading', false);
      }
    },
    
    async fetchFoundItems({ commit }) {
      try {
        commit('setLoading', true);
        const response = await itemService.getFoundItems();
        commit('setFoundItems', response.data);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch found items');
        return Promise.reject(error);
      } finally {
        commit('setLoading', false);
      }
    },
    
    async fetchMatchedItems({ commit }) {
      try {
        commit('setLoading', true);
        const response = await itemService.getMatchedItems();
        commit('setMatchedItems', response.data);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch matched items');
        return Promise.reject(error);
      } finally {
        commit('setLoading', false);
      }
    },
    
    async fetchItemById({ commit }, itemId) {
      try {
        commit('setLoading', true);
        const response = await itemService.getItemById(itemId);
        commit('setCurrentItem', response.data);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('setError', error.message || 'Failed to fetch item details');
        return Promise.reject(error);
      } finally {
        commit('setLoading', false);
      }
    },
    
    async reportLostItem({ commit }, itemData) {
      try {
        commit('setLoading', true);
        const response = await itemService.reportLostItem(itemData);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('setError', error.message || 'Failed to report lost item');
        return Promise.reject(error);
      } finally {
        commit('setLoading', false);
      }
    },
    
    async reportFoundItem({ commit }, itemData) {
      try {
        commit('setLoading', true);
        const response = await itemService.reportFoundItem(itemData);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('setError', error.message || 'Failed to report found item');
        return Promise.reject(error);
      } finally {
        commit('setLoading', false);
      }
    },
    
    clearError({ commit }) {
      commit('setError', null);
    }
  },
  mutations: {
    setLostItems(state, items) {
      state.lostItems = items;
    },
    setFoundItems(state, items) {
      state.foundItems = items;
    },
    setMatchedItems(state, items) {
      state.matchedItems = items;
    },
    setCurrentItem(state, item) {
      state.currentItem = item;
    },
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    setError(state, error) {
      state.error = error;
    }
  },
  getters: {
    lostItems: state => state.lostItems,
    foundItems: state => state.foundItems,
    matchedItems: state => state.matchedItems,
    currentItem: state => state.currentItem,
    isLoading: state => state.isLoading,
    hasError: state => !!state.error,
    errorMessage: state => state.error
  }
};