import logisticsService from '@/services/logistics.service';

export const logistics = {
  namespaced: true,
  state: {
    rates: null,
    rateHistory: [],
    loading: false,
    error: null
  },
  actions: {
    async checkRates({ commit }, shipmentData) {
      commit('setLoading', true);
      try {
        const response = await logisticsService.checkRates(shipmentData);
        commit('setRates', response.data);
        return response.data;
      } catch (error) {
        commit('setError', error.message || 'Failed to check rates');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    },
    
    async getShippingHistory({ commit }, limit) {
      commit('setLoading', true);
      try {
        const response = await logisticsService.getShippingHistory(limit);
        commit('setRateHistory', response.data.data);
        return response.data.data;
      } catch (error) {
        commit('setError', error.message || 'Failed to get shipping history');
        throw error;
      } finally {
        commit('setLoading', false);
      }
    }
  },
  mutations: {
    setRates(state, rates) {
      state.rates = rates;
      state.error = null;
    },
    setRateHistory(state, history) {
      state.rateHistory = history;
    },
    setLoading(state, isLoading) {
      state.loading = isLoading;
    },
    setError(state, error) {
      state.error = error;
    }
  }
};
