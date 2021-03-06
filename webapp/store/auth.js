export const ACTION_KEY_LOGIN = 'login'
export const ACTION_KEY_SIGNUP = 'signup'

export const state = () => ({
  user: null || { username: 'Kavish', email: 'kavishrmunjal@gmail.com' },
})

export const getters = {
  user: (state) => state.user,
}

export const mutations = {
  setUser(state, user) {
    state.user = user;
    state.loadingUser = false;
  },
}

export const actions = {
  init({ commit }) {
    this.$netlifyIdentity.on('init', (user) => {
      // if (user) {
      //   commit('setUser', {
      //     username: user.user_metadata.full_name,
      //     email: user.email
      //   })
      // }
    })
    this.$netlifyIdentity.on('close', () => {
      const user = this.$netlifyIdentity.currentUser()
      // if (user) {
      //   commit('setUser', {
      //     username: user.user_metadata.full_name,
      //     email: user.email
      //   })
      // }
    })
    this.$netlifyIdentity.init({
      APIUrl: process.env.NETLIFY_IDENTITY_ENDPOINT_URL,
    })
  },
  signup({ dispatch }) {
    dispatch('open', 'signup')
  },
  login({ dispatch }) {
    dispatch('open', 'login')
  },
  logout({ commit }) {
    this.$netlifyIdentity.logout()
    commit('setUser', null)
  },
  open({ commit }, action) {
    this.$netlifyIdentity.open(action)
    this.$netlifyIdentity.on(action, (user) => {
      // commit('setUser', {
      //   username: user.user_metadata.full_name,
      //   email: user.email
      // })
      this.$netlifyIdentity.close()
    })
  }
}
