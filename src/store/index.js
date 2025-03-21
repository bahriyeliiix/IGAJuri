import { createStore } from "vuex";

export default createStore({
  state: {
    hideConfigButton: false,
    isPinned: false,
    showConfig: false,
    sidebarType: "bg-white",
    isRTL: false,
    mcolor: "",
    darkMode: false,
    isNavFixed: false,
    isAbsolute: false,
    showNavs: true,
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    layout: "default",
    token: null,
  },
  mutations: {
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    setToken(state, token) {
      state.token = token; // Token'ı state'e kaydet
    },
    clearToken(state) {
      state.token = null; // Token'ı temizle
    },
    sidebarMinimize(state) {
      let sidenav_show = document.querySelector("#app");
      if (state.isPinned) {
        sidenav_show.classList.add("g-sidenav-hidden");
        sidenav_show.classList.remove("g-sidenav-pinned");
        state.isPinned = false;
      } else {
        sidenav_show.classList.add("g-sidenav-pinned");
        sidenav_show.classList.remove("g-sidenav-hidden");
        state.isPinned = true;
      }
    },
    sidebarType(state, payload) {
      state.sidebarType = payload;
    },
    navbarFixed(state) {
      if (state.isNavFixed === false) {
        state.isNavFixed = true;
      } else {
        state.isNavFixed = false;
      }
    },
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("sidebarType", payload);
    },
    saveToken({ commit }, token) {
      commit('setToken', token); // Token'ı kaydet
      localStorage.setItem('token', token); // Local Storage'a da kaydet
    },
    logout({ commit }) {
      commit('clearToken'); // Token'ı temizle
      localStorage.removeItem('token'); // Local Storage'dan da sil
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token; // Kullanıcı giriş yapmış mı?
    },
  },
});
