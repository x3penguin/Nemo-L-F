// store/notifications.module.js
export const notifications = {
    namespaced: true,
    state: {
      notifications: []
    },
    actions: {
      add({ commit }, notification) {
        const id = Date.now().toString();
        commit('add', {
          id,
          ...notification,
          timestamp: new Date()
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
          commit('remove', id);
        }, 5000);
      },
      remove({ commit }, id) {
        commit('remove', id);
      }
    },
    mutations: {
      add(state, notification) {
        state.notifications.push(notification);
      },
      remove(state, id) {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }
    },
    getters: {
      notifications: state => state.notifications
    }
  };