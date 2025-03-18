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
        commit('loginSuccess', { id: response.userId, email });
        localStorage.setItem('token', response.token);
        return Promise.resolve(response.userId);
      } catch (error) {
        commit('loginFailure');
        return Promise.reject(error);
      }
    },

    async register({ commit }, { name, email, password, phone }) {
      try {
        const response = await authService.register(name, email, password, phone);
        localStorage.setItem(
          'user',
          JSON.stringify({ userId: response.userId, token: response.token })
        );
        commit('registerSuccess', { id: response.userId, email });
        console.log('Backend Response:', response.data);
        return Promise.resolve(response.data);
      } catch (error) {
        commit('registerFailure');
        return Promise.reject(error);
      }
    },

    logout({ commit }) {
      authService.logout();
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
      state.status.loggedIn =false;
      
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