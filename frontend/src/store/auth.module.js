import authService from '@/services/auth.service';

const user = JSON.parse(localStorage.getItem('user'));
const initialState = user
  ? { status: { loggedIn: true }, user }
  : { status: { loggedIn: false }, user: null };

export const auth = {
  namespaced: true,
  state: initialState,
  actions: {
    async login({ commit }, { email, password }) {
      try {
        const response = await authService.login(email, password);
        const userData = { id: response.userId, email, token: response.token };
        commit('loginSuccess', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return Promise.resolve(response.userId);
      } catch (error) {
        commit('loginFailure');
        return Promise.reject(error);
      }
    },

    async register({ commit }, userData) {
      try {
        const { name, email, password, phone, city, postalCode, streetAddress, unitNumber } = userData;
        
        const response = await authService.register(
          name, email, password, phone, city, postalCode, streetAddress, unitNumber
        );
        
        localStorage.setItem(
          'user',
          JSON.stringify({ userId: response.data.userId, token: response.data.token })
        );
        commit('registerSuccess', { id: response.data.userId, email });

        return Promise.resolve(response.data);
      } catch (error) {
        commit('registerFailure');
        return Promise.reject(error);
      }
    },

    logout({ commit }) {
      // Call the service to log out
      authService.logout();
      
      // Update state
      commit('logout');
    }
  },
  mutations: {
    loginSuccess(state, user) {
      state.status.loggedIn = true;
      state.user = user;
    },
    loginFailure(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    registerSuccess(state) {
      state.status.loggedIn = false;
    },
    registerFailure(state) {
      state.status.loggedIn = false;
    },
    logout(state) {
      state.status.loggedIn = false;
      state.user = null;
      localStorage.removeItem("token");
    }
  },
  getters: {
    isLoggedIn(state) {
      return state.status.loggedIn;
    },
    user(state) {
      return state.user;
    }
  }
};